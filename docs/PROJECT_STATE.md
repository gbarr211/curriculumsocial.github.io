# Curriculum Social — current project state

Updated 15 October 2026 (Asia/Bangkok).

## Current request and workflow

Continue the prepared ChatGPT release in Codex, retain the approved Sites experience, and fix adult login/signup. Use this repository for the public website and durable engineering records. Future advanced workflows are developed and approved in the existing private Sites project before committing them here.

The ChatGPT and Codex project containers cannot be merged using the available project tools. The uploaded handoff and seven supporting documents have been preserved in the current cloud workspace under `/workspace/CurriculumSocial/sources`, with a provenance index in `/workspace/CurriculumSocial/README.md`. That archive is outside the website root and is not a full migration of ChatGPT conversations or Sites. The Windows project shown in the app is a separate checkout; this task cannot edit that host's files.

## Verified source state

- Public GitHub `main`: `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1` at inspection.
- GitHub review branch `review/movement-homepage-20261008`: `5b5fdf6099116faba768658a02d3c6ff0ffc6848`.
- Handoff's newer Sites source: `5e74b516131f96377f20697f2f64c83ea034cbd7` (historical evidence; unavailable in this checkout).
- Handoff's prepared release: `32182464535a31b7bdda8afe941af3760e042cf0`, formerly at `/workspace/scratch/bdf329276ed6/curriculum-release`. The commit and checkout are absent here, and its intended release branch was not found on GitHub.
- The original work history confirms public release authorization, preparation of that commit, and a failed Git push. It does not establish deployment.

## Account work recovered in Codex

Recovered the account preparation source and seven tests from the original work history without executing historical shell commands. Restored the authentication-only approach and hardened it on the current checkout:

- Six direct routes: `signup.html`, `login.html`, `profile.html`, and their `account/` equivalents.
- Email/password signup and login, Google popup sign-in, restored session, sign out, password reset, and separately confirmed deletion.
- Correct signup/login autocomplete, signup acknowledgement, guarded duplicate submissions, escaped identity display, and actionable service errors.
- Firebase initialization is isolated from the legacy `firebase-config.js`, with disabled controls until ready and an explicit recovery message for SDK/loading failure.
- Existing Firebase project configuration and provider SDK version are retained. No Firestore imports/writes, database permission changes, live test accounts, reset emails, or production deletions were performed.
- Local CSS uses the established Shared Circle colors and works without external fonts or CSS dependencies.

This is an independently reviewable account fix. It does **not** contain the missing newer Sites homepage, community changes, or hero asset, and must not be presented as the completed prepared release. Other legacy pages remain on the public-main baseline.

## Validation

Use the locked dependencies in `review/public-tests`:

```sh
npm ci --prefix review/public-tests
npm test --prefix review/public-tests
npm run test:browser --prefix review/public-tests
```

The DOM suite covers the seven recovered scenarios and ten additional loading, consent, reset, error, and deletion scenarios. Chromium checks cover all six routes, native form validation, session restoration, account actions, popup click activation, local assets, SDK failure, and layouts at 320, 390, and 1280 pixels. All Firebase services in these suites are mocked; passing checks do not verify live provider configuration, authorized domains, or production sign-in.

For local development, run `python3 -m http.server 8000 --bind 127.0.0.1` from the repository root. Account CSS and modules are local. Live SDK/authentication additionally depend on Google's Firebase endpoints and authorized-domain settings. Do not describe a local server as a published deployment.

## Blocking source transfer and next release

The latest prepared release is required to preserve the user's approved Sites experience. Transfer a Git bundle from the original ChatGPT workspace, or push the prepared release to a review branch there using its available authenticated GitHub tools. Example export in the original workspace, after checking the intended HEAD:

```sh
git -C /workspace/scratch/bdf329276ed6/curriculum-release rev-parse HEAD
git -C /workspace/scratch/bdf329276ed6/curriculum-release bundle create /tmp/CurriculumSocial-release.bundle HEAD
```

Expected prepared HEAD from the handoff: `32182464535a31b7bdda8afe941af3760e042cf0`. Preserve any newer work rather than resetting it. Once transferred, inspect the bundle, reconcile these account fixes with the prepared release, run the Sites-derived landing/community tests and account/browser checks, and then complete the authorized release. Retain `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1` as the original main rollback reference.

The environment's proxy returned 403 for the public site and private Sites URL during inspection. Neither live content nor the new authentication integration has been verified from this environment. The original handoff's landing/community test results are historical, not checks executed on the current checkout.

## Later work

Private interest submission, trusted reviewer membership, permission tests, and recoverable saves remain future Sites work. Their scope and acceptance are separate from authentication-only adult accounts. Product focus remains family-led pods, human teaching, minimal child data, and a manageable founder workload.
