# Curriculum Social

Read `docs/PROJECT_STATE.md` before changing the product or preparing a release.

- Use the existing checkout. Each cloud task is isolated; create a Git worktree only if the user requests one.
- The 15 October launch uses the accessible, reviewed GitHub homepage/community source at `5b5fdf6` plus the recovered adult-account fix. The user explicitly prioritized going live now. See `docs/RELEASE_SCOPE.md` for what ships and what stays in Sites.
- The newer Sites-only hero/branding assets and prepared commit `3218246` remain unavailable. They are a follow-up, not a blocker to the scoped launch. Do not claim the exact newer Sites release was recovered; reconcile its differences when accessible.
- Future advanced workflows should be built and approved in the existing private Sites project before they are committed to the public Git repository. Record the reviewed source version and approval with each release.
- The current public account path uses Firebase Authentication only. Keep profile, interest, reviewer, and child data out of that path. Do not grant reviewer privileges from client-editable profile fields or email comparisons.
- Do not change Firebase rules or expand data collection as a side effect of authentication work. Keep synthetic examples clearly separate from real records.
- Preserve the family-led direction: shared teaching and suitable homes, optional specialist educators, public venues mainly for outings. Samui is the initial market. Do not claim accreditation or verified outcomes without evidence.
- Prefer local assets, accessible forms, clear loading/error states, and the established Shared Circle palette. Do not introduce a framework or build step without a concrete need.
- Validate account/community changes with `npm ci --prefix review/public-tests`, `npm test --prefix review/public-tests`, and `npm run test:browser --prefix review/public-tests`. Browser tests need Chromium (`CHROMIUM_PATH` can override its location). Account tests mock Firebase and must not be reported as live integration checks.
- Report local changes, commits, pushes, deployment, and live verification separately. Preserve a rollback reference before release. Do not publish raw uploaded project research or private working notes as website assets.
