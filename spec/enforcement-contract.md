---
title: "Enforcement Contract"
---

# Enforcement Contract

**Status: DRAFT**

## 1. Overview

The enforcement contract defines what obligations a compliant APS runtime has when a policy produces a decision. It specifies what the runtime MUST, SHOULD, and MUST NOT do for each decision type.

## 2. Runtime Obligations

### 2.1 `allow`

- The runtime MUST forward the payload to the next stage unchanged (unless also combined with `transform` or `audit`).

### 2.2 `deny`

- The runtime MUST NOT forward the payload to the next stage.
- The runtime MUST return a `PolicyDenialError` to the caller, containing:
  - `policy_id` — the identifier of the policy that produced the denial
  - `reason` — a human-readable explanation (MAY be omitted for security-sensitive denials)
  - `interception_point` — one of `input`, `tool_call`, `output`
- The runtime SHOULD support a configurable fallback response to return to the agent in place of the denied payload.

### 2.3 `redact`

- The runtime MUST apply the redaction instructions before forwarding the payload.
- Redaction instructions MUST identify the target field(s) and the redaction strategy (e.g. `mask`, `remove`, `replace`).
- The runtime MUST NOT expose the original unredacted content downstream.

### 2.4 `transform`

- The runtime MUST apply the transformation before forwarding the payload.
- Transformations MUST produce a valid payload conforming to the original schema.
- The runtime MUST record that a transformation occurred in the audit log if auditing is enabled.

### 2.5 `audit`

- The runtime MUST write an audit record containing:
  - The full payload at the time of evaluation (pre-decision)
  - The policy decision and producing policy ID
  - The interception point
  - Agent ID, session ID, and timestamp from the context metadata
- Audit records MUST be written before the payload is forwarded or denied.
- The runtime SHOULD support pluggable audit backends.

## 3. Policy Evaluation Order

When multiple policies apply to the same interception point, the runtime MUST evaluate them in declared order. The first `deny` decision MUST short-circuit evaluation — remaining policies MUST NOT be evaluated.

`audit` policies MUST always be evaluated regardless of prior decisions.

## 4. Error Handling

If policy evaluation itself fails (e.g. Rego compilation error, runtime exception), the runtime MUST:

- Default to `deny` unless the policy set is explicitly configured with `on_error: allow`
- Record the failure in the audit log
- Surface a `PolicyEvaluationError` to the caller distinct from a `PolicyDenialError`
