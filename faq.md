---
title: FAQ
---

# Frequently Asked Questions

<details>
<summary>Is APS a replacement for built-in guardrails like those in LangChain, Guardrails AI, or LLM provider safety filters?</summary>

No. APS is not an alternative guardrail system — it's a communication standard that defines how any guardrail, safety layer, or policy engine should expose its decisions to the agent runtime. Think of it like HTTP: HTTP didn't replace web servers or browsers, it gave them a common language. APS gives your guardrails a common interface.

</details>

<details>
<summary>So I can keep using my existing guardrail library?</summary>

Exactly. If your guardrail library wraps itself in an APS-compliant runtime, it becomes interoperable with any APS-aware agent framework. APS is the contract between enforcement and execution — not the enforcement itself.

</details>

<details>
<summary>Why not just implement custom middleware per framework?</summary>

You can — but then you're locked in. If you move from LangChain to Mastra, or from OpenAI to a local Ollama model, your policy middleware has to be rewritten. APS lets you write policies once (in Rego or TypeScript/Java) and have them enforced consistently across any compliant runtime.

</details>

<details>
<summary>How does this relate to OPA/Rego?</summary>

OPA and Rego are supported, but APS is not an OPA wrapper. APS is extensible: the specification defines the interception contract — not the policy language or evaluation engine. Any engine that can receive a context and return a decision can back an APS policy.

The current authoring models are:

- **Rego (WASM)** — Rego policies compiled to WebAssembly and evaluated in-process
- **OPA (REST)** — Rego policies evaluated by a running OPA server via its HTTP API
- **Runtime** — Typed interfaces in TypeScript or Java for imperative logic or external I/O
- **DSL** — Bring your own policy language, backed by any evaluator

OPA is one way to express the _what_. APS defines the _when_ and the _contract_ that enforcement must uphold.

</details>

<details>
<summary>Where can I use APS?</summary>

Anywhere an AI agent runs. APS is framework-agnostic and runtime-agnostic, so it fits into whatever stack you're already using:

- **Agent frameworks** — LangChain, LangGraph, Mastra, CrewAI, Spring AI, LangChain4j, Semantic Kernel
- **CLI agents** — Claude Code, Aider, Codex CLI, or any custom agent running in a terminal
- **Desktop apps** — Claude Desktop, Cursor, or any Electron/native app embedding an LLM
- **MCP servers** — enforce policies on tool calls exposed via the Model Context Protocol
- **Custom backends** — any Java or TypeScript service that proxies LLM calls

If something sends messages to an LLM, calls tools, or processes model output — APS can sit in the middle.

</details>

<details>
<summary>Isn't this just another spec nobody will adopt?</summary>

Adoption happens when the pain is clear. Right now, every team building production AI agents is reinventing the same middleware: block this tool call, redact that PII, log everything. APS gives that work a name, a schema, and a standard. Implementations in Java and TypeScript are already underway. Use the standard — or contribute to it.

</details>
