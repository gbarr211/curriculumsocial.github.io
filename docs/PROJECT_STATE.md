# Curriculum Social — current project state

27 October 2026 approved cumulative Event release: the user requested publication of recent nightly improvements. This candidate includes explicit Samui-time scheduling and range guidance, household-count validation, preservation of unsaved household drafts during refresh, host capacity/revision checks with note recovery, and responsive list loading/retry/pagination recovery. These refine the existing free caregiver-attended Events flow, independent of Pods. Exact-location access, transaction authority, demo/member separation, billing, backend and data permissions remain unchanged. This approved release supersedes the local/unpublished status of the 24–27 October Event UI entries below. Deployment and served-file verification are recorded separately; see `EVENT_IMPROVEMENTS_20261027.md`. Rollback reference: `df458004cce8c9bf2145f1f3fa73b466683909ea`.

27 October 2026 local Event list recovery (unpublished): Explore, My plans and Hosting select immediately, distinguish loading/failure from confirmed empty results, and discard obsolete reads before further plan lookups. Pagination prevents concurrent duplicate reads, merges overlapping records, retains loaded results/cursors on failure, and restores keyboard focus after retry or the last page. Late success/failure and sign-out cannot restore an older list. Earlier unpublished Event form and host-review fixes are preserved. No backend, rules, collection, billing or production changes.

26 October 2026 local host-review improvement (unpublished): approval shows the household’s required places and the loaded availability. Pending/failed refreshes, insufficient capacity, changed requests and closed gatherings prevent submitting a stale decision; host notes survive refresh and retry. The existing transaction remains authoritative. This preserves the earlier unpublished Event scheduling, household-count and draft-refresh fixes; no backend, permissions, collection or billing changes.

26 October 2026 local Event refresh correction (unpublished): manual and live detail refreshes preserve the latest unsaved household input, including edits made while a read is pending. Latest capacity still revalidates the draft; saved revision conflicts, close/sign-out clearing, cancellation and fresh consent after saving remain. This builds on the unpublished 24/25 October host-time and household-count refinements. These local candidates have not been pushed, deployed or live-verified. Public release remains df458004cce8c9bf2145f1f3fa73b466683909ea; no backend, rules, billing or collection changes.

23 October 2026 free Event calendar utility: hosts and approved requesting adults can download a calendar file from an active gathering. Each click rereads the Event and household request, rejects changed sessions/approval, and exports only the title, UTC times, general area and canonical Event link. Exact meeting details, contacts, household counts and rosters stay out of the file. The UI explains that calendar copies do not update automatically; fictional preview exports are disabled. No calendar provider, email service, new backend, data collection, permission or billing change is involved. Local checks and actual deployment/served-file verification are tracked separately.

23 October 2026 account-return correction: sign-in recovery retains the selected gathering or existing Events, Contributions or Introductions destination. Known destinations are prepared before Firebase loads; unrecognized redirects and malformed event IDs are discarded. The sign-in page identifies the intended return destination. Account settings and the legacy account-management page keep their existing behavior. This changes navigation only, with no billing, permissions, data collection or new backend services. Release and served-file verification are recorded separately.

20 October 2026 navigation correction: see `MEMBER_NAVIGATION_20261020.md`. Existing member tools share direct visible navigation, including Events. The older `profile.html` family-page copy redirects to the canonical editing view; account settings stays distinct. This is a navigation-only correction to existing live features, with no new workflow, permissions or data collection.

19 October 2026 approved Events release: see `EVENTS_PILOT_RELEASE_20261019.md`. The reviewed private candidate adds real free caregiver-attended Events with saved household requests and host-only approval, independent of pods. Exact meeting details are separate and restricted to hosts/current approved requesters. Existing family, contribution and introduction flows remain enabled. The historical staged-Events and authentication-only descriptions below are superseded by the newer release documents. Production deployment and disposable-account verification are tracked separately in the private operations record.

18 October 2026 release increment: user authorized publishing the ready family-first work. See `FAMILY_FIRST_RELEASE_20261018.md`. Optional adult account name and clearly labeled reviewed family/Events demos are released alongside the existing real family profile/discovery tools. Shared-family backend, real email invitations, bookings and learner/guardian services remain staged. Previous baseline main/rollback is3e8914bda507141638d8a758f99a4587f4042880; the historical 17 October pending-rules note below is superseded by that earlier completed family release.

Current checkpoint, 17 October 2026: the approved hero and Shared Circle assets
have been recovered and are already live on main `4f254964`. Family profiles and
discovery are prepared on `review/family-matching-20261017` (`6b03bb2`), pending
production rules activation and live verification. Search and Windows/browser
validation improvements are described in [FAMILY_VALIDATION_20261017.md](FAMILY_VALIDATION_20261017.md).
The historical missing-asset and authentication-only descriptions below refer
to the earlier launch; use the newer family release scope for that increment.

Updated 15 October 2026 (Asia/Bangkok).

## Public launch

The user explicitly directed Codex to make the website live now, while keeping advanced builds in Sites for future approval. The release is assembled from the reviewed GitHub homepage/community at `5b5fdf6099116faba768658a02d3c6ff0ffc6848` and the authentication-only account work beginning at `99a6d2a4a9be0629068219e3da15746f2ecad60d`.

The reviewed branch includes the family-led homepage, seven community screens, navigation scroll fixes and guided walkthrough. Accounts use Firebase Authentication only. The public pages distinguish sample community actions from actual adult accounts. Legacy direct routes for unfinished submissions, reviewer tools, venue management, incident reports and portfolios are informational pages without forms or backend scripts.

The exact public/future boundary and source handoff procedure are in [RELEASE_SCOPE.md](RELEASE_SCOPE.md). This supersedes the earlier decision to hold the entire launch for the missing Sites bundle. The selected final Sites hero and unrecovered branding remain a follow-up, and this release does not claim exact parity with that newer source.

Publication state: **live and verified** at https://curriculumsocial.com/. Application commit `7a22a47bea15d903de5fa315a7c54ff37b011a79` was pushed to `main`; 34 live endpoints matched the tested source, and fresh Chromium checks confirmed real Firebase initialization on login/signup. See [deployment evidence](DEPLOYMENT_20261015.md). Original main/rollback reference: `c08e1a367822e6ee930ea8dd0eaa8c13cab189c1`.

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
