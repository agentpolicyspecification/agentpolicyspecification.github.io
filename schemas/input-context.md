---
title: "InputContext Schema"
---

# InputContext

The evaluation input provided to policies at the **Input Interception** point.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/input-context.schema.json`

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `messages` | `Message[]` | Yes | Ordered message history to be forwarded to the LLM |
| `metadata` | `Metadata` | Yes | Agent and session context |

### Message

| Property | Type | Required | Description |
|---|---|---|---|
| `role` | `"system" \| "user" \| "assistant"` | Yes | The role of the message author |
| `content` | `string` | Yes | The text content of the message |

### Metadata

| Property | Type | Required | Description |
|---|---|---|---|
| `agent_id` | `string` | Yes | Unique identifier for the agent |
| `session_id` | `string` | Yes | Unique identifier for the session |
| `timestamp` | `string (date-time)` | Yes | ISO 8601 timestamp of the interception |

Additional properties are permitted on `metadata` for runtime-specific extensions.

## Example

```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "What is the weather in Amsterdam?" }
  ],
  "metadata": {
    "agent_id": "agent-1",
    "session_id": "session-abc",
    "timestamp": "2026-03-31T10:00:00Z"
  }
}
```

## Download

[input-context.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/input-context.schema.json)
