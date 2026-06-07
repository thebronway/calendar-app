# Calendar-App Roadmap

*Last updated: 2026-06-07* 
*Current Version: v0.9.1*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app. It serves as a living guide for development priorities.

## Release Roadmap

### Release v0.9.2
- Location backend updates
- iCal Service Updates

### Release v0.9.3: Access & Identity (Feature Release)
* **Role-Based Permissions**
  * **Goal:** Standardize the UI state so `admin` sees edit buttons and `view` only sees the read-only dashboard.
  * **Flow:** User will set a new docker variable "view" to set the flow of the app:
    * **"none"** (default): anyone can view, admin must login with the lock on the top bar, user must set "admin_password".
    * **"simple"**: When going to the site, there will be just a password field, the user must then set "view_password" and "admin_password".  The admin can still use the lock at the top the access the admin page if they used the view password to enter the site. But they can log in with the admin password from the main login.

### Release v0.9.4
* **"sso:**: User must input details for oauth/authentik in variables and set view and admin groups, when a user tries to view the calendar, it should give the corresponding buttons for authentication. The user must still set "view_password" and "admin_password", as the login page will have the password field & the sso button.  the user must also set a view group and an admin group. Optional docker varibale to auto trigger sso login.

### Release v0.9.5
* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v0.9.6
* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v0.9.7
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**
* First time lauch modal

### Release v0.9.8
**Focus:** Establishing a professional-grade foundation for long-term maintenance.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.

### Release v0.9.9: 

### Release v1.0.0: