---
title: "Mastra Integration"
---

# Mastra Integration

**Package:** `@agentpolicyspecification/mastra`

Add APS policy enforcement to [Mastra](https://mastra.ai) agents. The integration intercepts at the Agent level — wrapping `generate()` and `stream()` for input/output policies, and wrapping tools for tool call policies.

## Installation

```bash
npm install @agentpolicyspecification/mastra @agentpolicyspecification/core
```

## How it works

```
apsAgent.generate(prompt)
    │
    ▼
evaluateInput()         ← Input interception
    │
    ▼
agent.generate(prompt)  ← Original Mastra agent call
    │
    ├─ tool execute() → evaluateToolCall()  ← Tool call interception (via withApsTools)
    │
    ▼
evaluateOutput()        ← Output interception (when .text resolves)
    │
    ▼
Result
```

## Basic usage

Wrap your `Agent` with `withAps` after construction:

```typescript
import { Agent } from "@mastra/core/agent";
import { withAps } from "@agentpolicyspecification/mastra";
import { ApsEngine } from "@agentpolicyspecification/core";

const engine = new ApsEngine({
  policySet: {
    input:  [new NoSsnPolicy()],
    output: [new NoConfidentialOutputPolicy()],
  },
});

const agent = new Agent({
  id: "my-agent",
  name: "My Agent",
  instructions: "You are a helpful assistant.",
  model: openai("gpt-4o-mini"),
});

const apsAgent = withAps(agent, {
  engine,
  metadata: { agent_id: "my-agent", session_id: "session-123" },
});

const result = await apsAgent.generate("What is the capital of France?");
console.log(result.text);
```

## Tool call interception

Tool call policies require wrapping the tools **before** passing them to the `Agent` constructor. Mastra executes tools internally during the agentic loop, so `withApsTools` wraps each tool's `execute` function to intercept calls before they run.

```typescript
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { withAps, withApsTools } from "@agentpolicyspecification/mastra";
import { ApsEngine } from "@agentpolicyspecification/core";
import type { ToolCallPolicy, ToolCallContext, PolicyDecision } from "@agentpolicyspecification/core";
import { z } from "zod";

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

const getWeatherTool = createTool({
  id: "get_weather",
  description: "Get the current weather for a city.",
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => ({ temperature: "18°C", condition: "Partly cloudy" }),
});

// 1. Wrap tools first
const tools = withApsTools({ get_weather: getWeatherTool }, { engine });

// 2. Pass wrapped tools to Agent
const agent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: "Use tools to answer questions.",
  model: openai("gpt-4o-mini"),
  tools,
});

// 3. Wrap the agent for input/output policies
const apsAgent = withAps(agent, { engine });

try {
  const result = await apsAgent.generate("What is the weather in Amsterdam?");
  console.log(result.text);
} catch (err) {
  if (err instanceof PolicyDenialError) {
    console.log("Blocked:", err.message);
  }
}
```

## Streaming

`stream()` is intercepted in the same way. Input is evaluated before the stream starts. Output evaluation runs when `.text` is awaited:

```typescript
const result = await apsAgent.stream("Explain quantum entanglement.");

// Output policy runs here, when the full text resolves
const text = await result.text;
console.log(text);
```

If the output policy denies, `result.text` rejects with `PolicyDenialError`.

## API reference

### `withAps(agent, options)`

Wraps a Mastra `Agent` with APS input and output policy enforcement.

| Parameter | Type | Description |
|---|---|---|
| `agent` | `Agent` | Any Mastra Agent instance |
| `options.engine` | `ApsEngine` | The APS engine to evaluate policies with |
| `options.metadata` | `Partial<Metadata>` | Optional metadata forwarded to all policy contexts |

**Returns:** `ApsAgent` with `generate()` and `stream()` methods.

---

### `withApsTools(tools, options)`

Wraps a record of Mastra tools so that `engine.evaluateToolCall()` is called before each tool executes.

| Parameter | Type | Description |
|---|---|---|
| `tools` | `Record<string, Tool>` | Mastra tools created with `createTool` |
| `options.engine` | `ApsEngine` | The APS engine to evaluate policies with |
| `options.metadata` | `Partial<Metadata>` | Optional metadata forwarded to all policy contexts |

**Returns:** The same record shape with wrapped `execute` functions.

::: tip
Always call `withApsTools` **before** passing tools to the `Agent` constructor. Wrapping tools after construction has no effect since Mastra captures the tool references at construction time.
:::

::: warning
`withAps` handles input and output policies. Tool call policies require `withApsTools`. Both are typically used together.
:::
