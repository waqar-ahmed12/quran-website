# One-time setup for a new Windows PC: installs Git, Node.js LTS and Python 3, then checks them.
# Run in PowerShell:  powershell -ExecutionPolicy Bypass -File .\setup-pc.ps1
# Safe to run again; anything already installed is skipped.

$apps = @(
  @{ Id = 'Git.Git';                Name = 'Git' },
  @{ Id = 'OpenJS.NodeJS.LTS';      Name = 'Node.js LTS' },
  @{ Id = 'Python.Python.3.12';     Name = 'Python 3.12' }
)

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget is missing. Install 'App Installer' from the Microsoft Store, then run this again." -ForegroundColor Red
  exit 1
}

foreach ($app in $apps) {
  Write-Host "`n== $($app.Name) ==" -ForegroundColor Cyan
  winget install --id $app.Id -e --source winget --accept-package-agreements --accept-source-agreements
}

# Pick up the new PATH without reopening PowerShell.
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')

Write-Host "`n== Check ==" -ForegroundColor Cyan
foreach ($cmd in @('git --version', 'node --version', 'python --version')) {
  try { Write-Host ("{0,-18} {1}" -f $cmd, (Invoke-Expression $cmd 2>&1)) }
  catch { Write-Host ("{0,-18} NOT FOUND - close and reopen PowerShell, then try again" -f $cmd) -ForegroundColor Yellow }
}
Write-Host "`nDone. Preview the site with:  node serve.js   then open http://localhost:8777/site/" -ForegroundColor Green
