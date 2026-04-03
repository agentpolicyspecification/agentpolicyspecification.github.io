---
title: "DSLPolicy Schema"
---

# DSLPolicy

A single declarative policy rule expressed as a condition/action pair. DSL policies require no OPA installation or SDK — they are evaluated by the APS runtime directly from YAML or JSON.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/dsl-policy.schema.json`

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `condition` | `Condition` | Yes | The condition evaluated against the context |
| `action` | `"allow" \| "deny" \| "redact" \| "transform" \| "audit"` | Yes | The action to take when the condition matches |
| `reason` | `string` | No | Human-readable reason, typically used with `deny` |
| `redactions` | `Redaction[]` | When `action` is `"redact"` | Redaction instructions |
| `transformation` | `object` | When `action` is `"transform"` | Field transformation map |

## Conditions

### EqualsCondition

Matches when the field value strictly equals the operand.

| Property | Type | Required |
|---|---|---|
| `field` | `string` | Yes |
| `equals` | `any` | Yes |

### ContainsCondition

Matches when the field value contains any of the given substrings (case-insensitive).

| Property | Type | Required |
|---|---|---|
| `field` | `string` | Yes |
| `contains` | `string[]` | Yes |

### NotInCondition

Matches when the field value is not present in the given list.

| Property | Type | Required |
|---|---|---|
| `field` | `string` | Yes |
| `not_in` | `any[]` | Yes |

### GreaterThanCondition

Matches when the field value is numerically greater than the threshold.

| Property | Type | Required |
|---|---|---|
| `field` | `string` | Yes |
| `greater_than` | `number` | Yes |

### AlwaysCondition

Always matches, regardless of context.

| Property | Type | Required |
|---|---|---|
| `always` | `true` | Yes |

## Examples

### Deny a disallowed tool

```yaml
condition:
  field: tool_name
  not_in: [web_search, read_file, summarize]
action: deny
reason: Tool is not in the approved list.
```

### Redact SSNs from model output

```yaml
condition:
  field: response.content
  contains: ["SSN", "social security"]
action: redact
redactions:
  - field: response.content
    strategy: replace
    pattern: '\b\d{3}-\d{2}-\d{4}\b'
    replacement: "[REDACTED]"
```

### Always audit

```yaml
condition:
  always: true
action: audit
reason: Logging all interactions.
```

## Download

[dsl-policy.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/dsl-policy.schema.json)
