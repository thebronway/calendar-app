# Calendar-App Roadmap

*Last updated: 2026-06-07* 
*Current Version: v0.9.3*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v0.9.4
- **Session & Security Migration**
  - **Goal:** Replace the stateful, in-memory token system and `sessionStorage` with stateless JSON Web Tokens (JWT) and secure cookies to ensure sessions survive container reboots and prevent XSS.
  - **Backend Storage:** Install `jsonwebtoken` and `cookie-parser`. Update `POST /api/auth/login` to generate a stateless JWT containing `{ role: 'admin' }`.
  - **Delivery Mechanism:** Issue this JWT to the frontend via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie instead of returning it in the JSON body.
  - **Middleware Update:** Rewrite the `verifyAdminToken` middleware in `server.js` to extract the JWT from the cookie and verify its signature.
  - **Frontend State Sync:** Remove all `sessionStorage` logic in `App.tsx` and `AuthModal.tsx`. Create a new backend endpoint (`GET /api/auth/me`) that the frontend calls on initial load to determine the user's active session state from their cookie.

### Release v0.9.5
* **Role-Based Access**
  - **Goal:** Introduce a shared "view" password for family/friends, managed by a new `VIEW_MODE` environment variable that dictates the UI flow.
  - **Configuration:** Introduce `VIEW_PASSWORD` and `VIEW_MODE` (which defaults to `none`).
  - **Role-Based JWTs:** Update `POST /api/auth/login` to evaluate the input password. If it matches `ADMIN_PASSWORD`, sign the JWT with `role: 'admin'`. If it matches `VIEW_PASSWORD`, sign with `role: 'view'`.
  - **Authorization:** Ensure API routes that modify data (like `POST /api/data/:year`) strictly check that `req.user.role === 'admin'`. Viewers should get a `403 Forbidden`.
  - **Flow (view_mode="none"):** The calendar remains public and read-only to anyone who visits. Admins authenticate via the existing lock icon in the header.
  - **Flow (view_mode="simple"):** The entire calendar is hidden behind a full-screen password prompt upon visiting the site. The user must enter either the view or admin password to see the dashboard. (If they enter the view password, admins can still click the header lock later to upgrade their session).

### Release v0.9.6
- **SSO Authentication & Auto-Redirect**
  - **Goal:** Integrate enterprise OIDC/OAuth2 (like Authentik) while maintaining the local password system as a "break-glass" fallback.
  - **Backend OIDC Setup:** Use an OIDC client library (e.g., `openid-client`). Add variables for `OIDC_ISSUER`, client credentials, `ADMIN_GROUP`, `VIEW_GROUP`, and an `AUTO_SSO_REDIRECT` boolean.
  - **SSO Routes & Mapping:** Create `/api/auth/sso/login` and `/api/auth/sso/callback`. The callback must read the user's groups from the identity provider, map them to the local `admin` or `view` role, issue the standard JWT cookie from v0.9.4, and redirect back to `/`.
  - **Frontend Auto-Redirect:** In `App.tsx`, if the user is unauthenticated and `AUTO_SSO_REDIRECT=true`, automatically redirect their browser to the backend SSO login route.
  - **The Break-Glass Backdoor:** Navigating to the root URL (/) must automatically redirect unauthenticated users to the SSO login flow. Navigating directly to /login must bypass this automatic redirect and render the standard local password screen alongside an SSO login button.

### Release v0.9.7
* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v0.9.8
* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v0.9.9
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**
* First time lauch modal

### Release v1.0.0:
**Focus:** Establishing a professional-grade foundation for long-term maintenance.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.