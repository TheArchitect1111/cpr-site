# Deployment Checklist

Before production deployment:

- Confirm branch and commit.
- Confirm branch classification is Production.
- Confirm deployment eligibility is `YES`.
- Confirm branch is `main` or `release/*`.
- Confirm route manifest has been regenerated.
- Confirm platform manifest has been regenerated.
- Confirm drift report shows no application drift.
- Confirm environment variables are reviewed.
- Confirm external services are reachable.
- Confirm rollback plan is known.
- Confirm release manifest parses as UTF-8 JSON.

Deployment is explicitly blocked from:

- `governance/*`
- `reconcile/*`
- `recovery/*`
- `feature/*`
- `preview/*`
- `experimental/*`

