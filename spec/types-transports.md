---
title: "Types & Transports"
---

# Types & Transports

**Status: DRAFT**

This page defines the supported combinations of **policy types** and **execution transports** in APS.

## Matrix

| Type    | file | http | wasm | stdio | runtime | Status          |
|---------|------|------|------|-------|---------|-----------------|
| dsl     | ✅   | ⚠️*  | ❌   | ❌    | ❌      | DRAFT           |
| rego    | ✅   | ✅   | ✅   | ❌    | ❌      | IMPLEMENTATION  |
| cedar   | ✅   | ✅   | ❌   | ❌    | ❌      | PROPOSED        |
| cel     | ✅   | ❌   | ❌   | ❌    | ❌      | PROPOSED        |
| casbin  | ✅   | ❌   | ❌   | ❌    | ❌      | PROPOSED        |
| llm     | ❌   | ✅   | ❌   | ❌    | ❌      | DRAFT           |
| runtime | ❌   | ❌   | ❌   | ❌    | ✅      | IMPLEMENTATION  |

\* DSL over HTTP is not standardized — typically wrapped in a custom remote evaluator.

---

## Transport-Only

Some transports are independent of the policy type and can be used generically.

| Transport | Description                                      | Status         |
|-----------|--------------------------------------------------|----------------|
| http      | Remote evaluator (e.g. SaaS, policy services)    | IMPLEMENTATION |
| stdio     | MCP-style subprocess execution                   | PROPOSED       |

---

## Notes

- **DSL**
  - Designed for local execution (`file`)
  - Remote execution is done via `http`, but not standardized

- **Rego**
  - Supports multiple deployment models:
    - Local (`file`)
    - Compiled (`wasm`)
    - Remote (`http`)

- **Cedar**
  - Can run locally (`file`)
  - Can be delegated to managed services (`http`)

- **CEL / Casbin**
  - Currently local-only
  - No widely adopted remote protocol

- **LLM**
  - Always remote (`http`) by nature

- **Runtime**
  - Always in-process
  - No transport layer applies