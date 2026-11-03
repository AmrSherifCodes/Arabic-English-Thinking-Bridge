#!/usr/bin/env bash
# Hybrid AI Toolchain Setup for AntiGravity / Claude Code CLI via OpenRouter
# -------------------------------------------------------------------------
# Usage:
#   export OPENROUTER_API_KEY="sk-or-v1-your-actual-key"
#   source ./scripts/setup-hybrid-env.sh

if [ -z "$OPENROUTER_API_KEY" ]; then
  echo "[!] Warning: OPENROUTER_API_KEY is not set. Set it before running or pass it as an argument."
  echo "    Example: export OPENROUTER_API_KEY=\"sk-or-v1-...\""
fi

export ANTHROPIC_BASE_URL="https://openrouter.ai/api"
export ANTHROPIC_AUTH_TOKEN="${OPENROUTER_API_KEY:-sk-or-v1-your-openrouter-key}"
export ANTHROPIC_API_KEY=""
export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek/deepseek-chat-v3.2"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="qwen/qwen-3-coder"

echo "[✓] Hybrid AI environment configured:"
echo "    ANTHROPIC_BASE_URL = $ANTHROPIC_BASE_URL"
echo "    SONNET ROUTE       = $ANTHROPIC_DEFAULT_SONNET_MODEL"
echo "    HAIKU ROUTE        = $ANTHROPIC_DEFAULT_HAIKU_MODEL"
