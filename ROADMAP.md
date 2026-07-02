# Calendar-App Roadmap

*Last updated: 2026-07-01*  
*Current Version: v0.9.9*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v1.0.0: Advanced Access Control & Logging
- Global Visibility Toggle (`VIEW_MODE`)
  - Introduce a new configuration setting to switch the calendar between "Public" and "Private" modes.
  - Public Mode: Calendar remains read-only to anyone; admins authenticate via the header lock.
  - Private Mode: Unauthenticated visitors are blocked by a full-screen login prompt.
- Hybrid Authentication System
  - Update `POST /api/auth/login` to support multiple credential tiers.
  - Step 1: Evaluate input against the `ADMIN_PASSWORD` environment variable (issues `role: 'admin'` JWT).
  - Step 2: Evaluate input against a new local `data/access.json` file (issues `role: 'view'` JWT).
  - Step 3: Return `401 Unauthorized` if neither match. (Create Custom 401 Page in app)
- UI-Managed View Passwords
  - Add a dedicated "Access Control" tab to the Settings Modal.
  - Build a management table allowing admins to dynamically create, name, and revoke multiple view-only passwords.
  - Add support for optional expiration dates for temporary sharing (e.g., auto-expiring a "Ski Trip" password).
- Access Logging & Auditing
  - Create a `data/logs.json` backend storage mechanism to track authentication events.
  - Capture key details on login: exact timestamp, IP address (via Nginx `X-Forwarded-For`), granted role, and the associated account name.
  - Track both successful logins and failed brute-force attempts.
  - Implement automatic log rotation (e.g., cap at the 500 most recent entries) to prevent file bloat.
  - Expose a protected `GET /api/auth/logs` backend route.
  - Display a "Recent Activity" data table at the bottom of the Access Control tab so admins can monitor exactly who is logging in and when.

### Release v1.0.1
- **SSO Authentication & Auto-Redirect**
  - **Goal:** Integrate enterprise OIDC/OAuth2 (like Authentik) while maintaining the local password system as a "break-glass" fallback.
  - **Backend OIDC Setup:** Use an OIDC client library (e.g., `openid-client`). Add variables for `OIDC_ISSUER`, client credentials, `ADMIN_GROUP`, `VIEW_GROUP`, and an `AUTO_SSO_REDIRECT` boolean.
  - **SSO Routes & Mapping:** Create `/api/auth/sso/login` and `/api/auth/sso/callback`. The callback must read the user's groups from the identity provider, map them to the local `admin` or `view` role, issue the standard JWT cookie from v0.9.4, and redirect back to `/`.
  - **Frontend Auto-Redirect:** In `App.tsx`, if the user is unauthenticated and `AUTO_SSO_REDIRECT=true`, automatically redirect their browser to the backend SSO login route.
  - **The Break-Glass Backdoor:** Navigating to the root URL (/) must automatically redirect unauthenticated users to the SSO login flow. Navigating directly to /login must bypass this automatic redirect and render the standard local password screen alongside an SSO login button.

### Release v1.0.2: PTO & Vacation Tracker Dashboard
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

### Release v1.0.3
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.0.4
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- First time lauch modal
- More Screenshots in the User guide

### Release v1.0.5
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.

### Release v2.0.0
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
- Accessibility Improvements
  -Add ARIA labels to icon-only buttons, trap focus inside modals.