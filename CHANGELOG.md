# LogbookWrapped Changelog

*Last updated: 2026-06-04* 
*Current Version: v0.8.5*

## Overview
This document tracks past changes starting with v0.7.1.

## Changelog

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

### v0.8.2: Monolith Breakup (Backend/Tech-Debt Release)
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