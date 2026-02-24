# Calendar-App Roadmap

*Last updated: 2026-02-24*
*Version: v0.7.3*

## Overview
This document tracks planned improvements, enhancements, and technical debt for the calendar-app. It serves as a living guide for development priorities.

## Current Status
- **Latest version**: v0.7.3
- **Stability**: Production-ready with basic features
- **Code health**: Monolithic App.jsx (needs splitting)
- **Security**: Basic admin password, needs hardening

## Priority Order

### 1. Component Splitting ⭐
**Status**: Partial (Footer, ToggleSwitch, IconEditor extracted)
**Goal**: Extract App.jsx into logical, reusable components
**Benefits**: 
- Maintainability (smaller files, isolated changes)
- Testability (components in isolation)
- Reusability (consistent UI patterns)
- Performance (optimized re-renders, code splitting)
**Scope**: CalendarGrid, DayCell, Header, modals, shared utilities

### 2. Test Suite (Jest + React Testing Library)
**Status**: Not started
**Goal**: Add comprehensive test coverage
**Benefits**:
- Catch regressions before production
- Enable safe refactoring
- Document expected behavior
- Required for production apps
**Scope**: Unit tests (utilities), component tests, integration tests

### 3. Security Hardening & Pen Testing
**Status**: Basic admin password only
**Goal**: Production-ready security
**Benefits**:
- Protect against common attacks
- Compliance with security best practices
- User data protection
**Scope**:
- Rate-limiting (API endpoints)
- Input validation/sanitization
- CSRF protection
- Security audit/penetration testing
- Environment variable best practices

### 4. Enhanced Authentication
**Status**: Single admin password
**Goal**: Flexible authentication system
**Benefits**:
- Granular access control
- Integration with existing auth systems
- Better user experience
**Scope**:
- View-only password (read-only access)
- OAuth integration (Google/GitHub/etc.)
- Role-based permissions (view vs admin)
- Session management

### 5. TypeScript Migration
**Status**: JavaScript only
**Goal**: Gradual conversion to TypeScript
**Benefits**:
- Type safety at compile time
- Better IDE support (autocomplete, refactoring)
- Self-documenting code
- Essential for growing codebase
**Approach**: Start with tsconfig.json, convert one file at a time

### 6. SQLite Database
**Status**: JSON file storage
**Goal**: Replace JSON with SQLite
**Benefits**:
- Performance (faster queries, indexing)
- Reliability (ACID transactions)
- Backup (built-in .dump)
- Scalability (handle larger datasets)
**Implementation**: Keep JSON import/export for migration

### 7. Backup/Export Feature
**Status**: Manual file copying only
**Goal**: Built-in data safety features
**Benefits**:
- User data protection
- Easy migration between instances
- Disaster recovery
**Features**: Export all data as ZIP, import from backup, scheduled auto-backups

### 8. Code/Comment Cleanup
**Status**: Some dead code, inconsistent comments
**Goal**: Clean, well-documented codebase
**Benefits**:
- Easier onboarding for new developers
- Reduced maintenance burden
- Professional code quality
**Scope**: Remove dead code, standardize comments, improve organization

### 9. Accessibility Improvements
**Status**: Basic HTML, needs work
**Goal**: WCAG 2.1 AA compliance
**Benefits**:
- Legal compliance
- Better UX for all users
- Inclusive design
**Fixes**: ARIA labels, keyboard navigation, color contrast, focus management

### 10. Bundle Optimization
**Status**: Single bundle, all icons included
**Goal**: Faster load times
**Benefits**:
- Better user experience (especially mobile)
- Improved SEO (page speed)
- Reduced bandwidth
**Optimizations**: Code splitting, lazy loading, tree-shaking, asset compression

### 11. Offline Support (PWA)
**Status**: Online-only
**Goal**: Progressive Web App capabilities
**Benefits**:
- Works without internet
- Mobile app-like experience
- Background sync
**Features**: Service worker caching, install prompt, IndexedDB for offline data

### 12. Calendar Views (Month/Week/List)
**Status**: Month grid only
**Goal**: Multiple view options
**Benefits**:
- Flexibility for different use cases
- Better overview and planning
- Enhanced usability
**Views**: Keep month grid, add week view (7-day), add list view (chronological)

## Completed Items

### v0.7.1: Security and Stability Fixes
- Dependency separation
- .dockerignore improvements
- File locking
- DATA_DIR fix
- Node 20 upgrade
- Version standardization

### v0.7.2: Medium Priority Improvements
- ESLint + Prettier setup
- Component extraction (Footer, ToggleSwitch)
- Improved error handling
- Structured logging
- JSON response standardization

### v0.7.3: UX Improvements
- Activities search/sort in day editor
- IconEditor search/sort
- Bottom "Add" buttons for categories/activities
- Key page activities search
- Bug fixes (password input, white screens)

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