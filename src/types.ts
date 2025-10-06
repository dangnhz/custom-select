/**
 * Display mode for selected items in the trigger button
 */
export type SelectedDisplayMode = 'count' | 'list' | 'tags' | 'custom';

/**
 * Search matching strategy
 */
export type SearchStrategy = 'contains' | 'startsWith' | 'exact';

/**
 * Dropdown position relative to trigger
 */
export type DropdownPosition = 'auto' | 'top' | 'bottom';

/**
 * Represents a single option in the multi-select
 */
export interface OptionData {
  /** Unique value for the option */
  value: string;
  /** Display text for the option */
  text: string;
  /** Display label (alias for text, for compatibility) */
  label: string;
  /** Whether the option is disabled */
  disabled: boolean;
  /** Whether the option is selected */
  selected: boolean;
  /** Parent option value (for nested options) */
  parent: string | null;
  /** Child options (for nested options) */
  children: OptionData[];
  /** Nesting level (0 for root) */
  level: number;
  /** Whether parent group is expanded (for nested options) */
  expanded: boolean;
  /** Indeterminate state for parent checkboxes */
  indeterminate: boolean;
}

/**
 * Configuration options for MultiSelect
 */
export interface MultiSelectConfig {
  /* Basic Options */
  /** Placeholder text when nothing is selected */
  placeholder: string;
  /** Placeholder text for search input */
  searchPlaceholder: string;
  /** Enable/disable search functionality */
  searchEnabled: boolean;
  /** Debounce delay for search input (in milliseconds) */
  searchDebounce: number;

  /* Footer Options */
  /** Show/hide "Clear All" button */
  showClearAll: boolean;
  /** Show/hide "Close" button */
  showClose: boolean;
  /** Text for "Clear All" button */
  clearAllText: string;
  /** Text for "Close" button */
  closeText: string;

  /* Display Options */
  /** Display mode for selected items */
  selectedDisplayMode: SelectedDisplayMode;
  /** Maximum items to display in 'list' mode before showing "+X more" */
  maxSelectedDisplay: number;
  /** Maximum tags to show in 'tags' mode before showing "+X more" */
  maxTags: number;
  /** Custom formatter function for selected display (used with 'custom' mode) */
  selectedFormat: ((selectedOptions: OptionData[]) => string) | null;
  /** Template for single selection text (use {count} placeholder) */
  selectedTextSingular: string;
  /** Template for multiple selections text (use {count} placeholder) */
  selectedTextPlural: string;

  /* Dropdown Options */
  /** Maximum height for dropdown in pixels */
  maxHeight: number;
  /** Dropdown position preference */
  position: DropdownPosition;
  /** Close dropdown when clicking outside */
  closeOnOutsideClick: boolean;
  /** Return focus to trigger button when dropdown closes */
  returnFocusOnClose: boolean;

  /* Search Options */
  /** Search matching strategy */
  searchStrategy: SearchStrategy;
  /** Clear search input when dropdown closes */
  clearSearchOnClose: boolean;
  /** Auto-focus search input when dropdown opens */
  searchAutoFocus: boolean;

  /* Performance Options */
  /** Enable virtual scrolling for large datasets (>500 options) */
  virtualScroll: boolean;
  /** Enable/disable animations */
  animation: boolean;

  /* Nested Options */
  /** Enable nested/hierarchical options support */
  nestedOptions: boolean;
  /** Cascade selection from parent to children */
  cascadeSelection: boolean;
  /** Show checkboxes for parent groups */
  showParentCheckbox: boolean;
  /** Auto-expand groups when children match search */
  expandOnSearch: boolean;
  /** Default expanded state for all groups */
  defaultExpanded: boolean;
  /** Indentation size in pixels for nested levels */
  indentSize: number;
  /** Icon for collapsed/closed groups */
  expandIconCollapsed: string;
  /** Icon for expanded/open groups */
  expandIconExpanded: string;
}

/**
 * Configuration options for SingleSelect
 */
export interface SingleSelectConfig {
  /* Basic Options */
  /** Placeholder text when nothing is selected */
  placeholder: string;
  /** Placeholder text for search input */
  searchPlaceholder: string;
  /** Enable/disable search functionality */
  searchEnabled: boolean;
  /** Debounce delay for search input (in milliseconds) */
  searchDebounce: number;

  /* Footer Options */
  /** Show/hide "Close" button */
  showClose: boolean;
  /** Text for "Close" button */
  closeText: string;
  /** Show/hide "Clear" button (to deselect current selection) */
  showClear: boolean;
  /** Text for "Clear" button */
  clearText: string;

  /* Dropdown Options */
  /** Maximum height for dropdown in pixels */
  maxHeight: number;
  /** Dropdown position preference */
  position: DropdownPosition;
  /** Close dropdown when clicking outside */
  closeOnOutsideClick: boolean;
  /** Return focus to trigger button when dropdown closes */
  returnFocusOnClose: boolean;
  /** Auto-close dropdown after selection */
  closeOnSelect: boolean;

  /* Search Options */
  /** Search matching strategy */
  searchStrategy: SearchStrategy;
  /** Clear search input when dropdown closes */
  clearSearchOnClose: boolean;
  /** Auto-focus search input when dropdown opens */
  searchAutoFocus: boolean;

  /* Performance Options */
  /** Enable/disable animations */
  animation: boolean;

  /* Single-Select Specific */
  /** Show radio button UI for options */
  showRadioButtons: boolean;
  /** Allow deselecting the current selection (clicking selected item deselects it) */
  allowDeselect: boolean;

  /* Nested Options */
  /** Enable nested/hierarchical options support */
  nestedOptions: boolean;
  /** Auto-expand groups when children match search */
  expandOnSearch: boolean;
  /** Default expanded state for all groups */
  defaultExpanded: boolean;
  /** Indentation size in pixels for nested levels */
  indentSize: number;
  /** Icon for collapsed/closed groups */
  expandIconCollapsed: string;
  /** Icon for expanded/open groups */
  expandIconExpanded: string;
}

/**
 * Event detail types for custom events
 */
export interface MultiSelectEventDetail {
  /** Selected values array */
  values: string[];
  /** Selected option data */
  options: OptionData[];
  /** Reference to MultiSelect instance */
  instance: MultiSelectInstance;
}

export interface MultiSelectSearchEventDetail extends MultiSelectEventDetail {
  /** Search query */
  query: string;
  /** Number of results found */
  resultsCount: number;
}

export interface MultiSelectClearEventDetail extends MultiSelectEventDetail {
  /** Previously selected values before clearing */
  previousValues: string[];
}

export interface MultiSelectGroupEventDetail extends MultiSelectEventDetail {
  /** Group/parent option value */
  group: string;
}

/**
 * Public API interface for MultiSelect instance
 */
export interface MultiSelectInstance {
  /* State Methods */
  /** Get array of currently selected values */
  getValue(): string[];
  /** Set selected values programmatically */
  setValue(values: string[]): void;
  /** Select all options */
  selectAll(): void;
  /** Clear all selections */
  clearAll(): void;

  /* Dropdown Control */
  /** Open the dropdown */
  open(): void;
  /** Close the dropdown */
  close(): void;
  /** Toggle dropdown open/close */
  toggle(): void;

  /* Lifecycle Methods */
  /** Re-sync with native select element */
  refresh(): void;
  /** Destroy instance and restore original select */
  destroy(): void;
  /** Enable the component */
  enable(): void;
  /** Disable the component */
  disable(): void;

  /* Nested Options Methods */
  /** Expand all parent groups */
  expandAll(): void;
  /** Collapse all parent groups */
  collapseAll(): void;
  /** Expand specific parent group by value */
  expandGroup(groupValue: string): void;
  /** Collapse specific parent group by value */
  collapseGroup(groupValue: string): void;

  /* Properties */
  /** Original select element */
  readonly selectElement: HTMLSelectElement;
  /** Configuration object */
  readonly config: Readonly<MultiSelectConfig>;
  /** Whether dropdown is currently open */
  readonly isOpen: boolean;
}

/**
 * Public API interface for SingleSelect instance
 */
export interface SingleSelectInstance {
  /* State Methods */
  /** Get currently selected value (or null if nothing selected) */
  getValue(): string | null;
  /** Set selected value programmatically */
  setValue(value: string | null): void;
  /** Clear selection */
  clear(): void;

  /* Dropdown Control */
  /** Open the dropdown */
  open(): void;
  /** Close the dropdown */
  close(): void;
  /** Toggle dropdown open/close */
  toggle(): void;

  /* Lifecycle Methods */
  /** Re-sync with native select element */
  refresh(): void;
  /** Destroy instance and restore original select */
  destroy(): void;
  /** Enable the component */
  enable(): void;
  /** Disable the component */
  disable(): void;

  /* Nested Options Methods */
  /** Expand all parent groups */
  expandAll(): void;
  /** Collapse all parent groups */
  collapseAll(): void;
  /** Expand specific parent group by value */
  expandGroup(groupValue: string): void;
  /** Collapse specific parent group by value */
  collapseGroup(groupValue: string): void;

  /* Properties */
  /** Original select element */
  readonly selectElement: HTMLSelectElement;
  /** Configuration object */
  readonly config: Readonly<SingleSelectConfig>;
  /** Whether dropdown is currently open */
  readonly isOpen: boolean;
}

/**
 * Event detail type for SingleSelect events
 */
export interface SingleSelectEventDetail {
  /** Selected value (or null if nothing selected) */
  value: string | null;
  /** Selected option data (or null if nothing selected) */
  option: OptionData | null;
  /** Reference to SingleSelect instance */
  instance: SingleSelectInstance;
}

export interface SingleSelectSearchEventDetail extends SingleSelectEventDetail {
  /** Search query */
  query: string;
  /** Number of results found */
  resultsCount: number;
}

export interface SingleSelectClearEventDetail extends SingleSelectEventDetail {
  /** Previously selected value before clearing */
  previousValue: string | null;
}

export interface SingleSelectGroupEventDetail extends SingleSelectEventDetail {
  /** Group/parent option value */
  group: string;
}

/**
 * Event handler types
 */
export type MultiSelectEventHandler = (detail: MultiSelectEventDetail) => void;
export type MultiSelectSearchEventHandler = (detail: MultiSelectSearchEventDetail) => void;
export type MultiSelectClearEventHandler = (detail: MultiSelectClearEventDetail) => void;
export type MultiSelectGroupEventHandler = (detail: MultiSelectGroupEventDetail) => void;

export type SingleSelectEventHandler = (detail: SingleSelectEventDetail) => void;
export type SingleSelectSearchEventHandler = (detail: SingleSelectSearchEventDetail) => void;
export type SingleSelectClearEventHandler = (detail: SingleSelectClearEventDetail) => void;
export type SingleSelectGroupEventHandler = (detail: SingleSelectGroupEventDetail) => void;

/**
 * Event map for type-safe event handling
 */
export interface MultiSelectEventMap {
  change: CustomEvent<MultiSelectEventDetail>;
  'multiselect:open': CustomEvent<MultiSelectEventDetail>;
  'multiselect:close': CustomEvent<MultiSelectEventDetail>;
  'multiselect:search': CustomEvent<MultiSelectSearchEventDetail>;
  'multiselect:clear': CustomEvent<MultiSelectClearEventDetail>;
  'multiselect:expand': CustomEvent<MultiSelectGroupEventDetail>;
  'multiselect:collapse': CustomEvent<MultiSelectGroupEventDetail>;
}

export interface SingleSelectEventMap {
  change: CustomEvent<SingleSelectEventDetail>;
  'singleselect:open': CustomEvent<SingleSelectEventDetail>;
  'singleselect:close': CustomEvent<SingleSelectEventDetail>;
  'singleselect:search': CustomEvent<SingleSelectSearchEventDetail>;
  'singleselect:clear': CustomEvent<SingleSelectClearEventDetail>;
  'singleselect:expand': CustomEvent<SingleSelectGroupEventDetail>;
  'singleselect:collapse': CustomEvent<SingleSelectGroupEventDetail>;
}
