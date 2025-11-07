# CSS Variables Guide - Orange Theme Design System

This document explains how to use the CSS variables defined in `src/index.css` to maintain consistency across your React application.

## 🎨 Color Palette

### Primary Orange Colors
```css
/* Main orange color */
background-color: var(--orange-primary);        /* #f05316 */
color: var(--orange-btn-text-color);            /* White text on orange */

/* Hover & Active States */
background-color: var(--orange-primary-hover);   /* Darker orange on hover */
background-color: var(--orange-primary-active); /* Even darker when active */

/* Lighter variations */
background-color: var(--orange-primary-light);   /* #fd8c57 */
background-color: var(--orange-primary-lighter); /* #ffb088 */
```

### Orange Scale (50-900)
```css
/* Use these for gradients, backgrounds, borders */
--orange-50 through --orange-900
/* Example: */
background-color: var(--orange-100); /* Very light orange */
border-color: var(--orange-300);     /* Light orange border */
```

### Neutral Colors
```css
/* Backgrounds */
background-color: var(--bg-primary);    /* White */
background-color: var(--bg-secondary);   /* Very light gray */
background-color: var(--bg-tertiary);   /* Light gray */
background-color: var(--bg-hover);      /* Hover state gray */

/* Text Colors */
color: var(--text-primary);    /* Dark gray for main text */
color: var(--text-secondary);  /* Medium gray for secondary text */
color: var(--text-tertiary);   /* Light gray for muted text */
```

### Status Colors (For Orders, Alerts, etc.)
```css
/* Success (Green) */
background-color: var(--status-success-bg);
color: var(--status-success);

/* Warning (Orange/Yellow) */
background-color: var(--status-warning-bg);
color: var(--status-warning);

/* Error (Red) */
background-color: var(--status-error-bg);
color: var(--status-error);

/* Info (Blue) */
background-color: var(--status-info-bg);
color: var(--status-info);

/* Pending */
background-color: var(--status-pending-bg);
color: var(--status-pending);

/* Cancel/Gray */
background-color: var(--status-cancel-bg);
color: var(--status-cancel);
```

## 📝 Typography

### Font Sizes
```css
font-size: var(--font-size-xs);   /* 11px */
font-size: var(--font-size-sm);   /* 13px */
font-size: var(--font-size-base); /* 14px */
font-size: var(--font-size-md);   /* 16px */
font-size: var(--font-size-lg);   /* 18px */
font-size: var(--font-size-xl);   /* 20px */
font-size: var(--font-size-2xl);  /* 24px */
font-size: var(--font-size-3xl); /* 32px */
```

### Font Weights
```css
font-weight: var(--font-weight-normal);    /* 400 */
font-weight: var(--font-weight-medium);    /* 500 */
font-weight: var(--font-weight-semibold);  /* 550 */
font-weight: var(--font-weight-bold);      /* 600 */
font-weight: var(--font-weight-extrabold); /* 650 */
font-weight: var(--font-weight-black);     /* 700 */
```

### Line Heights
```css
line-height: var(--line-height-tight);    /* 1.2 - For headings */
line-height: var(--line-height-normal);   /* 1.5 - Default */
line-height: var(--line-height-relaxed);  /* 1.8 - For readable text */
```

## 📏 Spacing

### Spacing Scale
```css
padding: var(--spacing-xs);  /* 4px */
padding: var(--spacing-sm);  /* 6px */
padding: var(--spacing-md);  /* 8px */
padding: var(--spacing-lg);  /* 12px */
padding: var(--spacing-xl);  /* 16px */
padding: var(--spacing-2xl); /* 20px */
padding: var(--spacing-3xl); /* 24px */
padding: var(--spacing-4xl); /* 30px */
padding: var(--spacing-5xl); /* 40px */
padding: var(--spacing-6xl); /* 60px */
```

**Example:**
```css
.card {
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}
```

## 🔲 Border Radius

```css
border-radius: var(--radius-sm);   /* 4px */
border-radius: var(--radius-md);    /* 6px */
border-radius: var(--radius-lg);    /* 8px */
border-radius: var(--radius-xl);   /* 10px */
border-radius: var(--radius-2xl);  /* 12px */
border-radius: var(--radius-full); /* 50% - For circles */
```

## 🌫️ Shadows

```css
box-shadow: var(--shadow-sm);    /* Subtle shadow */
box-shadow: var(--shadow-md);     /* Medium shadow */
box-shadow: var(--shadow-lg);      /* Large shadow */
box-shadow: var(--shadow-xl);     /* Extra large shadow */
box-shadow: var(--shadow-orange); /* Orange focus ring */
```

## 🔘 Buttons

### Primary Orange Button
```css
.btn-primary {
  background-color: var(--orange-btn-bg-color);
  color: var(--orange-btn-text-color);
  padding: var(--btn-padding-md);
  border-radius: var(--btn-border-radius);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--orange-btn-hover);
}

.btn-primary:active {
  background-color: var(--orange-btn-active);
}
```

### Button Sizes
```css
padding: var(--btn-padding-sm);  /* Small button */
padding: var(--btn-padding-md);   /* Medium button (default) */
padding: var(--btn-padding-lg);   /* Large button */
padding: var(--btn-padding-xl);   /* Extra large button */
```

### Other Button Styles
```css
/* Secondary Button */
background-color: var(--btn-secondary-bg);
color: var(--btn-secondary-text);

/* Success Button */
background-color: var(--btn-success-bg);
color: var(--btn-success-text);

/* Danger Button */
background-color: var(--btn-danger-bg);
color: var(--btn-danger-text);
```

## 📋 Forms & Inputs

```css
.input {
  padding: var(--input-padding);
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  font-size: var(--input-font-size);
}

.input:focus {
  border-color: var(--input-focus-border);
  box-shadow: var(--input-focus-shadow);
  outline: none;
}
```

## 📊 Tables

```css
.table {
  border-collapse: collapse;
}

.table th {
  background-color: var(--table-header-bg);
  color: var(--table-header-text);
  padding: var(--table-header-padding);
  border: 1px solid var(--table-border-color);
}

.table td {
  padding: var(--table-cell-padding);
  border: 1px solid var(--table-border-color);
}

.table tr:hover {
  background-color: var(--table-row-hover);
}
```

## 🧭 Navigation & Sidebar

```css
.sidebar {
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text);
  width: var(--sidebar-width);
}

.sidebar-item {
  padding: var(--spacing-lg);
}

.sidebar-item:hover {
  background-color: var(--sidebar-item-hover);
}

.sidebar-item.active {
  background-color: var(--sidebar-item-active);
}

.header {
  background-color: var(--header-bg);
  height: var(--header-height);
  color: var(--header-text-color);
}
```

## 🪟 Modals

```css
.modal-overlay {
  background-color: var(--modal-overlay-bg);
}

.modal {
  background-color: var(--modal-bg);
  padding: var(--modal-padding);
  border-radius: var(--modal-border-radius);
  box-shadow: var(--modal-shadow);
}
```

## 📦 Example Component Styles

### Status Badge
```css
.status-badge {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.status-badge.success {
  background-color: var(--status-success-bg);
  color: var(--status-success);
}

.status-badge.error {
  background-color: var(--status-error-bg);
  color: var(--status-error);
}
```

### Card Component
```css
.card {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color-light);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}
```

### Tag/Badge Component
```css
.tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.tag-purple {
  background-color: var(--tag-purple-bg);
  color: var(--tag-purple);
}

.tag-green {
  background-color: var(--tag-green-bg);
  color: var(--tag-green);
}
```

## 🎯 Best Practices

1. **Always use variables** instead of hardcoded values
2. **Use semantic names** - prefer `--text-primary` over `--gray-900`
3. **Combine variables** - e.g., `padding: var(--spacing-lg) var(--spacing-xl)`
4. **Consistent spacing** - Use the spacing scale for all margins and paddings
5. **Status colors** - Always use status color variables for order statuses, alerts, etc.
6. **Orange as primary** - Use orange variables for primary actions and branding

## 🔄 Migration Tips

When updating existing SCSS files:

1. Replace hardcoded orange colors: `#f05316` → `var(--orange-primary)`
2. Replace hardcoded grays: `#d8d8d8` → `var(--border-color-base)`
3. Replace hardcoded spacing: `12px` → `var(--spacing-lg)`
4. Replace hardcoded border-radius: `8px` → `var(--radius-lg)`
5. Replace status colors with semantic variables

## 📚 Quick Reference

| Category | Example Variables |
|----------|-------------------|
| **Colors** | `--orange-primary`, `--text-primary`, `--bg-primary` |
| **Spacing** | `--spacing-xs` through `--spacing-6xl` |
| **Typography** | `--font-size-*`, `--font-weight-*`, `--line-height-*` |
| **Borders** | `--border-color-*`, `--radius-*` |
| **Shadows** | `--shadow-sm` through `--shadow-xl` |
| **Buttons** | `--orange-btn-bg-color`, `--btn-padding-*` |
| **Status** | `--status-success`, `--status-error`, etc. |

