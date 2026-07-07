# Calendar-App Design & Theming Guide

This document outlines the design system and custom CSS variables used to theme the Calendar-App. 

When developing new features or adding new UI elements, **do not hardcode Tailwind color classes** (e.g., `bg-gray-800`, `text-blue-500`) for structural components. Instead, use the semantic `--theme-*` CSS variables defined in `src/components/ThemeStyleInjector.tsx` and mapped in `tailwind.config.js`.

## Semantic Theme Variables

The application relies on a robust set of CSS variables that map directly to Tailwind utility classes. These variables dynamically update when a user switches between Light, Dark, and Custom modes.

### 1. Base & Panels
* **`bg-theme-base`**: The overarching page background (the canvas).
* **`bg-theme-panel`**: The background for structural cards, modals, and the calendar grid wrapper.
* **`bg-theme-item`**: The background for interactive elements, inputs, and distinct sub-sections.
* **`bg-theme-item-hover`**: The hover state for interactive items.

### 2. Typography
* **`text-theme-text`**: Primary text color for headings and main body content.
* **`text-theme-text-secondary`**: Secondary text color for subtext, placeholders, and descriptions.
* **`text-theme-accent-text`**: Text color designed to sit specifically on top of the primary accent background.

### 3. Accents & Highlights
* **`bg-theme-accent` / `text-theme-accent` / `border-theme-accent`**: The primary brand color. Used for active states, primary buttons, and highlighted icons.
* **`bg-theme-accent-secondary` / `text-theme-accent-secondary`**: The secondary brand color. Used for bulk edit actions and specific stat highlights.

### 4. Calendar Grid Specifics
* **`bg-theme-grid-header`**: Background for the "Days of the Week" row.
* **`bg-theme-grid-cell`**: Background for the standard numbered day cells.
* **`bg-theme-grid-divider`**: The border color separating the grid cells.
* **`bg-theme-grid-empty`**: Background for empty padding cells at the start/end of a month.
* **`text-theme-grid-text-highlighted`**: Text color specifically for the day number when a category color is active on that cell.

## Development Rules

1. **Avoid Hardcoded Colors:** Never use `bg-white`, `dark:bg-gray-900`, `text-gray-800`, etc., for structural layout containers. Use `bg-theme-panel` and `text-theme-text` to ensure the element respects the user's active theme.
2. **Opacity Modifiers:** You can use Tailwind's opacity modifiers with the custom colors (e.g., `bg-theme-accent/20`) for subtle background highlights.
3. **Borders:** Use `border-theme-item` or `border-theme-grid-divider` for subtle separation lines, avoiding hardcoded `border-gray-200`.

## Updating Default Colors
If you need to change the factory default colors for Light or Dark mode, update the fallback hex codes inside `src/components/ThemeStyleInjector.tsx` AND update the `DEFAULT_CONFIG` fallback states in `src/hooks/useConfig.ts` and `src/utils/fileOps.js`.