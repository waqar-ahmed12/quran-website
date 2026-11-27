# Quran landing page

**Start here:** read `WEBSITE-BUILD.md` (current build instructions), then `PLAN.md` and
`design-system/quran-landing/MASTER.md`. Where they conflict, `WEBSITE-BUILD.md` wins.

## This PC is infected (Grenam/Renamer worm, found 2026-09-13)

- Never run `python`, `py`, `pip`, `ffmpeg`, Git Bash, or anything under `C:\ffmpeg-8.1.2-essentials_build\` or
  `%LOCALAPPDATA%\Programs\`. Running an infected `.exe` spreads the worm.
- The Bash tool is broken (Git's `bash.exe` is infected) — use PowerShell. If Grep/Glob fail, use
  `Get-ChildItem` / `Select-String`.
- Never use `dangerouslyDisableSandbox`.
- Safe: PowerShell cmdlets, `node` (validly signed), Opera GX. Before running any other `.exe`, check
  `Get-AuthenticodeSignature` is `Valid` and the file is not 533,504 bytes.
- Save images as PNG or WebP, never `.jpg`.
- **Obsidian is infected too** (found 2026-10-08): `C:\Users\Waqar Ahmed\Apps\Obsidian\Obsidian.exe` is the 533,504-byte
  worm (written 2026-09-30), and so are the Start-menu shortcut and `obsidian://` links that open it. The genuine,
  validly signed app is the hidden `gObsidian.exe` in the same folder. Never launch `Obsidian.exe` there.

## Working with the user

- Build one phase at a time (order in `WEBSITE-BUILD.md`, §7) and get sign-off before the next.
- The user prefers to run scripts themselves and paste the output: save the script, give one copy-paste command.
- **Qaida work:** read `QAIDA-BUILD.md` (steps, skills, decisions) and `QAIDA-CONTENT.md`. End every reply about the
  Qaida with one line: current step, its skills, next step (the user asked, 2026-09-14).
- **Building Lesson 2 (step 4)?** Read `docs/lesson-2/` first — the full specification, `README.md` in that folder
  says the order. `docs/lesson-2/09-going-in-order.md` changes the whole Qaida, not just that lesson.
- Preview with `node serve.js` → `http://localhost:8777/site/` (launch config "site"; "site-2" is the same on 8778, for when
  another chat holds 8777). Never `python -m http.server`.

## Site rules (security and speed, 2026-10-08)

- `site/_headers` sets a strict Content-Security-Policy, enforced by Netlify and by `serve.js` alike. Nothing loads from
  another site: fonts are in `site/fonts/` (`tools/self-host-fonts.js`). After editing or adding any inline `<script>`
  in a page, run `node tools/csp-hashes.js`, or the browser blocks it.
- A new page copies its `<head>` from an existing one: `fonts/fonts.css`, the font preloads and `prefetch.js`.
- Hero frames are cached for a year: after changing any frame file, bump `FRAMES_V` in `site/main.js` and the `?v=` in
  `site/index.html`'s preload.
- **Backend, database, accounts, sync, deployment, or anything across the whole system:** read
  `docs/architecture/README.md` first. It has the design, the build phases (A–I, `10-roadmap.md`) and the decision
  records (`decisions/`). Don't contradict an ADR; write a new one that supersedes it. When a phase is built, update the
  roadmap's status and `architecture.canvas` in the same sitting.
