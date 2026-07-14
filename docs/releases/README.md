# Release Manifests

Every production deployment produces an immutable **Release Manifest** documenting exactly what was deployed.

## Location

```
docs/releases/
├── README.md
├── latest.json                          # Pointer to most recent manifest
└── RELEASE-<shortSha>-<YYYY-MM-DD>.json # Immutable per-deploy record
```

## Generate

```bash
npm run governance:manifest
```

In CI (automatic via `verify:deploy`):

```bash
GOVERNANCE_BUILD_STATUS=passed \
GOVERNANCE_SMOKE_STATUS=passed \
GOVERNANCE_DEPLOY_APPROVAL=github-actions \
npm run governance:manifest
```

## Manifest Fields

| Section | Fields |
|---------|--------|
| Identity | `releaseVersion`, `schemaVersion` |
| Git | `commitSha`, `branch`, `commitMessage`, `author`, `timestamp` |
| Deployment | `vercelDeploymentId`, `buildTimestamp`, `buildNumber`, `buildStatus`, `deploymentApproval`, `rollbackVersion` |
| Runtime | `nodeVersion`, `nextVersion`, `reactVersion` |
| Components | `chassisVersion`, `portalVersion`, `orbieVersion` |
| Config versions | `environmentCatalogVersion`, `redirectVersion`, `airtableSchemaVersion`, `stripeConfigurationVersion`, etc. |
| Feature flags | Snapshot of flag names + production enabled state |
| Routes | Page and API route inventory at deploy time |
| Checksums | Hashes of `vercel.json`, `middleware.ts`, env catalog |
| Quality | Smoke test results, visual QA status, lint status |
| Release notes | Commit message or `GOVERNANCE_RELEASE_NOTES` env |

## Version Format

```
{platformVersion}+{shortSha}.{buildNumber}
```

Example: `1.0.0+6034671.42`

## Rollback Reference

Each manifest includes `deployment.rollbackVersion` when deploying a rollback. Previous manifests serve as the promotion target in Vercel.

## Retention

- Keep all production manifests indefinitely in Git
- Preview manifests optional (generate locally, do not commit)

## Validation

Deployment gates verify:
- Manifest exists before production promote
- Manifest SHA matches deployed commit

See [Deployment Checklist](../DEPLOYMENT-CHECKLIST.md).
