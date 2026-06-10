# Calendar-App Roadmap

*Last updated: 2026-06-09*  
*Current Version: v0.9.6*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v0.9.7: Advanced Access Control & Logging
* **Global Visibility Toggle (`VIEW_MODE`)**
  * Introduce a new configuration setting to switch the calendar between "Public" and "Private" modes.
  * **Public Mode:** Calendar remains read-only to anyone; admins authenticate via the header lock.
  * **Private Mode:** Unauthenticated visitors are blocked by a full-screen login prompt.
* **Hybrid Authentication System**
  * Update `POST /api/auth/login` to support multiple credential tiers.
  * Step 1: Evaluate input against the `ADMIN_PASSWORD` environment variable (issues `role: 'admin'` JWT).
  * Step 2: Evaluate input against a new local `data/access.json` file (issues `role: 'view'` JWT).
  * Step 3: Return `401 Unauthorized` if neither match. (Create Custom 401 Page in app)
* **UI-Managed View Passwords**
  * Add a dedicated "Access Control" tab to the Settings Modal.
  * Build a management table allowing admins to dynamically create, name, and revoke multiple view-only passwords.
  * Add support for optional expiration dates for temporary sharing (e.g., auto-expiring a "Ski Trip" password).
* **Access Logging & Auditing**
  * Create a `data/logs.json` backend storage mechanism to track authentication events.
  * Capture key details on login: exact timestamp, IP address (via Nginx `X-Forwarded-For`), granted role, and the associated account name.
  * Track both successful logins and failed brute-force attempts.
  * Implement automatic log rotation (e.g., cap at the 500 most recent entries) to prevent file bloat.
  * Expose a protected `GET /api/auth/logs` backend route.
  * Display a "Recent Activity" data table at the bottom of the Access Control tab so admins can monitor exactly who is logging in and when.

### Release v0.9.8
- **SSO Authentication & Auto-Redirect**
  - **Goal:** Integrate enterprise OIDC/OAuth2 (like Authentik) while maintaining the local password system as a "break-glass" fallback.
  - **Backend OIDC Setup:** Use an OIDC client library (e.g., `openid-client`). Add variables for `OIDC_ISSUER`, client credentials, `ADMIN_GROUP`, `VIEW_GROUP`, and an `AUTO_SSO_REDIRECT` boolean.
  - **SSO Routes & Mapping:** Create `/api/auth/sso/login` and `/api/auth/sso/callback`. The callback must read the user's groups from the identity provider, map them to the local `admin` or `view` role, issue the standard JWT cookie from v0.9.4, and redirect back to `/`.
  - **Frontend Auto-Redirect:** In `App.tsx`, if the user is unauthenticated and `AUTO_SSO_REDIRECT=true`, automatically redirect their browser to the backend SSO login route.
  - **The Break-Glass Backdoor:** Navigating to the root URL (/) must automatically redirect unauthenticated users to the SSO login flow. Navigating directly to /login must bypass this automatic redirect and render the standard local password screen alongside an SSO login button.

### Release v0.9.9
* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v1.0.0
* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v1.0.1
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**
* First time lauch modal
- Screenshots in the Userguide

### Release v1.0.2:
**Focus:** Establishing a professional-grade foundation for long-term maintenance.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.