# Calendar-App Changelog

*Last updated: 2026-06-07* 
*Current Version: v0.9.3*

## Overview
This document tracks past changes starting with v0.7.1.

## Changelog

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