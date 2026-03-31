---
title: "Tool Call Policy"
---

# Tool Call Policy

**Status: DRAFT**

## 1. Overview

Tool call policies are evaluated at the **Tool Call Interception** point — after the LLM produces a tool call instruction and before the tool is executed.

## 2. Evaluation Input

The policy engine receives a `ToolCallContext` (see [Core Concepts §4.2](core.md#42-toolcallcontext)).

## 3. Policy Scope

Tool call policies MAY inspect:

- The tool name being invoked
- The arguments passed to the tool
- The assistant message that produced the tool call
- Agent and session metadata

## 4. Supported Decisions

| Decision | Permitted | Notes |
|---|---|---|
| `allow` | Yes | |
| `deny` | Yes | Blocks tool execution; agent receives a denial error |
| `redact` | Yes | Applied to tool arguments before execution |
| `transform` | Yes | e.g. override or sanitize arguments |
| `audit` | Yes | |

## 5. Example: Rego Policy

Only allow a specific set of approved tools:

```ruby
package aps.tool_call

import future.keywords.if

approved_tools := {"web_search", "read_file", "summarize"}

default decision := "deny"

decision := "allow" if {
    input.tool_name in approved_tools
}

reason := sprintf("Tool '%v' is not in the approved tool list.", [input.tool_name])
```

## 6. Example: Programmatic Rule (TypeScript)

Prevent file writes outside of a designated directory:

```typescript
import { ToolCallPolicy, ToolCallContext, PolicyDecision } from "@aps/core";
import * as path from "path";

export class RestrictedWritePolicy implements ToolCallPolicy {
  private readonly allowedBase = "/workspace/output";

  evaluate(context: ToolCallContext): PolicyDecision {
    if (context.tool_name !== "write_file") return { decision: "allow" };

    const target = context.arguments["path"] as string;
    if (!path.resolve(target).startsWith(this.allowedBase)) {
      return {
        decision: "deny",
        reason: `write_file target '${target}' is outside the allowed directory.`,
      };
    }
    return { decision: "allow" };
  }
}
```
