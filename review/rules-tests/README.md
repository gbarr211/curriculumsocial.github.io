# Adult-profile rules emulator checks

Status, 2026-10-11: 56 scenario checks passed against the unchanged candidate at Git blob `41f5d53d1a0d76a7af42a1e7bece582ead1d8f53`. This is actual Firestore emulator evaluation, not JavaScript-mocked permission logic. It is not a production permission release or end-to-end authentication test.

## Reproduce

Requires Node.js compatible with the pinned dependencies and Java 21+. From this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

The first run downloads the emulator. Tested versions: firebase-tools 15.33.0, firebase 13.0.0, @firebase/rules-unit-testing 6.0.0, Firestore emulator 1.22.0 and Temurin Java 21.0.12.1. Dependencies are locked. No Firebase login is needed.

The command uses only `demo-curriculumsocial-rules`, binds Firestore to `127.0.0.1:8188`, and loads the canonical `../firestore-profiles.candidate.rules`. The test refuses another emulator address and never imports application Firebase configuration. All identities and records are synthetic; state clears before every scenario and at successful completion, then the CLI stops the emulator. No export is configured. Setup bypass is restricted to local synthetic fixture creation.

## Coverage and result

- Valid owner create/get, three descriptive roles, verified identity and optional HTTPS photo.
- Anonymous and other-owner create/get/update denials; listing and deletion denied for all three contexts.
- Create rejects wrong email/verification, privilege injection, invalid role/types/lengths/photo and every missing required field.
- Owner can update allowed display/bio/location/radius/philosophy fields; identity, role, verification, creation time, privilege and invalid field changes are denied.
- Child subcollections, student, interest and activity paths remain denied for synthetic reads/writes.

56/56 scenarios passed; successful process exit and synthetic cleanup confirmed. Java 17 failed the CLI prerequisite; Java 21 resolved it. The exact committed layout was rerun successfully.

## Remaining release gates

Keep production permanent default-deny in place. Test actual browser/provider/session flows in an approved integration environment; finish safe dynamic rendering, privacy/controller/retention decisions and legacy-record/schema handling; obtain explicit production permission release authorization. Mock authentication claims here do not test token refresh or OAuth. No test proves historical data, IAM/server paths, other Firebase products, browser layout or full application security.

The current candidate accepts client timestamps by type, rather than enforcing server time. They must not authorize access or be treated as trusted audit evidence. Self-selected parent/teacher/venue roles are descriptions only. This suite does not resolve pilot D01 or founder workload D02.

Primary guidance checked 2026-10-11:
- https://firebase.google.com/docs/rules/unit-tests
- https://firebase.google.com/docs/emulator-suite/connect_firestore
