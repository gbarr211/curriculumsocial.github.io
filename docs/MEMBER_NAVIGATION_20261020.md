# Direct member navigation — 20 October 2026

The user reported that Events felt buried between profile/member pages while liking the Events page's existing format. This correction shortens routes to existing approved tools; it adds no new workflow or data collection.

The same visible navigation now connects Your family, Events, Introductions, Contributions and Account settings on all five member pages. It stays reachable while scrolling; phones use two rows without horizontal scrolling or a hidden menu. Events content, imagery, light palette and attendance/privacy behavior are unchanged.

The homepage menu includes Events directly. Its restored-adult entry leads to the family workspace rather than the older `profile.html` copy. That legacy route now replaces itself with `/member.html?view=profile`. Account settings has a clearly labelled editing link to the same canonical view. The account heading and personal name field are distinct from family matching details.

Family tabs preserve their selected view in the URL. Explicit editing links load the saved editing form rather than defaulting to discovery; unrecognized view values cannot redirect elsewhere. The redundant shortcut panel is hidden while editing, and the family overview puts Events first. The sample community and family-invitation walkthrough remain separate demos.

Validation: required clean dependency install and public DOM/browser suites, plus focused navigation, direct-edit/reload, legacy-link, sticky navigation, contrast and target-size checks at 320/390/768/1280px. Adult services are mocked for these browser checks; no production accounts or records are created. Deployment file matching and live navigation checks are recorded separately in the private operations record. No Firebase rules, permissions, billing or automation settings change.

Rollback: `832fe9430b8b30373523cc4f87eb4408b05e9a20`.
