# Torres — Selected Work

An English portfolio inspired by the editorial composition of irinamoi.com. The home, project index, and About page use an ink-blue and warm-paper identity; case studies retain their own palettes.

## Preview

Requires Node.js. No dependency installation is needed.

```text
npm run build
npm run check
npm run preview
```

Open the printed local address. The `dist` folder is the complete deployable website.

## Deploy

The production site is https://tvv-portfolio.netlify.app/. Netlify deploys the `main` branch of `TorresWei987/Torres-Portfolio` using `netlify.toml`. Each deployment builds the pages, runs the existing checks, and publishes `dist`.

## Update

- Project descriptions and profile/contact data: `content.mjs`.
- Page structure and case study narratives: `build.mjs`.
- Still layout and palettes: `dist/styles.css`.
- Reference-led choreography and responsive motion: `dist/motion.css`.
- Motion, comparison, image enlargement, and copy-email behavior: `dist/app.js`.

Run the build after editing content or templates. Existing assets and styles are preserved.

## Motion and interaction

A blue identity curtain gathers TORRES and contracts into the header. A native-scroll desktop stage gives all four projects explicit previous/current/next states, layered media and delayed typography. Narrow screens return to separately composed normal-flow scenes. Navigation has bounded letter feedback and direction-aware visibility. Case reading uses early evidence reveals and small image-depth differences.

Supported browsers use a forward cross-document shared-media/title transition into cases; other browsers retain ordinary page navigation. Explicit return and browser history restore project context and focus, including after viewport changes. The return path does not claim a reverse shared-media morph.

The motion control pauses movement and stores the choice; operating-system reduced motion takes precedence. No-JavaScript controls are hidden, and image enlargement retains ordinary image links. Werewolf includes a keyboard-accessible before/after slider and native image dialogs. The contact surface has an ordinary email link, visible copy status, and a usable clipboard failure path. No analytics or runtime motion library was added. See `MOTION.md` for the choreography contract and `QA.md` for verification and limits.

## Content boundaries

Werewolf screenshots are retrospective source captures with sample data. Its player-card images are local explorations. Fold images come from actual local release materials. Handbooker is the renamed Lion’s Guide project; its isolated demo retains real lookup/citation behavior with question submissions disabled. The dormitory welcome project is upcoming, and its doorway illustration is a visual proposal.

Name and contact information were taken from the existing user-facing portfolio. No usage metrics, testimonials, launch dates, or unverified accomplishments were added.

Original project directories were used read-only. The site has no analytics, backend, accounts, or language switch. The Handbooker demo retains its original public handbook PDF and display-font requests; the main portfolio has no external runtime dependency.

## Source assets

Werewolf: existing project story HTML and its embedded screenshots. Fold: existing English local-release screenshots. Handbooker: a separate copy of its prepared `dist` site. The public handbook text and PDF were preserved. The supplied Bodoni Moda font is distributed under its included SIL Open Font License.
