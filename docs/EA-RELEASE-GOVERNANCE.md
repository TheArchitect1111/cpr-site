# EA Release Governance

EA release governance defines the minimum operational evidence required before a platform release is promoted.

## Baseline Rules

- Release branches must have a documented source branch and commit.
- Governance work must be isolated from application feature work.
- Route, platform, environment, external service, drift, and recovery documentation must be current.
- Generated manifests must be reproducible from the repository state.
- Production promotion must not proceed when application drift is detected inside a governance-only branch.

## Required Evidence

- Route inventory
- Platform manifest
- Drift report
- Environment catalog
- External service registry
- Deployment checklist
- Recovery playbook
- Release manifest

