# EA Release Governance Framework

Reusable release governance for all EA platform applications (CPR, Simplifi™, Amplifi™, ETFM, Magnifi™, etc.).

## Inheritance

Copy these paths into any EA application repository:

```
governance/              # Configuration, schemas, and policy SSOT
scripts/governance/      # Automation scripts
docs/EA-RELEASE-GOVERNANCE.md
docs/PLATFORM-MANIFEST.md
docs/ENVIRONMENT-CATALOG.md
docs/EXTERNAL-SERVICE-REGISTRY.md
docs/BRANCH-GOVERNANCE.md
docs/DEPLOYMENT-CHECKLIST.md
docs/DRIFT-DETECTION.md
docs/RECOVERY-PLAYBOOK.md
docs/releases/
```

Then customize `governance/config/platform.json` for the application.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run governance:manifest` | Generate release manifest |
| `npm run governance:gates` | Run deployment readiness gates |
| `npm run governance:drift` | Detect configuration/deployment drift |
| `npm run governance:platform` | Regenerate platform manifest |
| `npm run governance:all` | Run full governance pipeline |

## Principles

1. **Git is authoritative** — production deploys only from the approved branch.
2. **Every deploy is traceable** — one commit, one manifest, one deployment ID.
3. **Every secret is cataloged** — no undocumented production variables.
4. **Drift is visible** — automated comparison of Git, Vercel, and runtime config.
5. **Recovery is documented** — a new developer can recreate production from Git + docs.
