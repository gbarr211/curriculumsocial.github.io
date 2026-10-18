# Ready family-first release — 18 October 2026

The user reviewed the private family-first build and directed: “commit as much as you can to the live site” before the next scheduled run. This is authorization to publish the ready increment. Private reviewed source:5606ef8c24860535595c1121d5d032cc66039686. Public rollback:3e8914bda507141638d8a758f99a4587f4042880.

## Public behavior

- Existing real adult authentication, owner-private family profile saves/edit/export/delete and opted-in member discovery continue.
- Optional adult display name can be saved/cleared through Firebase Authentication in account settings. This is separate from the family name and does not publish a family card or grant teaching/manager/guardian rights. Account notice describes the field. Do not enter child data.
- Member home explains the first-parent representative model and links to the new demos. Until shared membership is activated, the adult who created an existing real family profile remains its owner; another profile does not join that family.
- Family setup/invitation/search/community/learner examples at `/review/family-accounts.html` are fictional browser-tab-session demonstrations. They do not send an invitation, join a real family or create a real learner. Reset clears samples. The fictional account selector is not authentication.
- Standalone gatherings at `/review/events.html` demonstrate RSVP/capacity/cancellation and optional progression toward pods. No real booking, payment or notice occurs. Pod membership is not required for a sample gathering.

Only allowlisted reviewed static runtime files are transferred. Private operations notes, backups, server candidate, token handling and rules are excluded from this release. Public labels replace owner-private review labels; links return to real member home. Existing hero/branding remain unchanged.

## Validation and live boundary

Run the locked public test suite (`npm ci --prefix review/public-tests`, `npm test --prefix review/public-tests`, `npm run test:browser --prefix review/public-tests`). It includes name-save/clear/session-change checks and the reviewed family and Events browser scenarios against the public files. Firebase is mocked for account tests. Independently compare deployed bytes to source and confirm real SDK initialization; do not create accounts or write users' names just to test publication.

No Firestore rules, Functions, shared membership migration or child/guardian collection is activated. Those need real Auth/App Check/email transport, intended runtime/index/IAM checks, compatible durable member UI, membership-aware deletion/retention/recovery and staged consent/backup/rollback. Their local emulator checks are implementation evidence, not a live service verification. Existing nightly development should continue from this boundary and preserve the active schedule.
