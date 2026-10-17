# Family profile release and recovery

The public site is currently at 4f254964503d17ed6fbe68ab230e3ff1366c35b3. Family setup and discovery are implemented but not activated on the live domain. The private Sites v17 source is c80d3eb030f45cdd6eba868ea15c64d3961352b6. Interactive synthetic review: https://curriculumsocial-movement-review.grageray.chatgpt.site/review/family-preview.html . Use sample details there; it does not write to Firebase.

## Activate storage

1. Sign in to Firebase Console for the existing project **cirriculum-social** (exact spelling). Select Firestore Database → Rules.
2. Save a copy of the current rules. The last observed rules deny every document. Do not change Authentication users, billing, existing records or unrelated settings.
3. Review `review/member/firestore.rules`. It permits an authenticated adult to manage only their own `adult_profiles/{uid}`. The optional `family_directory/{uid}` card contains exactly the shareable fields, and signed-in members can read cards. Anonymous users cannot read profiles or cards. All other collections stay denied.
4. Replace the editor contents with that file and Publish. This is a deliberate permission change; do not switch the database to test mode.

## Publish the frontend

1. In GitHub, open **gbarr211/curriculumsocial.github.io** and confirm main is still the baseline above. If main has advanced, reconcile changes first.
2. Upload the files in this package to their matching paths from the repository root. Keep the account/ and js/ and css/ folders intact. Include all of the login/signup/account pages together with the member service, UI and profile alias; uploading only member.html is incomplete.
3. Commit the reviewed files to main. Wait for the GitHub Pages deployment to succeed in Actions.
4. Open https://curriculumsocial.com/login.html?release=family-1 . A signed-in account should enter /member.html. First-time accounts see the family setup. Returning accounts with a saved profile see Find families.

## Verify before declaring complete

Use two temporary synthetic adult accounts, no real child details. Verify save, reload, editing, philosophies, an optional synthetic picture, sharing off by default, sharing on visible to the other account, private fields inaccessible to the other account, anonymous denial, sharing off removing the card, and profile deletion removing the card. Remove temporary test profiles and accounts after verification. Test account creation/cleanup still requires an authorized test scope; none were created by this build.

## Recovery

Revert the frontend release on GitHub if necessary; restore the saved default-deny rules to close profile access. Do not erase stored records as a rollback step. Live profile data has not been created by this build. The package does not include credentials or require a paid service or new Firebase project.
