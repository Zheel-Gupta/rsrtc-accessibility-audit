# RSRTC Accessibility Audit & Repository Architecture

Reverse-engineering the RSRTC online bus booking portal (`rsrtconline.rajasthan.gov.in`) to document real accessibility issues and lay out a maintainable full-stack project foundation.

## What's in this repo

- **Accessibility audit** of the RSRTC booking site (Lighthouse + manual keyboard-only navigation testing)
- **Project skeleton** demonstrating a clean client/server/docs/test architecture
- **Evidence** (screenshots) backing each documented issue

---

## 1. Boundaries — what lives where and why

This project follows a monorepo-style layout that keeps concerns cleanly separated, so each part of the codebase can be worked on, tested, and reasoned about independently.

- **`client/`** — All frontend code. Responsible only for rendering UI and capturing user input/interaction. It never talks to a database directly; it only communicates with `server/` through defined API calls.
- **`server/`** — All backend code. Responsible for business logic, validation, and data access. It has no knowledge of how the UI looks — it only accepts requests and returns data/responses.
- **`docs/`** — All project documentation, including this README and the accessibility audit (`docs/audit/`), which holds the completed audit worksheet (CSV) and supporting evidence screenshots.
- **`test/`** — All automated tests, kept separate from application code so test suites can be run, scaled, or swapped without touching `client/` or `server/`.

Keeping these boundaries strict means a change to the UI never risks breaking backend logic, and vice versa — each folder has one clear job.

---

## 2. Local setup

To run this project locally once client/server code is added:

```bash
# Clone the repository
git clone <your-repo-url>
cd rsrtc-accessibility-audit

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Run the server (from /server)
npm run dev

# Run the client (from /client, in a separate terminal)
npm run dev
```

Environment variables (when needed) should be placed in a `.env` file inside `server/`, and never committed to version control.

---

## 3. First vertical feature slice

To prove the architecture connects end-to-end (not just empty folders), here's the first feature this project is designed to support — a simplified version of RSRTC's own bus search:

1. **Client**: User fills in "From Stop," "To Stop," and "Journey Date" in a properly labeled form and clicks **Search**.
2. **Client → Server**: A `POST /api/search-buses` request is sent with the form data.
3. **Server**: Validates the input (checks required fields aren't empty, date is valid), then queries available bus routes matching the criteria.
4. **Server → Client**: Server responds with a JSON list of matching buses (or an empty list with a clear message).
5. **Client**: Displays the results in an accessible, keyboard-navigable list — each result reachable via `Tab`, with visible focus indicators throughout.

This slice deliberately mirrors the real accessibility issues found in the audit (missing form labels, missing focus indicators) — so the first feature built on this skeleton is designed correctly from the start, unlike the audited site.

---

## 4. Accessibility Audit Summary

**Site audited:** `rsrtconline.rajasthan.gov.in` (RSRTC online booking portal)
**Lighthouse Accessibility score:** 56/100
**Method:** Automated Lighthouse audit + manual keyboard-only navigation testing

Full findings with evidence, severity, and recommended fixes are documented in [`docs/audit/accessibility-audit-rsrtc.csv`](docs/audit/accessibility-audit-rsrtc.csv).

| ID | Issue | Severity |
|---|---|---|
| WEB-001 | Search form inputs missing associated labels | Critical |
| WEB-002 | Depot Name dropdown missing associated label | Major |
| WEB-003 | Registration portal link unreachable via keyboard | Major |
| WEB-004 | "Refund Status" nav item has no visible focus indicator | Major |
| WEB-005 | Multiple links lack a discernible accessible name | Minor |

Supporting screenshots are in [`docs/audit/screenshots/`](docs/audit/screenshots/).
