# Next edits (frontend)

This file lists the next, prioritized edits to finish polishing the Home page and related frontend tasks. Each item includes target files, short description, and acceptance criteria.

1) Normalize spacing & container widths (in-progress)
   - Files: `src/index.css`, `src/pages/HomePage.tsx`, `tailwind.config.js`
   - Description: Finalize `content-container` and `.section` utilities, ensure all page sections use them, remove redundant `px-*`/`mx-auto` inconsistencies.
   - Acceptance: Sections align vertically and horizontally; page uses a single max content width and consistent horizontal padding.

2) Fix lint/type errors (blocking quality checks)
   - Files: see ESLint output (examples): `src/App.tsx`, `src/api/analysis.ts`, `src/components/ErrorBoundary.tsx`, `src/pages/AnalyzePage.tsx`, `src/types/index.ts`
   - Description: Address `@typescript-eslint` errors (replace `any` with `unknown`/specific types, remove unused variables, and adjust empty object {} types). Fix warnings where practical.
   - Acceptance: `npm run -s typecheck` and `npx eslint src --ext .ts,.tsx` return no errors (or only acceptable warnings).

3) Optimize CTA hierarchy & microcopy
   - Files: `src/components/ui/Button.tsx`, `src/pages/HomePage.tsx`
   - Description: Ensure primary button uses `bg-primary` with high contrast and accessible focus; review copy ("Analyze" vs "Start Analysis"). Add `aria-pressed`/labels if needed.
   - Acceptance: Primary CTA visually dominant and passes color-contrast check for text/background.

4) Mobile/responsive polish
   - Files: `src/pages/HomePage.tsx`, any shared UI components
   - Description: Validate breakpoints (320px - 1440px): stack hero content, increase tap targets (buttons & textarea), reduce large vertical spacings on small screens.
   - Acceptance: Home page usable on 320px width; CTAs and textarea easily tappable; no horizontal scroll.

5) Accessibility pass
   - Files: `src/pages/HomePage.tsx`, `src/components/ui/*`, global
   - Description: Add ARIA labels where needed, ensure logical heading order, ensure focus outlines visible and keyboard navigable; run Lighthouse/aXe and resolve critical issues.
   - Acceptance: No critical accessibility violations from Lighthouse or aXe.

6) Feature cards – final polish (done → verify)
   - Files: `src/pages/HomePage.tsx`
   - Description: Confirm equal-height cards, readable spacing, and icon alignment.
   - Acceptance: Visual inspection across breakpoints; cards remain balanced.

7) Performance & asset optimization
   - Files: images/SVGs, build config
   - Description: Lazy-load non-critical assets, optimize SVGs, remove unused CSS utilities if present.
   - Acceptance: Reduced LCP risk; images sized and/or lazy-loaded.

8) Cross-browser QA & final polish
   - Files: UI/CSS
   - Description: Test in Chrome/Firefox/Safari on macOS/Linux/Windows where possible; fix font/render differences and minor spacing/shadow issues.
   - Acceptance: Visual parity and no layout breaks.

9) Visual regression tests (optional)
   - Files: test harness (Jest + Puppeteer/Playwright or Storybook snapshots)
   - Description: Add 1 snapshot test for hero and 1 for features to prevent regressions.
   - Acceptance: Snapshots added and pass in CI.

---

How to run quick checks (optional)

```bash
# typecheck
npm run -s typecheck

# ESLint
npx eslint src --ext .ts,.tsx

# local dev server
npm run dev
```

Notes
- Tailwind directives and @apply will show in-editor linter warnings; they are applied during PostCSS/Tailwind build. Do fixes in source files and validate via `npm run dev` or `vite build`.
- If you want, I can take the next highest priority item (fix lint/type errors) and apply small, safe fixes in the repo. Say which item to start or reply "start: <id>".
