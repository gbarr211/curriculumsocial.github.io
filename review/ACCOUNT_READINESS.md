# Adult account readiness — 2026-10-10

Account forms use the modular Firebase API through js/auth-entry.js. Signup and login navigate only after a successful profile read or confirmed signup profile save. Failed or denied reads are different from a missing document. Signup retry can reuse the matching authenticated session; it does not delete an account or silently roll back authentication. Form values remain available, concurrent requests are blocked, and passwords clear on successful completion. Google uses the same role selector as email signup. Roles describe participation and grant no security privileges.

The hosted account preview runs the same form module with synthetic in-memory services. It creates no Firebase users or records and sends no email. Public main is unchanged.

Production still uses permanent default-deny Firestore rules. `firestore-profiles.candidate.rules` is a review candidate, NOT a deployed or certified rule set. It proposes self-owned adult profile get/create/update, denies listing/deletion and all other collections, restricts creation fields, and keeps identity/role/verification/creation time immutable on update. It deliberately does not enable interest capture, child records, family directory, activities, privileged teacher/venue access or uploads.

Permission cases covered by the local emulator suite: own versus unrelated/anonymous get; list denied; own valid create; wrong UID/email/verification denied; extra administrator field denied; invalid role/type/oversized text denied; allowed display/bio update; email/role/createdAt/privilege modification denied; unauthorized update/delete; all student/interest/activity paths denied. Completed 2026-10-11: 56 actual Firestore emulator scenarios passed; see rules-tests/README.md and the locked, repeatable suite. Production integration remains untested and production permanent default-deny remains active.

Profile load/save failures now show retryable errors, retain edits and confirm a successful save before reporting it. Concurrent saves are guarded; switching to a real session clears demo child placeholders. Eleven account and four profile scenario groups passed, plus eight movement/nine interest regressions and four packaged-preview checks (36 total), using jsdom and mocked services. The private hosted preview was successfully updated; browser rendering and real Firebase behavior remain unverified.

Release checks still needed: dynamic HTML/data rendering; end-to-end Auth/provider/browser checks; incomplete-profile recovery after a real session reload; exact privacy/controller/retention notice; permitted synthetic integration environment; tested collection-specific permissions. Existing privileged roles in historical records must not be trusted as authorization merely because they are stored in a user document. No real child data is needed for these checks.

Use `npm install --ignore-scripts` and `npm test` in review/tests for offline mocked form/request regressions. For recovery, keep the published default-deny rules; do not restore blanket public access.

## 2026-10-11 verification boundary

The candidate rules were not changed or deployed. The suite reads the canonical rules file, uses only a local demo project and synthetic adult identities, and clears its fixtures. This advances emulator validation only; it does not complete the remaining release checks. Client timestamps are type-checked, not trusted audit time. Explicit permission-release authorization is still required.
