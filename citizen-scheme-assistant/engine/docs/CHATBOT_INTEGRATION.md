# Isolated Sahayak chatbot and voice integration

All implementation changes are in `beta-06-chatbot` on `feat/chatbot-voice-integration`. The original `beta-06` worktree is read-only. No database writes or scheme publication changes were performed. Git handoff is confined to the feature branch.

## Run this integration

The isolated servers are currently running:

- Frontend: http://127.0.0.1:5175
- Backend: http://127.0.0.1:8002
- Swagger: http://127.0.0.1:8002/docs
- Health: http://127.0.0.1:8002/health
- Chat status: http://127.0.0.1:8002/api/v1/chatbot/status

Port 8001 belongs to the original application's existing backend, which returns 404 for the chatbot status route. It was left running. Do not stop unrelated processes or run a second copy on an occupied port.

If these isolated processes have been stopped, use two PowerShell terminals:

```powershell
# Terminal 1: isolated backend only
Set-Location 'C:\Users\Asus\OneDrive\Desktop\version beta 6\beta-06-chatbot\citizen-scheme-assistant\engine'
$env:SCHEME_APP_ENV = 'development'
$env:SCHEME_DEMO_ENABLED = '1'
$env:CORS_ORIGINS = 'http://localhost:5175,http://127.0.0.1:5175'
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8002 --reload --no-access-log --no-proxy-headers
```

```powershell
# Terminal 2: isolated frontend only
Set-Location 'C:\Users\Asus\OneDrive\Desktop\version beta 6\beta-06-chatbot\citizen-scheme-assistant\frontend'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:8002'
npm.cmd run dev
```

Vite defaults to port 5175 with strict-port checking; the API client defaults to 8002 in this isolated copy. The existing isolated virtual environment uses Python 3.13.5. Runtime dependencies are pinned in engine/requirements.txt; google-genai==2.34.0 was already installed and is now declared. No frontend dependency was added or upgraded.

The real 15-scheme local bundles were copied from the original's public research artifacts to the isolated `engine/.phase3-output/catalog15/`. This Git-ignored directory is needed for this local demo. A fresh clone needs those artifacts reproduced or securely transferred; the source code does not substitute a fabricated catalogue. No database credentials are needed for this local-demo path. Other database-backed endpoints retain their existing read-only configuration.

## UI and existing functionality

Compared both worktrees and restored the original's current page/component/service appearance in the isolated copy, including its navigation, auth and scheme screens. Kept the floating chatbot and the isolated copy's additional /profile/details route. Package dependencies, CSS, assets and fonts were compared rather than replaced blindly.

The floating chat supports Enter-to-send, language selection, recent conversation memory, cancel, reset, minimize/reopen, responsive layout and per-message read aloud. Minimizing stops voice while retaining messages and pending text responses. Existing routes remain in place.

Restored UI files are listed in `.phase3-output/chatbot-integration/restored-ui-files.json`; the complete current Git status and task-specific content changes are recorded in `safety-report.json` and `changed-files.json` alongside it. Pre-existing package/App changes were not committed or discarded.

## AI configuration and honest fallback

Current live status is `gemini_configured=true`, `mode=ai`, using the existing configured `gemini-3.5-flash-lite` model. Real English and Hindi HTTP requests both returned 200 with `provider=gemini`, no degradation reason, and approximately 2.5s / 1.7s latency. ElevenLabs remains unconfigured. The UI labels basic guidance explicitly. A configured key is not described as a successful connection until a real Gemini message succeeds.

Configure secrets only in the isolated backend owner's private environment/configuration. Do not send keys in chat or add them to frontend VITE variables. Actual .env files were not changed; .env.example contains commented placeholders.

Server-side variables:

| Variable | Purpose |
| --- | --- |
| GEMINI_API_KEY | Enables Gemini; optional for basic source lookup |
| GEMINI_MODEL | Configurable model; default gemini-3.8-flash |
| ELEVENLABS_API_KEY | Optional premium speech provider |
| ELEVENLABS_VOICE_ID | Owner-selected server-side permitted voice |
| ELEVENLABS_MODEL_ID | Defaults to eleven_multilingual_v2 |
| SCHEME_APP_ENV | development for local demo |
| SCHEME_DEMO_ENABLED | Explicit 1 to enable existing local catalogue/screening |
| CORS_ORIGINS | Explicit isolated frontend origins |

Restart only the isolated backend after configuring its keys. Model availability and quota depend on the account. The default was checked against official model documentation; this run also verified real responses using the owner's existing configured model. The configured value takes precedence over the default. See [Gemini model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash), [official Python SDK](https://googleapis.github.io/python-genai/), and [ElevenLabs speech API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert).

Gemini receives recent conversation turns and actual catalogue summaries. It selects a bounded, validated conversation plan and known scheme identifiers. Policy benefits, documents, application instructions and links are rendered from actual records, not from generated policy prose. Unknown IDs and free-form invented scheme claims are rejected. Unavailable evidence stays unavailable. Citizen statements and model output cannot approve policy or create an eligibility decision.

The old hardcoded "verified" scheme catalogue and separate chatbot eligibility logic have been removed. Eligibility questions link to the existing structured screening journey. If an explicitly supplied typed questionnaire state is evaluated by the API, it delegates to the existing engine/provider boundary. No chat profile or natural-language answer is treated as a substitute for that state. The first five existing journeys retain preliminary decisions; other existing journeys preserve NEEDS_VERIFICATION where their criteria are incomplete. None of the 15 draft schemes were published or reclassified as verified.

Gemini timeouts, quota, missing models and authentication failures return transparent category-only degradation reasons and basic guidance. No provider error body, prompt, API key, or citizen answer is logged.

## API contract

All chatbot endpoints are local-only and use private no-store responses. Request/response models are in app/schemas/chatbot.py; Swagger is the exact reference.

```http
POST /api/v1/chatbot/message
Content-Type: application/json

{"message":"Tell me about PMJJBY","language":"en"}
```

The response includes `conversation_id`, `conversation_token`, `message`, `language`, `intent`, `provider`, `degradation_reason`, and grounded sections such as `schemes`, `sources`, `application_guidance`, `missing_documents`, and `screening_url`. Absent information remains null/empty; no invented confidence score is returned.

For subsequent turns send the returned conversation_id and conversation_token together:

```json
{
  "conversation_id": "<returned UUID>",
  "conversation_token": "<returned 64-character token>",
  "message": "Which documents are listed?",
  "language": "en"
}
```

Hindi messages use `"language":"hi"`; Roman-script Hinglish is also passed to the configured model. Basic mode has deliberately limited intent recognition and is not presented as a conversational model.

- GET /api/v1/chatbot/status
- GET /api/v1/chatbot/suggested-questions?lang=hi
- GET /api/v1/chatbot/conversations/{conversation_id}
- DELETE /api/v1/chatbot/conversations/{conversation_id}
- GET /api/v1/chatbot/voice/status
- POST /api/v1/chatbot/voice/tts with `{"text":"नमस्ते","language":"hi"}`

History/reset require the `X-Conversation-Token` header. A guessed ID alone cannot read/delete a conversation. Voice returns private audio/mpeg when configured/successful, otherwise JSON with `provider=browser_fallback`. Clients must inspect the content type; the provided client already does.

Conversations live only in bounded process memory: 15-minute expiry (purged on access), up to 100 conversations, 12 recent turns and 40 messages per conversation. Reloading/restarting can lose them; no multi-worker continuity is promised. No citizen DB/profile persistence or browser localStorage was added. This loopback preview is not an internet-ready chat service; public deployment would require explicit authentication/rate limits, privacy review and provider consent.

## Voice behavior and privacy

Microphone starts only after a user gesture. Recognition requests en-IN/hi-IN, inserts the transcript into the editable input and requires the citizen to press Send. Permission denial, missing support, silence and errors return to a usable text flow. Stop/cancel, timeouts, unmount and conversation reset clean up listeners, audio, object URLs and pending requests.

Read aloud first tries the configured backend speech provider; otherwise it uses browser speech synthesis. It uses each message's content language. Browser recognition/synthesis availability and Hindi voices vary by browser/device. Browser speech services or configured Gemini/ElevenLabs may process user content externally; do not enter sensitive identifiers. No attempt was made to bypass browser microphone permissions.

## Verification performed

| Check | Actual result |
| --- | --- |
| Complete Python suite | 199 passed |
| Isolated PGlite database suite | 35 passed; no remote DB |
| Frontend Node tests | 32 passed, including voice, API-base and build-directory regression tests |
| Production Vite build | Passed |
| Python dependency consistency | pip check passed |
| Actual HTTP screening integration | 30 bilingual journeys across 15 schemes, plus 7 decision cases passed |
| Actual localhost Chrome integration | 11 checks passed, zero main-context page errors |
| Original-worktree preservation | See safety-report.json; SHA-256 comparison against pre-change snapshot |

The frontend tests emitted a non-failing Vite test WebSocket "port already in use" warning while the development server was running; all assertions and the production build succeeded.

Browser checks covered memory, source-backed document/application follow-ups, screening link, Hindi response, reset, existing questionnaire visibility, mobile bounds, explicit transcript confirmation, browser TTS fallback/stop and permission denial. Routes rendered at /schemes, /schemes/in-cen-000001, /screening, /results, /login, /signup and /profile (anonymous redirects to /login). No live authentication transaction was performed.

**Voice browser events were synthetic. Physical microphone input and audible playback were not verified. Live Gemini responses are now verified in English and Hindi. ElevenLabs remains unverified because it is not configured.**

Commands from the corresponding isolated directories:

```powershell
# engine
.\.venv\Scripts\python.exe -m unittest discover -s tests
npm.cmd ci --ignore-scripts --no-audit --no-fund --prefix db-validation
npm.cmd test
.\.venv\Scripts\python.exe -m pip check
.\.venv\Scripts\python.exe -B tests/verify_screening15_http.py --base http://127.0.0.1:8002 --output .phase3-output/chatbot-integration/screening15-http.json
# frontend
npm.cmd test
npm.cmd run build
```

Ignored audit reports/screenshots are under engine/.phase3-output/chatbot-integration/: browser-report.json, screening15-http.json, backend-tests-final.log, desktop-home.png, desktop-chat.png, mobile-chat.png. Browser tooling was installed only in the ignored audit directory, not the frontend dependencies.

## Remaining manual verification

1. Gemini server-side configuration is now working; keep the existing isolated configuration private. The stopped isolated backend was restarted on port 8002; do not start a second server on that port.
2. Optional ElevenLabs credentials/voice; verify real speech or keep the browser fallback.
3. On the intended demonstration device, grant microphone permission explicitly, confirm English/Hindi transcription before sending, and listen to/read-aloud stop behavior.
4. Validate live sign-in/profile operations only with an explicitly authorized test account; no user account was created during this task.

No original-worktree, Supabase publication, or remote permission changes are needed for these local checks. Publish only approved feature-branch changes; do not merge or push to main.
