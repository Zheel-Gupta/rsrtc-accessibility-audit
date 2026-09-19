# RSRTC Staff Portal — Bus Operations Capstone

A production-style internal staff portal for RSRTC (Rajasthan State Road Transport Corporation), built as a full-stack architecture capstone. It combines an accessibility audit of the real RSRTC booking site with an original, semantic, accessible, responsive, and dynamically data-driven application inspired by that audit's findings.

**Live demo:** _add your deployed URL here after publishing (see Deployment below)_
**Repository:** https://github.com/Zheel-Gupta/rsrtc-accessibility-audit

---

## Feature highlights

- **Simulated authentication** — `login.html` + `auth.js` gate the dashboard and inventory pages behind a sign-in screen, with session state kept in `localStorage` and a working sign-out flow.
- **Dynamic CRUD** — the "Scheduled services" table on the dashboard supports full Create, Read, Update, and Delete, backed by `services.js`, with state persisted to `localStorage` so changes survive a page reload.
- **Live REST API integration** — the Spare Parts Inventory page (`inventory.html`) fetches real data from a public API (FakeStoreAPI) using `async/await`, with real-time search, category filtering, and sorting that update the DOM without a page reload.
- **Persistent client state** — a shopping cart on the inventory page and the services table both read/write `localStorage`, so a returning user's data is exactly where they left it.
- **Accessible by design** — semantic HTML5 landmarks, labelled form controls, visible focus indicators, a skip link, and an accessible modal dialog pattern (focus trap + `Escape` to close) throughout — directly addressing the issues documented in the audit.
- **Responsive, token-based styling** — a single `style.css` built on CSS custom properties (design tokens) for color, type, spacing, and radius, with mobile-first breakpoints at 320 / 768 / 1024 / 1440px, plus a light/dark theme toggle and glassmorphism surfaces.
- **Robust error and loading states** — the inventory page shows shimmering skeleton cards while data loads and a dismissible, retryable error banner if the API request fails.

---

## Architecture

```
rsrtc-accessibility-audit/
├── client/
│   ├── login.html        # Simulated sign-in screen
│   ├── index.html        # Dashboard: services CRUD table + form
│   ├── inventory.html    # Spare parts catalog: live REST API + cart
│   ├── style.css         # Design tokens + all responsive/theme styling
│   ├── auth.js           # Simulated session management (login/guard/logout)
│   ├── services.js       # CRUD logic for the scheduled-services table
│   ├── api.js             # Fetch layer for the public REST API (FakeStoreAPI)
│   └── app.js             # DOM logic for inventory: search, filter, sort, cart
├── server/                # Reserved for a future real backend (not used by this client-only capstone)
├── docs/
│   ├── audit/              # Accessibility audit: worksheet CSV + evidence screenshots
│   └── responsive-demo/    # Screenshots across breakpoints and themes
├── test/                   # Reserved for automated tests
└── README.md
```

**Boundaries.** `client/` is a fully static, client-only application — no build step, no bundler, just ES modules loaded directly by the browser. `auth.js`, `services.js`, and `api.js` each own one responsibility and are imported where needed, so logic isn't duplicated across pages. `server/` and `test/` are kept as placeholders in the architecture to show where a real backend and automated test suite would live if this capstone were extended into a full-stack app with a real database instead of `localStorage`.

**Data flow (services CRUD).** `index.html` loads `services.js` as a module. `initServiceCrud()` reads any saved services from `localStorage` (seeding five defaults on first run), renders the table, and wires the Add/Edit/Delete form and row buttons. Every change calls back into `services.js`, which updates state, re-saves to `localStorage`, and re-renders the table — no page reload is needed at any step.

**Data flow (inventory / REST API).** `inventory.html` loads `app.js`, which calls `fetchProducts()` and `fetchCategories()` from `api.js` using `async/await` and `fetch`. While waiting, skeleton cards render. On success, products render into the grid and category tabs populate dynamically from the API's own category list. Search, category, and sort all filter the in-memory product list client-side and re-render instantly. "Add to cart" writes to `localStorage` via a small cart module inside `app.js`, and the cart drawer reads back from the same store.

**Authentication (simulated).** This capstone does not have a real backend, so `auth.js` simulates the auth *pattern* used in production apps: `login.html` accepts any Staff ID and a 4+ character password, writes a session object to `localStorage`, and redirects to the dashboard. `requireAuth()` runs at the top of every protected page and bounces unauthenticated visitors back to `login.html`. `wireSignOut()` clears the session and returns to the login screen. This is clearly labelled in the UI as a demo and is not a real security boundary.

---

## Local setup

No installation or build step is required — this is a static site of plain HTML, CSS, and ES module JavaScript.

```bash
git clone https://github.com/Zheel-Gupta/rsrtc-accessibility-audit.git
cd rsrtc-accessibility-audit/client
```

Because the pages use `<script type="module">`, opening `index.html` directly via `file://` will block the module scripts in most browsers. Serve the folder locally instead:

```bash
# Option A — Python (built into most systems)
python -m http.server 8000
# then open http://localhost:8000/login.html

# Option B — VS Code
# Right-click index.html (or login.html) -> "Open with Live Server"
```

Start at `login.html`, sign in with any Staff ID and a password of 4 or more characters, and you'll land on the dashboard.

---

## Deployment

This project deploys as a static site with no build step. Using **GitHub Pages** (already hosted on GitHub, so no extra account is needed):

1. On GitHub, open the repository -> **Settings** -> **Pages**.
2. Under **Build and deployment -> Source**, choose **Deploy from a branch**.
3. Set **Branch** to `main`. GitHub Pages can only publish from the repo root or a `/docs` folder, so the simplest path is copying (or moving) the contents of `client/` into a top-level `/docs` folder and pointing Pages at `main` / `/docs`, or moving this client app into its own dedicated repository where `client/`'s contents sit at the repo root.
4. Save. GitHub will publish the site at `https://<username>.github.io/<repo-name>/` within a minute or two.
5. Copy that URL into the **Live demo** link at the top of this README and into your capstone submission.

Netlify or Vercel work identically for a static site like this: connect the GitHub repository, set the publish directory to `client`, leave the build command empty, and deploy.

---

## Relationship to the accessibility audit

The original audit (`docs/audit/accessibility-audit-rsrtc.csv`) documented five real issues on the live RSRTC booking portal: missing form labels, an unlabelled dropdown, a keyboard-unreachable link, a missing `lang` attribute, and links with no discernible name. Every one of those issues is deliberately avoided in this capstone: all inputs have linked `<label>` elements, the `<html>` tag declares `lang="en"`, every interactive element is reachable and operable by keyboard with a visible focus ring, and all links and buttons have clear, discernible text. The capstone is, in effect, the accessible version of the site that was audited.
