"""Lightweight offline test-harness ASGI implementation of httpx for in-process testing."""
import asyncio
from collections.abc import Mapping
import json
from urllib.parse import urlparse, urlencode


class Headers(Mapping):
    def __init__(self, raw_headers):
        self._store = {}
        for k, v in raw_headers:
            key_str = k.decode('latin1').lower() if isinstance(k, bytes) else str(k).lower()
            val_str = v.decode('latin1') if isinstance(v, bytes) else str(v)
            self._store[key_str] = val_str

    def __getitem__(self, key):
        return self._store[key.lower()]

    def __iter__(self):
        return iter(self._store)

    def __len__(self):
        return len(self._store)

    def get(self, key, default=None):
        return self._store.get(key.lower(), default)


class Response:
    def __init__(self, status_code, headers, content):
        self.status_code = status_code
        self.headers = Headers(headers)
        self.content = content

    @property
    def text(self):
        return self.content.decode('utf-8')

    def json(self):
        return json.loads(self.text)

    @property
    def is_success(self):
        return 200 <= self.status_code < 300

    @property
    def is_error(self):
        return 400 <= self.status_code < 600


class ASGITransport:
    def __init__(self, app=None, raise_app_exceptions=True, client=None):
        self.app = app
        self.raise_app_exceptions = raise_app_exceptions
        self.client = client or ('127.0.0.1', 12345)


class AsyncClient:
    def __init__(self, transport=None, base_url='http://test', **kwargs):
        self.transport = transport
        self.base_url = base_url

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    async def aclose(self):
        pass

    async def request(self, method, url, params=None, json_data=None, data=None, content=None, headers=None):
        parsed = urlparse(url)
        path = parsed.path or '/'
        query = parsed.query
        if params:
            extra_query = urlencode(params)
            query = f'{query}&{extra_query}' if query else extra_query

        req_headers = []
        if headers:
            for k, v in headers.items():
                req_headers.append([str(k).lower().encode('latin1'), str(v).encode('latin1')])

        body = b''
        if content is not None:
            if isinstance(content, str):
                body = content.encode('utf-8')
            elif isinstance(content, bytes):
                body = content
        elif json_data is not None:
            body = json.dumps(json_data).encode('utf-8')
            req_headers.append([b'content-type', b'application/json'])
        elif data is not None:
            if isinstance(data, str):
                body = data.encode('utf-8')
            elif isinstance(data, bytes):
                body = data
        req_headers.append([b'content-length', str(len(body)).encode('latin1')])
        host = (parsed.netloc or urlparse(self.base_url).netloc or '127.0.0.1').encode('latin1')
        req_headers.append([b'host', host])

        client_host_port = self.transport.client if self.transport and self.transport.client else ('127.0.0.1', 12345)

        scope = {
            'type': 'http',
            'asgi': {'version': '3.0'},
            'http_version': '1.1',
            'method': method.upper(),
            'scheme': 'http',
            'path': path,
            'raw_path': path.encode('latin1'),
            'query_string': query.encode('latin1'),
            'headers': req_headers,
            'client': client_host_port,
            'server': ('127.0.0.1', 80),
        }

        res_status = None
        res_headers = []
        res_body = []

        async def receive():
            return {'type': 'http.request', 'body': body, 'more_body': False}

        async def send(message):
            nonlocal res_status, res_headers
            if message['type'] == 'http.response.start':
                res_status = message['status']
                res_headers = message.get('headers', [])
            elif message['type'] == 'http.response.body':
                res_body.append(message.get('body', b''))

        try:
            await self.transport.app(scope, receive, send)
        except Exception:
            if getattr(self.transport, 'raise_app_exceptions', True):
                raise

        return Response(res_status, res_headers, b''.join(res_body))

    async def get(self, url, **kwargs):
        return await self.request('GET', url, **kwargs)

    async def post(self, url, json=None, data=None, content=None, **kwargs):
        return await self.request('POST', url, json_data=json, data=data, content=content, **kwargs)

    async def put(self, url, **kwargs):
        return await self.request('PUT', url, **kwargs)

    async def delete(self, url, **kwargs):
        return await self.request('DELETE', url, **kwargs)

    async def options(self, url, **kwargs):
        return await self.request('OPTIONS', url, **kwargs)

    async def head(self, url, **kwargs):
        return await self.request('HEAD', url, **kwargs)


class Client:
    def __init__(self, *args, **kwargs):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def get(self, *args, **kwargs):
        raise NotImplementedError('Client.get not supported in offline tests')

    def post(self, *args, **kwargs):
        raise NotImplementedError('Client.post not supported in offline tests')


class HTTPError(Exception):
    pass


class HTTPStatusError(HTTPError):
    pass


class RequestError(HTTPError):
    pass
