# Calendar-App Roadmap

*Last updated: 2026-07-05*  
*Current Version: v1.1.1*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v1.1.2: Theming Updates
- Themeing is hot garbage, and you keep fucking it up. So we are going to take it slowly.
- Best practies we not followed, so address any issues first
- Dark and light mode must remain as is, only being able to change background and accent colors.
- Identify additional elements for theming (look at what is already done for custom as a start)
  - once we id what areas need custom theming, we will wire them up one by one. and test. and maek sure dark mode/ light mode are affected

### Release v1.1.3: Multi-Year iCal Sync Engine
- **Historically Aware Key Parsing:** Load and map key item definitions on a per-year basis during feed generation.
- **Structural Fallback Mapping:** Implement matching rules using raw icon strings and color properties if unique configuration identifiers change across year boundaries.
- **Cross-Year Event Preservation:** Prevent historical events from disappearing when categories or activities are deleted or modified in later year setups.
- **Continuous Rolling Timeline Feeds:** Maintain multi-year calendar subscriptions without requiring manual annual URL renewals.

### Release v1.1.4: Webhooks
- **Goal:** Push real-time calendar modification notifications out to third-party home automation platforms (e.g., Discord, Slack, Umami, SMTP, or custom web endpoints).
- **Configuration:** Add a `webhooks` array to the core `AppConfig` type mapping unique webhook IDs, payload destination URLs, and a toggleable active state flag.
- **Diff Engine:** Intercept `POST /api/data/:year` requests to compute a baseline structural difference, checking if a new entry or activity update occurred to avoid notification spam on simple spelling corrections.
- **Payload Dispatcher:** Asynchronously fire out a standardized JSON POST body payload containing text templates summarizing the modification out to all active webhook endpoints.

### Release v1.1.5: Enterprise Single Sign-On (SSO / OIDC)
- **Federated Authentication Handshake:** Integrate standard OpenID Connect protocol options to offload identity verification to modern identity providers (e.g., Authentik, Keycloak).
- **Automated Frontend Handshake Redirection:** Implement automatic visitor forwarding straight to the configured external single sign-on screen upon landing on the root path.
- **Bypass Redirection Backdoor:** Restrict automatic token redirection loops exclusively to the root path (`/`), allowing direct browser navigation to `/login` to bypass the loop for local master emergency access.

### Release v1.1.6: API Keys & REST API
- **Goal:** Allow external automation setups (e.g., Home Assistant, n8n, Node-RED) to programmatically log categories or activities onto the calendar without utilizing the frontend UI.
- **Token Profiles:** Extend the database schema inside `access.json` and the `AccessControlModal.tsx` interface to support generating long-lived, cryptographically secure API tokens distinct from traditional view passwords.
- **Ingestion Route:** Create a protected REST API endpoint under `POST /api/external/log` requiring authentication passing via standard `Authorization: Bearer <token>` header rules.
- **Sync Synchronization:** Parse incoming JSON payloads containing mandatory parameters for target date strings (`YYYY-MM-DD`), optional `categoryId` tags, locations, and `activityIds`, merging updates straight to `YYYY_data.json` while instantly triggering frontend UI updates via the server `broadcastUpdate` WebSocket hook.

### Release v1.1.7: PTO & Vacation Tracker Dashboard
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

### Release v1.1.8
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.1.9
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- clean up files (reorangize)
- look for tech debt
- More Screenshots in the User guide
- Accessibility Improvements
  - Add ARIA labels to icon-only buttons, trap focus inside modals.

### Release v1.2.0
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.
- Package Updates - how to maintain

### Release v1.5.0: Multi User Support

### Release v2.0.0: PWA
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.