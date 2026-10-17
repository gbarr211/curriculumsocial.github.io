# Family profile and discovery increment

Login/signup → family setup → save → discover families. Returning members see discovery and can edit their family profile.

Family card: name or nickname (for example Smith Family), optional compressed picture, broad area, languages, educational philosophies, interests and introduction. Contributions and availability remain private. Discovery uses shared philosophies/interests and filters; no compatibility score or child records.

Family visibility is optional and off by default. Atomic profile saves create, update or remove the directory card. Rules enforce the exact shared-field projection. Deleting a profile removes its card. Account deletion asks the owner to remove the profile first. Picture selection is local until save; square 320px JPEG, capped at 180000 data-URL characters. The original file and its metadata are not uploaded.

Private design preview: /review/family-preview.html uses fictional data and no Firebase writes. Actual /member.html uses cirriculum-social Firebase. Production rules activation and persistence verification are required before release.

Checks: 42 local emulator security/schema scenarios, 12 mocked family UI scenarios and 39 account/community regressions passed. Production rules last observed default deny. No production profile/account was created during this increment. Synthetic tests cover atomic opt-out/deletion, directory projection, email/child/admin-field denial, anonymous/cross-account denial, bounded queries and session clearing.

Next: restore secure Firebase admin sign-in; publish reviewed rules with browser action-time confirmation; publish the GitHub candidate based on public 4f254964503d17ed6fbe68ab230e3ff1366c35b3; verify synthetic save/read/update/discovery/denial/opt-out/deletion with authorized test accounts and cleanup.
