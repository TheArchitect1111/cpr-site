# EA Release Governance

Operational governance framework for all EA platform applications. Makes every deployment **deterministic, reproducible, auditable, recoverable, and traceable**.

## At Any Moment, Answer

| Question | Source |
|----------|--------|
| What version is running? | `docs/releases/latest.json` → `releaseVersion` |
| What code produced it? | `git.commitSha` in release manifest |
| What environment created it? | `deployment.vercelEnvironment` + Vercel deployment ID |
| What services does it depend on? | `governance/config/external-services.json` |
| Can we reproduce it exactly? | Git SHA + env catalog + release manifest |
| Can we roll back safely? | Previous manifest in `docs/releases/` + Vercel promote |
| Has anything drifted from Git? | `npm run governance:drift` |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Git (main) — single source of truth                          │
│  app/ middleware.ts vercel.json .env.example                  │
│  governance/config/*  scripts/governance/*                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   CI Gates        Release Manifest   Drift Detection
   verify:deploy   docs/releases/     governance:drift
         │               │               │
         └───────────────┴───────────────┘
                         │
                         ▼
              Vercel Production Deploy
              (one commit ↔ one manifest)
```

## Phases

| Phase | Capability | Command / Location |
|-------|------------|-------------------|
| 1 | Release Manifest | `npm run governance:manifest` → `docs/releases/` |
| 2 | Deployment Gates | `npm run governance:gates` |
| 3 | Environment Catalog | `governance/config/env-catalog.json` |
| 4 | External Service Registry | `governance/config/external-services.json` |
| 5 | Branch Governance | `governance/config/branch-policy.json` |
| 6 | Platform Manifest | `npm run governance:platform` |
| 7 | Drift Detection | `npm run governance:drift` |
| 8 | Recovery Framework | `docs/RECOVERY-PLAYBOOK.md` |

## Commands

```bash
npm run governance:routes      # Collect route manifest
npm run governance:platform      # Generate platform.manifest.json
npm run governance:manifest      # Generate release manifest
npm run governance:gates         # Run deployment gates
npm run governance:drift         # Detect drift + integrity score
npm run governance:all           # Full pipeline
npm run verify:deploy            # lint + build + smoke + governance
```

## Inheritance (Other EA Apps)

Copy into any EA repository:

1. `governance/` (entire folder)
2. `scripts/governance/` (entire folder)
3. Governance docs in `docs/`
4. `.github/workflows/release-governance.yml`
5. Customize `governance/config/platform.json`

## Production Deploy Rules

1. Deploy **only** from `main` (or configured production branch)
2. Run `npm run verify:deploy` — all gates must pass
3. Generate release manifest before promote
4. No dashboard-only redirects — all rules in `vercel.json`
5. No staging flags (`CPR_STAGING_OPEN`) in Production env
6. Every production env var documented in env catalog

## Related Documents

- [Platform Manifest](./PLATFORM-MANIFEST.md)
- [Environment Catalog](./ENVIRONMENT-CATALOG.md)
- [External Service Registry](./EXTERNAL-SERVICE-REGISTRY.md)
- [Branch Governance](./BRANCH-GOVERNANCE.md)
- [Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)
- [Drift Detection](./DRIFT-DETECTION.md)
- [Recovery Playbook](./RECOVERY-PLAYBOOK.md)
- [Release Manifests](./releases/README.md)
