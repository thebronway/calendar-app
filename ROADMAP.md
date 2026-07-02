# Calendar-App Roadmap

*Last updated: 2026-07-02*  
*Current Version: v1.0.2*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap
 
### Release v1.0.3
- Login Page
  - Login Page title and logo should match site title and logo in settings
- UI updates
  - Make all other admin modals (key, feeds, access, settings) wider on desktop, make them all the same width
  - Key modal UI and background update to keeps in line with all other admin modals
  - Color match key title like other modals
- Settings updates (make sure new sections are in their own files, follow current logic)
  - Set session timeout in Settings
  - Add a setting to make stats admin only (Main year stats, month stats, and counts) - options are no stats, admin only, all users (wordsmith that)
    - if no stats, stats are still kept, just hidden
  - Add Settings for tracking code injection like umami, and google analtyics. How to prevent malicous code input?
- First time lauch modal for admin login
  - What setting to set (very brief intro to features)
  - Changelog from most recent version
  - Flag should be reset after every version
- Confirm User guide is still up to date

### Release v1.0.4
- Demo mode flag docker var
  - Add helper text on login screen
      - Admin password
      - User password
  - Always show first time admin modal
  - Maybe I should make access json files read only to prevent mode change and password changing?

### Release v1.0.5
- Private Local vs Private SSO vs Private LDAP
- **SSO Authentication & Auto-Redirect**
  - **Goal:** Integrate enterprise OIDC/OAuth2 (like Authentik) while maintaining the local password system as a "break-glass" fallback.
  - **Backend OIDC Setup:** Use an OIDC client library (e.g., `openid-client`). Add variables for `OIDC_ISSUER`, client credentials, `ADMIN_GROUP`, `VIEW_GROUP`, and an `AUTO_SSO_REDIRECT` boolean.
  - **SSO Routes & Mapping:** Create `/api/auth/sso/login` and `/api/auth/sso/callback`. The callback must read the user's groups from the identity provider, map them to the local `admin` or `view` role, issue the standard JWT cookie from v0.9.4, and redirect back to `/`.
  - **Frontend Auto-Redirect:** In `App.tsx`, if the user is unauthenticated and `AUTO_SSO_REDIRECT=true`, automatically redirect their browser to the backend SSO login route.
  - **The Break-Glass Backdoor:** Navigating to the root URL (/) must automatically redirect unauthenticated users to the SSO login flow. Navigating directly to /login must bypass this automatic redirect and render the standard local password screen alongside an SSO login button.

### Release v1.0.6: PTO & Vacation Tracker Dashboard
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

### Release v1.0.7
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.0.8
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- More Screenshots in the User guide

### Release v1.0.9
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.

### Release v2.0.0
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
- Accessibility Improvements
  -Add ARIA labels to icon-only buttons, trap focus inside modals.