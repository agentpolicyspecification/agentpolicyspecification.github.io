---
title: "Policy Authoring"
---

# Policy Authoring

**Status: DRAFT**

## 1. Overview

APS supports two complementary policy authoring models. They can be mixed within the same policy set.

| Model | Best for |
|---|---|
| **Rego** | Declarative rules, composable logic, OPA ecosystem compatibility |
| **Runtime** | Rules requiring external I/O, complex state, or typed business logic |

## 2. Rego Policies

APS Rego policies are standard OPA policies evaluated against a structured `input` document. Each interception point has its own package namespace:

| Interception Point | Package |
|---|---|
| Input | `aps.input` |
| Tool Call | `aps.tool_call` |
| Output | `aps.output` |

### 2.1 Required Rules

A compliant Rego policy MUST define a `decision` rule that produces one of: `allow`, `deny`, `redact`, `transform`, `audit`.

```ruby
package aps.input

default decision := "allow"

decision := "deny" if { ... }
```

### 2.2 Optional Rules

| Rule | Type | Description |
|---|---|---|
| `reason` | `string` | Human-readable explanation for the decision |
| `redactions` | `array` | Required when `decision == "redact"` |
| `transformation` | `object` | Required when `decision == "transform"` |

### 2.3 Input Document

The `input` document corresponds to the context object for each interception point. See [Core Concepts §4](core.md#4-data-model) for the full schema.

## 3. Runtime Rules

Runtime rules implement a typed interface provided by the APS runtime SDK. They are registered alongside Rego policies and evaluated in the same pipeline.

### 3.1 Java Interface (planned)

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

### 3.2 TypeScript Interface (planned)

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

### 3.3 PolicyDecision Shape

```typescript
type PolicyDecision =
  | { decision: "allow" }
  | { decision: "deny"; reason?: string }
  | { decision: "redact"; redactions: Redaction[] }
  | { decision: "transform"; transformation: Transformation }
  | { decision: "audit" };
```

## 4. Policy Set Configuration

A policy set is the full collection of policies applied to a single APS runtime instance. It is declared in a configuration file (format TBD — candidates: YAML, JSON).

```yaml
policy_set:
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
