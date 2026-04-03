---
title: "OutputContext Schema"
---

# OutputContext

The evaluation input provided to policies at the **Output Interception** point.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/output-context.schema.json`

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `response` | `AssistantMessage` | Yes | The LLM response being evaluated |
| `metadata` | `Metadata` | Yes | Agent and session context |

### AssistantMessage

| Property | Type | Required | Description |
|---|---|---|---|
| `role` | `"assistant"` | Yes | Always `"assistant"` |
| `content` | `string` | Yes | The text content of the response |

### Metadata

| Property | Type | Required | Description |
|---|---|---|---|
| `agent_id` | `string` | Yes | Unique identifier for the agent |
| `session_id` | `string` | Yes | Unique identifier for the session |
| `timestamp` | `string (date-time)` | Yes | ISO 8601 timestamp of the interception |

## Example

```json
{
  "response": {
    "role": "assistant",
    "content": "The weather in Amsterdam today is 12°C and cloudy."
  },
  "metadata": {
    "agent_id": "agent-1",
    "session_id": "session-abc",
    "timestamp": "2026-03-31T10:00:02Z"
  }
}
```

## Download

[output-context.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/output-context.schema.json)
