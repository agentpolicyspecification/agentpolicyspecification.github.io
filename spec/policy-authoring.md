---
title: "Policy Authoring"
---

# Policy Authoring

**Status: DRAFT**

## 1. Overview

APS supports three complementary policy authoring models. They can be mixed within the same policy set.

| Model | Best for |
|---|---|
| **DSL** | Simple condition/action rules, zero dependencies, readable configuration |
| **Rego** | Declarative rules, composable logic, OPA ecosystem compatibility |
| **Runtime** | Rules requiring external I/O, complex state, or typed business logic |

## 2. DSL Policies

APS DSL policies express simple condition/action rules in YAML or JSON, validated against the [DSL Policy Schema](/schemas/dsl-policy). No OPA or SDK dependency is required.

### 2.1 Structure

```yaml
condition: <Condition>
action: allow | deny | redact | transform | audit
reason: <optional string>         # human-readable note, typically for deny
redactions: [...]                  # required when action is redact
transformation: { field: value }  # required when action is transform
```

### 2.2 Conditions

| Condition | Matches when... |
|---|---|
| `{ field, equals }` | Field value strictly equals the operand |
| `{ field, contains: [...] }` | Field value contains any of the given substrings |
| `{ field, not_in: [...] }` | Field value is not in the given list |
| `{ field, greater_than }` | Field value is numerically greater than the threshold |
| `{ always: true }` | Always matches |

### 2.3 Example: Block a disallowed tool

```yaml
condition:
  field: tool_name
  not_in: [web_search, read_file, summarize]
action: deny
reason: Tool is not in the approved list.
```

### 2.4 Example: Redact SSNs from output

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

## 3. Rego Policies

APS Rego policies are standard OPA policies evaluated against a structured `input` document. Each interception point has its own package namespace:

| Interception Point | Package |
|---|---|
| Input | `aps.input` |
| Tool Call | `aps.tool_call` |
| Output | `aps.output` |

### 3.1 Required Rules

A compliant Rego policy MUST define a `decision` rule that produces one of: `allow`, `deny`, `redact`, `transform`, `audit`.

```ruby
package aps.input

default decision := "allow"

decision := "deny" if { ... }
```

### 3.2 Optional Rules

| Rule | Type | Description |
|---|---|---|
| `reason` | `string` | Human-readable explanation for the decision |
| `redactions` | `array` | Required when `decision == "redact"` |
| `transformation` | `object` | Required when `decision == "transform"` |

### 3.3 Input Document

The `input` document corresponds to the context object for each interception point. See [Core Concepts §4](core.md#4-data-model) for the full schema.

## 4. Runtime Rules

Runtime rules implement a typed interface provided by the APS runtime SDK. They are registered alongside Rego policies and evaluated in the same pipeline.

### 4.1 Java Interface (planned)

```java
public interface InputPolicy {
    PolicyDecision evaluate(InputContext context);
}

public interface ToolCallPolicy {
    PolicyDecision evaluate(ToolCallContext context);
}

public interface OutputPolicy {
    PolicyDecision evaluate(OutputContext context);
}
```

### 4.2 TypeScript Interface (planned)

```typescript
interface InputPolicy {
  evaluate(context: InputContext): PolicyDecision;
}

interface ToolCallPolicy {
  evaluate(context: ToolCallContext): PolicyDecision;
}

interface OutputPolicy {
  evaluate(context: OutputContext): PolicyDecision;
}
```

### 4.3 PolicyDecision Shape

```typescript
type PolicyDecision =
  | { decision: "allow"; audit?: boolean }
  | { decision: "deny"; reason?: string; audit?: boolean }
  | { decision: "redact"; redactions: Redaction[]; audit?: boolean }
  | { decision: "transform"; transformation: Transformation; audit?: boolean }
  | { decision: "audit"; reason?: string };
```

## 5. Policy Set Configuration

A policy set is the full collection of policies applied to a single APS runtime instance. It is declared in YAML or JSON conforming to the [PolicySet schema](/schemas/policy-set).

```yaml
policy_set:
  aps_version: "0.1.0"
  on_error: deny        # or: allow
  input:
    - type: rego
      path: policies/no-ssn.rego
    - type: runtime
      class: com.example.policies.ContentFilterPolicy   # Java
  tool_call:
    - type: rego
      path: policies/approved-tools.rego
  output:
    - type: rego
      path: policies/no-blocked-domains.rego
    - type: runtime
      class: RedactCreditCardPolicy                     # TypeScript
```
