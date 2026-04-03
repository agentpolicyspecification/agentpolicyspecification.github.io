---
title: "Versioning"
---

# Versioning

APS uses [Semantic Versioning](https://semver.org) (semver) for the specification and all SDK implementations.

## Specification

The specification and its JSON schemas are versioned together under a single version number.

Schemas are published at versioned URLs:

```
https://agentpolicyspecification.github.io/schemas/v{major}.{minor}.{patch}/
```

For example:

```
https://agentpolicyspecification.github.io/schemas/v0.1.0/base.schema.json
https://agentpolicyspecification.github.io/schemas/v0.1.0/policy-decision.schema.json
```

Each schema's `$id` field encodes its version, so consumers can pin to an exact schema revision.

## SDKs

Each SDK is versioned independently and declares which specification version it implements.

| SDK | Repository |
|---|---|
| TypeScript | [agentpolicyspecification/aps-typescript](https://github.com/agentpolicyspecification/aps-typescript) |
| Java | [agentpolicyspecification/aps-java](https://github.com/agentpolicyspecification/aps-java) |

SDK release notes document any specification changes included in each release.

## Policy Set Version Declaration

Policy sets declare the APS specification version they target using the `aps_version` field:

```yaml
aps_version: "0.1.0"
policies:
  - ...
```

This field is required. The APS runtime uses it to validate compatibility between the policy set and the running implementation, and to apply the correct evaluation semantics for that spec version.

If the runtime does not support the declared `aps_version`, it MUST refuse to load the policy set and surface a clear error to the operator.

## Compatibility

### What a version number means

| Component | `MAJOR` bump | `MINOR` bump | `PATCH` bump |
|---|---|---|---|
| **Specification** | Breaking change to the data model or enforcement contract | New interception point, decision type, or condition | Clarification, editorial fix, or schema correction |
| **SDK** | Breaking API change | New feature, new module, or new spec support | Bug fix |

### Pre-1.0 stability

All artifacts are currently in the **0.x** range. While APS is pre-1.0:

- **Minor versions** (`0.x.0`) may contain breaking changes to both the specification and the SDK APIs.
- **Patch versions** (`0.x.y`) are non-breaking within the same minor.
- Pinning to an exact minor version is recommended for production use.

### Specification ↔ SDK compatibility

An SDK minor version is compatible with exactly one specification minor version. The mapping is documented in each SDK's `CHANGELOG.md`.

## Conventional Commits

All repositories follow the [Conventional Commits](https://www.conventionalcommits.org) specification for commit messages. Release notes are generated automatically from commit history on every merge to `main`.

| Prefix | Effect |
|---|---|
| `feat:` | Minor version bump |
| `fix:` | Patch version bump |
| `feat!:` / `BREAKING CHANGE:` | Major version bump |
| `docs:`, `chore:`, `refactor:` | No version bump |

## Changelog

Each repository maintains a `CHANGELOG.md` at its root that is updated automatically on release.

- [spec CHANGELOG](https://github.com/agentpolicyspecification/spec/blob/main/CHANGELOG.md)
- [aps-typescript CHANGELOG](https://github.com/agentpolicyspecification/aps-typescript/blob/main/CHANGELOG.md)
- [aps-java CHANGELOG](https://github.com/agentpolicyspecification/aps-java/blob/main/CHANGELOG.md)
