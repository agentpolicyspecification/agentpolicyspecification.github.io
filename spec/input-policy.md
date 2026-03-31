---
title: "Input Policy"
---

# Input Policy

**Status: DRAFT**

## 1. Overview

Input policies are evaluated at the **Input Interception** point — after the agent constructs a message payload and before it is forwarded to the LLM runtime.

## 2. Evaluation Input

The policy engine receives an `InputContext` (see [Core Concepts §4.1](core.md#41-inputcontext)).

## 3. Policy Scope

Input policies MAY inspect:

- Any message in the `messages` array (role and content)
- The full message history
- Agent and session metadata

Input policies MUST NOT modify the LLM response or tool call results — those are governed by output and tool call policies respectively.

## 4. Supported Decisions

| Decision | Permitted | Notes |
|---|---|---|
| `allow` | Yes | |
| `deny` | Yes | Blocks the message from reaching the LLM |
| `redact` | Yes | Applied to message content before forwarding |
| `transform` | Yes | e.g. prepend a system prompt, normalize content |
| `audit` | Yes | |

## 5. Example: Rego Policy

Block any message containing a social security number pattern:

```ruby
package aps.input

import future.keywords.if

default decision := "allow"

decision := "deny" if {
    some msg in input.messages
    regex.match(`\b\d{3}-\d{2}-\d{4}\b`, msg.content)
}

reason := "Message contains a potential SSN."
```

## 6. Example: Programmatic Rule (TypeScript)

```typescript
import { InputPolicy, InputContext, PolicyDecision } from "@aps/core";

export class NoSSNInputPolicy implements InputPolicy {
  evaluate(context: InputContext): PolicyDecision {
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;
    const found = context.messages.some(m => ssnPattern.test(m.content));
    return found
      ? { decision: "deny", reason: "Message contains a potential SSN." }
      : { decision: "allow" };
  }
}
```
