# Calendar-App Roadmap

*Last updated: 2026-06-04* 
*Current Version: v0.8.6*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app. It serves as a living guide for development priorities.

## Release Roadmap

### Release v0.8.7
 next is a big change so no code yet we're just going to discuss it. I want your opinion and if you think it would be feasible, what is the plan. No code yet.
- Custom Views
  - Add dynamic urls like /<year>/list/<activity1>&<category1> and /<year>/year/<activity1>&<activity2> and /<year>/<month>/<activity1>&<activity2>&<activity3> (or similar format)
  - Be able to dynamically list unlimited activities
  - If no activty is listed, show all activies
  - If no category is listed, show all categories
  - On key configuration page, show the url name under the text box (need to normaize spaces and slashes)
    - For list view:
      - Ex. I want to send this URL to people so they can see all of the types of races. I'm running so that's activity 1 and activity 2. And I want to be like a list.  So it should show the Date, Activity Icon, Activity Name (Display Name if used), and then group by month
    - For year view:
      - Show the entire calendar
      - Show the just the events that are in the filter (dont show other activies not in url in the key)
    - For year view:
      - Show just that month
      - Show the just the events that are in the filter (dont show other activies not in url in the key)

### Release v0.8.8
- Freeze header on desktop, everything above line break
- Add the ability to hide the key on desktop (deafult is showing the key) (leave mobile alone)
- On mobile, when logged in and icons flow to the second row, if only 1 icon is on the second row it looks werid. can we make the rows have an even number of icons IF mobile and IF flows onto second row.

### Release v0.8.9: Access & Identity (Feature Release)
**Focus:** Expanding who can see the calendar and how they access it.

* **Enhanced Authentication (View-Only & SSO)**
  * **Goal:** Implement a dual-tier system. Add a standard "View-only" password so owners can share their calendar privately, and integrate OAuth (e.g., Google/GitHub/Authentik) for the Admin login. 
  * **Value:** Fulfills SSO learning goals while making the app easily shareable with friends/family without exposing write access.
* **Role-Based Permissions**
  * **Goal:** Standardize the UI state so `admin` sees edit buttons and `view` only sees the read-only dashboard.
  * **Value:** Clean separation of concerns for the frontend UI.
  * **Flow:** User will set a docker variable "view" to set the flow of the app:
    * **"none"** (default): anyone can view, admin must login with the lock on the top bar, user must set "admin_password".
    * **"simple"**: When going to the site, there will be just a password field, the user must then set "view_password" and "admin_password".  The admin can still use the lock at the top the access the admin page if they used the view password. But they can log in with the admin password from the main login
    * **"sso:**: User must input details for oauth/authentik in variables and set view and admin groups, when a user tries to view the calendar, it should give the corresponding buttons for authentication. The user must still set "view_password" and "admin_password", as the login page will have the password field & the sso button.  the user must also set a view group and an admin group. 

### Release v0.9.0: iCal Export (Feature Release)
**Focus:** Create optional iCal Service.

### Release v0.9.1: Hardening & Speed (Backend/Tech-Debt Release)
**Focus:** Securing the application against public internet threats and optimizing load times.

* **Security Hardening**
  * **Goal:** Implement API rate-limiting (especially on the login route), input sanitization, and CSRF protection.
  * **Value:** Critical for any self-hosted app exposed to the open web to prevent brute-force password attacks.
* **Bundle Optimization**
  * **Goal:** Optimize the dynamic icon imports (`lucide-react`) to ensure aggressive tree-shaking, and implement lazy loading for modals.
  * **Value:** Faster initial page loads, particularly crucial for mobile users on cellular networks.

### Release v0.9.2: Polish & Go-Anywhere (Feature Release)
**Focus:** Making the app accessible to everyone and usable in any condition.

* **Offline Support (PWA)**
  * **Goal:** Use service workers and Vite's PWA plugin to cache the frontend and allow read/write buffering via `localStorage` when offline.
  * **Value:** Perfect for a travel app—users can view their itinerary or log a flight while in airplane mode or deep in the mountains.
* **Accessibility Improvements**
  * **Goal:** Add ARIA labels to icon-only buttons, trap focus inside modals, and ensure full keyboard navigation.
  * **Value:** Better UX for screen readers and power-users who prefer keyboard shortcuts.

### Release v0.9.3:  Comment Clean-up (Backend/Tech-Debt Release)
* **Code & Comment Cleanup**
  * **Goal:** Standardize comments, remove dead code, and clean up inline styles while splitting components.
  * **Value:** Easier onboarding and reduced maintenance burden.
* **Add AI usage declration**

### Release v0.9.4: Enterprise Readiness (Backend/Tech-Debt Release)
**Focus:** Establishing a professional-grade foundation for long-term maintenance.

* **TypeScript Migration**
  * **Goal:** Gradual conversion of `.jsx` and `.js` files to `.tsx` and `.ts`.
  * **Value:** Eliminates runtime type errors and vastly improves IDE autocomplete.
* **Test Suite**
  * **Goal:** Introduce Jest and React Testing Library for core utilities (date math, JSON parsing) and component rendering.
  * **Value:** Prevents regressions during major refactors.

### Release v0.9.5: 

### Release v0.9.6: 

### Release v0.9.7: 

### Release v0.9.8: 

### Release v0.9.9: 

### Release v1.0.0:


## Development Principles

1. **Move slowly**: Step-by-step changes, no breaking changes
2. **PR process**: Always create PRs, never push directly to main
3. **Test locally**: Verify changes before creating PR
4. **Version tags**: Git tag and Docker tag for each release
5. **Documentation**: Update README, ROADMAP, and code comments

## Contribution Guidelines

1. Check ROADMAP.md for current priorities
2. Create feature branch (`feat/vX.X.X-description`)
3. Implement changes with tests
4. Run lint/build locally
5. Create PR with detailed description
6. Wait for review and approval
7. Merge, tag, and deploy

## Notes
- This is a living document; update as priorities change
- Balance new features with technical debt reduction
- Security and stability always come first
- User experience improvements have high value
