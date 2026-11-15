param([Parameter(Mandatory=$true)][string]$ToPhase)

$state = Get-Content MIRACLE_STATE.md -Raw
$stamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$hash  = git rev-parse --short HEAD

$state = $state -replace 'phase: .*', "phase: $ToPhase"
$state = $state -replace 'status: .*', 'status: in_progress'
$state = $state -replace 'last_commit: .*', "last_commit: $hash"
Set-Content MIRACLE_STATE.md $state

Add-Content MIRACLE_PROGRESS.log "[$stamp] ADVANCE -> $ToPhase (commit $hash)"
Write-Host "Advanced to $ToPhase" -ForegroundColor Green
