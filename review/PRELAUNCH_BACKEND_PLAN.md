# Pre-launch backend and operations plan

13 October 2026. Implementation proposal responding to the request to advance backend and operating preparation. Not a production permission release.

## Product states

1. Public demo: synthetic data only, no signup needed. Demo service adapter must never write to live collections.
2. Registered pre-launch adult: private own profile, interest preferences and waitlist/pod-formation status. Registration does not expose other families or grant organizer privileges.
3. Invited active pod member: permission-scoped access to the specific pod, sessions and shared learning resources after readiness review. Activate pods independently; do not require a platform-wide big-bang launch.

Never automatically convert synthetic families, children or events into live records. An authenticated but incomplete/denied account gets a recoverable onboarding state, never fabricated data presented as personal records. Provide an explicit Try demo route from all account states.

## Build order

### 1. Adult interest capture and coordinator review

Ship one complete flow before broadening backend features. Capture adult email/contact confirmation, participation roles, broad area, optional child age bands/counts without child identities, languages, availability, hosting/teaching willingness and consent version/time. Separate service contact from optional marketing consent. User-controlled roles express interest, not authority.

Choose authenticated direct writes or a verified server endpoint before coding. Do not open anonymous Firestore collection writes just to avoid a server. Preserve request identity for idempotent retry. Do not expose email-existence checks or allow listing requests. Validate allowed keys, enums, maximum lengths, explicit consent and timestamps at the trusted boundary. Server moderation fields are not client-editable. Display success only after confirmed persistence; failed saves retain inputs. Rate limiting and bot controls depend on the chosen deployment surface and must be verified, not assumed.

Candidate entities: private adult profile; private interest request; coordinator-owned review state; pod proposal. Keep private contact fields separate from any future opt-in directory projection. No production rules changes until integration and permission checks pass.

Acceptance: anonymous/unrelated reads denied; owner access constrained; coordinators authorized through trusted membership/claims; client cannot self-promote; duplicate submits do not duplicate records; network failure and session restoration recover; consent and deletion behavior verified using approved synthetic integration scope.

### 2. Pod formation and membership

Begin with human-reviewed matching by broad area, age bands, language, availability and contributions. No opaque matching score needed. Invites expire, are revocable and bind to the intended adult account. Trusted membership grants access; acceptance never grants extra roles. Revoked membership loses access on the next authorized request. Exact addresses stay out of directories.

Readiness: compatible committed families, suitable home rotation (target 2–3 homes), teaching/preparation coverage, supervision, accountable coordinator, realistic budget, local operating/education requirements and tested access. Family count alone is insufficient.

### 3. Rotation and shared learning planning

Data: pod memberships, session, host reference, teaching/preparation owner, backup, availability, shared plan and activity revision. Parents remain the teaching/hosting foundation; specialist teachers contribute where useful. Keep address/incident information separately restricted. Basic change history and notifications before chat or elaborate collaboration systems.

### 4. Private learning records, optional home activities and assessment

First add adult-created learning goals, session notes and evidence references, with clear distinction between participation and assessed work. Parent-controlled access/export. Young children: optional hands-on home extensions and observations, not mandatory graded homework. Later add age-appropriate assignment, submission, rubric, reviewer and feedback only after real use requires them. No independent child accounts or automated high-stakes grading in the first slice. AI may draft preparation/feedback; responsible adults review it.

### 5. Teacher organization and accounting integrations

Teacher contribution profile, assigned sessions, preparation checklist, resource library and availability follow shared pod scheduling; do not build a separate institution-sized administration system. Defer chat, exam engines, payroll, wallets, split payouts, custom accounting and accreditation claims.

Use an established accounting ledger for invoices, receipts, reconciled actual transactions, refunds and currencies. Platform stores limited external invoice/payment IDs and status later. Decide entity, seller/payment flow, bank, accounting currency and accountant workflow before subscriptions or payment integration. Xero and QuickBooks Online are candidates, not configured integrations.

## Operating workbook specification

One temporary private workbook: Start here; Pod readiness; Rotation; Learning plan; Quotes; Budget. No real child records or contact directory. Rotation uses household/adult references. Quotes distinguish currency, units, quantity, inclusions and expiry. Budget keeps cash costs separate from family teaching/hosting effort; no assumed free founder coordination. Blank inputs are unknown, not zero. Do not share the entire internal workbook with families; publish limited appropriate views when authorized.

Budget calculations: revenue=families*fee; pre-contingency cost=sum(fixed categories)+families*variable cost; cost=pre-contingency cost*(1+reserve); surplus=revenue-cost; required fee=cost/families; break-even count=ceil(fixed*(1+reserve)/(fee-variable*(1+reserve))) only if contribution is positive; cash after setup=cash-setup; runway=cash after setup/monthly loss when loss exists. Single planning currency; no tax or accreditation inference.

## Current boundary and next action

Existing adult-profile rules have prior emulator evidence; production remains default-deny. Runtime is unavailable in this session, so this document is preparation, not tested or deployed backend implementation. First runnable increment after restoration: select and implement the adult recruitment flow, test its persistence and access controls, then publish its working front end. Existing Shared Circle brand implementation remains queued.
