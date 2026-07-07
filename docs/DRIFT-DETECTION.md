# Drift Detection

Drift detection confirms that governance-only work does not alter application behavior.

The governance drift report checks for changes under:

- `app/`
- `lib/`
- `middleware.ts`
- `vendor/`
- `public/`
- `components/`
- `pages/`

Generated report:

```text
governance/reports/drift-report.json
```

The report also records:

- Branch classification
- Validation status
- Deployment eligibility
- Validation or production mode
- Integrity score
- Drift score
- Production readiness

Reconciliation branches are allowed to run drift detection in `VALIDATION MODE`.
They are not deployment eligible.

