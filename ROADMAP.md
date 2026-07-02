# Calendar-App Roadmap

*Last updated: 2026-07-02*  
*Current Version: v1.0.3*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap
 
### Release v1.0.4
- Split Privacy & Analytics
  - Add url regex for selfhosted umami instaces
- First time lauch modal for admin login (new file(s))
  - Very brief intro to features, how to get started, link to userguide
  - Changelog from most recent version, link to full github changlog
  - Flag should be reset after every version, so admin sees the the popup on first login if its a new version
- Confirm User guide is still up to date (update with tracking and new settings)
- Redo Readme Key features

### Release v1.0.5
- Demo mode flag docker var
  - Add helper text on login screen
      - Admin password
      - User password
  - Always show first time admin modal
  - Maybe I should make access json files read only to prevent mode change and password changing?
- confrim nginx conf

### Release v1.0.6
- Private Local vs Private SSO vs Private LDAP
- **SSO Authentication & Auto-Redirect**
  - **Goal:** Integrate enterprise OIDC/OAuth2 (like Authentik) while maintaining the local password system as a "break-glass" fallback.
  - **Backend OIDC Setup:** Use an OIDC client library (e.g., `openid-client`). Add variables for `OIDC_ISSUER`, client credentials, `ADMIN_GROUP`, `VIEW_GROUP`, and an `AUTO_SSO_REDIRECT` boolean.
  - **SSO Routes & Mapping:** Create `/api/auth/sso/login` and `/api/auth/sso/callback`. The callback must read the user's groups from the identity provider, map them to the local `admin` or `view` role, issue the standard JWT cookie from v0.9.4, and redirect back to `/`.
  - **Frontend Auto-Redirect:** In `App.tsx`, if the user is unauthenticated and `AUTO_SSO_REDIRECT=true`, automatically redirect their browser to the backend SSO login route.
  - **The Break-Glass Backdoor:** Navigating to the root URL (/) must automatically redirect unauthenticated users to the SSO login flow. Navigating directly to /login must bypass this automatic redirect and render the standard local password screen alongside an SSO login button.

### Release v1.0.7: PTO & Vacation Tracker Dashboard
- **Data Modeling & Storage Mechanics**
  - Introduce a new backend data store file `data/pto_config.json` managed exclusively by the admin credential tier to store the global bank definitions.
  - Define each PTO Bank entry structure with fields: `id` (UUID string), `name` (string, e.g., "Vacation"), `startingBalance` (number in hours), `accrualRate` (number in hours), `accrualFrequency` (enum: `'none'`, `'weekly'`, `'biweekly'`, `'monthly'`, `'annually'`), and `startDate` (ISO string date template).
  - Extend the core calendar `DayData` type definition in `src/types/index.ts` to include an optional schema layer: `pto?: { bankId: string; hours: number; }[]` to allow tracking multiple types of off-time allocations within a single day cell.
- **Backend API Layer Hardening**
  - Implement a new protected route `GET /api/pto/config` returning the contents of `data/pto_config.json` (requires valid admin JWT cookie).
  - Implement a new protected route `POST /api/pto/config` to overwrite and update global accrual rules with automated input sanitization and payload structural verification.
  - Modify the existing payload validation logic inside `POST /api/data/:year` within `server.js` to whitelist and parse the new optional day-level `pto` array parameter without triggering schema integrity rejections.
- **Dynamic Accrual Engine Core Math**
  - Implement a stateless client-side computation module (`src/utils/ptoMath.ts`) to resolve real-time account balances dynamically rather than writing database cron-jobs or mutating active counters.
  - Compute total earned hours per bank as: `startingBalance` + (`accrualRate` × `elapsedIntervals`), where elapsed intervals are determined by calculating time step boundaries between the bank's defined `startDate` and the client's localized current timestamp.
  - Compute remaining balance per bank as: `totalEarnedHours` – `totalUsedHours`, where used hours are solved by aggregating all day-level matching `bankId` logs parsed across the database history dataset.
- **Admin Configuration Interface (UI Elements)**
  - Integrate a new dedicated "Time Off (PTO)" sub-tab panel into the master `SettingsModal.tsx` component.
  - Render an inline data card grid for all active banks, cleanly listing out the profile rules, structural milestones, and configured accrual rates.
  - Implement an absolute inline form layout triggered via an "+ Add Bank" button, presenting text inputs for Bank Title, numeric controls for Starting/Accrual hour buckets, a date picker for the activation milestone, and a dropdown select field for the frequency interval rules.
- **Cell Editor Upgrades & Logging UI (UI Elements)**
  - Inject a new secure, conditionally rendered "Time Off Logs" segment inside the primary desktop and mobile view grids of `CellEditor.tsx`, restricted exclusively behind an `isAdmin` authentication gate check.
  - Provide a single-click button styled as "+ Log Time Off" that expands smoothly to show an entry configuration layout composed of a select dropdown picking from available active banks and an integer counter box defaulting explicitly to `8` hours.
  - Render saved allocations inside the view window as color-coded standalone data badges embedded with individual quick-delete action parameters (e.g., `[🌴 Vacation: 8h (x)]`).
- **Main Dashboard Widgets & Aggregators (UI Elements)**
  - Integrate a modern "Time Off Balances" visualization matrix directly into the primary main page `StatsSection.tsx` block, hidden completely when the application session role evaluates to `'view'`.
  - Design clean horizontal allocation balance progress bars or high-visibility card metrics representing each individual bank pool.
  - Highlight the primary real-time remaining balance integer pool as a dominant text anchor (e.g., `42.5 hrs available`), followed closely by secondary explicit string math descriptions in smaller layout font sizes to maintain clarity (e.g., `80h Earned — 37.5h Used`).

### Release v1.0.8
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.0.9
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- More Screenshots in the User guide
- iCal syncing - how does it deal with activities which only happen in a certain year and not the next year. Should the iCals be confined to a year?

### Release v1.1.0
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.
- Package Updates

### Release v2.0.0
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
- Accessibility Improvements
  -Add ARIA labels to icon-only buttons, trap focus inside modals.