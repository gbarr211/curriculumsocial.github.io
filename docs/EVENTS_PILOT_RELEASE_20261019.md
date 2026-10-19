# Independent Events pilot

The user approved activation and live tests of private Sites source `aa0eb708af085e397780912ed45f66819e75b46f` on 19 October 2026, following review at `/review/events-pilot.html`. Rollback: `5f4fca961f0e7b373a1cc615e8b37e5cb339f0a1`.

Events supports free caregiver-attended social or learning gatherings in Samui, independent of pods. Any adult with a confirmed account email may publish. Email confirmation does not verify identity, qualifications or venue suitability. Hosts confirm permission to use their space; caregivers remain responsible for their households.

Signed-in members see coarse listings. Each requesting adult manages one household RSVP. Pending requests reserve no places; approval reserves every visiting adult and child. Updated household counts require new approval. Exact meeting details are separate documents readable only by the host and currently approved requesting adults before the gathering ends. Cancellation removes them. No public guest list, payments, email notifications or child profiles are added.

Descriptions, things to bring and sufficient capacity can be edited. Title, time, area and location stay fixed after publication; changed arrangements require cancellation and a new gathering. Inactive RSVP history stays under the requesting adult's control. Account deletion checks hosted events and saved RSVPs alongside existing profile/contribution/introduction checks. External account deletion needs manual operator cleanup; automatic expiry is not enabled.

The production runtime and the fictional community remain separate. `/activities.html?demo=1` and the existing Events walkthrough remain fictional. The new `/events.html` has real authenticated server saves and no synthetic-data fallback. The private preview remains owner-private.

Validation before activation: 12 model, 73 Events rule, 8 cleanup, 239 existing rule, 9 real-SDK emulator browser, 15 preview browser, 7 entry and 14 candidate-account browser groups. Required public suites and production verification are recorded separately with the release. Mocked account tests are not live integration. The release includes authorization for exactly three disposable adult test accounts and a temporary gathering, with record/account cleanup; billing remains unchanged.

Operational follow-ups: reporting/moderation, retention/expiry, notification channels and duplicate household requests by different adults. These remain proposals, not silently enabled workflows. To roll back, disable Events entry first and retain participant-protecting rules while reviewing any records created after activation.
