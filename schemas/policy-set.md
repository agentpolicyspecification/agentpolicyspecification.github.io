---
title: "PolicySet Schema"
---

# PolicySet

A collection of DSL policy rules with optional interception point and tool scope bindings. This is the top-level configuration object for DSL-authored policy sets.

**Schema ID:** `https://agentpolicyspecification.github.io/schemas/v0.1.0/policy-set.schema.json`

## Properties

| Property | Type | Required | Description |
|---|---|---|---|
| `aps_version` | `string` | Yes | The APS spec version this policy set targets (e.g. `"0.1.0"`) |
| `policies` | `PolicyEntry[]` | Yes | The ordered list of policy rules in this set |

## PolicyEntry

A DSL policy rule with optional scope restrictions.

| Property | Type | Required | Description |
|---|---|---|---|
| `condition` | `Condition` | Yes | The condition evaluated against the context |
| `action` | `"allow" \| "deny" \| "redact" \| "transform" \| "audit"` | Yes | The action to take when the condition matches |
| `reason` | `string` | No | Human-readable reason, typically used with `deny` |
| `redactions` | `Redaction[]` | When `action` is `"redact"` | Redaction instructions |
| `transformation` | `object` | When `action` is `"transform"` | Field transformation map |
| `applies_to` | `("input" \| "output" \| "tool_call")[]` | No | Interception points this policy applies to. Omit to apply to all. |
| `tools` | `string[]` | No | Tool names this policy applies to. Only evaluated when `applies_to` includes `"tool_call"`. Omit to apply to all tools. |

See [DSLPolicy](/schemas/dsl-policy) for the full `Condition` reference.

## Example

```yaml
aps_version: "0.1.0"
policies:
  - condition:
      always: true
    action: audit
    reason: Log all interactions.

  - condition:
      field: tool_name
      not_in: [web_search, read_file, summarize]
    action: deny
    reason: Tool is not in the approved list.
    applies_to: [tool_call]

  - condition:
      field: response.content
      contains: ["credit card", "card number"]
    action: redact
    redactions:
      - field: response.content
        strategy: replace
        pattern: '\b(?:\d[ -]?){13,16}\b'
        replacement: "[REDACTED]"
    applies_to: [output]
```

## Download

[policy-set.schema.json](https://github.com/agentpolicyspecification/spec/blob/main/schemas/v0.1.0/policy-set.schema.json)
