# Whole application: local operation and hosting status

All work is in the isolated beta-06-chatbot worktree. Local validation made no
production deployment, database/RLS change or scheme publication. Approved Git
handoff changes belong only on feat/chatbot-voice-integration, never main.

## Local demo

From the isolated citizen-scheme-assistant directory:

```powershell
.\start-demo.ps1
```

Open http://127.0.0.1:5175. FastAPI is on http://127.0.0.1:8002, Swagger at /docs.
The script validates the local 15-scheme bundle and API identity, explicitly enables
the existing local-only demo, and reuses occupied ports without killing processes.
It does not modify .env, credentials, Supabase or the original project.
Logs are under engine/.phase3-output/chatbot-integration/ (ignored).

If dependencies have not been installed in this isolated checkout, follow
CHATBOT_INTEGRATION.md first. The prepared catalogue is ignored research output,
not generated fake records; a fresh clone needs those validated bundles reproduced
or transferred separately.

## Final verification results

- Backend: 210 tests passed; isolated PGlite database: 35 passed.
- Frontend: 32 tests passed, including API-origin and build-directory regression tests.
- Production build passed. Both development and built-app browser journeys passed.
- Actual HTTP: 15 schemes, 30 bilingual journeys and 7 additional decision cases passed.
- Built-browser requests used only http://127.0.0.1:5176 for API traffic, verifying
  the same-origin proxy. English/Hindi results, document checklist, application
  guidance and real English/Hindi/Hinglish Gemini responses were visible.
- Nine mobile routes passed with no runtime page errors or horizontal overflow.
- Original worktree: all 7,945 baseline files unchanged; Git handoff uses the isolated feature branch.

The production build also exposed a Windows casing collision: public/Assets and
Vite's generated assets shared a directory. Vite preview rejected the bundles as
incorrectly cased and returned HTML instead of JavaScript/CSS. Generated files now
use static/; existing artwork remains in Assets/. Actual asset requests and the
complete built-browser journey verified the fix.

## Actual deployment findings

Both catalogue and chatbot previously used 127.0.0.1:8002 as their unconditional
production default. On a teammate's deployed website that points to the visitor's
computer, not our backend. This is fixed by the shared frontend apiConfig module:

- Development default: http://127.0.0.1:8002.
- Production default: same-origin /api and /health; the host must proxy them.
- Explicit VITE_API_BASE_URL: used by catalogue, screening and chatbot alike.

VITE variables are substituted during the frontend build. Changing a host variable
after building does not update existing JavaScript; rebuild/redeploy the frontend.
For separate hosting use the real HTTPS FastAPI origin, without an extra /api/v1
suffix, and set backend CORS_ORIGINS to exact HTTPS frontend origins.

No actual backend hosting domain/configuration was found in repository metadata.
GitHub public metadata showed no deployments or project homepage. Therefore no
remote health endpoint was available to verify. Supabase is PostgreSQL/auth; its
Healthy indicator does not establish that FastAPI is hosted or reachable.

The isolated engine/.env currently configures Gemini only. It does not configure
a Supabase SQL connection. Local catalogue/screening uses validated bundles, not
a hidden live connection. Production database endpoints fail safely with 503 when
their required connection configuration is absent.

## Prepared hosting configuration (not executed)

Project render.yaml prepares a FastAPI web service with the repository-relative
root citizen-scheme-assistant/engine, requirements.txt installation, /health check,
and binding to 0.0.0.0:$PORT. Automatic deployment is disabled. The owner must review
and explicitly create/deploy the service; this file does not create one.
The service branch is pinned to feat/chatbot-voice-integration. For a Blueprint,
select citizen-scheme-assistant/render.yaml as its configuration path. For a
manually created Web Service, explicitly select that feature branch and root.

Provide privately on the backend host:

- DATABASE_URL for the restricted scheme_api login, never a writer/admin role.
- DATABASE_EXPECTED_USER=scheme_api.
- Verified Supabase CA as a host secret file at /etc/secrets/supabase-ca.crt.
- DATABASE_SSL_ROOT_CERT pointing to that file.
- CORS_ORIGINS containing the exact HTTPS frontend origin(s).
- GEMINI_API_KEY as a private server variable, and GEMINI_MODEL=gemini-3.5-flash-lite
  to preserve the account-tested model.
- SCHEME_CHATBOT_PUBLIC_ENABLED=1 (prepared in render.yaml and the private render.env).

Keep SCHEME_APP_ENV=production and SCHEME_DEMO_ENABLED=0. No migration or import is
part of the startup command. The existing API connection still enforces verify-full
TLS, read-only transactions, reader membership, privilege checks and rollback.
No RLS/policy modification is needed or proposed.

The frontend host must either set VITE_API_BASE_URL to that verified HTTPS service
before npm run build, or proxy /api/* and /health to it and serve dist/index.html for
SPA routes such as /schemes/in-cen-000001. Proxy rules must precede the SPA fallback.
Do not proxy /api failures to index.html; that would create INVALID_RESPONSE errors.
No hosting domain was invented and no hosting account was accessed.

Official configuration references:
[Render FastAPI](https://render.com/docs/deploy-fastapi) and
[Vite preview proxy](https://vite.dev/config/preview-options.html#preview-proxy).

## Publication and chat boundaries

The 15 government records remain drafts. Their local preliminary guidance is
identified as such. Production published queries correctly exclude them; a hosted
empty published catalogue is not an RLS bug to bypass. Policy/translation review
and explicit publication approval remain necessary for production citizen access.

Preliminary-demo routes remain loopback-only. Public chat is explicitly enabled by
SCHEME_APP_ENV=production plus SCHEME_CHATBOT_PUBLIC_ENABLED=1. Browser POSTs must
send an Origin matching an approved HTTPS CORS_ORIGINS entry or the platform-provided
RENDER_EXTERNAL_URL. Unknown/missing POST origins are rejected before provider use.
Public status can be checked without an Origin. Origin checks are browser protection,
not user authentication; provider spending is independently bounded.

Public requests have per-peer limits (120 total requests/minute, 30 POSTs/minute),
global provider limits (60 POSTs/minute, 300/hour), four concurrent provider requests,
and a 16 KiB streamed body limit. POST budgets include speech. 429 responses carry
Retry-After: 60. Caller-supplied forwarding headers cannot bypass limits. Hosting
proxies may conservatively share a peer budget. Peer identifiers are ephemeral HMACs;
no raw IP addresses or answers are stored by the limiter. Keep one worker/instance:
budgets are process-local and reset on restart. Multi-instance deployment requires a
shared limiter and account-level provider spending controls.

Existing conversation capabilities, 15-minute expiry, bounded history, no-store,
provider timeouts, server-only keys and published-policy gates remain enforced.
Public scheme answers fetch details only for at most three server-selected published
records; disappeared records do not fall back to stale summaries or draft bundles.
The local demo still uses the existing explicit development gate. No scheme is
published or approved by enabling public chat.

## Built frontend preview and verification

In frontend: npm.cmd run build, then npm.cmd run preview -- --port 5176.
Open http://127.0.0.1:5176. Vite's preview inherits the local /api and /health proxy
to 8002, exercising production-built assets against the actual local API. This is
a local build check, not evidence of deployment to a remote host.

Whole-app browser report: engine/.phase3-output/chatbot-integration/wholeapp-browser-report.json.
It verifies 15 cards in both languages; full PMJJBY English/Hindi questionnaires,
explained results, three document checkboxes and application guidance; actual
English/Hindi/Hinglish Gemini responses and conversation memory; nine mobile routes;
and no runtime page errors. Physical microphone and audible playback require device
testing. Browser speech fallback is retained; ElevenLabs is not configured.

All 15 bilingual deterministic journeys are tested over actual HTTP by
engine/tests/verify_screening15_http.py. Incomplete policy screens continue to
return NEEDS_VERIFICATION; completing a questionnaire is not government approval.

Actual final suite results and build-preview evidence are recorded in the ignored
stabilization report beside those browser reports. No result is inferred merely
from the presence of a deployment configuration file.
