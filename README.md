# 🎯 Custom Select

A lightweight, accessible TypeScript library for custom single and multi-select dropdowns. Transforms native HTML `<select>` elements into modern, customizable interfaces with support for search, nested options, and full keyboard navigation. Zero dependencies, framework-agnostic.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## ✨ Features

- **🎯 Single & Multi-Select** - Both single-select (radio) and multi-select (checkbox) modes
- **🚀 Zero Dependencies** - Pure TypeScript/JavaScript, no external libraries
- **♿ Fully Accessible** - WCAG 2.1 AA compliant with complete keyboard navigation
- **🌳 Nested Options** - Hierarchical selections with expand/collapse and cascade
- **🎨 Display Modes** - Count, list, tags (with removal), or custom formatters (multi-select)
- **🔍 Smart Search** - Debounced filtering with configurable strategies
- **🎭 Fully Themeable** - 55+ CSS variables for complete visual customization
- **🔄 Progressive Enhancement** - Works with native `<select>` elements
- **⚡ High Performance** - Virtual scrolling for large datasets (multi-select), debounced search
- **📱 Responsive** - Auto-adjusts position on scroll/resize, works on all screen sizes
- **🎯 Custom Icons** - Configurable expand/collapse icons
- **✨ Tag Display** - Individual tag removal in tags mode (multi-select)
- **🔧 TypeScript First** - Full type definitions and IntelliSense support

## 📦 Installation

### Option 1: NPM Package (Recommended)

```bash
npm install @dangnhz/custom-select
```

### Option 2: Direct File Copy

Copy the built files from `dist/` to your project:

**Production (Minified):**
```
dist/multiselect.min.js          # ES Module
dist/multiselect.umd.min.js      # UMD for browsers
dist/styles.min.css              # Styles
```

**With Source Maps (for debugging):**
```
dist/multiselect.min.js.map
dist/multiselect.umd.min.js.map
dist/styles.min.css.map
```

## 🚀 Quick Start

### ES Module (Modern JavaScript/TypeScript)

```typescript
// Multi-select with checkboxes
import { MultiSelect } from '@dangnhz/custom-select';
import '@dangnhz/custom-select/styles.css';

const ms = new MultiSelect('#my-select', {
  searchEnabled: true,
  selectedDisplayMode: 'tags',
  searchDebounce: 300
});

// Listen to changes
document.querySelector('#my-select').addEventListener('change', (e) => {
  console.log('Selected:', e.detail.values);
  console.log('Options:', e.detail.options);
});

// Single-select with radio buttons
import { SingleSelect } from '@dangnhz/custom-select';

const ss = new SingleSelect('#my-single-select', {
  searchEnabled: true,
  showRadioButtons: true,
  closeOnSelect: true
});

document.querySelector('#my-single-select').addEventListener('change', (e) => {
  console.log('Selected:', e.detail.value);
  console.log('Option:', e.detail.option);
});
```

### Browser (UMD - No Build Tool)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Include minified CSS -->
  <link rel="stylesheet" href="path/to/multiselect/styles.min.css">
</head>
<body>
  <!-- Your select element -->
  <select id="my-select" multiple>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>

  <!-- Include minified JS -->
  <script src="path/to/multiselect/multiselect.umd.min.js"></script>

  <script>
    // Access via global MultiSelect object
    const ms = new MultiSelect.MultiSelect('#my-select', {
      searchEnabled: true,
      selectedDisplayMode: 'tags'
    });
  </script>
</body>
</html>
```

## 📖 Usage

### SingleSelect Examples

#### Basic Single Select

```html
<select id="country">
  <option value="">Choose a country...</option>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</select>

<script>
  new SingleSelect('#country', {
    searchEnabled: true,
    closeOnSelect: true,  // Auto-close after selection
    placeholder: 'Choose a country...'
  });
</script>
```

#### With Radio Buttons

```html
<select id="language">
  <option value="">Choose a language...</option>
  <option value="js">JavaScript</option>
  <option value="py">Python</option>
  <option value="go">Go</option>
</select>

<script>
  new SingleSelect('#language', {
    showRadioButtons: true,  // Show radio button UI
    searchEnabled: true,
    closeOnSelect: true,
    allowDeselect: true      // Allow clicking selected item to deselect
  });
</script>
```

#### Nested Single Select

```html
<select id="technology">
  <option value="">Choose a technology...</option>
  <optgroup label="Frontend">
    <option value="react">React</option>
    <option value="vue">Vue</option>
  </optgroup>
  <optgroup label="Backend">
    <option value="node">Node.js</option>
    <option value="django">Django</option>
  </optgroup>
</select>

<script>
  new SingleSelect('#technology', {
    nestedOptions: true,
    showRadioButtons: true,
    defaultExpanded: true,
    searchEnabled: true
  });
</script>
```

### MultiSelect Examples

#### Basic Multi-Select

```html
<select id="countries" multiple>
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="ca">Canada</option>
</select>

<script>
  new MultiSelect('#countries', {
    placeholder: 'Select countries...',
    searchEnabled: true,
    searchDebounce: 300  // Debounce search for performance
  });
</script>
```

#### Nested Multi-Select (Hierarchical)

```html
<select id="files" multiple>
  <optgroup label="Documents">
    <option value="doc1">Report.pdf</option>
    <option value="doc2">Notes.docx</option>
  </optgroup>
  <optgroup label="Images">
    <option value="img1">Photo.jpg</option>
  </optgroup>
</select>

<script>
  new MultiSelect('#files', {
    nestedOptions: true,
    cascadeSelection: true,    // Select parent selects all children
    showParentCheckbox: true,  // Show checkbox on parent groups
    defaultExpanded: true,
    expandIconCollapsed: '➕', // Custom icons
    expandIconExpanded: '➖'
  });
</script>
```

### Display Modes

```javascript
// Count mode (default) - "3 selected"
new MultiSelect('#select1', {
  selectedDisplayMode: 'count',
  selectedTextSingular: '{count} item selected',
  selectedTextPlural: '{count} items selected'
});

// Tags mode with removable pills
new MultiSelect('#select2', {
  selectedDisplayMode: 'tags',
  maxTags: 5  // Show max 5 tags, then "+X more"
});

// List mode with truncation
new MultiSelect('#select3', {
  selectedDisplayMode: 'list',
  maxSelectedDisplay: 3  // Show max 3 items, then "+X more"
});

// Custom formatter function
new MultiSelect('#select4', {
  selectedDisplayMode: 'custom',
  selectedFormat: (options) => {
    return options.length ?
      `${options.map(o => o.text).join(', ')}` :
      'None selected';
  }
});
```

### Initialize Multiple Instances

```javascript
// Initialize all selects with class "multi"
const instances = MultiSelect.init('.multi', {
  searchEnabled: true,
  selectedDisplayMode: 'tags'
});

console.log(`Initialized ${instances.length} instances`);
```

## ⚙️ Configuration Options

Complete list of all 31 configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Basic Options** |
| `placeholder` | `string` | `'Select options...'` | Placeholder text when nothing selected |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder text |
| `searchEnabled` | `boolean` | `true` | Enable/disable search functionality |
| `searchDebounce` | `number` | `300` | Search debounce delay in milliseconds |
| **Footer Options** |
| `showClearAll` | `boolean` | `true` | Show "Clear All" button in footer |
| `showClose` | `boolean` | `true` | Show "Close" button in footer |
| `clearAllText` | `string` | `'Clear All'` | Text for clear all button |
| `closeText` | `string` | `'Close'` | Text for close button |
| **Display Options** |
| `selectedDisplayMode` | `'count' \| 'list' \| 'tags' \| 'custom'` | `'count'` | How to display selections in trigger |
| `maxSelectedDisplay` | `number` | `3` | Max items in list mode before "+X more" |
| `maxTags` | `number` | `5` | Max tags in tags mode before "+X more" |
| `selectedFormat` | `(options: OptionData[]) => string \| null` | `null` | Custom formatter for selected display |
| `selectedTextSingular` | `string` | `'{count} selected'` | Template for single selection (use `{count}`) |
| `selectedTextPlural` | `string` | `'{count} selected'` | Template for multiple selections (use `{count}`) |
| **Dropdown Options** |
| `maxHeight` | `number` | `300` | Maximum dropdown height in pixels |
| `position` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Dropdown position preference |
| `closeOnOutsideClick` | `boolean` | `true` | Close dropdown when clicking outside |
| `returnFocusOnClose` | `boolean` | `false` | Return focus to trigger button when dropdown closes |
| **Search Options** |
| `searchStrategy` | `'contains' \| 'startsWith' \| 'exact'` | `'contains'` | Search matching strategy |
| `clearSearchOnClose` | `boolean` | `true` | Clear search input when dropdown closes |
| `searchAutoFocus` | `boolean` | `true` | Auto-focus search input when dropdown opens |
| **Performance Options** |
| `virtualScroll` | `boolean` | `false` | Enable virtual scrolling (for >500 options) |
| `animation` | `boolean` | `true` | Enable/disable animations |
| **Nested Options** |
| `nestedOptions` | `boolean` | `false` | Enable nested/hierarchical options support |
| `cascadeSelection` | `boolean` | `false` | Cascade selection from parent to children |
| `showParentCheckbox` | `boolean` | `false` | Show checkboxes for parent groups |
| `expandOnSearch` | `boolean` | `true` | Auto-expand groups when children match search |
| `defaultExpanded` | `boolean` | `false` | Default expanded state for all groups |
| `indentSize` | `number` | `20` | Indentation size in pixels for nested levels |
| `expandIconCollapsed` | `string` | `'▶'` | Icon for collapsed/closed groups |
| `expandIconExpanded` | `string` | `'▼'` | Icon for expanded/open groups |

[See TypeScript interfaces for complete type definitions](#-typescript-support)

## 🎯 Public API

### MultiSelect API

#### Properties

```typescript
ms.selectElement  // HTMLSelectElement - Original select element (readonly)
ms.config         // MultiSelectConfig - Configuration object (readonly)
ms.isOpen         // boolean - Whether dropdown is currently open (readonly)
```

#### Selection Methods

```typescript
// Get currently selected values
const values = ms.getValue();  // Returns: string[]

// Set selected values programmatically
ms.setValue(['value1', 'value2']);

// Select all options
ms.selectAll();

// Clear all selections
ms.clearAll();
```

#### Dropdown Control

```typescript
// Open dropdown
ms.open();

// Close dropdown
ms.close();

// Toggle dropdown open/close
ms.toggle();
```

#### Nested Options Control

```typescript
// Expand all parent groups
ms.expandAll();

// Collapse all parent groups
ms.collapseAll();

// Expand specific group by value
ms.expandGroup('groupValue');

// Collapse specific group by value
ms.collapseGroup('groupValue');
```

#### Lifecycle Methods

```typescript
// Re-sync with native select element (if options changed)
ms.refresh();

// Enable the component
ms.enable();

// Disable the component
ms.disable();

// Destroy instance and restore original select
ms.destroy();
```

#### Static Methods

```typescript
// Initialize multiple instances at once
const instances = MultiSelect.init('.my-selects', {
  searchEnabled: true
});
// Returns: MultiSelect[] - Array of initialized instances
```

### SingleSelect API

#### Properties

```typescript
ss.selectElement  // HTMLSelectElement - Original select element (readonly)
ss.config         // SingleSelectConfig - Configuration object (readonly)
ss.isOpen         // boolean - Whether dropdown is currently open (readonly)
```

#### Selection Methods

```typescript
// Get currently selected value
const value = ss.getValue();  // Returns: string | null

// Set selected value programmatically
ss.setValue('value1');

// Clear selection
ss.clear();
```

#### Dropdown Control

```typescript
// Open dropdown
ss.open();

// Close dropdown
ss.close();

// Toggle dropdown open/close
ss.toggle();
```

#### Nested Options Control

```typescript
// Expand all parent groups
ss.expandAll();

// Collapse all parent groups
ss.collapseAll();

// Expand specific group by value
ss.expandGroup('groupValue');

// Collapse specific group by value
ss.collapseGroup('groupValue');
```

#### Lifecycle Methods

```typescript
// Re-sync with native select element (if options changed)
ss.refresh();

// Enable the component
ss.enable();

// Disable the component
ss.disable();

// Destroy instance and restore original select
ss.destroy();
```

#### Static Methods

```typescript
// Initialize multiple instances at once
const instances = SingleSelect.init('.my-selects', {
  searchEnabled: true
});
// Returns: SingleSelect[] - Array of initialized instances
```

### Events

All events are dispatched as `CustomEvent` on the original `<select>` element:

#### MultiSelect Events

##### `change`
Fired when selection changes.

```typescript
selectElement.addEventListener('change', (e: CustomEvent) => {
  console.log('Values:', e.detail.values);        // string[]
  console.log('Options:', e.detail.options);      // OptionData[]
  console.log('Instance:', e.detail.instance);    // MultiSelect
});
```

##### `multiselect:open`
Fired when dropdown opens.

```typescript
selectElement.addEventListener('multiselect:open', (e: CustomEvent) => {
  console.log('Dropdown opened');
  console.log('Current values:', e.detail.values);
});
```

##### `multiselect:close`
Fired when dropdown closes.

```typescript
selectElement.addEventListener('multiselect:close', (e: CustomEvent) => {
  console.log('Dropdown closed');
});
```

##### `multiselect:search`
Fired when search query changes.

```typescript
selectElement.addEventListener('multiselect:search', (e: CustomEvent) => {
  console.log('Search query:', e.detail.query);           // string
  console.log('Results count:', e.detail.resultsCount);   // number
});
```

##### `multiselect:clear`
Fired when "Clear All" button is clicked.

```typescript
selectElement.addEventListener('multiselect:clear', (e: CustomEvent) => {
  console.log('Previous values:', e.detail.previousValues);  // string[]
  console.log('New values:', e.detail.values);               // [] (empty)
});
```

##### `multiselect:expand`
Fired when a parent group is expanded.

```typescript
selectElement.addEventListener('multiselect:expand', (e: CustomEvent) => {
  console.log('Expanded group:', e.detail.group);  // string (group value)
});
```

##### `multiselect:collapse`
Fired when a parent group is collapsed.

```typescript
selectElement.addEventListener('multiselect:collapse', (e: CustomEvent) => {
  console.log('Collapsed group:', e.detail.group);  // string (group value)
});
```

#### SingleSelect Events

##### `change`
Fired when selection changes.

```typescript
selectElement.addEventListener('change', (e: CustomEvent) => {
  console.log('Value:', e.detail.value);          // string | null
  console.log('Option:', e.detail.option);        // OptionData | null
  console.log('Instance:', e.detail.instance);    // SingleSelect
});
```

##### `singleselect:open`
Fired when dropdown opens.

```typescript
selectElement.addEventListener('singleselect:open', (e: CustomEvent) => {
  console.log('Dropdown opened');
  console.log('Current value:', e.detail.value);
});
```

##### `singleselect:close`
Fired when dropdown closes.

```typescript
selectElement.addEventListener('singleselect:close', (e: CustomEvent) => {
  console.log('Dropdown closed');
});
```

##### `singleselect:search`
Fired when search query changes.

```typescript
selectElement.addEventListener('singleselect:search', (e: CustomEvent) => {
  console.log('Search query:', e.detail.query);           // string
  console.log('Results count:', e.detail.resultsCount);   // number
});
```

##### `singleselect:clear`
Fired when "Clear" button is clicked.

```typescript
selectElement.addEventListener('singleselect:clear', (e: CustomEvent) => {
  console.log('Previous value:', e.detail.previousValue);  // string | null
  console.log('New value:', e.detail.value);               // null
});
```

##### `singleselect:expand`
Fired when a parent group is expanded.

```typescript
selectElement.addEventListener('singleselect:expand', (e: CustomEvent) => {
  console.log('Expanded group:', e.detail.group);  // string (group value)
});
```

##### `singleselect:collapse`
Fired when a parent group is collapsed.

```typescript
selectElement.addEventListener('singleselect:collapse', (e: CustomEvent) => {
  console.log('Collapsed group:', e.detail.group);  // string (group value)
});
```

## 🎨 Theming

Customize the appearance using 55 CSS custom properties (variables):

```css
:root {
  /* Trigger Button (10 variables) */
  --ms-trigger-bg: #ffffff;
  --ms-trigger-border: #d1d5db;
  --ms-trigger-border-open: #3b82f6;
  --ms-trigger-text: #1f2937;
  --ms-trigger-padding: 0.5rem 1rem;
  --ms-trigger-radius: 0.375rem;
  --ms-trigger-min-height: 2.5rem;
  --ms-trigger-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.3);
  --ms-trigger-hover-bg: #f9fafb;

  /* Dropdown Panel (6 variables) */
  --ms-dropdown-bg: #ffffff;
  --ms-dropdown-border: #d1d5db;
  --ms-dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --ms-dropdown-radius: 0.375rem;
  --ms-dropdown-max-height: 20rem;
  --ms-dropdown-z-index: 50;

  /* Search Input (6 variables) */
  --ms-search-bg: #ffffff;
  --ms-search-border: #e5e7eb;
  --ms-search-text: #1f2937;
  --ms-search-padding: 0.5rem 0.75rem;
  --ms-search-radius: 0.25rem;
  --ms-search-focus-ring: 0 0 0 2px rgba(59, 130, 246, 0.3);

  /* Options (9 variables) */
  --ms-option-padding: 0.5rem 0.75rem;
  --ms-option-hover-bg: #f3f4f6;
  --ms-option-selected-bg: #eff6ff;
  --ms-option-selected-text: #1e40af;
  --ms-option-disabled-bg: #f9fafb;
  --ms-option-disabled-text: #9ca3af;
  --ms-option-focused-bg: #dbeafe;
  --ms-option-focus-outline-color: #3b82f6;
  --ms-option-indent-size: 1.25rem;

  /* Checkboxes (5 variables) */
  --ms-checkbox-size: 1rem;
  --ms-checkbox-color: #3b82f6;
  --ms-checkbox-bg: #ffffff;
  --ms-checkbox-border: #d1d5db;
  --ms-checkbox-indeterminate-color: #6b7280;

  /* Groups/Nested (5 variables) */
  --ms-group-bg: #f9fafb;
  --ms-group-text-color: #374151;
  --ms-group-font-weight: 600;
  --ms-expand-icon-color: #6b7280;
  --ms-expand-icon-size: 0.75rem;

  /* Tags (7 variables) */
  --ms-tag-bg: #e0e7ff;
  --ms-tag-text-color: #3730a3;
  --ms-tag-padding: 0.125rem 0.5rem;
  --ms-tag-border-radius: 0.25rem;
  --ms-tag-close-size: 1rem;
  --ms-tag-close-color: #6366f1;
  --ms-tag-gap: 0.25rem;

  /* Footer (3 variables) */
  --ms-footer-bg: #f9fafb;
  --ms-footer-border-top: #e5e7eb;
  --ms-footer-padding: 0.5rem 0.75rem;

  /* Buttons (5 variables) */
  --ms-button-bg: transparent;
  --ms-button-text: #3b82f6;
  --ms-button-hover-bg: #eff6ff;
  --ms-button-padding: 0.375rem 0.75rem;
  --ms-button-radius: 0.25rem;
  --ms-button-focus-ring: 0 0 0 2px rgba(59, 130, 246, 0.3);

  /* Scrollbar (5 variables) */
  --ms-scrollbar-width: 8px;
  --ms-scrollbar-track-bg: #f1f1f1;
  --ms-scrollbar-thumb-bg: #888888;
  --ms-scrollbar-thumb-hover-bg: #555555;
  --ms-scrollbar-thumb-radius: 4px;

  /* Animation (2 variables) */
  --ms-animation-duration: 150ms;
  --ms-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Theme Examples

**Dark Mode:**

```css
.dark-theme {
  --ms-trigger-bg: #1f2937;
  --ms-trigger-border: #374151;
  --ms-trigger-text: #f9fafb;
  --ms-dropdown-bg: #1f2937;
  --ms-option-hover-bg: #374151;
  --ms-checkbox-color: #60a5fa;
}
```

**Material Design:**

```css
.material-theme {
  --ms-trigger-radius: 4px;
  --ms-dropdown-radius: 4px;
  --ms-trigger-focus-ring: 0 0 0 2px #6200ee;
  --ms-checkbox-color: #6200ee;
  --ms-option-selected-bg: #f3e5f5;
}
```

## ♿ Accessibility

Full WCAG 2.1 AA compliance with comprehensive keyboard and screen reader support:

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Focus navigation with trap inside dropdown |
| `↑` / `↓` Arrow | Navigate between options |
| `Home` / `End` | Jump to first/last option |
| `Enter` / `Space` | Toggle option selection |
| `Escape` | Close dropdown |
| `→` Arrow | Expand collapsed group (nested options) |
| `←` Arrow | Collapse expanded group (nested options) |

### Screen Reader Support

- **Live region announcements** for all state changes
- **Proper ARIA attributes**:
  - `role="listbox"`, `role="option"` for semantic structure
  - `aria-selected`, `aria-disabled` for option states
  - `aria-expanded` for groups
  - `aria-label` for controls
  - `aria-live="polite"` for announcements
- **Selection announcements**: "Option X selected. 3 items selected."
- **Search result announcements**: "5 results found for 'query'."
- **Group state announcements**: "Documents group expanded."

### Visual Indicators

- **Focus outlines** with high contrast (2px solid)
- **Reduced motion support** via `prefers-reduced-motion` media query
- **Touch-friendly targets** (44×44px minimum for mobile)
- **Color contrast** meets WCAG AA standards (4.5:1)

## 🔧 TypeScript Support

Full TypeScript definitions included:

```typescript
import { MultiSelect, SingleSelect } from '@dangnhz/custom-select';
import type {
  MultiSelectConfig,
  MultiSelectInstance,
  SingleSelectConfig,
  SingleSelectInstance,
  OptionData,
  MultiSelectEventDetail,
  SingleSelectEventDetail,
  MultiSelectSearchEventDetail,
  SingleSelectSearchEventDetail,
  MultiSelectClearEventDetail,
  SingleSelectClearEventDetail,
  MultiSelectGroupEventDetail,
  SingleSelectGroupEventDetail
} from '@dangnhz/custom-select';

// Type-safe configuration
const config: MultiSelectConfig = {
  searchEnabled: true,
  selectedDisplayMode: 'tags',
  searchDebounce: 300
};

// Type-safe instance
const ms: MultiSelectInstance = new MultiSelect('#select', config);

// Type-safe event handling
selectElement.addEventListener('multiselect:search', (e: CustomEvent<MultiSelectSearchEventDetail>) => {
  console.log(e.detail.query);         // string
  console.log(e.detail.resultsCount);  // number
  console.log(e.detail.values);        // string[]
  console.log(e.detail.options);       // OptionData[]
});

// Access option data
const options: OptionData[] = ms.getValue().map(value => ({
  value,
  text: '',
  label: '',
  disabled: false,
  selected: true,
  parent: null,
  children: [],
  level: 0,
  expanded: false,
  indeterminate: false
}));
```

## ⚡ Performance & Best Practices

### Optimize for Large Datasets

```javascript
// For >500 options, enable virtual scrolling
new MultiSelect('#large-select', {
  virtualScroll: true,
  searchDebounce: 500  // Increase debounce for slower devices
});
```

### Debounce Search

```javascript
// Adjust debounce based on dataset size
new MultiSelect('#select', {
  searchDebounce: 100  // Fast for <100 options
  // searchDebounce: 300  // Default for 100-1000 options
  // searchDebounce: 500  // Slow for >1000 options
});
```

### Memory Management

```javascript
// Always destroy when removing from DOM
ms.destroy();  // Removes event listeners, restores original select
```

### Progressive Enhancement

```javascript
// Component works without JavaScript (native select is preserved)
// Enhance only when JS is available
if ('classList' in document.documentElement) {
  new MultiSelect('#select', config);
}
```

## 🧪 Browser Support

- **Chrome/Edge** (last 2 versions)
- **Firefox** (last 2 versions)
- **Safari** (last 2 versions)
- **iOS Safari** (last 2 versions)
- **Chrome Mobile** (last 2 versions)

Requires ES2020 support. For older browsers, use a transpiler like Babel.

## 📝 License

MIT © [Your Organization]

## 📚 Documentation

- [Examples](examples/) - Live examples with code

## 🔗 Links

- [GitHub Repository](https://github.com/dangnhz/multiselect)
- [Issue Tracker](https://github.com/dangnhz/multiselect/issues)
- [Changelog](CHANGELOG.md)
- [npm Package](https://www.npmjs.com/package/@dangnhz/multiselect)
