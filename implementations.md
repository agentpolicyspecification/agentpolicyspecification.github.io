---
title: "Implementations"
---

# Implementations

APS reference implementations track the specification draft. APIs may change until the specification is stable.

## TypeScript

**Package:** `@agentpolicyspecification/core`

**Repository:** [aps-typescript](https://github.com/agentpolicyspecification/aps-typescript)

**Status:** Pre-release

### Installation

```bash
npm install @agentpolicyspecification/core
```

### Quick start

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
  policySet: {
    input: [new NoSSNPolicy()],
  },
  onAudit: (record) => console.log("[audit]", record),
});

await engine.evaluateInput(context);
```

See the [repository](https://github.com/agentpolicyspecification/aps-typescript) for full documentation.

---

## Java

**Package:** `io.agentpolicyspecification:aps-core`

**Status:** Planned

---

## Conformance test suite

A language-agnostic conformance test suite is planned. It will allow APS runtime implementors to verify compliance with the enforcement contract.

**Status:** Planned
