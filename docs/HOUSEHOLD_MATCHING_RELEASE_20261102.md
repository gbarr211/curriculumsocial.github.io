# Shared-household matching release — 2 November 2026

The user approved publishing shared-household matching and the tested invitation and access-recovery fixes on 2 November 2026. Reviewed product candidate: `3f2178bc9021791f551d53f68d161cefc105ddd4`. Owner-private matching review: source `7bcc9d04c9cac427df30fa0e649bf66d59f8742a`, version 41, `/review/household-matching.html`. That isolated review uses fictional households; its older surrounding Site source is not the public release source.

Invited adults can find families using an accessible household's saved educational preferences without creating another profile. A sole shared household is selected automatically when no owned profile exists; multiple shared households require an explicit choice. Owned profiles remain the default when present. Browsing without preferences remains available. Household selection does not save a profile or grant editing rights. Unconfirmed shared preferences clear during refresh, lost access requires a new selection, and session changes discard stale reads.

The cumulative candidate also includes invitation recovery, binding acceptance to the reviewed invitation, failed/pending sign-out handling, open-invitation expiry checks and independent shared-profile loading/retry. Shared read failures no longer block the owned profile or discovery; targeted retry preserves owned drafts.

The existing read-only invited-adult role, backend services, security rules, indexes, billing, data collection and Events/Pods boundary remain unchanged. No new production accounts or database writes are required for this client release. Local tests use synthetic/mocked services and are not production persistence evidence.

Rollback reference: public main `b0f10b5682386abe6e51db3deea318df42b99198`. Deployment identity, final checks, backups and served-source verification are recorded separately in the private operations release record. Approval and release preparation do not alone establish that the public deployment has completed.
