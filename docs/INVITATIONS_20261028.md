# Adult invitations — 28 October 2026

The user requested working platform and family invitations on the live site and selected: invited adult views the shared household profile; the first parent manages it. Future referral rewards remain proposals, with no tracking or spending added.

The existing owner-private Sites candidate is `/review/invitations.html`, source `88bfee48390b4c76907d3c5bee3e27786355fd85`. Its fictional actors reset on reload and cannot send/copy outward invitations. It is separate from the real `/invitations.html` page. The existing advanced family/guardian/Pods backend remains staged.

Platform invitations copy the canonical signup link, invoke device sharing where supported, or compose an email in the sender’s own app. No platform email delivery or contact upload is claimed.

A verified managing adult explicitly enables sharing and creates a personal link for another adult’s sign-in email. Links expire within 48 hours and can be revoked. Only the intended verified recipient may accept. Acceptance consumes the invitation record and atomically adds their own UID, chosen display name and fixed consent version to `family_links/{ownerUid}`. Tokens have 192 bits of randomness and are stored only as a SHA-256 document ID; raw tokens remain in URL fragments and tab memory, with no referrer transmission.

The first parent alone edits the existing `adult_profiles` document. Accepted adults can read it, including household availability and contribution preferences, and see the adult roster. Membership grants no private message, contribution submission, Event meeting location, child record or guardianship rights. Each adult keeps their own account. Owner removal and member departure revoke shared profile reads. Families are limited to six adults and five retained invitation records; old records can be removed to free slots.

Owners close access after removing other adults; the atomic close removes retained invite documents. Profile/account deletion guards require access cleanup first. Account deletions outside the app still require manual operator cleanup. Expired invitation records are not automatically deleted. No billing change, Cloud Functions, mail service, new database or composite index is introduced.

Validation: invitation model/DOM checks; full existing account/community/Event browser suite plus new routing and invitation journeys; combined Firestore emulator checks including identity, expiry, consent, update bypass, consumed-token pairing, read-only access, cleanup and competing acceptance. Emulator and transport mocks do not establish live integration. Live SDK verification and served-byte checks are recorded separately in private operations records before declaring release complete.

Rollback source: `0b898312301f4447251212e3cf89cfd651ff5515`. Original deployed ruleset is preserved in the private operations rollback receipt.
