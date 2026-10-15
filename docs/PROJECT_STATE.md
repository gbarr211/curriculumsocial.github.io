# Curriculum Social — current project state

Updated 15 October 2026 (Asia/Bangkok).

## Public launch

The user explicitly directed Codex to make the website live now, while keeping advanced builds in Sites for future approval. The release is assembled from the reviewed GitHub homepage/community at `5b5fdf6099116faba768658a02d3c6ff0ffc6848` and the authentication-only account work beginning at `99a6d2a4a9be0629068219e3da15746f2ecad60d`.

The reviewed branch includes the family-led homepage, seven community screens, navigation scroll fixes and guided walkthrough. Accounts use Firebase Authentication only. The public pages distinguish sample community actions from actual adult accounts. Legacy direct routes for unfinished submissions, reviewer tools, venue management, incident reports and portfolios are informational pages without forms or backend scripts.

The exact public/future boundary and source handoff procedure are in [RELEASE_SCOPE.md](RELEASE_SCOPE.md). This supersedes the earlier decision to hold the entire launch for the missing Sites bundle. The selected final Sites hero and unrecovered branding remain a follow-up, and this release does not claim exact parity with that newer source.

Publication state at this checkpoint: release assembled and validated locally; GitHub main push and live verification are the next steps. See the final deployment evidence once added below. Original main/rollback reference: `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1`.

## Validation completed on this release

- 17 account DOM scenarios passed with mocked Firebase.
- 21 community DOM scenarios passed against the packaged public demo.
- 14 account Chromium checks passed, with mocked Firebase and no real accounts.
- 12 public-release Chromium checks passed: homepage/account entry points at 320, 390, 1024 and 1280px; interest-preview defaults; five-stop walkthrough; seven demo screens on mobile/desktop; scroll/history navigation; simulated actions; deferred pages; local asset/browser errors.
- All static links/assets resolved across 15 public entry pages. Previously reviewed generator-code removals were preserved. JavaScript syntax and whitespace checks passed.
- Firebase's public project configuration returned HTTP 200 and includes `curriculumsocial.com` in its authorized domains. The public site and real Firebase SDK are reachable from this environment. No production accounts, password-reset emails, account deletions, database writes or permission changes were made by testing.

Run from the repository root:

```sh
npm ci --prefix review/public-tests
npm test --prefix review/public-tests
npm run test:browser --prefix review/public-tests
python3 -m http.server 8000 --bind 127.0.0.1
```

The browser suite uses `/usr/bin/chromium`; `CHROMIUM_PATH` overrides it. Browser tests start/close their own local servers and may need the environment's local-listener permission. No application build step is required. `.nojekyll` marks the public site as static files.

## Source continuity and other-chat updates

Nine uploaded documents are preserved unchanged under `/workspace/CurriculumSocial/sources`, outside the website root, with hashes in `/workspace/CurriculumSocial/README.md`. The Shared Circle board and later selected-hero hashes are recorded in [BRAND_REFERENCE.md](BRAND_REFERENCE.md). Historical instructions in uploads remain source evidence and do not override the current request.

The original ChatGPT work was **Build Educational Movement**. The cross-chat reader now reports it is unavailable without the Codex app MCP server; that server is not exposed here. Direct scheduled-chat synchronization cannot currently run. Native GitHub fetch/push works. GitHub API/PR creation is blocked by this environment, so release uses native Git and live HTTP verification.

Still-unavailable sources: prepared release `32182464535a31b7bdda8afe941af3760e042cf0`, newer Sites source `5e74b516131f96377f20697f2f64c83ea034cbd7`, and separate branding candidate `242995f4de87fa67f4273d88b2e88b83714158e4`. The original scratch directories are absent here. Do not claim these commits have been recovered. Transfer approved updates through a review branch or a Git bundle, then reconcile them with the launched account flow.

A full ChatGPT-to-Codex project-container merge is not supported by the available tools. The app's Windows project is separate from this cloud checkout. The project archive and Git repository preserve the available context and implementation.

## Future Sites work

Private interest capture, private profiles, trusted reviewer membership, narrowly scoped permissions, recoverable saves, real child records, enrollment and payments remain future work. Build and review those increments in the existing Sites project before committing an approved release to the public repository. Preserve Sites sharing configuration; do not infer permission to widen Firestore access from account-release authorization.

The selected later hero and accurate logo/font assets remain visual follow-ups. The current board palette is used, with local typography fallbacks; do not substitute a new generated logo or claim the unrecovered SVG candidate exactly matches the board.
