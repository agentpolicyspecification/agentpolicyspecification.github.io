---
title: "PolicyDecision Schema"
---

# PolicyDecision

The result produced by a policy evaluation at any interception point.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/policy-decision.schema.json`

## Decision Types

All non-audit decisions support an optional `audit` flag. When `audit: true` is set alongside another decision, the runtime writes an audit record **and** applies the primary decision. The standalone `audit` decision produces only an audit record (equivalent to `allow` + `audit: true`).

### `allow`

The interaction proceeds unchanged.

| Property | Type | Required | Description |
|---|---|---|---|
| `decision` | `"allow"` | Yes | |
| `audit` | `boolean` | No | When `true`, an audit record is also produced |

```json
{ "decision": "allow" }
```

### `deny`

The interaction is blocked.

| Property | Type | Required | Description |
|---|---|---|---|
| `decision` | `"deny"` | Yes | |
| `reason` | `string` | No | Human-readable explanation. MAY be omitted for security-sensitive denials. |
| `policy_id` | `string` | No | The policy that produced this denial. |
| `audit` | `boolean` | No | When `true`, an audit record is also produced |

```json
{ "decision": "deny", "reason": "Message contains a potential SSN.", "policy_id": "no-ssn" }
```

### `redact`

Specific content is removed or masked before the interaction proceeds.

| Property | Type | Required | Description |
|---|---|---|---|
| `decision` | `"redact"` | Yes | |
| `redactions` | `Redaction[]` | Yes | One or more redaction instructions. |
| `audit` | `boolean` | No | When `true`, an audit record is also produced |

**Redaction:**

| Property | Type | Required | Description |
|---|---|---|---|
| `field` | `string` | Yes | Dot-notation path (e.g. `response.content`) |
| `strategy` | `"mask" \| "remove" \| "replace"` | Yes | |
| `replacement` | `string` | No | Required for `mask` and `replace` |
| `pattern` | `string` | No | Regex pattern. Required for `replace` |

```json
{
  "decision": "redact",
  "redactions": [
    { "field": "response.content", "strategy": "replace", "pattern": "\\b\\d{3}-\\d{2}-\\d{4}\\b", "replacement": "[REDACTED]" }
  ]
}
```

### `transform`

The payload is modified before the interaction proceeds.

| Property | Type | Required | Description |
|---|---|---|---|
| `decision` | `"transform"` | Yes | |
| `transformation` | `Transformation` | Yes | |
| `audit` | `boolean` | No | When `true`, an audit record is also produced |

**Transformation operation:**

| Property | Type | Required | Description |
|---|---|---|---|
| `op` | `"set" \| "prepend" \| "append"` | Yes | |
| `field` | `string` | Yes | Dot-notation path |
| `value` | `any` | Yes | Value to apply |

### `audit`

Produces only an audit record; the interaction proceeds unchanged.

| Property | Type | Required | Description |
|---|---|---|---|
| `decision` | `"audit"` | Yes | |
| `reason` | `string` | No | Optional note for the audit record |

## Download

[policy-decision.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/policy-decision.schema.json)
