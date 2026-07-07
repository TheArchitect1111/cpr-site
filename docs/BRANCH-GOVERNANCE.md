# Branch Governance

## Branch Classifications

Every branch is classified before governance commands run.

| Branch pattern | Classification | Validation | Deployment |
| --- | --- | --- | --- |
| `main` | Production | Allowed | Eligible |
| `release/*` | Production | Allowed | Eligible |
| `governance/*` | Governance | Allowed | Blocked |
| `reconcile/*` | Reconciliation | Allowed | Blocked |
| `recovery/*` | Recovery | Allowed | Blocked |
| `preview/*` | Preview | Allowed | Blocked |
| `feature/*` | Feature | Blocked | Blocked |
| `experimental/*` | Experimental | Blocked | Blocked |

## Validation Workflow

Validation commands may run on production, governance, reconciliation, recovery, and preview branches:

```text
npm run governance:gates
npm run governance:drift
npm run governance:routes
npm run governance:platform
npm run governance:manifest
```

Non-production branches report `VALIDATION MODE` and `Deployment Eligibility: NO`.

## Reconciliation Workflow

Use `reconcile/*` branches for intentional product reconciliation. Governance validation is allowed so work can be measured, but deployment remains blocked.

Rules:

- Do not reconcile feature branches into the governance baseline.
- Do not include application feature work.
- Do not deploy from reconciliation, recovery, feature, preview, or experimental branches.
- Do not tag until the baseline is approved.

## Deployment Workflow

Deployment verification is eligible only from:

```text
main
release/*
```

All other branch classes must fail deployment verification even if governance validation passes.

