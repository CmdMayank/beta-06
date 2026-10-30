# YojanaMitra (योजनामित्र) — Frontend Foundation & UI

AI-assisted Indian Government Scheme Discovery & Eligibility Screening Platform.

Built with **React + Vite**, styled with **Tailwind CSS**, and architected for **Bilingual (Hindi/English)** citizen assistance with **Shared-Phone Ephemeral Privacy**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` (Tested on `v24.15.0`)
- npm `v9+` (Tested on `v11.12.1`)

### Installation & Run

```bash
# Navigate to frontend folder
cd citizen-scheme-assistant/frontend

# Install dependencies (if not already installed)
npm install

# Start local Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🛠 Tech Stack

- **Framework**: React 18
- **Bundler / Dev Server**: Vite 5
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS 3 (configured with Indian public-service tricolour palette: saffron, emerald green, and charcoal navy)
- **Icons**: Lucide React
- **Typography**: Inter & Noto Sans Devanagari (Google Fonts)
- **Speech API**: Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`) for audio read-aloud & voice query assistance

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── logo.svg                # YojanaMitra emblem (Ashoka chakra & tricolour motifs)
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives
│   │   │   ├── Navbar.jsx      # Navigation, Logo, Language switcher & Data wipe trigger
│   │   │   ├── Footer.jsx      # Disclaimer, official portals (.gov.in) & transparency links
│   │   │   ├── LanguageSwitcher.jsx
│   │   │   ├── StatusBadge.jsx # 3 outcomes with distinct icons + text (not color alone)
│   │   │   ├── ProgressBar.jsx # Step progress indicator
│   │   │   ├── Disclaimer.jsx  # Mandatory statutory warning box
│   │   │   ├── EmptyState.jsx  # Search & filter empty state
│   │   │   ├── LoadingState.jsx
│   │   │   └── ErrorState.jsx
│   │   ├── home/               # Homepage sections
│   │   │   ├── HeroSection.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── CategoryCard.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── FeaturedSchemes.jsx
│   │   │   └── TrustPrivacy.jsx
│   │   ├── schemes/            # Scheme discovery
│   │   │   ├── SchemeCard.jsx
│   │   │   └── FilterSidebar.jsx # Level, Category, and State/UT filter
│   │   ├── questionnaire/      # Eligibility Screening
│   │   │   ├── QuestionInput.jsx # TEXT, NUMBER, DATE, BOOLEAN, SINGLE_SELECT, MULTI_SELECT
│   │   │   └── VoiceAssistant.jsx# Audio read-aloud & speech input
│   │   └── results/            # Results breakdown
│   │       ├── ResultCard.jsx  # Scheme outcome, decisive rule, missing info, required docs
│   │       └── DocumentChecklist.jsx # Consolidated actionable checklist with print view
│   ├── data/                   # Separate mock data fixtures conforming to schemas
│   │   ├── mockSchemes.js      # Conforms to contracts/scheme.schema.json
│   │   ├── mockQuestions.js    # Demographics & questionnaire items
│   │   └── mockResults.js      # Conforms to contracts/eligibility-result.schema.json
│   ├── i18n/                   # Centralized bilingual support
│   │   ├── translations.js     # Standard terminology from docs/GLOSSARY.md
│   │   └── LanguageContext.jsx # Ephemeral sessionStorage language provider
│   ├── services/               # API abstraction layer (FastAPI backend ready)
│   │   ├── apiClient.js        # Configured via VITE_API_BASE_URL
│   │   ├── sessionApi.js       # Session lifecycle & question/answer endpoints
│   │   └── schemeApi.js        # Scheme catalog & details endpoints
│   ├── styles/
│   │   └── index.css           # Tailwind directives & print styles
│   ├── pages/
│   │   ├── HomePage.jsx        # /
│   │   ├── SchemesPage.jsx     # /schemes
│   │   ├── SchemeDetailsPage.jsx # /schemes/:code
│   │   ├── ScreeningPage.jsx   # /screening
│   │   ├── ResultsPage.jsx     # /results
│   │   └── NotFoundPage.jsx    # 404
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🔒 Shared-Phone Privacy & Invariants

1. **Zero Persistent Tracking**: Citizen answers and sessions are saved solely in volatile browser `sessionStorage`. Closing the tab or clicking **"Clear Data / New Citizen"** immediately wipes all traces from client memory.
2. **Separation of Logic**: The frontend contains **no** hardcoded eligibility decisions. It renders questions and displays outcome results received from the API (or contract-compliant mock data in dev).
3. **Multi-Modal Accessibility**: Web Speech API is integrated for audio read-aloud of question prompts and explanations in Hindi and English.

