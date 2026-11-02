param (
    [string]$Version = "3.0.1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Launching Thinking Bridge Release: v$Version" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Users\MSI\AppData\Roaming\.minecraft\runtime\java-runtime-delta\windows\java-runtime-delta"
node scripts/release.js $Version

