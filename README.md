# Curriculum Social

Static website for Curriculum Social. The current handoff, source-transfer blocker,
and Sites-to-GitHub approval workflow are recorded in [the project state](docs/PROJECT_STATE.md).

Run locally from this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Account checks:

```sh
npm ci --prefix review/public-tests
npm test --prefix review/public-tests
npm run test:browser --prefix review/public-tests
```

Browser checks use installed Chromium (`CHROMIUM_PATH` overrides the executable)
and mocked Firebase. No live accounts or database records are created by the tests.
