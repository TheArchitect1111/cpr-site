# Branch Governance

**Policy source:** `governance/config/branch-policy.json`

## Branch Types

| Branch Pattern | Type | Deploy Target | Approval | Manifest Required |
|----------------|------|---------------|----------|-------------------|
| `main` | Production | Production | Yes | Yes |
| `release/*` | Release Candidate | Preview | Yes | Yes |
| `develop` | Development | Preview | No | No |
| `feature/*` | Feature | Preview | No | No |
| `fix/*` | Feature/Fix | Preview | No | No |
| `hotfix/*` | Hotfix | Preview → main | Yes | Yes |

## Merge Rules

1. **Production (`main`)** accepts merges only from `release/*` and `hotfix/*`
2. **Release candidates** merge from `feature/*`, `fix/*`, or `develop`
3. **No direct push** to `main` — pull request required
4. **CI must pass** before merge (`lint-build-smoke` + `release-governance` on main)
5. **Branch retirement:** delete merged feature/fix branches within 30 days

## Deployment Rules

| Environment | Source Branch | Gates |
|-------------|---------------|-------|
| Production | `main` only | Full `verify:deploy` |
| Preview | Any branch | lint + build (gates warn-only) |
| Local | Any | Developer discretion |

**Forbidden:**
- Promoting Preview deployments to Production without matching `main` commit
- CLI deploys that bypass Git integration
- Production deploy from `fix/*` or `feature/*`

## Approval Requirements

| Action | Approver |
|--------|----------|
| Merge to `main` | EA Platform Ops + product owner |
| Production env var change | EA Platform Ops |
| Hotfix to `main` | EA Platform Ops (expedited review) |
| Dashboard redirect change | Must become PR to `vercel.json` |

## Rollback Rules

1. Identify previous release manifest in `docs/releases/`
2. Vercel → Deployments → select manifest's deployment → **Promote to Production**
3. If env change caused failure, revert Vercel env and redeploy same commit
4. Do not roll back Airtable data — fix forward in admin
5. Record rollback in new release manifest with `rollbackVersion` field

## Hotfix Workflow

```
main ──► hotfix/critical-fix ──► PR ──► main ──► verify:deploy ──► production
                │
                └── cherry-pick back to develop (if exists)
```

1. Branch from `main`: `hotfix/<description>`
2. Minimal fix only — no feature work
3. Full `verify:deploy` required
4. Release manifest with `deploymentApproval: hotfix`
5. Merge to `main` within 24 hours

## Current State (CPR)

| Item | Status |
|------|--------|
| Production branch | `main` @ documented in releases |
| Active fork | `fix/admin-login-loop` (12 ahead / 38 behind) — **must reconcile before next production deploy** |
| GitHub branch protection | See `docs/branch-protection-checklist.md` |

## Retirement Policy

- Merged branches: delete within 30 days
- Stale preview branches (>30 days, no activity): archive or delete
- Orphan branches with production-only code: merge or document exclusion before deletion
