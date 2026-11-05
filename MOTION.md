# Portfolio motion plan

Visitor: a university reviewer or potential collaborator exploring Torres's real work. Purpose: understand the maker through Werewolf, Fold, Handbooker and an honestly labelled upcoming dorm project.

Visual thesis: oversized blue editorial type, real interface layers, and a recurring identity-to-work-to-story handoff. Preserve the existing paper/ink blue palette and each case palette. Keep paragraphs calm.

| Journey / source | Behavior and parameters | Interruption / alternatives | Proof |
|---|---|---|---|
| Cold entry, SRC-01–02 | TORRES characters converge, then shrink into header; curtain retract overlaps label, three statement lines, actual screens and introduction. Native animations, ~2.8s complete, scale 4.25 desktop / 2.8 narrow; cubic(.2,.75,.2,1). | Escape, scroll, pointer activation, resize, hidden tab and pause finalize. Warm visit ~0.85s; direct case has independent entry. No JS = final visible composition. | Before/mid/after entry samples; warm/direct entry. |
| Navigation, SRC-04–07 | 600ms letter wave / 25ms stagger and 150ms accent dot; fixed header hides after meaningful downward travel, returns on reversal. Stable outer targets. | Focus forces header visible. Fine pointer only for letter displacement; same wave on keyboard focus. | Hover/focus cycles, reverse scrolling, narrow header. |
| Project discovery, SRC-10–13 | 460svh desktop collection with 100svh sticky stage, explicit previous/current/next. Image layers move first (~1.1s), labels/title/descriptor follow at .35/.5/.65s. Native scroll, no wheel interception. | Latest scene wins. Number buttons provide direct access. Narrow view uses normal-flow compositions. Motion off retains discrete selection with no tween. | Forward/reverse/fast traversal, every destination, resize. |
| Case handoff, SRC-14–16 | Native cross-document shared media/title transition ~1.25s, short secondary layer departure; same anchor/case palette. Session origin records source link and scroll. | Ordinary MPA links handle unsupported browsers, modifier clicks, missing origin, direct entry and failure. No synthetic content swap or scroll lock. | Source, transition and destination samples; direct URLs and Back/Forward. |
| Reading, SRC-23–27 | Early title/annotation wipes, grouped evidence reveals, bounded image depth (~18px), no paragraph motion. | Cancel to readable baseline; images retain native enlargement link without JS. | Read all case types, range keyboard and image dialog. |
| Index, SRC-17–18 | One hovered/focused actual-image preview, 500ms crop/scale response and bounded foreground movement. | Keyboard parity, coarse-pointer static layout, native project links. | Focus/activation/leave. |
| Return and contact, SRC-28–30 | Footer uncovers below main; conventional email plus copy with visible and live status; explicit case return restores project, scroll and focus. | One replaceable feedback timer; clipboard failure directs to email. Pause/hidden tab stop decorative work. | Return context, copy success/failure, repeated activation. |

All timings above are proposed adaptations. Reference mechanics and hierarchy are retained; these are not claims of pixel-identical geometry or measured source runtime. The installed skill's 2026-11-04 source study supplies provenance. Real screenshots and original copy remain unchanged.

Lifecycle owner: each native document owns one init/dispose lifecycle. Native navigation disposes the document; pagehide finalizes overlays and frames, pageshow restores BFCache state. All active animations, delayed departures, pointer frames and feedback timers have explicit cancellation. System preference overrides stored manual pause; both preference change directions are handled. Scroll work uses a single queued frame, not a permanent render loop.

QA results and visual evidence are recorded after browser review.
