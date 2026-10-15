# Public deployment — 15 October 2026

**Live website:** https://curriculumsocial.com/

Published application commit: `7a22a47bea15d903de5fa315a7c54ff37b011a79`. Native Git push updated both `main` and `codex/adult-account-handoff`; read-back confirmed both refs. GitHub API build-status access is unavailable, so deployment is established by direct HTTPS and Chromium checks of the public site.

Verified at `2026-10-15T01:47:09Z`: all **34** checked public endpoints returned HTTP 200 and matched the tested local files byte-for-byte. This includes the homepage, seven demo screens, six account routes, account notice, CSS/JavaScript, deferred-feature pages, hero image and release marker.

| Live path | HTTP | SHA-256 |
| --- | --- | --- |
| `/` | 200 | `421a6987be6a37837f4805244fa49b43160aba829118477446554f9808d4755f` |
| `login.html` | 200 | `217f32241eacffbfca40190fcae4f5e732c31e5f65e70ee5053a70cbb7867cfe` |
| `signup.html` | 200 | `ec5262c2f70d40cb27e9032fe713ac8e61a9c90bc39c13935bcbd59fccc79dc7` |
| `js/public-account-service.js` | 200 | `21369eba0a5bc1230c168fe30faa456db164edecd247ad1b8b6a69cf7f4a7d1a` |
| `release.json` | 200 | `9c381d69fa275796937c2e3ce93bcb546007bc8b994b62ccfa2b90071957caa8` |

Fresh Chromium visits to the deployed `login.html` and `signup.html` loaded the real Firebase 10.7.1 SDK, initialized project `cirriculum-social`, completed signed-out session readiness, and enabled the form controls. No SDK mocking was used in these two live checks. The public Firebase configuration separately confirms `curriculumsocial.com` as an authorized domain. No credentials were entered, accounts created, reset emails sent, or account deletions/database writes performed; a real-user completed sign-in was not exercised.

Before deployment, **38 DOM scenarios** and **26 Chromium checks** passed. Account lifecycle tests used mocked Firebase; community/demo tests execute the actual static frontend with no backend. Internal resource checks and CRLF-aware Git whitespace checks also passed. Retained byte-comparison and browser evidence lives in `/workspace/CurriculumSocial/validation/live-release.json` and `live-account.json` outside the public website.

Release boundary: homepage and demo community are public, and the adult account path uses real Firebase Authentication. Community actions remain synthetic; private submissions, real profiles, reviewer operations, enrollment and payments remain future Sites work. Details: [RELEASE_SCOPE.md](RELEASE_SCOPE.md).

The launched homepage/community source is reviewed GitHub commit `5b5fdf6099116faba768658a02d3c6ff0ffc6848`, combined with the recovered account fixes. The unavailable later Sites hero and branding are explicitly deferred. This is not a claim that prepared commit `3218246` was recovered or deployed.

Rollback reference: `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1`. Preserve subsequent account/data decisions when planning any rollback; do not force-reset shared history. No Firebase rules or Sites sharing settings changed.
