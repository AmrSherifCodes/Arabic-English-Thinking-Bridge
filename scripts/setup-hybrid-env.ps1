# Hybrid AI Toolchain Setup for AntiGravity / Claude Code CLI via OpenRouter (PowerShell)
# --------------------------------------------------------------------------------------
param(
  [string]$ApiKey = $env:OPENROUTER_API_KEY
)

if (-not $ApiKey) {
  Write-Warning "OPENROUTER_API_KEY is not set. Using placeholder."
  $ApiKey = "sk-or-v1-your-openrouter-key"
}

$env:ANTHROPIC_BASE_URL = "https://openrouter.ai/api"
$env:ANTHROPIC_AUTH_TOKEN = $ApiKey
$env:ANTHROPIC_API_KEY = ""
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = "deepseek/deepseek-chat-v3.2"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = "qwen/qwen-3-coder"

Write-Host "[✓] Hybrid AI environment configured for this session:" -ForegroundColor Green
Write-Host "    ANTHROPIC_BASE_URL = $env:ANTHROPIC_BASE_URL"
Write-Host "    SONNET ROUTE       = $env:ANTHROPIC_DEFAULT_SONNET_MODEL"
Write-Host "    HAIKU ROUTE        = $env:ANTHROPIC_DEFAULT_HAIKU_MODEL"
