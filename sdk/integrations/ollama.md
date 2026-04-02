---
title: "Ollama Integration"
---

# Ollama Integration

**Package:** `@agentpolicyspecification/ollama`

Wrap an [Ollama](https://ollama.com) client with APS policy enforcement. Supports both non-streaming and streaming chat, including tool call interception.

## Installation

```bash
npm install @agentpolicyspecification/ollama @agentpolicyspecification/core ollama
```

## How it works

`withAps` wraps the Ollama client's `chat()` method:

```
client.chat(request)
    │
    ▼
evaluateInput()       ← Input interception
    │
    ▼
ollama.chat(request)  ← Original Ollama call
    │
    ├─ tool_calls → evaluateToolCall()  ← Tool call interception
    │
    ▼
evaluateOutput()      ← Output interception
    │
    ▼
Response
```

For streaming, tool calls are intercepted from the final chunk (where Ollama delivers them), and output is evaluated after the stream ends.

## Basic usage

```typescript
import { Ollama } from "ollama";
import { withAps } from "@agentpolicyspecification/ollama";
import { ApsEngine } from "@agentpolicyspecification/core";

const ollama = new Ollama({ host: "http://localhost:11434" });

const engine = new ApsEngine({
  policySet: {
    input:  [new NoSsnPolicy()],
    output: [new NoConfidentialOutputPolicy()],
  },
});

const client = withAps(ollama, {
  engine,
  metadata: { agent_id: "my-agent", session_id: "session-123" },
});

const response = await client.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "What is the capital of France?" }],
});

console.log(response.message.content);
```

## Tool call interception

When the model returns tool calls, each one is evaluated via `engine.evaluateToolCall()` before the response is returned.

```typescript
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

const client = withAps(ollama, { engine });

const response = await client.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "What is the weather in Amsterdam?" }],
  tools: [{
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a city.",
      parameters: {
        type: "object",
        properties: { city: { type: "string" } },
        required: ["city"],
      },
    },
  }],
});
```

## Streaming

Pass `stream: true` to receive an `AsyncIterable<ChatResponse>`. Input is evaluated before the stream starts. Tool calls are intercepted from the final chunk; output is evaluated after the stream ends.

```typescript
const stream = await client.chat({
  model: "llama3.1",
  messages: [{ role: "user", content: "Explain quantum entanglement." }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.message.content);
}
// Output policy and tool call policies run after the stream completes
```

If a policy denies during or after the stream, a `PolicyDenialError` is thrown at that point.

## Error handling

```typescript
import { PolicyDenialError } from "@agentpolicyspecification/core";

try {
  const response = await client.chat({
    model: "llama3.1",
    messages: [{ role: "user", content: "My SSN is 123-45-6789" }],
  });
} catch (err) {
  if (err instanceof PolicyDenialError) {
    console.log("Blocked by policy:", err.policy_id, err.message);
  }
}
```

## API reference

### `withAps(ollama, options)`

Returns an `ApsOllamaClient` that wraps the provided Ollama instance with APS enforcement.

| Parameter | Type | Description |
|---|---|---|
| `ollama` | `Ollama` | An Ollama client instance |
| `options.engine` | `ApsEngine` | The APS engine to evaluate policies with |
| `options.metadata` | `Partial<Metadata>` | Optional metadata forwarded to all policy contexts |

**Returns:** `ApsOllamaClient`

---

### `ApsOllamaClient`

| Method | Description |
|---|---|
| `chat(request)` | Non-streaming chat. Returns `Promise<ChatResponse>`. |
| `chat(request & { stream: true })` | Streaming chat. Returns `Promise<AsyncIterable<ChatResponse>>`. |
