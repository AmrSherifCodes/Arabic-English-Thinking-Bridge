// 3.5-Second Interpretation Chosen: Countdown Delay Indicator
// Implemented with requestAnimationFrame and high-resolution performance.now() timestamps.
// This prevents drift, avoids setInterval stutter, and never blocks the main rendering thread.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Cpu,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  ShieldAlert,
  Boxes
} from 'lucide-react';

export interface ToolCallRecord {
  toolName: string;
  args: Record<string, any>;
  result: Record<string, any>;
  step: number;
}

export interface AgentResponse {
  success: boolean;
  prompt: string;
  agentOutput: string;
  toolCalls: ToolCallRecord[];
  stepsCount: number;
  durationMs: number;
  provider: string;
}

const COUNTDOWN_TOTAL_MS = 3500; // 3.5 seconds

export default function AgentLandingPage() {
  const [prompt, setPrompt] = useState<string>(
    'Analyze Arabic nominal sentence structure ("أنا مهندس") and determine copula transfer interference'
  );
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownProgress, setCountdownProgress] = useState<number>(0);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(3.5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [agentResponse, setAgentResponse] = useState<AgentResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // High-precision non-drifting countdown powered by requestAnimationFrame
  const startCountdownAndRun = useCallback(() => {
    if (isLoading || isCountingDown) return;
    setErrorMsg(null);
    setAgentResponse(null);
    setIsCountingDown(true);
    setCountdownProgress(0);
    setTimeRemainingSec(3.5);

    startTimeRef.current = performance.now();

    const tick = (currentTime: number) => {
      if (!startTimeRef.current) return;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(100, (elapsed / COUNTDOWN_TOTAL_MS) * 100);
      const remaining = Math.max(0, (COUNTDOWN_TOTAL_MS - elapsed) / 1000);

      setCountdownProgress(progress);
      setTimeRemainingSec(Number(remaining.toFixed(2)));

      if (elapsed < COUNTDOWN_TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Countdown reached 3.5s: Trigger the server-side autonomous agent loop
        setIsCountingDown(false);
        setCountdownProgress(100);
        setTimeRemainingSec(0);
        void executeAgent();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [isLoading, isCountingDown, prompt]);

  const cancelCountdown = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsCountingDown(false);
    setCountdownProgress(0);
    setTimeRemainingSec(3.5);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const executeAgent = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (!res.ok) {
        throw new Error(`Agent API responded with HTTP status ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setAgentResponse(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute autonomous agent loop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E13] text-[#EEF2F5] p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="border-b border-[#1E2933] pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-semibold">
            <Cpu size={14} />
            <span>Autonomous Tool-Loop Agent · tb-eg.vercel.app</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Cognitive Bridge <span className="text-[#2DD4BF]">AI Agent</span>
          </h1>
          <p className="text-[#9AA7B2] text-sm sm:text-base leading-relaxed">
            Unlike a passive chatbot, this production agent executes multi-step autonomous tool calls
            (knowledge retrieval, metric computation, and state auditing) via the Vercel AI SDK before generating its response.
          </p>
        </header>

        {/* 3.5-Second Countdown / Execution Controller Card */}
        <div className="p-6 rounded-2xl bg-[#0F151C] border border-[#1E2933] shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2933] pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#EEF2F5]">
              <Activity className="text-[#F5B942]" size={18} />
              <span>3.5-Second Precise Delay Timer (requestAnimationFrame)</span>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-lg bg-[#0A0E13] border border-[#1E2933] text-[#2DD4BF]">
              {isCountingDown ? `TICKING: ${timeRemainingSec.toFixed(2)}s` : 'READY: 3.50s'}
            </div>
          </div>

          {/* Progress Bar (Visible 3.5s Indicator) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#9AA7B2] font-mono">
              <span>Countdown Progress</span>
              <span>{Math.round(countdownProgress)}%</span>
            </div>
            <div className="w-full bg-[#0A0E13] h-3 rounded-full overflow-hidden border border-[#1E2933]">
              <div
                className="h-full bg-gradient-to-r from-[#2DD4BF] to-[#F5B942] transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${countdownProgress}%` }}
              />
            </div>
          </div>

          {/* User Input Field */}
          <div className="space-y-2">
            <label htmlFor="agent-prompt" className="block text-xs font-bold uppercase tracking-wider text-[#9AA7B2]">
              Agent Goal / Linguistic Query:
            </label>
            <textarea
              id="agent-prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isCountingDown || isLoading}
              className="w-full p-3.5 rounded-xl bg-[#0A0E13] border border-[#1E2933] text-[#EEF2F5] placeholder-[#9AA7B2] text-sm focus:outline-none focus:border-[#2DD4BF] transition disabled:opacity-50"
              placeholder="Enter a cognitive structure or transfer query..."
            />
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {!isCountingDown ? (
              <button
                type="button"
                onClick={startCountdownAndRun}
                disabled={isLoading || !prompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] text-[#0A0E13] font-bold text-sm flex items-center gap-2 hover:bg-[#26b8a5] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Play size={16} />
                <span>{isLoading ? 'Agent Running...' : 'Start 3.5s Countdown & Run'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelCountdown}
                className="px-5 py-2.5 rounded-xl bg-[#F5B942] text-[#0A0E13] font-bold text-sm flex items-center gap-2 hover:bg-[#d99f32] transition active:scale-95 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Cancel Countdown</span>
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5B942] animate-pulse">
                <Boxes size={16} />
                <span>Executing ToolLoopAgent (Vercel AI SDK)...</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-center gap-3">
            <ShieldAlert size={18} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Agent Output & Tool-Call Traces */}
        {agentResponse && (
          <div className="space-y-6">
            {/* Tool Calls Trace Panel */}
            <div className="p-6 rounded-2xl bg-[#0F151C] border border-[#1E2933] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2933] pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#EEF2F5]">
                  <Terminal className="text-[#2DD4BF]" size={18} />
                  <span>Autonomous Tool Invocations ({agentResponse.toolCalls.length} tool calls)</span>
                </div>
                <span className="text-xs font-mono text-[#9AA7B2]">
                  {agentResponse.durationMs}ms · {agentResponse.stepsCount} steps
                </span>
              </div>

              <div className="space-y-3">
                {agentResponse.toolCalls.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#0A0E13] border border-[#1E2933] space-y-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[#2DD4BF] font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-[#2DD4BF]" />
                        Step {tc.step}: tool {tc.toolName}()
                      </span>
                      <span className="text-[10px] text-[#9AA7B2] font-normal uppercase">Executed</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-[#0F151C] border border-[#1E2933]/60">
                        <span className="text-[#9AA7B2] block mb-1 font-bold">Input Arguments:</span>
                        <pre className="text-[#EEF2F5] whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(tc.args, null, 2)}
                        </pre>
                      </div>

                      <div className="p-2 rounded-lg bg-[#0F151C] border border-[#1E2933]/60">
                        <span className="text-[#2DD4BF] block mb-1 font-bold">Tool Output:</span>
                        <pre className="text-[#EEF2F5] whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(tc.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesized Agent Response */}
            <div className="p-6 rounded-2xl bg-[#0F151C] border border-[#1E2933] shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5B942]">
                <Sparkles size={18} />
                <span>Final Agent Synthesized Output:</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A0E13] border border-[#1E2933] text-sm text-[#EEF2F5] whitespace-pre-wrap leading-relaxed font-mono">
                {agentResponse.agentOutput}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

