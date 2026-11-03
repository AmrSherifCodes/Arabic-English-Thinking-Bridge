# ⚡ Hybrid AI Toolchain & Routing Strategy Guide

This workspace is configured with a **Hybrid AI Routing Strategy** to eliminate 5-hour rolling token limits during 20-25 hour coding sessions.

---

## 🔀 Model Routing Matrix

| Task Category | Assigned Model | Provider | Cost Profile |
| :--- | :--- | :--- | :--- |
| **React / TypeScript UI Components** | `deepseek/deepseek-chat-v3.2` | OpenRouter | ~$0.0002 / 1k tokens |
| **Tailwind Styling & Layout Fixes** | `deepseek/deepseek-chat-v3.2` | OpenRouter | ~$0.0002 / 1k tokens |
| **Capacitor Android / iOS Configs** | `qwen/qwen-3-coder` | OpenRouter | ~$0.0001 / 1k tokens |
| **Unit Tests, Mocks & Regex** | `qwen/qwen-3-coder` | OpenRouter | ~$0.0001 / 1k tokens |
| **Boilerplate & Type Definitions** | `qwen/qwen-3-coder` | OpenRouter | ~$0.0001 / 1k tokens |
| **Multi-File Architecture Refactoring** | `claude-3-5-sonnet` / Max | Anthropic Direct | High IQ (Reserved) |
| **Complex Async Race Conditions** | `claude-3-5-sonnet` / Max | Anthropic Direct | High IQ (Reserved) |
| **Gradle / Native Build Troubleshooting** | `claude-3-5-sonnet` / Max | Anthropic Direct | High IQ (Reserved) |

---

## 🔄 STATE.md Handoff Protocol (Every 10-12 Turns)

To prevent context snowballing (which consumes massive input tokens on every turn):

1. **Trigger Prompt** (Run every 10-12 turns):
   > *"Output a 15-line technical state summary of what we just changed and what remains into STATE.md. Then we will start a new chat."*

2. **Starting a New Chat**:
   - Open a fresh chat thread.
   - Start with: *"Read STATE.md and resume from section 2."*
   - This saves up to 90% of input tokens on every message.

---

## 🔑 Key Configuration Files
- `.antigravityrules` — Enforces strict zero-preamble, diff-only output rules.
- `scripts/setup-hybrid-env.ps1` — PowerShell environment variable setup for OpenRouter.
- `scripts/setup-hybrid-env.sh` — Bash environment variable setup for OpenRouter.
- `STATE.md` — Live technical context log for zero-token context resets.
