# Calendar-App Roadmap

*Last updated: 2026-08-08*  
*Current Version: v1.1.9*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v1.2.0: UI, UX and bug fixes
- Getting Unsaved Chnages warning when clicking on key, settings, for the first time
- Even after the container is rebuilt, welcome modal is grabbing previus release notes
- Clear to Reset View (reset should take place of (year/planner/list) slider)
- Border of the year/planner/list reset view button, border - I dont like black line, give me options
- On mobile, view only mode the floating bar takes up the whole page but the planner slider only takes up a third of the page. The floating bar should fit around whatever content is there - maybe make it bigger when it just the slider.
- On mobile, Admin mode when you go to edit a date the floating bar is now in the way the floating bar shouldn’t be there on edit mode
- The x should have a label on mobile

### Release v1.2.1: UX Updates
- Draft mode. For itineraries in progress, admin can set the day to draft and if draft is set, only admin sees content, others just see a day with no content
- When bulk editing multiple days, there should be a clear all data button (with appropite warnings)

### Release v1.2.2: Stats
- Stats page should open up dedicated stats page /stats
- Show cool stats all time, yoy or just for the that year
- Generate end of year snapshots and lifelime snapshots

### Release v1.2.3: iCal updates
- Key Modal Categories and Activites
  - Duplicate Names are allowed (bad for URL ID)
  - Update URL IDs to have cat- or act- in front of ID.
- We may need to not base the feed creation on a year of a key, maybe need to pull in all unique ones
- **Historically Aware Key Parsing:** Load and map key item definitions on a per-year basis during feed generation.
- **Structural Fallback Mapping:** Implement matching rules using raw icon strings and color properties if unique configuration identifiers change across year boundaries.
- **Cross-Year Event Preservation:** Prevent historical events from disappearing when categories or activities are deleted or modified in later year setups.
- **Continuous Rolling Timeline Feeds:** Maintain multi-year calendar subscriptions without requiring manual annual URL renewals.

### Release v1.2.4: 
- Events prep

### Release v1.2.5: Events (WIP)
- Every day can have an event (max 1 per day or maybe 2?)
- Events span multiple days
- If an two days have the same event listed, then it should be one event
- Events should be on the 2 lines right below the number
- Adding "Trips / Events" Functionality. Need opinion on name
- Trips / Events will take 2 lines and the activites will take up 1 line (with a flex of a second line if 3 or 4 activities)
- Line one will be the trip name
- Line two will be a list of location (not in bubbles)
- Line 1 and 2 will be one big bubble that can span multiple cells horizantally
- If goes onto a new week like the bubble wont havea. close blubble, it will have a flat line, and the next line will start with a flat fline and end with a bubble
- The trip/event bubble will be colored the category color, not the whole cell.
- New flat deafult colors plus Custom Color picker addtional option category customization in key 
  - #e67e22, #2980b9, #27ae60, #8e44ad, #e74c3c are my ideas but open to suggestions
  - Ideas for having up to 2 categories on one day? (Like for work in the am / vacation in the pm)

### Release v1.2.6: Move
- Move contents

### Release v1.2.7: 
-

### Release v1.2.8: 
-

### Release v1.2.9: 
-

### Release v1.3.0: Enterprise Single Sign-On (SSO / OIDC)
- **Federated Authentication Handshake:** Integrate standard OpenID Connect protocol options to offload identity verification to modern identity providers (e.g., Authentik, Keycloak).
- **Automated Frontend Handshake Redirection:** Implement automatic visitor forwarding straight to the configured external single sign-on screen upon landing on the root path.
- **Bypass Redirection Backdoor:** Restrict automatic token redirection loops exclusively to the root path (`/`), allowing direct browser navigation to `/login` to bypass the loop for local master emergency access.

### Release v1.3.1: API Keys & REST API
- **Goal:** Allow external automation setups (e.g., Home Assistant, n8n, Node-RED) to programmatically log categories or activities onto the calendar without utilizing the frontend UI.
- **Token Profiles:** Extend the database schema inside `access.json` and the `AccessControlModal.tsx` interface to support generating long-lived, cryptographically secure API tokens distinct from traditional view passwords.
- **Ingestion Route:** Create a protected REST API endpoint under `POST /api/external/log` requiring authentication passing via standard `Authorization: Bearer <token>` header rules.
- **Sync Synchronization:** Parse incoming JSON payloads containing mandatory parameters for target date strings (`YYYY-MM-DD`), optional `categoryId` tags, locations, and `activityIds`, merging updates straight to `YYYY_data.json` while instantly triggering frontend UI updates via the server `broadcastUpdate` WebSocket hook.

### Release v1.3.2: Webhooks
- **Goal:** Push real-time calendar modification notifications out to third-party home automation platforms (e.g., Discord, Slack, Umami, SMTP, or custom web endpoints).
- **Configuration:** Add a `webhooks` array to the core `AppConfig` type mapping unique webhook IDs, payload destination URLs, and a toggleable active state flag.
- **Diff Engine:** Intercept `POST /api/data/:year` requests to compute a baseline structural difference, checking if a new entry or activity update occurred to avoid notification spam on simple spelling corrections.
- **Payload Dispatcher:** Asynchronously fire out a standardized JSON POST body payload containing text templates summarizing the modification out to all active webhook endpoints.

### Release v1.3.3: 
-

### Release v1.3.4: 
-

### Release v1.3.5: PTO & Vacation Tracker Dashboard
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

### Release v1.3.6
- Security Hardening
  - Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
- Bundle Optimization**
  - Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.3.7
- Standardize and cleanup comments, remove dead code, and clean up inline styles while splitting components. 
  - Look for monolithic files.
- Reorgainze files (put in folders if needed)
- clean up files (reorangize)
- look for tech debt
- More Screenshots in the User guide
- Accessibility Improvements
  - Add ARIA labels to icon-only buttons, trap focus inside modals.

### Release v1.3.8
- Establishing test suite of professional-grade foundation for long-term maintenance.
  - Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering which should prevent regressions during major refactors.
- Package Updates - how to maintain

### Release v1.3.9
- Identify additional elements for theming that have hard coded static elements (look at what is already done for custom as a start)
  - once we id what areas need custom theming, we will wire them up one by one. and test. and make sure dark mode/ light mode are affected. Only one thing at a time. We will test it. We'll see how it looks and then we'll validate or revert. One element at a time. Slow and steady here. Micro incremental tests. 

### Release v1.5.0: Multi User Support
- DB?

### Release v2.0.0: PWA
- Offline Support (PWA)
  - Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.