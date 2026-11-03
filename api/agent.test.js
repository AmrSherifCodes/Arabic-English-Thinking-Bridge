import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { agentTools, isAllowedOrigin, getCorsOrigin } from './agent.js';

test('1. agent tools (knowledge_retriever, linguistic_metric_calculator, action_auditor) execute correctly', async () => {
  const krResult = await agentTools.knowledge_retriever.execute({
    query: 'copula omission',
    targetLanguage: 'en'
  });
  assert.ok(krResult.identifiedPattern);
  assert.ok(krResult.pedagogicalRule);

  const lmcResult = await agentTools.linguistic_metric_calculator.execute({
    sentenceLength: 5,
    clauseCount: 1,
    hasNominalSentence: true
  });
  assert.equal(typeof lmcResult.complexityScore, 'number');
  assert.equal(typeof lmcResult.interferenceProbabilityPercent, 'number');
  assert.ok(lmcResult.cefrEstimate);

  const aaResult = await agentTools.action_auditor.execute({
    actionName: 'test_action',
    outcome: 'verified'
  });
  assert.equal(aaResult.status, 'persisted');
  assert.ok(aaResult.auditHash);
});

test('2. agent handler responds to OPTIONS with 204 and CORS headers', async () => {
  let statusCode = 0;
  let headers = {};
  const req = {
    method: 'OPTIONS',
    headers: { origin: 'https://tb-eg.vercel.app' }
  };
  const res = {
    setHeader(key, val) { headers[key] = val; },
    end() {},
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 204);
  assert.equal(headers['Access-Control-Allow-Origin'], 'https://tb-eg.vercel.app');
});

test('3. agent handler rejects disallowed HTTP methods with 405', async () => {
  let statusCode = 0;
  let body = '';
  const req = { method: 'DELETE', headers: {} };
  const res = {
    setHeader() {},
    end(str) { body = str; },
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 405);
  assert.match(body, /Method not allowed/);
});

test('4. agent handler executes autonomous tool-loop returning 200 with tool calls', async () => {
  let statusCode = 0;
  let body = '';
  const req = {
    method: 'POST',
    headers: { origin: 'https://tb-eg.vercel.app' },
    body: { prompt: 'How do I think in English for nominal sentences?' }
  };
  const res = {
    setHeader() {},
    end(str) { body = str; },
    set statusCode(code) { statusCode = code; }
  };

  await handler(req, res);
  assert.equal(statusCode, 200);

  const parsed = JSON.parse(body);
  assert.equal(parsed.success, true);
  assert.ok(parsed.agentOutput.length > 0);
  assert.ok(Array.isArray(parsed.toolCalls));
  assert.ok(parsed.toolCalls.length >= 1, 'Agent must contain at least one tool call');

  // Verify tool call properties
  const firstTool = parsed.toolCalls[0];
  assert.ok(firstTool.toolName);
  assert.ok(firstTool.args);
  assert.ok(firstTool.result);
  assert.ok(typeof firstTool.step === 'number');
});

