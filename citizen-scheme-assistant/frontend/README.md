<div align="center">

<img src="./public/logo.svg" alt="Scheme Sahayak logo" width="96" />

# 🇮🇳 Scheme Sahayak · योजना सहायक

### Find the government schemes you deserve — in plain Hindi or English.

An AI-assisted, **bilingual**, **privacy-first** web app that helps Indian citizens discover welfare schemes, understand their eligibility, and walk into the office with the right documents.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Storage-3FCF8E?logo=supabase&logoColor=white)
![Languages](https://img.shields.io/badge/Languages-हिन्दी_|_English-FF9933)

[✨ Features](#-features) · [🚀 Quick Start](#-quick-start) · [🧱 Architecture](#-architecture) · [📁 Structure](#-project-structure) · [🧪 Testing](#-testing) · [🔒 Privacy](#-privacy-by-design)

</div>

---

## 🎯 Why this exists

Millions of citizens qualify for central and state schemes but never apply. The rules are buried in dense legal language, spread across many portals, and the fear of rejection or a wasted trip to the office keeps people away.

**Scheme Sahayak** collapses that journey into one friendly interface:

> *Browse schemes → answer a few smart questions → get a clear, explained result → print your document checklist.*

---

## ✨ Features

### 🔍 Scheme Discovery
- Browse the **published scheme catalogue** with search and filters by **level** (Central / State), **category** and **State/UT**
- Rich **scheme detail pages** with benefits, documents, application guidance and **source references / citations**
- Homepage with featured schemes, category cards, a "How it works" walkthrough and a trust & privacy section

### 🧠 Adaptive Eligibility Screening
- One scheme per questionnaire, with the **backend deciding the next question** so users only answer what affects the outcome
- Supports **text, number, date, yes/no, single-select and multi-select** inputs
- **Skip**, **"I don't know"** and **clear** are treated as distinct answers, and **Back** restores a previous state
- Live **progress indicator** throughout the flow

### 📋 Transparent Results
- Qualified screening status with distinct **icons + text** (never colour alone)
- Shows the **decisive rule**, conditions, **missing information**, benefits and application guidance
- Mandatory **disclaimer** and official-portal links (HTTPS only, validated)
- Missing guidance is shown as *unavailable* — never fabricated

### 🗂 Document Checklist & Vault
- Consolidated, actionable **document checklist** with a **print-friendly view**
- **Document ownership checklist** in the user profile
- Sample document previews (Aadhaar, ration card, income / caste / domicile certificates, marksheet, bank passbook, Samagra ID)
- Secure upload for signed-in users (JPEG / PNG / PDF, up to 3 MB, images auto-resized, 90-day expiry)

### 🗣 Voice & Chat Assistant
- **Floating chatbot** with suggested questions, typing indicator, scheme result cards and missing-document hints
- **Voice input** (speech recognition in `hi-IN` / `en-IN`) with a **confirmation modal** before anything is submitted
- **Read-aloud** of questions and explanations in the active language
- No transcripts, audio or tokens are persisted

### 🌐 Bilingual by Design
- Full **Hindi ⇄ English** UI with a one-tap language switcher
- Standard government terminology kept consistent via a central translation layer
- Backend content-language and fallback metadata is shown honestly — no browser-generated translations passed off as official

### 👤 Optional Accounts
- Login / signup and profile pages powered by **Supabase Auth**
- Profile data can pre-fill screening answers
- Protected routes for profile pages; the core experience works without an account

### 🎨 Design
- Tricolour-inspired palette: **saffron**, **India green**, **navy** and warm **cream**
- Glassmorphism cards, soft shadows and **Plus Jakarta Sans + Noto Sans Devanagari** typography
- Responsive, mobile-first layouts and print styles

---

## 🛠 Tech Stack

| Layer | Technology |
| :-- | :-- |
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 + PostCSS + Autoprefixer |
| Icons | Lucide React |
| Auth & storage | Supabase JS (anon key only) |
| Voice | Web Speech API (recognition + synthesis) |
| Testing | Node built-in test runner (`node --test`) |
| Backend (separate) | FastAPI eligibility engine in `../engine` |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- The FastAPI backend from `../engine` running locally (see [INTEGRATION.md](./INTEGRATION.md))

### 1. Install

```bash
cd citizen-scheme-assistant/frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :-- | :-: | :-- |
| `VITE_DEFAULT_LANGUAGE` | – | Default UI language (`hi` or `en`) |
| `VITE_API_BASE_URL` | – | Backend origin. Empty in dev → `http://127.0.0.1:8002`. Empty in production → same-origin proxy |
| `VITE_SUPABASE_URL` | – | Public Supabase project URL (enables login & profile) |
| `VITE_SUPABASE_ANON_KEY` | – | Public **anon** key only |

> ⚠️ Never put Gemini, database or service-role keys in `VITE_*` variables. Everything prefixed `VITE_` ships to the browser.

### 3. Run

```bash
npm run dev       # http://127.0.0.1:5175 (proxies /api and /health to :8002)
npm run build     # production build
npm run preview   # preview the build on http://127.0.0.1:5176
npm test          # run the test suite
```

---

## 🧱 Architecture

```
┌──────────────────────┐   /api/v1/*    ┌──────────────────────────┐
│  React + Vite (this) │ ─────────────▶ │  FastAPI Eligibility     │
│                      │ ◀───────────── │  Engine (../engine)      │
│  • UI & i18n         │  state, next   │  • decides next question │
│  • Ephemeral state   │  question,     │  • evaluates eligibility │
│  • Voice & chatbot   │  results       │  • explains results      │
└──────────┬───────────┘                └──────────────────────────┘
           │ optional (anon key)
           ▼
   ┌───────────────┐
   │   Supabase    │  Auth · profiles · document storage
   └───────────────┘
```

**Key principle — the frontend never decides eligibility.** It renders questions and results returned by the API. There are no browser-side eligibility calculations, no mock fallbacks in production and no demo bypasses. Input checks validate transport types only.

### API surface used

| Operation | Request |
| :-- | :-- |
| List schemes | `GET /api/v1/schemes?lang=en&limit=20&offset=0` |
| Scheme detail | `GET /api/v1/schemes/{id}?lang=hi` |
| Start screening | `POST /api/v1/questionnaire/start` |
| Next / restore | `POST /api/v1/questionnaire/next` |
| Answer / skip / clear / unknown | `POST /api/v1/questionnaire/answer` |
| Explain results | `POST /api/v1/results/explain` |

The server state (version, fingerprint, answers, skipped fields) is passed back unchanged — **no session IDs**. See [INTEGRATION.md](./INTEGRATION.md) for the full contract.

---

## 🗺 Routes

| Path | Page | Access |
| :-- | :-- | :-: |
| `/` | Home | Public |
| `/schemes` | Scheme catalogue with filters | Public |
| `/schemes/:code` | Scheme details | Public |
| `/screening` | Adaptive questionnaire | Public |
| `/results` | Eligibility results & checklist | Public |
| `/login` · `/signup` | Authentication | Public |
| `/profile` | Profile & documents | 🔐 Signed in |
| `/profile/details` | Profile details | 🔐 Signed in |

---

## 📁 Project Structure

```
frontend/
├── public/                  # Logo, artwork and sample document previews
├── src/
│   ├── auth/                # AuthContext + ProtectedRoute (Supabase)
│   ├── chatbot/             # Floating chatbot, voice controller, result cards
│   ├── components/
│   │   ├── common/          # Navbar, Footer, StatusBadge, Disclaimer, states…
│   │   ├── home/            # Hero, SearchBar, HowItWorks, TrustPrivacy…
│   │   ├── schemes/         # SchemeCard, FilterSidebar, SourceReferences
│   │   ├── questionnaire/   # QuestionInput, VoiceAssistant
│   │   ├── results/         # ResultCard, DocumentChecklist
│   │   ├── documents/       # DocumentCard, DocumentPreviewModal
│   │   └── profile/         # DocumentOwnershipChecklist
│   ├── config/              # Document types, matching rules, income bands
│   ├── constants/           # States/UTs and scheme constants
│   ├── documents/           # Secure upload service
│   ├── i18n/                # Translations + LanguageContext
│   ├── pages/               # Route-level pages
│   ├── profile/             # Profile → screening answer mapping
│   ├── services/            # apiClient, adapters, screeningFlow, scheme/session APIs
│   ├── mock/ · data/        # Synthetic fixtures (tests / explicit demo only)
│   └── styles/              # Tailwind directives & print styles
├── tests/                   # Service, voice, render and integration tests
├── INTEGRATION.md           # Backend contract & demo notes
└── vite.config.js
```

---

## 🔒 Privacy by Design

Built for **shared phones**, where many families use one device.

- 🧹 Answers, results and document ticks live **in memory / `sessionStorage` only** — a reload wipes them
- 🗑 A **"Clear Data / New Citizen"** action invalidates pending responses and clears all state
- 🚫 No answers are logged or sent to analytics; HTTP errors never expose submitted values
- 🎙 Voice answers are **confirmed before submission**; unrecognised speech is rejected
- 🔗 External links must be **HTTPS** with no embedded credentials
- 💾 Only the **language preference** may persist

> ℹ️ Browser speech recognition depends on browser/OS support and may use the browser vendor's remote service.

---

## 🧪 Testing

```bash
npm test
```

Tests cover:
- Request and state contracts with the backend
- Adaptive question selection and answer data types
- Skip / clear / unknown flows and history restore
- Completion modes and failed-explanation retries
- Network and `422` error handling, empty catalogue, language fallback
- Voice controller behaviour and safe React rendering
- API base URL resolution

These are service/controller and server-render tests, not browser end-to-end tests. Fixtures are synthetic and used only in tests.

---

## ♿ Accessibility

- Status shown with **icon + text**, never colour alone
- Read-aloud for questions and explanations
- Devanagari-ready typography
- Large touch targets and responsive layout for low-end phones
- Print-optimised document checklist

---

## 🤝 Contributing

1. Fork and create a feature branch
2. Keep eligibility logic in the **backend** — the frontend only renders
3. Run `npm test` and `npm run build` before opening a PR
4. See the repository-level `CONTRIBUTING.md` for conventions and merge order

---

## ⚠️ Disclaimer

This tool provides **screening guidance only**, not a legal or official determination of eligibility. Always confirm details on the relevant official government portal before applying.

---

<div align="center">

Made with ❤️ for the citizens of India 🇮🇳

**जन-जन तक योजनाएँ · Schemes for every citizen**

</div>
