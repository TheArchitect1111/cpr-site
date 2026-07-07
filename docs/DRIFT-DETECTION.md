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

