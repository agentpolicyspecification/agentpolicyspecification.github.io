---
title: "Output Policy"
---

# Output Policy

**Status: DRAFT**

## 1. Overview

Output policies are evaluated at the **Output Interception** point — after the LLM produces a response and before it is returned to the agent.

## 2. Evaluation Input

The policy engine receives an `OutputContext` (see [Core Concepts §4.3](core.md#43-outputcontext)).

## 3. Policy Scope

Output policies MAY inspect:

- The full response content
- Agent and session metadata

Output policies MUST NOT re-invoke the LLM. If a transformation requires generating new content, this must be handled by a configured fallback, not by the policy itself.

## 4. Supported Decisions

| Decision | Permitted | Notes |
|---|---|---|
| `allow` | Yes | |
| `deny` | Yes | Blocks the response from reaching the agent |
| `redact` | Yes | Applied to response content before delivery |
| `transform` | Yes | e.g. strip formatting, enforce tone |
| `audit` | Yes | |

## 5. Example: Rego Policy

Deny responses that contain content from a known blocked domain:

```ruby
package aps.output

import future.keywords.if

blocked_domains := {"malicious-site.example", "phishing.example"}

default decision := "allow"

decision := "deny" if {
    some domain in blocked_domains
    contains(input.response.content, domain)
}

reason := "Response references a blocked domain."
```

## 6. Example: Runtime Rule (TypeScript)

Redact credit card numbers from model output:

```typescript
import { OutputPolicy, OutputContext, PolicyDecision } from "@aps/core";

export class RedactCreditCardPolicy implements OutputPolicy {
  private readonly pattern = /\b(?:\d[ -]?){13,16}\b/;

  evaluate(context: OutputContext): PolicyDecision {
    if (!this.pattern.test(context.response.content)) {
      return { decision: "allow" };
    }
    return {
      decision: "redact",
      redactions: [
        {
          field: "response.content",
          strategy: "replace",
          replacement: "[REDACTED]",
          pattern: this.pattern.source,
        },
      ],
    };
  }
}
```
