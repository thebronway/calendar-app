# Calendar-App Roadmap

*Last updated: 2026-07-02*  
*Current Version: v1.0.4*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v1.0.5
- Demo mode flag docker var
  - Add helper text on login screen
      - Admin password
      - User password
  - Always show first time admin modal
  - Maybe I should make access json files read only to prevent mode change and password changing? or should it all be programtic?
- confrim nginx conf

### Release v1.0.6
- Custom themeing
  - **Goal:** Brand your instance by overriding the default Tailwind blue accents across the user interface.
  - **Data Model:** Track a `primaryAccentColor` hex string property inside the global `AppConfig` configuration layer.
  - **Frontend Picker:** Integrate a color picker or Tailwind swatch palette panel cleanly within `SettingsModal.tsx`.
  - **Style Injection:** Inject the selected accent selection dynamically into your CSS root variables or inline styles across action buttons, active element borders, and login screen headers.

### Release v1.0.7
- Automated Backups
  - **Goal:** Protect flat JSON data structures from accidental data loss, corrupted configurations, or destructive Bulk Edits.
  - **Cron Scheduler:** Implement an automated crontab backup engine inside `server.js` using `node-cron` that executes daily at midnight.
  - **Archiving & Retention:** Automatically serialize active `YYYY_data.json`, `config.json`, and `access.json` files into timestamped archive directories under `data/backups/`, enforcing a rolling retention window that deletes files older than 7 days.
  - **Management UI:** Create a dedicated "Data Management" tab in your settings modal listing available local backups with 1-click restoration and a manual download button that packages the data directory as a `.zip` archive.

### Release v1.0.8
- Webhooks
  - **Goal:** Push real-time calendar modification notifications out to third-party home automation platforms (e.g., Discord, Slack, Umami, or custom web endpoints).
  - **Configuration:** Add a `webhooks` array to the core `AppConfig` type mapping unique webhook IDs, payload destination URLs, and a toggleable active state flag.
  - **Diff Engine:** Intercept `POST /api/data/:year` requests to compute a baseline structural difference, checking if a new entry or activity update occurred to avoid notification spam on simple spelling corrections.
  - **Payload Dispatcher:** Asynchronously fire out a standardized JSON POST body payload containing text templates summarizing the modification out to all active webhook endpoints.

### Release v1.0.9
- API Keys & REST API
  - **Goal:** Allow external automation setups (e.g., Home Assistant, n8n, Node-RED) to programmatically log categories or activities onto the calendar without utilizing the frontend UI.
  - **Token Profiles:** Extend the database schema inside `access.json` and the `AccessControlModal.tsx` interface to support generating long-lived, cryptographically secure API tokens distinct from traditional view passwords.
  - **Ingestion Route:** Create a protected REST API endpoint under `POST /api/external/log` requiring authentication passing via standard `Authorization: Bearer <token>` header rules.
  - **Sync Synchronization:** Parse incoming JSON payloads containing mandatory parameters for target date strings (`YYYY-MM-DD`), optional `categoryId` tags, locations, and `activityIds`, merging updates straight to `YYYY_data.json` while instantly triggering frontend UI updates via the server `broadcastUpdate` WebSocket hook.

### Release v1.1.0
- Private Local vs Private SSO vs Private LDAP
- **SSO & LDAP Authentication Infrastructure**
  - **Goal:** Support switching between Local JSON database authentication, centralized LDAP directory lookup, or enterprise OIDC/OAuth2 single sign-on (e.g., Authentik) when Private Mode is active.
  - **Security & Environment Architecture:** Store high-risk parameters, OIDC Client Secrets, LDAP Bind Passwords, and Identity Provider base URLs exclusively within Docker environment variables to protect the self-hosted infrastructure from clear-text configuration leaks.
  - **OIDC Group Mapping Mechanics:** Request `groups` access scopes during the login sequence to parse the returned JWT token payload's group claim array, mapping matching group strings directly to the application's native `admin` or `view` roles.
  - **LDAP Search & Bind Mechanics:** Bind to the directory using credentials to execute an attribute group search (`memberOf` or group `member` mapping) against user records, resolving access tiers dynamically using group strings specified in the UI settings.
  - **Frontend Auto-Redirect:** Automatically forward unauthenticated root (`/`) visitors straight to the backend OIDC authentication handshake loop when SSO is selected as the active provider mode.
  - **The Break-Glass Backdoor:** Restrict automatic OIDC redirection loops exclusively to the root path (`/`), allowing direct browser hits to `/login` to render the native local username and password input screen for emergency fallback during authentication provider failures.

### Release v1.1.1: PTO & Vacation Tracker Dashboard
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

### Release v1.1.2
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.1.3
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- More Screenshots in the User guide
- iCal syncing - how does it deal with activities which only happen in a certain year and not the next year. Should the iCals be confined to a year?

### Release v1.1.4
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.
- Package Updates

### Release v2.0.0
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
- Accessibility Improvements
  -Add ARIA labels to icon-only buttons, trap focus inside modals.