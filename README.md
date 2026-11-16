# Senior HR Coordinator — Operations & Task Command Center

A zero-dependency Progressive Web App (PWA) for Senior HR Coordinators. Four interactive tabs, offline support, installable on iPhone, iPad, Android and desktop.

| Tab | What it covers |
| --- | --- |
| **Operations** | Daily, weekly, monthly, quarterly, bi-annual and annual task matrix with priorities, owners and SLAs |
| **Lifecycle** | Pre-boarding, Day 1–30 onboarding, internal mobility and offboarding SOPs |
| **Compliance** | FLSA, FMLA/CFRA, ADA, OSHA, I-9, pay transparency, retention timelines and ER triage |
| **Toolkit** | Four copy-ready templates, KPI benchmarks and the Senior vs. Junior matrix |

Features: live search, priority and cadence filters, progress ring, checklist progress saved on-device (`localStorage`), JSON/CSV export, light/dark theme, install banner, offline indicator, keyboard-accessible tabs.

> **Disclaimer:** The content is operational reference guidance, not legal advice. Deadlines and thresholds (final pay, leave, pay transparency, minimum wage, FLSA salary levels) change and vary by state and city. Confirm with Legal or counsel before acting.

---

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder so the service worker works:

```bash
npx serve .        # or: python3 -m http.server 8080
```

Run the tests (Node 18+):

```bash
node tests/app.test.js
```

---

## Deploy from an iPhone only (GitHub + GitHub Pages)

You need a free GitHub account and Safari. No computer, terminal or Codespaces required.

### 1. Unzip
1. Download `senior-hr-coordinator-pwa.zip` (it lands in the **Files** app, usually *Downloads*).
2. Tap the zip once. iOS creates a folder named `senior-hr-coordinator-pwa`.

### 2. Create the repository
1. In Safari open **github.com** and sign in.
2. Tap **+** → **New repository**.
3. Name it `senior-hr-coordinator-pwa`, choose **Public**, tick **Add a README file** (optional), tap **Create repository**.

### 3. Upload the root files
The iPhone file picker selects files, not folders, so upload in three small batches.

1. In the repo tap **Add file → Upload files**.
2. Tap **choose your files**, then **Browse** and open the unzipped folder.
3. Tap **Select** and pick every **file** in the top level of the folder: `index.html`, `style.css`, `script.js`, `manifest.json`, `service-worker.js`, `offline.html`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `README.md`, `LICENSE`, `robots.txt`, `sitemap.xml`, `browserconfig.xml`, `package.json`.
4. Tap **Commit changes**.

> iOS Files hides names that start with a dot (`.gitignore`, `.env.example`). They are optional and not needed to run the app. You can add them later with **Add file → Create new file**.

### 4. Upload the sub-folders (required: `assets/` and `screenshots/`)
GitHub can create a folder when you type a path in a new file name:

1. **Add file → Create new file**. In the name box type `assets/.gitkeep` (typing `/` creates the folder). Tap **Commit changes**.
2. Open the new `assets` folder, then **Add file → Upload files**, and select `logo.svg` and `og-image.png` from the unzipped `assets` folder. Commit.
3. Repeat for `screenshots`: create `screenshots/.gitkeep`, open it, upload `mobile-view.png` and `desktop-view.png`. Commit.
4. Optional extras (not needed for the app to run): repeat the same steps for `tests`, `docs`, `api`, `backend`, `database` and `config`.

### 5. Turn on GitHub Pages
1. Repo → **Settings** → **Pages** (under *Code and automation*).
2. **Source:** *Deploy from a branch*. **Branch:** `main`, folder `/ (root)`. Tap **Save**.
3. Wait 1–2 minutes. Your site is at `https://YOUR-GITHUB-USERNAME.github.io/senior-hr-coordinator-pwa/`.

### 6. Install it on your iPhone
1. Open the Pages URL in **Safari**.
2. Tap **Share → Add to Home Screen → Add**.
3. Launch it from the home screen. After the first load it works offline.

### 7. Update the URLs (optional, for SEO and sharing)
Edit `sitemap.xml` and `robots.txt` and replace `YOUR-GITHUB-USERNAME` with your GitHub username. For link previews that need absolute URLs, change the `og:url` and image paths in `index.html` to your full Pages URL.

---

## Project structure

```
index.html  style.css  script.js  manifest.json  service-worker.js  offline.html
favicon.ico  icon-192.png  icon-512.png  robots.txt  sitemap.xml  browserconfig.xml
assets/        logo.svg, og-image.png
screenshots/   mobile-view.png, desktop-view.png
tests/         app.test.js
docs/          HR-SOP-FRAMEWORK.md
api/           hr-tasks-schema.json
backend/       webhook-handler.example.js
database/      schema.sql
config/        app.config.json
```

## Optional: HRIS / Slack integrations
`backend/webhook-handler.example.js` is a reference serverless function. It is **not** used by the static site. Copy `.env.example` to `.env` in your serverless host and set the variables. `database/schema.sql` mirrors the local data model if you later move progress to a server.

## Updating the offline cache
When you change any cached file, bump `VERSION` in `service-worker.js` so installed apps pick up the update.

## Privacy
All progress is stored only in your browser. The app makes no network requests other than loading its own files. Do not paste employee PII into the templates or exports.

## License
MIT — see `LICENSE`.
