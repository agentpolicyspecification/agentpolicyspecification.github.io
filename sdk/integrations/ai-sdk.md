---
title: "Vercel AI SDK Integration"
---

# Vercel AI SDK Integration

**Package:** `@agentpolicyspecification/ai-sdk`

Wrap any [Vercel AI SDK](https://sdk.vercel.ai) language model with APS policy enforcement. The wrapper is a transparent `LanguageModelV3` — it can be used anywhere a model is accepted, including [Mastra](/sdk/integrations/mastra) and other frameworks built on the AI SDK.

## Installation

```bash
npm install @agentpolicyspecification/ai-sdk @agentpolicyspecification/core
```

## How it works

`withAps` wraps `doGenerate` and `doStream` on the model:

```
User prompt
    │
    ▼
evaluateInput()     ← Input interception
    │
    ▼
model.doGenerate()  ← Original model call
    │
    ├─ tool calls → evaluateToolCall()  ← Tool call interception
    │
    ▼
evaluateOutput()    ← Output interception
    │
    ▼
Response
```

A denied decision throws `PolicyDenialError` and the call is aborted at that point.

## Basic usage

```typescript
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { withAps } from "@agentpolicyspecification/ai-sdk";
import { ApsEngine } from "@agentpolicyspecification/core";

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const engine = new ApsEngine({
  policySet: {
    input: [new NoSsnPolicy()],
  },
});

const model = withAps(openai("gpt-4o-mini"), {
  engine,
  metadata: { agent_id: "my-agent", session_id: "session-123" },
});

const { text } = await generateText({ model, prompt: "What is the capital of France?" });
```

The `metadata` object is forwarded to every policy context and audit record.

## Tool call interception

When the model returns tool calls, each one is evaluated via `engine.evaluateToolCall()` before the result is returned to the caller. This works for both `doGenerate` and `doStream`.

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import type { ToolCallPolicy, ToolCallContext, PolicyDecision } from "@agentpolicyspecification/core";

const BLOCKED_TOOLS = new Set(["delete_file", "execute_shell"]);

class NoBlockedToolsPolicy implements ToolCallPolicy {
  readonly id = "no-blocked-tools";

  evaluate(ctx: ToolCallContext): PolicyDecision {
    return BLOCKED_TOOLS.has(ctx.tool_name)
      ? { decision: "deny", reason: `Tool "${ctx.tool_name}" is not permitted.` }
      : { decision: "allow" };
  }
}

const engine = new ApsEngine({
  policySet: {
    input:     [new NoSsnPolicy()],
    tool_call: [new NoBlockedToolsPolicy()],
    output:    [new NoConfidentialOutputPolicy()],
  },
});
```

## Streaming

`withAps` transparently wraps the stream. Input is evaluated before the stream starts; tool calls are evaluated as they arrive in the stream; output is evaluated when the stream ends.

```typescript
import { streamText } from "ai";

const result = streamText({
  model: withAps(openai("gpt-4o-mini"), { engine }),
  prompt: "Explain quantum entanglement.",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

## With an audit handler

Combine with `@agentpolicyspecification/langfuse` or `@agentpolicyspecification/otel` by passing `onAudit` to the engine:

```typescript
import { createLangfuseAuditHandler } from "@agentpolicyspecification/langfuse";

const engine = new ApsEngine({
  policySet: { ... },
  onAudit: createLangfuseAuditHandler({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
  }),
});

const model = withAps(openai("gpt-4o-mini"), {
  engine,
  metadata: { agent_id: "my-agent", session_id: "session-abc" },
});
```

## API reference

### `withAps(model, options)`

Returns a `LanguageModelV3` that wraps the provided model with APS enforcement.

| Parameter | Type | Description |
|---|---|---|
| `model` | `LanguageModelV3` | Any Vercel AI SDK language model |
| `options.engine` | `ApsEngine` | The APS engine to evaluate policies with |
| `options.metadata` | `Partial<Metadata>` | Optional metadata forwarded to all policy contexts |

**Returns:** `LanguageModelV3`
