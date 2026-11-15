param(
    [Parameter(Mandatory=$true)][string]$Message,
    [string]$Files = "."
)

$ErrorActionPreference = "Stop"
$stamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

# Stage everything under $Files except ignored files
git add $Files
if (git diff --cached --quiet) {
    Write-Host "[agent-commit] Nothing to commit at $stamp" -ForegroundColor Yellow
    Add-Content -Path MIRACLE_PROGRESS.log -Value "[$stamp] NOOP commit attempt: $Message"
    exit 0
}

git commit -m "$Message"
$hash = git rev-parse --short HEAD
Add-Content -Path MIRACLE_PROGRESS.log -Value "[$stamp] COMMIT $hash : $Message"
Write-Host "[agent-commit] Committed $hash" -ForegroundColor Green
