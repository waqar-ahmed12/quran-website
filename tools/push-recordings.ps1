# Puts the teacher's original recordings and cut lists into git and pushes the branch, before this PC is replaced.
# recordings-inbox/ is git-ignored, so the files are force-added. The repo is PUBLIC: this publishes the raw recordings.
# The decoded WAVs and compare clips are left out on purpose: tools/m4a-to-wav.ps1 and tools/cut-letters.js rebuild them
# exactly from the .m4a files and the cut lists, so nothing is lost.
#
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\push-recordings.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$d = 'recordings-inbox/19 Nov audios 4 files'
git add -f 'recordings-inbox/*.html' 'recordings-inbox/*.js' 'recordings-inbox/WhatsApp Audio 2026-10-14 at 3.46.52 AM - Copy.mp4' "$d/*.m4a" "$d/*.json" 'tools/push-recordings.ps1'
git status --short
git commit -m "chore(recordings): keep the teacher's original recordings and cut lists in the repo" -m "The PC is being replaced, so the raw material moves from the ignored recordings-inbox/ into git: the four 19 Nov .m4a recordings, the October WhatsApp clip, the cut lists, and the check and compare pages. The decoded WAVs and compare clips are left out: tools/m4a-to-wav.ps1 and tools/cut-letters.js rebuild them exactly." -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push origin qaida-home-and-lesson-1-fixes
git status -sb | Select-Object -First 1
