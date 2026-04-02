---
title: "TypeScript SDK"
---

# TypeScript SDK

The APS TypeScript implementation is a monorepo of focused packages. All packages are pre-release and track the specification draft.

**Repository:** [agentpolicyspecification/aps-typescript](https://github.com/agentpolicyspecification/aps-typescript)

## Packages

| Package | Description |
|---|---|
| [`@agentpolicyspecification/core`](#core) | Engine, policy interfaces, generated types, errors |
| [`@agentpolicyspecification/dsl`](#dsl) | JSON-based rule policies |
| [`@agentpolicyspecification/rego`](#rego) | Rego policies via OPA WASM (in-process) |
| [`@agentpolicyspecification/opa`](#opa) | Rego policies via OPA REST API |
| [`@agentpolicyspecification/http`](#http) | Remote policy evaluation over HTTP |
| [`@agentpolicyspecification/otel`](#otel) | OpenTelemetry audit handler |
| [`@agentpolicyspecification/langfuse`](#langfuse) | Langfuse audit handler |

---

## `@agentpolicyspecification/core` {#core}

The foundation package. Provides the `ApsEngine`, policy interfaces, generated context types, and error classes.

### Installation

```bash
npm install @agentpolicyspecification/core
```

### ApsEngine

`ApsEngine` evaluates a `PolicySet` at each interception point. Construct it once and reuse it across requests.

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";

const engine = new ApsEngine({
  policySet: {
    input:     [...],  // InputPolicy[]
    tool_call: [...],  // ToolCallPolicy[]
    output:    [...],  // OutputPolicy[]
    on_error:  "deny", // "deny" | "allow" — default: "deny"
  },
  onAudit: (record) => console.log("[audit]", record),
});
```

Call the engine at each interception point:

```typescript
await engine.evaluateInput(inputContext);     // before sending to the LLM
await engine.evaluateToolCall(toolCallCtx);   // before executing a tool
await engine.evaluateOutput(outputContext);   // after the LLM responds
```

Denied decisions throw `PolicyDenialError`. Evaluation errors throw `PolicyEvaluationError`.

### Policy interfaces

Implement one of three interfaces depending on the interception point you need:

```typescript
import type {
  InputPolicy, InputContext,
  ToolCallPolicy, ToolCallContext,
  OutputPolicy, OutputContext,
  PolicyDecision,
} from "@agentpolicyspecification/core";

class NoSsnPolicy implements InputPolicy {
  readonly id = "no-ssn";

  evaluate(ctx: InputContext): PolicyDecision {
    const found = ctx.messages.some(m => /\b\d{3}-\d{2}-\d{4}\b/.test(m.content));
    return found
      ? { decision: "deny", reason: "Message contains a potential SSN." }
      : { decision: "allow" };
  }
}
```

### PolicyDecision

Every `evaluate()` call returns a `PolicyDecision`:

| `decision` | Meaning |
|---|---|
| `"allow"` | Request proceeds |
| `"deny"` | Request is blocked; `PolicyDenialError` is thrown |
| `"audit"` | Request proceeds, audit record is emitted |
| `"redact"` | Request proceeds; adapter should redact sensitive fields |
| `"transform"` | Request proceeds with transformed values |

### Error handling

```typescript
import { PolicyDenialError, PolicyEvaluationError } from "@agentpolicyspecification/core";

try {
  await engine.evaluateInput(ctx);
} catch (err) {
  if (err instanceof PolicyDenialError) {
    console.log("Blocked by policy:", err.policy_id, err.message);
  }
}
```

### Audit handler

Pass `onAudit` to receive a structured record for every policy decision:

```typescript
const engine = new ApsEngine({
  policySet: { ... },
  onAudit: (record) => {
    // record.policy_id, record.decision, record.interception_point,
    // record.reason, record.context, record.timestamp
    myLogger.info("aps.audit", record);
  },
});
```

---

## `@agentpolicyspecification/dsl` {#dsl}

Write policies as plain JSON files — no TypeScript compilation needed.

### Installation

```bash
npm install @agentpolicyspecification/dsl
```

### Rule file

Create a JSON file next to your code:

```json
{
  "condition": {
    "field": "messages.0.content",
    "contains": ["password", "ssn", "social security"]
  },
  "action": "deny",
  "reason": "Message contains potentially sensitive information."
}
```

### Usage

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { DslInputPolicy, DslOutputPolicy } from "@agentpolicyspecification/dsl";

const engine = new ApsEngine({
  policySet: {
    input:  [new DslInputPolicy("no-pii",      "./policies")],
    output: [new DslOutputPolicy("no-secrets", "./policies")],
  },
});
```

The file name (without `.json`) is the policy id. The policy directory is scanned at construction time.

### Condition types

| Condition | Example |
|---|---|
| `contains` | `{ "field": "messages.0.content", "contains": ["secret"] }` |
| `equals` | `{ "field": "metadata.agent_id", "equals": "blocked-agent" }` |
| `not_in` | `{ "field": "tool_name", "not_in": ["delete_file"] }` |
| `greater_than` | `{ "field": "messages.length", "greater_than": 10 }` |
| `always` | `{ "always": true }` |

---

## `@agentpolicyspecification/rego` {#rego}

Evaluate Rego policies compiled to WebAssembly. No external server required.

### Installation

```bash
npm install @agentpolicyspecification/rego
```

### Build the bundle

```bash
opa build --target=wasm --entrypoint=aps/input/decision \
  ./policies/no-ssn.rego --output ./policies/no-ssn.tar.gz
```

### Usage

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { RegoInputPolicy } from "@agentpolicyspecification/rego";

const engine = new ApsEngine({
  policySet: {
    input: [new RegoInputPolicy("no-ssn", "./policies/no-ssn.tar.gz")],
  },
});
```

---

## `@agentpolicyspecification/opa` {#opa}

Evaluate policies via a running OPA server. Suitable for centralised policy management.

### Installation

```bash
npm install @agentpolicyspecification/opa
```

### Start OPA and load a policy

```bash
opa run --server --addr=:8181
curl -X PUT http://localhost:8181/v1/policies/no-ssn \
  --data-binary @./policies/no-ssn.rego
```

### Usage

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { OpaInputPolicy } from "@agentpolicyspecification/opa";

const engine = new ApsEngine({
  policySet: {
    input: [
      new OpaInputPolicy("no-ssn", { baseUrl: "http://localhost:8181" }, "aps/input"),
    ],
  },
});
```

---

## `@agentpolicyspecification/http` {#http}

Delegate policy evaluation to a remote HTTP endpoint — useful for centralised policy services or policy-as-a-service.

### Installation

```bash
npm install @agentpolicyspecification/http
```

### Protocol

The package POSTs to `{baseUrl}/aps/evaluate`:

```json
{
  "policy_id": "no-ssn",
  "interception_point": "input",
  "context": { ... }
}
```

The server must respond with a `PolicyDecision` object.

### Usage

```typescript
import { ApsEngine } from "@agentpolicyspecification/core";
import { HttpInputPolicy, HttpOutputPolicy } from "@agentpolicyspecification/http";

const engine = new ApsEngine({
  policySet: {
    input:  [new HttpInputPolicy("no-ssn",   { baseUrl: "https://policies.example.com" })],
    output: [new HttpOutputPolicy("no-leak", { baseUrl: "https://policies.example.com" })],
  },
});
```

---

## `@agentpolicyspecification/otel` {#otel}

Emit APS audit records as OpenTelemetry spans.

### Installation

```bash
npm install @agentpolicyspecification/otel @opentelemetry/api @opentelemetry/sdk-trace-base
```

### Usage

```typescript
import { createOtelAuditHandler } from "@agentpolicyspecification/otel";
import { ApsEngine } from "@agentpolicyspecification/core";
import { BasicTracerProvider, ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";

const provider = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

const engine = new ApsEngine({
  policySet: { ... },
  onAudit: createOtelAuditHandler({ tracer: provider.getTracer("aps") }),
});
```

Each audit record becomes a span named `aps.policy.evaluate` with attributes:

| Attribute | Value |
|---|---|
| `aps.policy_id` | The policy id |
| `aps.decision` | `allow`, `deny`, `audit`, … |
| `aps.interception_point` | `input`, `tool_call`, `output` |
| `aps.reason` | Denial reason (if present) |

---

## `@agentpolicyspecification/langfuse` {#langfuse}

Send APS audit records to [Langfuse](https://langfuse.com) as traces. Built on `@langfuse/otel`.

### Installation

```bash
npm install @agentpolicyspecification/langfuse
```

### Usage

```typescript
import { createLangfuseAuditHandler } from "@agentpolicyspecification/langfuse";
import { ApsEngine } from "@agentpolicyspecification/core";

const auditHandler = createLangfuseAuditHandler({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl:   process.env.LANGFUSE_BASE_URL, // default: https://cloud.langfuse.com
});

const engine = new ApsEngine({
  policySet: { ... },
  onAudit: auditHandler,
});

// Flush before process exit to ensure all spans are sent
await auditHandler.flush();
```

Session and agent metadata from the context is forwarded as `session.id` and `user.id` span attributes, enabling trace grouping in the Langfuse UI.
