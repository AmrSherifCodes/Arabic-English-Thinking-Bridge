param(
    [ValidateSet("lint","test","build","all")][string]$Mode = "all",
    [switch]$Strict
)

$stamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$log = "MIRACLE_PROGRESS.log"
$failures = 0

function Log($msg) { Add-Content -Path $log -Value "[$stamp] $msg" }

if ($Mode -in @("lint","all")) {
    Write-Host "== tsc --noEmit ==" -ForegroundColor Cyan
    $out = npm run lint 2>&1
    if ($LASTEXITCODE -ne 0) { Log "LINT: FAIL"; $out | Select-String "error TS" | Select-Object -First 10 | Write-Host; $failures++ }
    else { Log "LINT: PASS"; Write-Host "PASS" -ForegroundColor Green }
}

if ($Mode -in @("test","all")) {
    Write-Host "== npm test (filtered) ==" -ForegroundColor Cyan
    $out = npm test 2>&1
    $bad = $out | Select-String -Pattern "✖|\bFAIL\b|ERR_ASSERTION|AssertionError|failing tests:" -CaseSensitive | Select-Object -First 10
    if ($bad) { $bad | Write-Host; Log "TEST: FAIL ($($bad.Count) lines)"; $failures++ }
    else { Log "TEST: PASS"; Write-Host "PASS (0 failures)" -ForegroundColor Green }
}

if ($Mode -in @("build","all")) {
    Write-Host "== npm run build ==" -ForegroundColor Cyan
    $out = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) { Log "BUILD: FAIL"; $out | Select-String "error" | Select-Object -First 5 | Write-Host; $failures++ }
    else { Log "BUILD: PASS"; Write-Host "PASS" -ForegroundColor Green }
}

if ($failures -gt 0 -and $Strict) { exit 1 }
Write-Host "`n$failures failure group(s). See $log" -ForegroundColor $(if ($failures) {"Yellow"} else {"Green"})
