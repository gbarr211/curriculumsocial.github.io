# Family release validation — 17 October 2026

Release baseline: public main `4f254964503d17ed6fbe68ab230e3ff1366c35b3`;
prepared family candidate `6b03bb2b831e4a83d3f38389f7eaade77a88922f`.
Both remote heads were checked before local work. This record describes local
validation, not a production release or live persistence verification.

The discovery search now includes the visible philosophy and interest labels,
alongside family name, introduction and languages. Searches are case-insensitive
and ignore surrounding whitespace. Area, philosophy and language filters still
apply, and results remain limited to the fetched directory cards.

Windows test loaders now accept LF and CRLF files. The browser checks load the
prepared member flow and its demo authentication gate with synthetic Firebase
modules. A dedicated family browser suite exercises the actual page, service
adapter, UI and image pipeline against local fixture storage. Fixtures do not
enforce security rules and cannot establish production persistence or OAuth.

Verified locally on Windows with Node 24, Edge Chromium and portable Java 21:

- 19 family UI scenarios with mocked accounts.
- 39 existing authentication/loading/community regression groups.
- 42 Firestore emulator security/schema scenarios, including cross-account and
  anonymous denial, exact directory projection, opt-out, deletion and closed
  legacy collections.
- 13 account browser checks and 12 public-release browser checks.
- 8 family browser scenario groups at 390px and 1280px: signup navigation,
  private defaults, save/reload, editing, 320px JPEG compression, card projection,
  interest/philosophy search, keyboard focus, account deletion guard, profile
  alias, opt-out, profile deletion and sign-out clearing.
- Approved hero SHA-256 remains
  `c51a20a3d771aa28048ac27d3f935e699e997004b800208dffb4bcc61b210a6c`.

Commands:

```text
npm ci --prefix review/public-tests
node review/member/family-ui.test.cjs
npm test --prefix review/public-tests
npm run test:browser --prefix review/public-tests
npm ci --prefix review/rules-tests
review/rules-tests/node_modules/.bin/firebase emulators:exec --config review/member/firebase.json --only firestore --project demo-curriculumsocial-rules "node review/rules-tests/family.test.mjs"
```

Set `CHROMIUM_PATH` to the installed Chromium executable. The emulator requires
Java 21 on PATH. Private machine paths, backups and run records are kept outside
this repository.

Still required: inspect and back up deployed rules, obtain direct approval for
the concrete production permission/deployment change and disposable test scope,
activate in a controlled sequence, and verify actual public-domain persistence,
Google/email authentication, access denials, deletion and cleanup. Do not claim
this release is live from the local test results.
