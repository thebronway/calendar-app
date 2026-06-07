# Calendar-App Roadmap

*Last updated: 2026-06-07* 
*Current Version: v0.9.2*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app.

## Release Roadmap

### Release v0.9.3
- iCal subscription system updates
  - Feed Name Highlight gets cutoff on left side
  - The Event Trigger sounds too technical 
  - Dropdown for Trigger on
    - Sounds too techincal
    - Change From dropdown to the button select like the rest of the page (if user selects activits, show sctivites)
  - Dropdown for Logic Rules
    - Title sounds too technical
    - Change From dropdown to the button select like the rest of the page
  - Why does some buttons highlight blue, and other white and other green, all should be green if highlighted
  - No public feed button if public feed is available, need to add it
- After container reboot, you stay logged in, but if you try to do something it errors out and makes you logout and log back in - fix that
- Location backend updates - keep the backend the same, but when a user types in a location, and clicked enter, it puts it in a pill with a x to remove it. change the flow there, just for the ui. 

### Release v0.9.4
* **Role-Based Permissions**
  * **Goal:** Standardize the UI state so `admin` sees edit buttons and `view` only sees the read-only dashboard.
  * **Flow:** User will set a new docker variable "view" to set the flow of the app:
    * **"none"** (default): anyone can view, admin must login with the lock on the top bar, user must set "admin_password".
    * **"simple"**: When going to the site, there will be just a password field, the user must then set "view_password" and "admin_password".  The admin can still use the lock at the top the access the admin page if they used the view password to enter the site. But they can log in with the admin password from the main login.

### Release v0.9.5
* **"sso:**: User must input details for oauth/authentik in variables and set view and admin groups, when a user tries to view the calendar, it should give the corresponding buttons for authentication. The user must still set "view_password" and "admin_password", as the login page will have the password field & the sso button.  the user must also set a view group and an admin group. Optional docker varibale to auto trigger sso login.

### Release v0.9.6
* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals. For Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v0.9.7
* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v0.9.8
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**
* First time lauch modal

### Release v0.9.9
**Focus:** Establishing a professional-grade foundation for long-term maintenance.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.

### Release v1.0.0: