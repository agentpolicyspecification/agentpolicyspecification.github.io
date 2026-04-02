---
title: "Java SDK"
---

# Java SDK

The APS Java implementation is a multi-module Maven project. All modules are pre-release and track the specification draft.

**Repository:** [agentpolicyspecification/aps-java](https://github.com/agentpolicyspecification/aps-java)

## Modules

| Module | Description |
|---|---|
| [`core`](#core) | Engine, policy interfaces, types, errors |
| [`dsl`](#dsl) | JSON-based rule policies |
| [`rego`](#rego) | Rego policies via OPA WASM (in-process, Chicory) |
| [`opa`](#opa) | Rego policies via OPA REST API |
| [`http`](#http) | Remote policy evaluation over HTTP |
| [`otel`](#otel) | OpenTelemetry audit handler |
| [`langfuse`](#langfuse) | Langfuse audit handler |

---

## `core` {#core}

The foundation module. Provides the `ApsEngine`, policy interfaces, context and decision types, and error classes.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>core</artifactId>
  <version>0.1.0</version>
</dependency>
```

### ApsEngine

`ApsEngine` evaluates a `PolicySet` at each interception point. Construct it once and reuse it across requests.

```java
import io.github.agentpolicyspecification.core.ApsEngine;
import io.github.agentpolicyspecification.core.PolicySet;

ApsEngine engine = ApsEngine.builder()
    .policySet(PolicySet.builder()
        .input(List.of(/* InputPolicy... */))
        .toolCall(List.of(/* ToolCallPolicy... */))
        .output(List.of(/* OutputPolicy... */))
        .onError(OnErrorBehavior.DENY)
        .build())
    .onAudit(record -> System.out.println("[audit] " + record))
    .build();
```

Call the engine at each interception point:

```java
engine.evaluateInput(inputContext);      // before sending to the LLM
engine.evaluateToolCall(toolCallCtx);    // before executing a tool
engine.evaluateOutput(outputContext);    // after the LLM responds
```

Denied decisions throw `PolicyDenialError`. Evaluation errors throw `PolicyEvaluationError`.

### Policy interfaces

Implement one of three interfaces depending on the interception point you need:

```java
import io.github.agentpolicyspecification.core.policy.InputPolicy;
import io.github.agentpolicyspecification.core.context.InputContext;
import io.github.agentpolicyspecification.core.decision.PolicyDecision;
import io.github.agentpolicyspecification.core.decision.DenyDecision;
import io.github.agentpolicyspecification.core.decision.AllowDecision;

public class NoSsnPolicy implements InputPolicy {

    @Override
    public String id() { return "no-ssn"; }

    @Override
    public PolicyDecision evaluate(InputContext ctx) {
        boolean found = ctx.messages().stream()
            .anyMatch(m -> m.content().matches(".*\\b\\d{3}-\\d{2}-\\d{4}\\b.*"));
        return found
            ? DenyDecision.deny("Message contains a potential SSN.")
            : AllowDecision.allow();
    }
}
```

### PolicyDecision

Every `evaluate()` call returns a `PolicyDecision`:

| Decision | Meaning |
|---|---|
| `AllowDecision` | Request proceeds |
| `DenyDecision` | Request is blocked; `PolicyDenialError` is thrown |
| `AuditDecision` | Request proceeds, audit record is emitted |
| `RedactDecision` | Request proceeds; adapter should redact sensitive fields |
| `TransformDecision` | Request proceeds with transformed values |

### Error handling

```java
import io.github.agentpolicyspecification.core.error.PolicyDenialError;
import io.github.agentpolicyspecification.core.error.PolicyEvaluationError;

try {
    engine.evaluateInput(ctx);
} catch (PolicyDenialError e) {
    System.out.println("Blocked by policy: " + e.policyId() + " — " + e.getMessage());
}
```

### Audit handler

Pass `onAudit` to receive a structured record for every policy decision:

```java
ApsEngine engine = ApsEngine.builder()
    .policySet(...)
    .onAudit(record -> {
        // record.policyId(), record.decision(), record.interceptionPoint(),
        // record.reason(), record.context(), record.timestamp()
        logger.info("aps.audit {}", record);
    })
    .build();
```

---

## `dsl` {#dsl}

Write policies as plain JSON files — no Java compilation needed.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>dsl</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Rule file

Create a JSON file in your policy directory:

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

```java
import io.github.agentpolicyspecification.dsl.DslInputPolicy;
import io.github.agentpolicyspecification.dsl.DslOutputPolicy;

ApsEngine engine = ApsEngine.builder()
    .policySet(PolicySet.builder()
        .input(List.of(new DslInputPolicy("no-pii", "./policies")))
        .output(List.of(new DslOutputPolicy("no-secrets", "./policies")))
        .build())
    .build();
```

The file name (without `.json`) is the policy id.

### Condition types

| Condition | Example |
|---|---|
| `contains` | `{ "field": "messages.0.content", "contains": ["secret"] }` |
| `equals` | `{ "field": "tool_name", "equals": "delete_file" }` |
| `not_in` | `{ "field": "tool_name", "not_in": ["read_file", "list_dir"] }` |
| `greater_than` | `{ "field": "messages.length", "greater_than": 10 }` |
| `always` | `{ "always": true }` |

---

## `rego` {#rego}

Evaluate Rego policies compiled to WebAssembly, in-process via [Chicory](https://github.com/dylibso/chicory). No external server required.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>rego</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Build the bundle

```bash
opa build --target=wasm --entrypoint=aps/input/decision \
  ./policies/no-ssn.rego --output ./policies/no-ssn.tar.gz
```

### Usage

```java
import io.github.agentpolicyspecification.rego.RegoInputPolicy;

ApsEngine engine = ApsEngine.builder()
    .policySet(PolicySet.builder()
        .input(List.of(new RegoInputPolicy("no-ssn", "./policies/no-ssn.tar.gz")))
        .build())
    .build();
```

---

## `opa` {#opa}

Evaluate policies via a running OPA server. Suitable for centralised policy management.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>opa</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Start OPA and load a policy

```bash
opa run --server --addr=:8181
curl -X PUT http://localhost:8181/v1/policies/no-ssn \
  --data-binary @./policies/no-ssn.rego
```

### Usage

```java
import io.github.agentpolicyspecification.opa.OpaInputPolicy;
import io.github.agentpolicyspecification.opa.OpaClientOptions;

ApsEngine engine = ApsEngine.builder()
    .policySet(PolicySet.builder()
        .input(List.of(new OpaInputPolicy(
            "no-ssn",
            new OpaClientOptions("http://localhost:8181"),
            "aps/input")))
        .build())
    .build();
```

---

## `http` {#http}

Delegate policy evaluation to a remote HTTP endpoint.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>http</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Protocol

The module POSTs to `{baseUrl}/aps/evaluate`:

```json
{
  "policy_id": "no-ssn",
  "interception_point": "input",
  "context": { ... }
}
```

The server must respond with a `PolicyDecision` object.

### Usage

```java
import io.github.agentpolicyspecification.http.HttpInputPolicy;
import io.github.agentpolicyspecification.http.HttpClientOptions;

ApsEngine engine = ApsEngine.builder()
    .policySet(PolicySet.builder()
        .input(List.of(new HttpInputPolicy(
            "no-ssn",
            new HttpClientOptions("https://policies.example.com"))))
        .build())
    .build();
```

---

## `otel` {#otel}

Emit APS audit records as OpenTelemetry spans.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>otel</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Usage

```java
import io.github.agentpolicyspecification.otel.OtelAuditHandlers;
import io.opentelemetry.api.GlobalOpenTelemetry;

ApsEngine engine = ApsEngine.builder()
    .policySet(...)
    .onAudit(OtelAuditHandlers.create())
    .build();
```

Pass a custom `Tracer` to use your own provider:

```java
.onAudit(OtelAuditHandlers.create(myTracer))
```

Each audit record becomes a span named `aps.policy.evaluate` with attributes:

| Attribute | Value |
|---|---|
| `aps.policy_id` | The policy id |
| `aps.decision` | `allow`, `deny`, `audit`, … |
| `aps.interception_point` | `input`, `tool_call`, `output` |
| `aps.reason` | Denial reason (if present) |

---

## `langfuse` {#langfuse}

Send APS audit records to [Langfuse](https://langfuse.com) as traces via OTLP/HTTP.

### Installation

```xml
<dependency>
  <groupId>io.github.agentpolicyspecification</groupId>
  <artifactId>langfuse</artifactId>
  <version>0.1.0</version>
</dependency>
```

### Usage

```java
import io.github.agentpolicyspecification.langfuse.LangfuseAuditHandlers;
import io.github.agentpolicyspecification.langfuse.LangfuseAuditHandlerOptions;

LangfuseAuditHandler auditHandler = LangfuseAuditHandlers.create(
    LangfuseAuditHandlerOptions.builder()
        .publicKey(System.getenv("LANGFUSE_PUBLIC_KEY"))
        .secretKey(System.getenv("LANGFUSE_SECRET_KEY"))
        .build()
);

ApsEngine engine = ApsEngine.builder()
    .policySet(...)
    .onAudit(auditHandler)
    .build();

// Flush before shutdown to ensure all spans are exported
auditHandler.flush();
```

Session and agent metadata from the context is forwarded as `session.id` and `user.id` span attributes, enabling trace grouping in the Langfuse UI.

Credentials can also be provided via environment variables `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, and `LANGFUSE_BASE_URL` (default: `https://cloud.langfuse.com`):

```java
LangfuseAuditHandler auditHandler = LangfuseAuditHandlers.create();
```
