---
title: "Implementations"
---

# Implementations

APS reference implementations track the specification draft. APIs may change until the specification is stable.

## TypeScript

**Repository:** [aps-typescript](https://github.com/agentpolicyspecification/aps-typescript)

The TypeScript implementation is split into focused packages:

| Package | Description | Status |
|---|---|---|
| `@agentpolicyspecification/core` | Engine, policy interfaces, types, errors | Pre-release |
| `@agentpolicyspecification/rego` | Rego policies evaluated via OPA WASM (in-process) | Pre-release |
| `@agentpolicyspecification/opa` | Rego policies evaluated via OPA REST API | Pre-release |

### `@agentpolicyspecification/core` — Runtime policies

Write policies directly in TypeScript using the `InputPolicy`, `ToolCallPolicy`, and `OutputPolicy` interfaces:

```typescript
import { ApsEngine, InputPolicy, InputContext, PolicyDecision } from "@agentpolicyspecification/core";

class NoSSNPolicy implements InputPolicy {
  readonly id = "no-ssn";

  evaluate(context: InputContext): PolicyDecision {
    const found = context.messages.some(m =>
      /\b\d{3}-\d{2}-\d{4}\b/.test(m.content)
    );
    return found
      ? { decision: "deny", reason: "Message contains a potential SSN." }
      : { decision: "allow" };
  }
}

const engine = new ApsEngine({
  policySet: { input: [new NoSSNPolicy()] },
  onAudit: (record) => console.log("[audit]", record),
});

await engine.evaluateInput(context);
```

### `@agentpolicyspecification/rego` — OPA WASM (in-process)

Evaluate Rego policies compiled to WebAssembly. No external server required:

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { RegoInputPolicy } from "@agentpolicyspecification/rego";

const engine = new ApsEngine({
  policySet: {
    input: [new RegoInputPolicy("no-ssn", "./policies/no-ssn-input.tar.gz")],
  },
});

await engine.evaluateInput(context);
```

### `@agentpolicyspecification/opa` — OPA REST API

Evaluate policies via a running OPA server. Suitable for centralised policy management:

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { OpaInputPolicy } from "@agentpolicyspecification/opa";

const engine = new ApsEngine({
  policySet: {
    input: [new OpaInputPolicy("no-ssn", { baseUrl: "http://localhost:8181" }, "aps/input")],
  },
});

await engine.evaluateInput(context);
```

---

## Java

**Package:** `io.agentpolicyspecification:aps-core`

**Status:** Planned

---

## Conformance test suite

A language-agnostic conformance test suite is planned. It will allow APS runtime implementors to verify compliance with the enforcement contract.

**Status:** Planned
