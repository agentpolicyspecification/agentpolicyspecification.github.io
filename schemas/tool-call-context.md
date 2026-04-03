---
title: "ToolCallContext Schema"
---

# ToolCallContext

The evaluation input provided to policies at the **Tool Call Interception** point.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/tool-call-context.schema.json`

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `tool_name` | `string` | Yes | The name of the tool the LLM has requested to invoke |
| `arguments` | `object` | Yes | The arguments provided by the LLM |
| `calling_message` | `AssistantMessage` | Yes | The assistant message that produced the tool call |
| `metadata` | `Metadata` | Yes | Agent and session context |

### AssistantMessage

| Property | Type | Required | Description |
|---|---|---|---|
| `role` | `"assistant"` | Yes | Always `"assistant"` |
| `content` | `string` | Yes | The text content of the message |

### Metadata

| Property | Type | Required | Description |
|---|---|---|---|
| `agent_id` | `string` | Yes | Unique identifier for the agent |
| `session_id` | `string` | Yes | Unique identifier for the session |
| `timestamp` | `string (date-time)` | Yes | ISO 8601 timestamp of the interception |

## Example

```json
{
  "tool_name": "read_file",
  "arguments": { "path": "/workspace/data.csv" },
  "calling_message": {
    "role": "assistant",
    "content": "I will read the file to answer your question."
  },
  "metadata": {
    "agent_id": "agent-1",
    "session_id": "session-abc",
    "timestamp": "2026-03-31T10:00:01Z"
  }
}
```

## Download

[tool-call-context.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/tool-call-context.schema.json)
