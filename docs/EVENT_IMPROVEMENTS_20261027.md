# Event usability and recovery — 27 October 2026

The user approved publishing the recent nightly improvements on 27 October.
This release combines the existing 24–27 October Event UI candidates.

- Hosting interprets dates as Samui time on devices anywhere, suggests an
  adjustable one-hour end, and gives field-level date/range feedback before save.
- Household requests validate combined counts and gathering capacity locally,
  retain incomplete inputs and preserve the latest unsaved draft during refresh.
- Host approval displays needed/available places, blocks known stale or invalid
  decisions, and preserves the host note through refresh and failed-save recovery.
- Explore, My plans and Hosting distinguish loading, read failure and confirmed
  empty results. Failed reads retain loaded results/cursors; overlapping pages
  do not duplicate cards, and obsolete responses cannot replace a current view.

The existing transactions remain authoritative for identity, consent, capacity
and revisions. Caregivers stay; Events remain independent of Pods. Exact meeting
locations keep their existing host/approved-requester access. Calendar downloads
remain saved copies, and updates remain in-app.

No backend, collection, Firebase rules/indexes, permissions, billing, email,
payment, shared-family/Pods activation or child-record change is included.
Fictional review data remains separate from real member records. The campaign
walkthrough and independent homework prototypes are outside this public payload.

Validation uses the locked public test package: npm ci, npm test and npm run
 test:browser. Tests mock Firebase or use synthetic local services; they are not
production persistence evidence. Current scope covers 43 existing DOM groups,
72 unit/UI tests and 252 browser groups, including phone/desktop layouts,
timezones, stale reads, capacity races, retry data, sign-out and keyboard focus.
Release records separately identify the actual completed test runs, deployed
commit, served bytes and signed-out real-SDK startup checks.

Rollback reference: df458004cce8c9bf2145f1f3fa73b466683909ea.
