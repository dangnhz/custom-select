# Custom Select

A lightweight, accessible TypeScript library for custom single and multi-select dropdowns. Transforms native HTML `<select>` elements into modern, customizable interfaces with search, nested options, and full keyboard navigation. Zero dependencies, framework-agnostic.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

## Features

- **Single & Multi-Select** - Both modes with radio/checkbox UI
- **Zero Dependencies** - Pure TypeScript/JavaScript
- **Fully Accessible** - WCAG 2.1 AA compliant, complete keyboard navigation
- **Nested Options** - Hierarchical selections with expand/collapse
- **Display Modes** - Count, list, tags (removable), or custom formatters
- **Smart Search** - Debounced filtering with multiple strategies
- **Themeable** - 50+ CSS variables for customization
- **Progressive Enhancement** - Works with native `<select>` elements
- **TypeScript First** - Full type definitions included

## Installation

```bash
npm install @dangnhz/custom-select
```

## Quick Start

### Multi-Select

```typescript
import { MultiSelect } from '@dangnhz/custom-select';
import '@dangnhz/custom-select/styles.css';

const ms = new MultiSelect('#my-select', {
  searchEnabled: true,
  selectedDisplayMode: 'tags'
});

document.querySelector('#my-select').addEventListener('change', (e) => {
  console.log('Selected:', e.detail.values);
});
```

### Single-Select

```typescript
import { SingleSelect } from '@dangnhz/custom-select';
import '@dangnhz/custom-select/styles.css';

const ss = new SingleSelect('#my-select', {
  searchEnabled: true,
  closeOnSelect: true
});

document.querySelector('#my-select').addEventListener('change', (e) => {
  console.log('Selected:', e.detail.value);
});
```

### Separate Bundles (Smaller File Size)

```typescript
// Import only what you need
import { MultiSelect } from '@dangnhz/custom-select/multi';
import '@dangnhz/custom-select/multi.css';

// Or for single-select only
import { SingleSelect } from '@dangnhz/custom-select/single';
import '@dangnhz/custom-select/single.css';
```

## Configuration Examples

### Display Modes (Multi-Select)

```javascript
// Count: "3 selected"
new MultiSelect('#select', {
  selectedDisplayMode: 'count'
});

// Tags: Removable pills
new MultiSelect('#select', {
  selectedDisplayMode: 'tags',
  maxTags: 5  // Show max 5, then "+X more"
});

// List: Comma-separated
new MultiSelect('#select', {
  selectedDisplayMode: 'list',
  maxSelectedDisplay: 3
});

// Custom formatter
new MultiSelect('#select', {
  selectedDisplayMode: 'custom',
  selectedFormat: (options) => options.map(o => o.text).join(', ')
});
```

### Nested Options

```javascript
// With optgroups
new MultiSelect('#select', {
  nestedOptions: true,
  cascadeSelection: true,     // Parent selects all children
  showParentCheckbox: true,
  defaultExpanded: true
});
```

### Multiple Instances

```javascript
// Initialize all at once
const instances = MultiSelect.init('.my-select', {
  searchEnabled: true
});
```

## Configuration Options

### MultiSelect

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **Basic Options** |
| `placeholder` | `string` | `'Select options...'` | Placeholder text when nothing selected |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder text |
| `searchEnabled` | `boolean` | `true` | Enable/disable search functionality |
| `searchDebounce` | `number` | `300` | Search debounce delay in milliseconds |
| **Footer Options** |
| `showClearAll` | `boolean` | `true` | Show "Clear All" button in footer (multi-select) |
| `showClear` | `boolean` | `false` | Show "Clear" button in footer (single-select) |
| `showClose` | `boolean` | `true` | Show "Close" button in footer |
| `clearAllText` | `string` | `'Clear All'` | Text for clear all button (multi-select) |
| `clearText` | `string` | `'Clear'` | Text for clear button (single-select) |
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

### SingleSelect

SingleSelect shares most MultiSelect options, plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showRadioButtons` | `boolean` | `true` | Show radio button UI |
| `allowDeselect` | `boolean` | `false` | Allow deselecting current selection |
| `closeOnSelect` | `boolean` | `true` | Auto-close after selection |
| `showClear` | `boolean` | `false` | Show "Clear" button in footer |

**Note:** SingleSelect does not support multi-select specific features like `selectedDisplayMode`, `maxTags`, `showClearAll`, `showParentCheckbox`, or `cascadeSelection`.

## API

### MultiSelect

```typescript
// Properties
ms.selectElement  // Original <select> element
ms.config         // Configuration object
ms.isOpen         // Dropdown state

// Selection
ms.getValue()           // Get selected values: string[]
ms.setValue([...])      // Set selected values
ms.selectAll()          // Select all options
ms.clearAll()           // Clear all selections

// Dropdown
ms.open()               // Open dropdown
ms.close()              // Close dropdown
ms.toggle()             // Toggle dropdown

// Nested options
ms.expandAll()          // Expand all groups
ms.collapseAll()        // Collapse all groups
ms.expandGroup(value)   // Expand specific group
ms.collapseGroup(value) // Collapse specific group

// Lifecycle
ms.refresh()            // Re-sync with native select
ms.enable()             // Enable component
ms.disable()            // Disable component
ms.destroy()            // Destroy and restore original

// Static
MultiSelect.init(selector, config)  // Initialize multiple
```

### SingleSelect

```typescript
// Properties
ss.selectElement  // Original <select> element
ss.config         // Configuration object
ss.isOpen         // Dropdown state

// Selection
ss.getValue()           // Get selected value: string | null
ss.setValue(value)      // Set selected value
ss.clear()              // Clear selection

// Dropdown
ss.open()               // Open dropdown
ss.close()              // Close dropdown
ss.toggle()             // Toggle dropdown

// Nested options (same as MultiSelect)
ss.expandAll()
ss.collapseAll()
ss.expandGroup(value)
ss.collapseGroup(value)

// Lifecycle (same as MultiSelect)
ss.refresh()
ss.enable()
ss.disable()
ss.destroy()

// Static
SingleSelect.init(selector, config)  // Initialize multiple
```

## Events

Events are dispatched on the original `<select>` element:

### MultiSelect Events

```typescript
selectElement.addEventListener('change', (e) => {
  console.log(e.detail.values);    // string[]
  console.log(e.detail.options);   // OptionData[]
});

selectElement.addEventListener('multiselect:open', (e) => {
  console.log('Dropdown opened');
});

selectElement.addEventListener('multiselect:close', (e) => {
  console.log('Dropdown closed');
});

selectElement.addEventListener('multiselect:search', (e) => {
  console.log(e.detail.query);         // string
  console.log(e.detail.resultsCount);  // number
});

selectElement.addEventListener('multiselect:clear', (e) => {
  console.log(e.detail.previousValues);  // string[]
});

selectElement.addEventListener('multiselect:expand', (e) => {
  console.log(e.detail.group);  // string
});

selectElement.addEventListener('multiselect:collapse', (e) => {
  console.log(e.detail.group);  // string
});
```

### SingleSelect Events

```typescript
selectElement.addEventListener('change', (e) => {
  console.log(e.detail.value);   // string | null
  console.log(e.detail.option);  // OptionData | null
});

// Events: singleselect:open, singleselect:close, singleselect:search,
//         singleselect:clear, singleselect:expand, singleselect:collapse
// (Same structure as MultiSelect events)
```

## Theming

Customize using 50+ CSS variables with `--ms-*` prefix:

```css
:root {
  /* Trigger */
  --ms-trigger-bg: #ffffff;
  --ms-trigger-border: #d1d5db;
  --ms-trigger-text: #1f2937;
  --ms-trigger-radius: 0.375rem;

  /* Dropdown */
  --ms-dropdown-bg: #ffffff;
  --ms-dropdown-border: #d1d5db;
  --ms-dropdown-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Options */
  --ms-option-hover-bg: #f3f4f6;
  --ms-option-selected-bg: #eff6ff;
  --ms-option-selected-text: #1e40af;

  /* Checkboxes/Radio */
  --ms-checkbox-color: #3b82f6;

  /* Tags */
  --ms-tag-bg: #e0e7ff;
  --ms-tag-text-color: #3730a3;

  /* And 40+ more... */
}
```

**Dark mode example:**

```css
.dark {
  --ms-trigger-bg: #1f2937;
  --ms-trigger-text: #f9fafb;
  --ms-dropdown-bg: #1f2937;
  --ms-option-hover-bg: #374151;
}
```

## Accessibility

WCAG 2.1 AA compliant with full keyboard and screen reader support.

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Focus navigation (trapped in dropdown) |
| `↑` / `↓` | Navigate options |
| `Home` / `End` | Jump to first/last |
| `Enter` / `Space` | Toggle selection |
| `Escape` | Close dropdown |
| `→` / `←` | Expand/collapse groups |

### Screen Reader

- Live region announcements for state changes
- Complete ARIA attributes (`role`, `aria-selected`, `aria-expanded`, etc.)
- Announces selections, search results, and group states

### Visual

- High contrast focus outlines
- Respects `prefers-reduced-motion`
- Touch-friendly targets (44×44px min)
- WCAG AA color contrast (4.5:1)

## TypeScript

Full type definitions included:

```typescript
import { MultiSelect, SingleSelect } from '@dangnhz/custom-select';
import type {
  MultiSelectConfig,
  SingleSelectConfig,
  OptionData
} from '@dangnhz/custom-select';

// Type-safe config
const config: MultiSelectConfig = {
  searchEnabled: true,
  selectedDisplayMode: 'tags'
};

const ms = new MultiSelect('#select', config);
```

## Browser Support

- Chrome/Edge, Firefox, Safari (last 2 versions)
- iOS Safari, Chrome Mobile (last 2 versions)

Requires ES2020 support.

## License

MIT © [dangnhz](https://github.com/dangnhz)

## Links

- [GitHub](https://github.com/dangnhz/custom-select)
- [npm](https://www.npmjs.com/package/@dangnhz/custom-select)
- [Issues](https://github.com/dangnhz/custom-select/issues)
