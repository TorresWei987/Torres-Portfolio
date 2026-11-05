# Motion verification

Reviewed in the in-app Chromium browser on 2026-11-04/05. The reference study was captured on 2026-11-04. This is an implementation inspired by its mechanics, with Torres's own work, palette and shorter choreography; it is not a pixel-identical copy.

## Exercised in the browser

- 1440×900, 1920×1080, 1366×768 and 390×844 layouts. No horizontal content overflow was found in the inspected views. A separate fresh-tab entrance capture used the browser's 1280×720 default.
- Cold and warm entry; blue curtain retraction, identity contraction and overlapping hero reveals. Scroll, keyboard and pointer activation finalize the entry. Captures include a local entry fixture that resets only the visit flag.
- All four project scenes and all four case destinations. Exactly one enhanced desktop scene is current; other scenes have `inert` and `aria-hidden`. The narrow layout exposes all four scenes in normal document flow.
- Forward and reverse project selection, including nonadjacent selection. Selected metadata agrees with the current project.
- Werewolf and Fold scene-to-case transitions; preserved before/mid/after screenshots show the anchor media and title changing position. Handbooker and the upcoming dorm case also opened successfully.
- Explicit return restores the originating scene and focus. Browser Back and Forward preserve route/project identity; a return after a desktop-to-narrow resize targets the originating project. Index keyboard focus and activation were exercised, including Back after resizing.
- Manual motion off persists across navigation, disables smooth scrolling, and leaves project selection usable; keyboard re-enabling was exercised.
- Werewolf comparison range: ArrowRight changes 50 to 51 and updates the actual divider. Image enlargement, Escape, focus return and scroll-unlock completed.
- Index keyboard selection reveals the appropriate preview; actual Fold preview opacity was sampled during its entrance.
- Contact entry and direct contact URL reach the revealed footer. Copy email produced both visible “Email copied” and polite “Email address copied to clipboard” feedback.
- A stripped-script HTML fixture exposes all four ordinary project links, hides motion/copy/range controls, and preserves full-image links. This tests the authored no-JavaScript baseline, rather than changing the browser's global JavaScript setting.
- A deliberately missing-image fixture retained the main statement and project link without a scroll lock.

## Code-reviewed safeguards

Both operating-system preference change directions; paused departure specificity; pointer resets and hidden-tab work; current-scene authority during rapid scrolling; native modified clicks; unsupported shared-transition fallback; pagehide cancellation of pending departures; BFCache preference refresh and geometry-aware origin restoration; clipboard timeout/failure and stale-request guards; no synthetic document swapping or wheel interception.

## Limits

Physical touch devices, Safari/Firefox, actual operating-system reduced-motion toggling, browser zoom above 100%, deliberately slow or failed full-document navigation, and a forced clipboard-denial branch were not exercised. Still samples establish visual states, not frame rate or input latency. Browser evaluation can precede asynchronous painting; completed state checks use refreshed accessibility snapshots. Forward native shared transitions do not imply a reverse shared-media animation on Back.

## Evidence

The accompanying review files include the native screenshots `werewolf-before.jpg`, `handoff-03.jpg`, `handoff-04.jpg`, `handbooker-still.jpg`, `mobile-home.jpg`, `mobile-return.jpg`, `index-keyboard.jpg`, `contact-success.jpg`, and entry samples. Capture timing JSON records screenshot request/completion bounds, not animation onset or frame durations.

The final build check validates eight pages, 127 local references, English metadata, image dimensions, navigation anchors and the isolated Handbooker demo. Temporary QA routes are excluded from publication. Factual project content was preserved: Werewolf includes retrospective/local explorations; Fold uses actual release screens; Handbooker is the new name; the dorm website remains upcoming.
