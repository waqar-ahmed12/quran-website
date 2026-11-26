# Quran landing page

**Start here:** read `WEBSITE-BUILD.md` (current build instructions), then `PLAN.md` and
`design-system/quran-landing/MASTER.md`. Where they conflict, `WEBSITE-BUILD.md` wins.

## This PC (new, clean — set up 2026-11-26)

- The old PC had a worm (Grenam/Renamer, 2026-09-13). This is a **new, clean PC**, so those rules no longer apply.
  Python, `pip`, Git Bash and the Bash tool are fine to use. Older notes in `PLAN.md`/`WEBSITE-BUILD.md` about
  the worm describe the old PC only.
- Tools: Git, Node.js LTS, Python 3. To set them up, run `setup-pc.ps1` (see `WEBSITE-BUILD.md` §0).
- Never use `dangerouslyDisableSandbox`.
- Keep saving images as PNG or WebP (the existing assets are, and the pipeline expects it).

## Working with the user

- Build one phase at a time (order in `WEBSITE-BUILD.md`, §7) and get sign-off before the next.
- The user prefers to run scripts themselves and paste the output: save the script, give one copy-paste command.
- **Qaida work:** read `QAIDA-BUILD.md` (steps, skills, decisions) and `QAIDA-CONTENT.md`. End every reply about the
  Qaida with one line: current step, its skills, next step (the user asked, 2026-09-14).
- Preview with `node serve.js` → `http://localhost:8777/site/` (launch config "site").
