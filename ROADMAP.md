# Calendar-App Roadmap

*Last updated: 2026-02-27*  
*Current Version: v0.7.3*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app. It serves as a living guide for development priorities.

## Release Roadmap

### Release v0.8.0: Core User Features (Feature Release)
**Focus:** High-impact usability features and data peace-of-mind.

* **Bulk Editing**
  * **Goal:** Allow users to select a date range or multiple days to apply categories/activities all at once.
  * **Value:** Massively reduces the friction of logging long vacations or repeating work trips.
* **Backup/Export Feature**
  * **Goal:** Add a simple "Download Data" button to the Settings modal.
  * **Value:** Instant user peace-of-mind. Since data is just JSON, exporting it to the user's local machine is low-effort to build but highly valued by self-hosters.

### Release v0.8.5: Monolith Breakup (Backend/Tech-Debt Release)
**Focus:** Paying off UI technical debt before the codebase becomes unmanageable.

* **Component Splitting**
  * **Goal:** Extract the massive 1,100+ line `App.jsx` into logical, reusable components (`SettingsModal`, `CellEditor`, `CalendarGrid`, `MonthView`).
  * **Value:** Makes the codebase significantly easier to navigate, debug, and safely expand without breaking unrelated features.
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**

### Release v0.9.0: Access & Identity (Feature Release)
**Focus:** Expanding who can see the calendar and how they access it.

* **Enhanced Authentication (View-Only & SSO)**
  * **Goal:** Implement a dual-tier system. Add a standard "View-only" password so owners can share their calendar privately, and integrate OAuth (e.g., Google/GitHub/Authentik) for the Admin login. 
  * **Value:** Fulfills SSO learning goals while making the app easily shareable with friends/family without exposing write access.
* **Role-Based Permissions**
  * **Goal:** Standardize the UI state so `admin` sees edit buttons and `view` only sees the read-only dashboard.
  * **Value:** Clean separation of concerns for the frontend UI.

### Release v0.9.5: Hardening & Speed (Backend/Tech-Debt Release)
**Focus:** Securing the application against public internet threats and optimizing load times.

* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
  * **Value:** Critical for any self-hosted app exposed to the open web to prevent brute-force password attacks.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals.
  * **Value:** Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.0.0: Polish & Go-Anywhere (Feature Release)
**Focus:** Making the app accessible to everyone and usable in any condition.

* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v1.0.5: Enterprise Readiness (Backend/Tech-Debt Release)
**Focus:** Establishing a professional-grade foundation for long-term maintenance.

* **TypeScript Migration**
  * **Goal:** Gradual conversion of `.jsx` and `.js` files to `.tsx` and `.ts`.
  * **Value:** Eliminates runtime type errors and vastly improves IDE autocomplete.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.

## Completed Items

### v0.7.1: Security and Stability Fixes
- Dependency separation
- .dockerignore improvements
- File locking
- DATA_DIR fix
- Node 20 upgrade
- Version standardization

### v0.7.2: Medium Priority Improvements
- ESLint + Prettier setup
- Component extraction (Footer, ToggleSwitch)
- Improved error handling
- Structured logging
- JSON response standardization

### v0.7.3: UX Improvements
- Activities search/sort in day editor
- IconEditor search/sort
- Bottom "Add" buttons for categories/activities
- Key page activities search
- Bug fixes (password input, white screens)

## Development Principles

1. **Move slowly**: Step-by-step changes, no breaking changes
2. **PR process**: Always create PRs, never push directly to main
3. **Test locally**: Verify changes before creating PR
4. **Version tags**: Git tag and Docker tag for each release
5. **Documentation**: Update README, ROADMAP, and code comments

## Contribution Guidelines

1. Check ROADMAP.md for current priorities
2. Create feature branch (`feat/vX.X.X-description`)
3. Implement changes with tests
4. Run lint/build locally
5. Create PR with detailed description
6. Wait for review and approval
7. Merge, tag, and deploy

## Notes
- This is a living document; update as priorities change
- Balance new features with technical debt reduction
- Security and stability always come first
- User experience improvements have high value
