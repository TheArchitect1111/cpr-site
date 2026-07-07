# Recovery Playbook

If a release fails:

1. Stop promotion.
2. Identify the release branch and commit.
3. Compare route manifest and platform manifest with the last known good release.
4. Check external service health.
5. Roll back through the hosting provider if production has changed.
6. Record the incident and remediation in the release notes.

Governance baseline work must not deploy or mutate production state.

