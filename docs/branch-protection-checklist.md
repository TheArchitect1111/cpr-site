# Branch Protection Checklist (protected release branch)

There is **no separate `production` branch** today. For this repo, the protected release branch is **`main`**. Apply settings to **`main`** until a dedicated production-branch strategy is approved.

Apply these settings in GitHub repository settings:

- Require a pull request before merging.
- Require at least 1 approval.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass before merging.
- Set required check: `lint-build-smoke`.
- Require branches to be up to date before merging.
- Include administrators in restrictions.
- Restrict force pushes and deletions.

## Release Checklist

- CI green on PR (`lint-build-smoke`).
- Production URL and canonical alias verified.
- Critical flows manually spot-checked after deploy:
  - Home sections and images
  - Form submission
  - Login/portal route
  - Payment start path (if touched)

## Account-level reliability (still pending)

- Sentry DSN configured for production ([Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/))
- Uptime monitors on canonical URLs ([Uptime Kuma](https://github.com/louislam/uptime-kuma))
- Backup destination documented for env/registry exports
