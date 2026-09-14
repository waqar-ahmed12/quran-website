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

## Working with the user

- Build one phase at a time (order in `WEBSITE-BUILD.md`, §7) and get sign-off before the next.
- The user prefers to run scripts themselves and paste the output: save the script, give one copy-paste command.
- **Qaida work:** read `QAIDA-BUILD.md` (steps, skills, decisions) and `QAIDA-CONTENT.md`. End every reply about the
  Qaida with one line: current step, its skills, next step (the user asked, 2026-09-14).
- Preview with `node serve.js` → `http://localhost:8777/site/` (launch config "site"). Never `python -m http.server`.
