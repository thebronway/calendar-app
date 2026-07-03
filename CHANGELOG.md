# Calendar-App Changelog

*Last updated: 2026-07-02*  
*Current Version: v1.0.5*

## Overview
This document tracks past changes starting with v0.7.1.

## Changelog

### Release v1.0.5
- Added Demo Mode with 15-minute data resets
- Implemented seed snapshots to save demo state

### Release v1.0.4
- Split Privacy and Analytics settings into separate components
- Added URL validation regex for self-hosted Umami tracking
- Added dynamic first-time launch welcome modal for admins
- Fixed login screen transition timing bug
- Updated .dockerignore to fix markdown build exclusions
- Documentation updates (README Key Features and User Guide)
- Updated Help Modal

### Release v1.0.3
- Login page title, icon updates and autofocus updates
- Standardized desktop layout width and styling across admin modals
- Added options to hide stats to non-admin users
- Added session timeout configuration options
- Added Umami and Google Analytics options

### Release v1.0.2
- Upgraded authentication to standard Username and Password login
- Implemented secure JWT_SECRET environment configuration with persistent fallback
- Reduced API JSON parsing limit to 2MB to prevent DoS vulnerabilities
- Documentation updates (README and User Guide)

### Release v1.0.1
- server.js monolithic breakup
- SettingsModal.tsx monolithic breakup
- KeyConfigModal.tsx monolithic breakup
- AccessControlModal.tsx monolithic breakup

### Release v1.0.0
- Added public and private modes
- Added access control modal for admin users
- Implemented view-only password management with unique name/password validation and optional expirations
- Added custom login message configuration for the login screen
- Added login activity logging

### Release v0.9.9
- Moved admin navigation to bottom bar
- Hid admin navigation during Bulk Edit and on User Guide
- Added Cancel button to Bulk Edit bar
- Made Save and Cancel buttons sticky in Feed Editor
- Implemented global confirm modal context to replace native browser prompts
- Added hook to prevent browser tab closure with unsaved changes
- Added Clear Day button to Cell Editor
- Adjusted mobile and desktop button layouts in Cell Editor footer

### Release v0.9.8
- Added drag-and-drop reordering for Locations, Cell Editor Activities, and Key Config items
- Added day of the week display to the Cell Editor header
- Added inline activity editor Save/Cancel buttons
- Bugfix: Location input saves when clicking away
- Bugfix: PFixed "unsaved changes" warnings when opening days with empty notes

### Release v0.9.7
- Added advanced global keyboard shortcuts for navigation and admin actions
- Added Help Modal to UI and app header
- Added open-source and AI Acknowledgments section to the User Guide
- Bugfix: Corrected Unraid Docker health check failures (IPv6 fallback)
- Bugfix: Fixed scroll position resets and User Guide markdown links

### Release v0.9.6
- Layout preference settings (Auto-scroll, collapse panels)
- Session & security migration to stateless JWTs
- Secure HttpOnly cookie implementation

### Release v0.9.5
- CellEditor monolithic breakup
- CellEditor UI Updates
- App header UI Updates
- Screenshot Updates
- User Guide Updates

### Release v0.9.4
- CellEditor Updates on Desktop

### Release v0.9.3
- iCal subscription system updates
- After container reboot bugfix
- Location UI updates

### Release v0.9.2
- iCal subscription system updates

### Release v0.9.1
- Added iCal calendar subscription system
    - Implemented 2-step trigger and payload query builder
    - Added AND/OR filter logic rules
    - Integrated icons into the feed manager UI
    - Updated User_guide

### Release v0.9.0
- App.tsx monolithic breakup

### Release v0.8.9
- Added user guide in code and in app
- Header UI cleanup
- Footer UI cleanup
- Desktop Year View cleanup
- Minor bug fixes

### Release v0.8.8
- Planner View: Added a new 3-column dashboard (/planner) combining a calendar grid with a flowing chronological list of events.
- Month View: Redesigned the single-month layout to match the Planner View, dropping the side legend in favor of a unified full-width card.
- List View: Updated the date boxes to display the short day of the week (e.g., 'Mon') instead of redundant month abbreviations.
- Key Filters: Updated selection logic to use 'OR' instead of 'AND' when combining multiple activities/categories, and made categories clickable in the Key.
- Keyboard Navigation: Arrow keys now correctly traverse across year boundaries (e.g., navigating from Dec 2026 to Jan 2027).
- Bugfix: Corrected the active-cell highlight ring getting cut off on expanding rows within the calendar grid.

### Release v0.8.7
- Dynamic URL Filtering: Filter and share specific views instantly using paths and query parameters (e.g., ?a=slug).
- List View: Added a continuous timeline layout (/list) aggregating filtered events chronologically by month.
- Month View: View a single month alongside a dynamic side-legend showing only the active keys for that month.
- Inline Editor Auto-Save: Custom display names now auto-save on blur, removing the redundant green checkmark.

### Release v0.8.6
- Custom Activities: Added the ability to edit an activity's display name for a specific day (does not affect global filters or counts).
- Desktop UI: Combined the 'Category' and 'Activities' tabs into a single view in the editor.
- Bugfix: Fixed the mobile header layout so the year picker and action icons properly wrap to the next line.
- Bugfix: Improved the visual indicators for when Bulk Edit mode is active on mobile.
- Bugfix: Ensured Bulk Edit mode and active selections are properly cleared when a user logs out.

### Release v0.8.5
- Minor bugfixes

### Release v0.8.4
- Complete Backend Re-Write to Typescript

### v0.8.2: Monolith Breakup
- Component Splitting: Extracted `SettingsModal`, `CellEditor`, `KeyConfigModal`, `AuthModal`, and `IconEditor` into dedicated component files.
- UI Abstraction: Extracted the core calendar grid and rendering logic into a new `MonthView` component.
- Utility Extraction: Relocated heavy static data (icons, categories) and helper functions into a dedicated `utils/` directory.

### v0.8.0: Core User Features
- Bulk editing for date ranges and multiple days
- UI Polish: Updated "Time Traveling" stat card to purple

### v0.7.3: UX Improvements
- Activities search/sort in day editor
- IconEditor search/sort
- Bottom "Add" buttons for categories/activities
- Key page activities search
- Bug fixes (password input, white screens)

### v0.7.2: Medium Priority Improvements
- ESLint + Prettier setup
- Component extraction (Footer, ToggleSwitch)
- Improved error handling
- Structured logging
- JSON response standardization

### v0.7.1: Security and Stability Fixes
- Dependency separation
- .dockerignore improvements
- File locking
- DATA_DIR fix
- Node 20 upgrade
- Version standardization