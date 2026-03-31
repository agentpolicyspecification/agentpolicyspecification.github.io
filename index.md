---
layout: home

hero:
  name: "Agent Policy Specification"
  text: "Enforce policies on AI agent interactions."
  tagline: A vendor-neutral standard for intercepting and enforcing policies on every message, tool call, and model response — before any side effect occurs.
  image:
    light: /aps-logo-light.svg
    dark: /aps-logo-dark-nobg.svg
    alt: Agent Policy Specification Logo
  actions:
    - theme: brand
      text: Read the Spec
      link: /spec/core
    - theme: alt
      text: View on GitHub
      link: https://github.com/agentpolicyspecification

features:
  - title: Input Policy
    details: Evaluate messages before they reach the LLM. Block, redact, or transform content at the boundary.
  - title: Tool Call Policy
    details: Intercept tool invocations before execution. Enforce allowlists, validate arguments, prevent unsafe operations.
  - title: Output Policy
    details: Evaluate model responses before delivery. Redact sensitive content, block unsafe outputs, audit everything.
  - title: Rego + Programmatic
    details: Write policies declaratively in Rego (OPA-compatible) or programmatically in TypeScript and Java.
  - title: Vendor-neutral
    details: Not tied to any agent framework, LLM provider, or cloud platform. Works wherever your agent runs.
  - title: Composable decisions
    details: Five decision types — allow, deny, redact, transform, audit — that compose to cover any enforcement scenario.
---
