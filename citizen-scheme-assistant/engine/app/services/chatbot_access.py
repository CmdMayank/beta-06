"""Opt-in public chat with bounded, process-local abuse and provider budgets."""
from collections import deque
from contextlib import contextmanager
from hashlib import sha256
import hmac
import os
from secrets import token_bytes
from threading import RLock
from time import monotonic
from urllib.parse import urlsplit

from fastapi import Request, Response
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse
from app.core.config import cors_origins
from app.core.errors import APIError


class ChatBodyLimitMiddleware:
    """Bound actual streamed bytes before JSON parsing, including chunked input."""
    MAX_BYTES = 16_384

    def __init__(self, app): self.app = app

    async def __call__(self, scope, receive, send):
        if (scope['type'] != 'http' or scope.get('method') != 'POST'
            or not scope.get('path', '').startswith('/api/v1/chatbot/')):
            await self.app(scope, receive, send)
            return
        length = dict(scope.get('headers', [])).get(b'content-length')
        try: oversized = length is not None and (int(length) < 0 or int(length) > self.MAX_BYTES)
        except ValueError: oversized = True
        if oversized:
            await JSONResponse({'error': {'code': 'CHATBOT_BODY_TOO_LARGE',
                'message': 'Chat request is too large.'}}, status_code=413,
                headers={'Cache-Control':'no-store','Pragma':'no-cache'})(scope, receive, send)
            return
        size = 0
        async def limited_receive():
            nonlocal size
            message = await receive()
            if message['type'] == 'http.request':
                size += len(message.get('body', b''))
                if size > self.MAX_BYTES: raise HTTPException(413, 'Chat request is too large.')
            return message
        await self.app(scope, limited_receive, send)


class PublicChatLimiter:
    REQUESTS_PER_MINUTE = 120
    PAID_PER_MINUTE = 30
    GLOBAL_PAID_PER_MINUTE = 60
    GLOBAL_PAID_PER_HOUR = 300
    MAX_IN_FLIGHT = 4
    MAX_PEERS = 1024

    def __init__(self, clock=monotonic):
        self._clock = clock
        self._salt = token_bytes(32)
        self._lock = RLock()
        self._peers = {}
        self._minute, self._hour = deque(), deque()
        self._active = 0

    @staticmethod
    def _expire(bucket, before):
        while bucket and bucket[0] <= before: bucket.popleft()

    @staticmethod
    def _reject():
        raise APIError(429, 'CHATBOT_RATE_LIMITED', 'Too many requests. Please retry later.',
                       headers={'Retry-After': '60'})

    @contextmanager
    def reserve(self, peer, paid):
        # Never trust caller-controlled X-Forwarded-For. A shared hosting proxy
        # may conservatively share a peer budget; global budgets still apply.
        key = hmac.new(self._salt, peer.encode(), sha256).digest()
        with self._lock:
            now = self._clock()
            for expired in [k for k,v in self._peers.items() if v[2] <= now - 60]:
                del self._peers[expired]
            if key not in self._peers:
                if len(self._peers) >= self.MAX_PEERS: self._reject()
                self._peers[key] = (deque(), deque(), now)
            requests, calls, _ = self._peers[key]
            self._peers[key] = (requests, calls, now)
            self._expire(requests, now - 60)
            self._expire(calls, now - 60)
            self._expire(self._minute, now - 60)
            self._expire(self._hour, now - 3600)
            if len(requests) >= self.REQUESTS_PER_MINUTE: self._reject()
            requests.append(now)
            if paid:
                if (len(calls) >= self.PAID_PER_MINUTE
                    or len(self._minute) >= self.GLOBAL_PAID_PER_MINUTE
                    or len(self._hour) >= self.GLOBAL_PAID_PER_HOUR
                    or self._active >= self.MAX_IN_FLIGHT): self._reject()
                calls.append(now); self._minute.append(now); self._hour.append(now)
                self._active += 1
        try: yield
        finally:
            if paid:
                with self._lock: self._active -= 1


public_chat_limiter = PublicChatLimiter()


def public_enabled():
    return (os.getenv('SCHEME_APP_ENV') == 'production'
            and os.getenv('SCHEME_CHATBOT_PUBLIC_ENABLED') == '1')


def approved_origins():
    candidates = cors_origins() + [os.getenv('RENDER_EXTERNAL_URL', '')]
    result = set()
    for value in candidates:
        parsed = urlsplit(value)
        if (parsed.scheme == 'https' and parsed.hostname
            and parsed.hostname not in ('localhost', '127.0.0.1', '::1')
            and not parsed.username and not parsed.password
            and parsed.path in ('', '/') and not parsed.query and not parsed.fragment):
            result.add('https://' + parsed.netloc)
    return result


def chat_access(request: Request, response: Response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['Pragma'] = 'no-cache'
    local = (request.client and request.client.host in ('127.0.0.1','::1','test','testclient')
             and request.url.hostname in ('127.0.0.1','localhost','::1','test','testserver'))
    if not public_enabled():
        if not local: raise APIError(404, 'CHATBOT_UNAVAILABLE', 'Chatbot is unavailable.')
        yield
        return
    if not request.client: raise APIError(404, 'CHATBOT_UNAVAILABLE', 'Chatbot is unavailable.')
    origin = request.headers.get('origin')
    if ((origin is not None and origin not in approved_origins())
        or (request.method == 'POST' and origin not in approved_origins())):
        raise APIError(403, 'CHATBOT_ORIGIN_DENIED', 'Use the configured application to access chat.')
    with public_chat_limiter.reserve(request.client.host, request.method == 'POST'):
        yield
