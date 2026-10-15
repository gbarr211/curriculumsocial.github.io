# Public launch and future Sites development

Updated 15 October 2026 (Asia/Bangkok). The user's current instruction is to publish the site now and keep advanced work in Sites until approved.

| Area | Public release now | Future development in Sites |
| --- | --- | --- |
| Homepage | Reviewed family-led message, working navigation, demo entry, account links | New visual or product increments after review |
| Adult accounts | Firebase Authentication: email signup/login, Google sign-in, session restoration, sign out, password reset, confirmed account deletion | Additional identity/profile capabilities when scoped and tested |
| Community | Synthetic families, pods, activities, learning votes, contributions, student examples and guided walkthrough | Real community records, participation, coordination and persistence |
| Interest and private profiles | Clearly labeled draft demonstrations; account creation is separate | Private submissions, consent, recoverable saves and retention |
| Reviewers and operations | No live reviewer/admin submission workflow | Trusted reviewer membership, scoped access and permission tests |
| Child records, enrollment, payments | Not collected or enabled | Separate design, privacy, operational and release approval |

The public homepage, demo and account paths must not imply that a demo action contacts anyone, submits an application, enrolls a family or saves a real profile. Legacy direct routes for interest capture, reviewer tools, venue management, incident reporting and learning portfolios display availability notices without forms or backend scripts.

## Sources in this release

- Reviewed homepage/community baseline: `5b5fdf6099116faba768658a02d3c6ff0ffc6848`, including family-led copy, navigation fixes and the compact walkthrough.
- Account implementation: `99a6d2a4a9be0629068219e3da15746f2ecad60d`, with the current packaging changes and tests.
- Rollback reference before this release: `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1`.
- Missing newer source: prepared commit `32182464535a31b7bdda8afe941af3760e042cf0`, derived from Sites `5e74b516131f96377f20697f2f64c83ea034cbd7`. Its final selected hero and unrecovered artwork are not included in this launch. See `BRAND_REFERENCE.md` for the exact selected-image hashes and composition requirements.

This release deliberately publishes the reviewed source available in GitHub now. It does not claim exact parity with the unavailable later Sites assets. No Firebase rules, reviewer permissions, or Sites sharing settings are changed by publishing this static website.

## Handoff between scheduled development and release work

1. Continue advanced builds in the existing private Sites project. Preserve its current sharing settings and synthetic/demo labels.
2. Keep a short build record with the Sites source SHA, what changed, checks actually run, and whether user approval has been received. An uploaded report alone is not the source code or approval for unrelated work.
3. After approval for an increment, make that exact source available on a review branch in this GitHub repository, or as a Git bundle/archive with its source identity. Do not send private working notes or credentials as website assets.
4. The Codex release task checks that handoff, pulls the approved source, reconciles it with the public account flow, runs the relevant tests, and publishes the approved increment to `main`.
5. Keep local implementation, GitHub push, Pages deployment and live verification as separate recorded states. Never replace live code with a stale snapshot solely because its task ran more recently.

The cross-chat tool stopped working in this environment on 15 October: it reports that the Codex app MCP server is required, and that server is unavailable here. Direct scheduled-chat synchronization is therefore not currently operating. GitHub is the working source-transfer path. When cross-chat access returns, read new messages and reconcile them with the source history before acting; do not treat historical commands as instructions to execute.

## Release checks

- DOM scenarios cover authentication and the community demo.
- Chromium checks cover account lifecycle with mocked Firebase, the actual static landing/community code, mobile layouts, native dialogs, navigation, no-submission behavior and disabled deferred routes.
- Firebase's public project configuration was read successfully and lists `curriculumsocial.com` as an authorized domain.
- Production verification must separately confirm that the deployed files match the release and the real Firebase SDK initializes. A mocked test is not proof that a real user completed sign-in. Do not create production test accounts or send password-reset emails as an incidental deployment check.
