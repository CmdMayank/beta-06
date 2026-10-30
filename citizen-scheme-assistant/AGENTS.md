# AGENTS.md: Rules for AI Coding Agents

All AI assistants (including Google Antigravity, GitHub Copilot, Claude, Cursor, ChatGPT, etc.) operating in this repository **must** strictly adhere to the following rules.

---

## Rule 1: Respect Folder Ownership
You are only authorized to generate or modify code in the folder assigned for your current task:
- If working on **Frontend**: Edit only `frontend/`. Do not touch `engine/` or `data/schemes/`.
- If working on **Engine**: Edit only `engine/`. Do not touch `frontend/` or `data/schemes/`.
- If working on **Data/Schemes**: Edit only `data/schemes/`. Do not touch `frontend/` or `engine/`.
- **Contracts (`contracts/`)**: Do NOT edit schema files unless explicitly commanded by the user with a corresponding Architecture Decision Record (ADR) update in `docs/DECISIONS.md`.

---

## Rule 2: Never Hard-Code UI Strings
- Every user-facing label, prompt, button, placeholder, error message, and audio readout text in `frontend/` must be referenced through an internationalization (i18n) key supporting both **Hindi (`hi`)** and **English (`en`)**.
- Refer to `docs/GLOSSARY.md` for standardized translations of official terminology.
- Scheme-specific titles, descriptions, and criteria texts come dynamically from `data/schemes/`, never from UI code.

---

## Rule 3: Never Invent Rules, Thresholds, or Official URLs
- Do NOT hallucinate or guess government criteria, income ceilings, land holding boundaries, or official scheme URLs.
- All scheme criteria must be sourced from official government notifications (`.gov.in` / `.nic.in`) and stored in `data/schemes/` with an accurate `last_checked_date`.
- If a rule threshold is uncertain or depends on unverified state modifications, mark the rule evaluation condition with confidence `"UNCERTAIN"` and explain what exact piece of information is required.

---

## Rule 4: Scheme Logic Separation Invariant
- The frontend must NEVER perform eligibility checks or contain conditional logic deciding whether a user qualifies for a scheme.
- The engine must NEVER produce HTML or presentation markup.
- Communication between frontend and engine strictly follows `contracts/`.

---

## Rule 5: Shared-Phone Privacy & Ephemeral Storage
- Never write citizen input data (income, caste, gender, age, land holdings) to persistent disk, third-party analytics, remote databases, or `localStorage` that outlives a user's session.
- Keep session state in volatile client memory or session storage with a prominent "Clear Data" mechanism.

---

## Rule 6: Keep PRs Small, Focused, and Atomic
- Do not combine refactorings with feature additions.
- If a task involves updating documentation and code, keep them clearly partitioned.
- Ensure all JSON schemas, mock data, and test cases validate before concluding your turn.
