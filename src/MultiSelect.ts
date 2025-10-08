import type {
  MultiSelectConfig,
  MultiSelectInstance,
  OptionData,
  MultiSelectEventDetail,
  MultiSelectSearchEventDetail,
  MultiSelectClearEventDetail,
  MultiSelectGroupEventDetail,
} from './types';
import * as NestedOptions from './NestedOptions';
import {
  getSelectedValues,
  syncNativeSelect,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  searchMatch,
  formatSelectedText,
  truncate,
  getDropdownPosition,
  trapFocus,
  debounce,
} from './utils';

/**
 * Default configuration for MultiSelect
 */
const DEFAULT_CONFIG: MultiSelectConfig = {
  // Basic Options
  placeholder: 'Select options...',
  searchPlaceholder: 'Search...',
  searchEnabled: true,
  searchDebounce: 300,

  // Footer Options
  showClearAll: true,
  showClose: true,
  clearAllText: 'Clear All',
  closeText: 'Close',

  // Display Options
  selectedDisplayMode: 'count',
  maxSelectedDisplay: 3,
  maxTags: 5,
  selectedFormat: null,
  selectedTextSingular: '{count} selected',
  selectedTextPlural: '{count} selected',

  // Dropdown Options
  maxHeight: 300,
  position: 'auto',
  closeOnOutsideClick: true,
  returnFocusOnClose: false,

  // Search Options
  searchStrategy: 'contains',
  clearSearchOnClose: true,
  searchAutoFocus: false,

  // Performance Options
  virtualScroll: false,
  animation: true,

  // Nested Options
  nestedOptions: false,
  cascadeSelection: false,
  showParentCheckbox: false,
  expandOnSearch: true,
  defaultExpanded: false,
  indentSize: 20,
  expandIconCollapsed: '▶',
  expandIconExpanded: '▼',
};

/**
 * MultiSelect class - Main component
 */
export class MultiSelect implements MultiSelectInstance {
  // Static registry of all instances
  private static instances = new Set<MultiSelect>();

  // Core properties
  public readonly config: MultiSelectConfig;
  public readonly selectElement: HTMLSelectElement;

  // DOM elements
  private container: HTMLElement | null = null;
  private trigger: HTMLElement | null = null;
  private dropdown: HTMLElement | null = null;
  private searchInput: HTMLInputElement | null = null;
  private optionsList: HTMLElement | null = null;
  private footer: HTMLElement | null = null;

  // State
  private _isOpen = false;
  private optionData: OptionData[] = [];
  private selectedValues: string[] = [];
  private filteredData: OptionData[] | null = null;
  private searchQuery = '';
  private focusedOptionIndex = -1;

  // Accessibility - Live region for announcements
  private liveRegion: HTMLElement | null = null;

  // Event handlers storage for cleanup
  private eventHandlers = new Map<string, EventListener>();

  /**
   * Constructor
   */
  constructor(selector: string | HTMLSelectElement, config: Partial<MultiSelectConfig> = {}) {
    // Find select element
    if (typeof selector === 'string') {
      const element = document.querySelector<HTMLSelectElement>(selector);
      if (!element) {
        throw new Error(`MultiSelect: Element not found: ${selector}`);
      }
      if (element.tagName !== 'SELECT') {
        throw new Error(`MultiSelect: Element is not a <select>: ${selector}`);
      }
      this.selectElement = element;
    } else {
      // Validate element type
      if (selector.tagName !== 'SELECT') {
        throw new Error('MultiSelect: Element is not a <select>');
      }
      this.selectElement = selector;
    }

    // Validate it's a multi-select
    if (!this.selectElement.multiple) {
      throw new Error('MultiSelect: <select> element must have "multiple" attribute');
    }

    // Merge config with defaults
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize
    this.init();
  }

  /**
   * Get dropdown open state
   */
  public get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Main initialization method
   */
  private init(): void {
    this.parseOptions();
    this.createUI();
    this.bindEvents();
    this.hideOriginalSelect();
    this.storeInstance();
  }

  /**
   * Parse options from select element
   */
  private parseOptions(): void {
    this.optionData = NestedOptions.parseSelectElement(
      this.selectElement,
      this.config.nestedOptions
    );

    // Set initial expanded state
    if (this.config.nestedOptions && this.config.defaultExpanded) {
      NestedOptions.expandAll(this.optionData);
    }

    // Get initial selected values
    this.selectedValues = getSelectedValues(this.selectElement);

    // Update option data with selected state
    this.selectedValues.forEach((value) => {
      const option = NestedOptions.findOption(this.optionData, value);
      if (option) {
        option.selected = true;
      }
    });

    // Update parent states if nested
    if (this.config.nestedOptions) {
      this.optionData.forEach((option) => {
        if (option.children.length > 0) {
          NestedOptions.updateParentState(option, this.optionData);
        }
      });
    }
  }

  /**
   * Create custom UI structure
   */
  private createUI(): void {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'ms-multiselect';

    // Add no-animation class if animations are disabled
    if (!this.config.animation) {
      addClass(this.container, 'ms-multiselect--no-animation');
    }

    // Create trigger button (to be implemented in Phase 7)
    this.trigger = this.createTrigger();
    this.container.appendChild(this.trigger);

    // Create dropdown panel
    this.dropdown = this.createDropdown();
    this.container.appendChild(this.dropdown);

    // Link trigger to dropdown via aria-controls
    if (this.trigger && this.dropdown) {
      const dropdownId = this.dropdown.getAttribute('id');
      if (dropdownId) {
        this.trigger.setAttribute('aria-controls', dropdownId);
      }
    }

    // Insert after select element
    this.selectElement.parentNode?.insertBefore(this.container, this.selectElement.nextSibling);

    // Initial trigger update
    this.updateTriggerText();
  }

  /**
   * Create trigger button
   */
  private createTrigger(): HTMLElement {
    const trigger = createElement('button', 'ms-multiselect__trigger', {
      type: 'button',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-label': 'Multi-select dropdown',
    });

    // Add caret icon
    const caret = createElement('span', 'ms-multiselect__caret', {
      'aria-hidden': 'true',
    });
    trigger.appendChild(caret);

    return trigger;
  }

  /**
   * Create dropdown panel
   */
  private createDropdown(): HTMLElement {
    const dropdownId = `ms-dropdown-${Math.random().toString(36).slice(2, 11)}`;
    const dropdown = createElement(
      'div',
      'ms-multiselect__dropdown ms-multiselect__dropdown--hidden',
      {
        id: dropdownId,
        role: 'dialog',
        'aria-label': 'Multi-select options',
        'aria-hidden': 'true',
        'aria-modal': 'false',
      }
    );

    // Add search if enabled
    if (this.config.searchEnabled) {
      const searchContainer = this.renderSearch();
      dropdown.appendChild(searchContainer);
    }

    // Add options list
    this.optionsList = this.renderOptionsList();
    dropdown.appendChild(this.optionsList);

    // Add footer (only if buttons are shown)
    this.footer = this.renderFooter();
    if (this.footer) {
      dropdown.appendChild(this.footer);
    }

    // Create live region for screen reader announcements
    this.liveRegion = createElement('div', 'ms-multiselect__live-region', {
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.padding = '0';
    this.liveRegion.style.margin = '-1px';
    this.liveRegion.style.overflow = 'hidden';
    this.liveRegion.style.clipPath = 'inset(50%)';
    this.liveRegion.style.whiteSpace = 'nowrap';
    this.liveRegion.style.border = '0';
    dropdown.appendChild(this.liveRegion);

    return dropdown;
  }

  /**
   * Render search input
   */
  private renderSearch(): HTMLElement {
    const searchContainer = createElement('div', 'ms-multiselect__search');

    this.searchInput = createElement('input', 'ms-multiselect__search-input', {
      type: 'text',
      placeholder: this.config.searchPlaceholder,
      'aria-label': 'Search options',
      autocomplete: 'off',
    });

    searchContainer.appendChild(this.searchInput);
    return searchContainer;
  }

  /**
   * Render options list container
   */
  private renderOptionsList(): HTMLElement {
    const list = createElement('div', 'ms-multiselect__options', {
      role: 'listbox',
      'aria-multiselectable': 'true',
    });

    list.style.maxHeight = `${String(this.config.maxHeight)}px`;

    // Render options
    this.renderOptions(list);

    return list;
  }

  /**
   * Render options into list container
   */
  private renderOptions(container: HTMLElement, filteredData?: OptionData[]): void {
    container.innerHTML = '';

    const dataToRender = filteredData ?? this.optionData;

    if (dataToRender.length === 0) {
      const emptyMsg = createElement('div', 'ms-multiselect__empty');
      emptyMsg.textContent = this.searchQuery ? 'No results found' : 'No options available';
      container.appendChild(emptyMsg);
      return;
    }

    dataToRender.forEach((option) => {
      const optionEl = this.renderOption(option);
      container.appendChild(optionEl);

      // Render children if expanded (for nested options)
      if (this.config.nestedOptions && option.expanded && option.children.length > 0) {
        option.children.forEach((child) => {
          const childEl = this.renderOption(child);
          container.appendChild(childEl);
        });
      }
    });
  }

  /**
   * Render single option element
   */
  private renderOption(option: OptionData): HTMLElement {
    const optionEl = createElement('div', 'ms-multiselect__option', {
      role: 'option',
      'aria-selected': option.selected ? 'true' : 'false',
      'data-value': option.value,
    });

    if (option.disabled) {
      addClass(optionEl, 'ms-multiselect__option--disabled');
      optionEl.setAttribute('aria-disabled', 'true');
    }

    if (option.selected) {
      addClass(optionEl, 'ms-multiselect__option--selected');
    }

    // Add indentation for nested levels
    if (this.config.nestedOptions && option.level > 0) {
      optionEl.style.paddingLeft = `${String(option.level * this.config.indentSize)}px`;
      addClass(optionEl, `ms-multiselect__option--level-${String(option.level)}`);
      addClass(optionEl, 'ms-multiselect__option--child');
    }

    // Parent group with expand/collapse icon
    if (this.config.nestedOptions && option.children.length > 0) {
      addClass(optionEl, 'ms-multiselect__option--parent');
      optionEl.setAttribute('aria-expanded', option.expanded ? 'true' : 'false');

      const expandIcon = createElement('span', 'ms-multiselect__expand-icon');
      expandIcon.textContent = option.expanded
        ? this.config.expandIconExpanded
        : this.config.expandIconCollapsed;
      if (option.expanded) {
        addClass(expandIcon, 'ms-multiselect__expand-icon--expanded');
      }
      expandIcon.setAttribute('data-action', 'expand');
      optionEl.appendChild(expandIcon);
    }

    // Checkbox (if not parent or if showParentCheckbox is true)
    if (!option.children.length || this.config.showParentCheckbox) {
      const checkboxLabel = createElement('label', 'ms-multiselect__checkbox-label');

      const checkbox = createElement('input', 'ms-multiselect__checkbox', {
        type: 'checkbox',
        'aria-label': option.text,
      });

      checkbox.checked = option.selected;
      checkbox.disabled = option.disabled;

      if (option.indeterminate) {
        checkbox.indeterminate = true;
        addClass(checkboxLabel, 'ms-multiselect__checkbox-label--indeterminate');
      }

      checkboxLabel.appendChild(checkbox);

      // Add custom checkbox visual
      const checkboxCustom = createElement('span', 'ms-multiselect__checkbox-custom');
      checkboxLabel.appendChild(checkboxCustom);

      optionEl.appendChild(checkboxLabel);
    }

    // Option text
    const textEl = createElement('span', 'ms-multiselect__option-text');
    textEl.textContent = option.text;
    optionEl.appendChild(textEl);

    return optionEl;
  }

  /**
   * Render footer
   */
  private renderFooter(): HTMLElement | null {
    // Don't create footer if no buttons are shown
    if (!this.config.showClearAll && !this.config.showClose) {
      return null;
    }

    const footer = createElement('div', 'ms-multiselect__footer');

    if (this.config.showClearAll) {
      const clearBtn = createElement(
        'button',
        'ms-multiselect__button ms-multiselect__button--clear',
        {
          type: 'button',
        }
      );
      clearBtn.textContent = this.config.clearAllText;
      clearBtn.setAttribute('data-action', 'clear');
      footer.appendChild(clearBtn);
    }

    if (this.config.showClose) {
      const closeBtn = createElement(
        'button',
        'ms-multiselect__button ms-multiselect__button--close',
        {
          type: 'button',
        }
      );
      closeBtn.textContent = this.config.closeText;
      closeBtn.setAttribute('data-action', 'close');
      footer.appendChild(closeBtn);
    }

    return footer;
  }

  /**
   * Update trigger button text based on display mode
   */
  private updateTriggerText(): void {
    if (!this.trigger) return;

    const count = this.selectedValues.length;
    const selectedOptions = NestedOptions.getSelectedOptions(this.optionData);

    // Filter out parent options (only show leaf options)
    const leafOptions = this.config.nestedOptions
      ? selectedOptions.filter((opt) => opt.children.length === 0)
      : selectedOptions;

    // Get or create text container (preserve caret)
    let textContainer = this.trigger.querySelector('.ms-multiselect__trigger-text');
    if (!textContainer) {
      textContainer = createElement('span', 'ms-multiselect__trigger-text');
      // Insert before caret
      const caret = this.trigger.querySelector('.ms-multiselect__caret');
      if (caret) {
        this.trigger.insertBefore(textContainer, caret);
      } else {
        this.trigger.appendChild(textContainer);
      }
    }

    // Handle tags mode separately (needs to work when count is 0 to clear tags)
    if (this.config.selectedDisplayMode === 'tags') {
      // Remove existing tags first
      const existingTags = this.trigger.querySelector('.ms-multiselect__tags');
      if (existingTags) existingTags.remove();

      if (count === 0) {
        // Show placeholder when no selections
        textContainer.textContent = this.config.placeholder;
      } else {
        // Render tags and remove text container
        textContainer.remove();
        this.renderTags(leafOptions);
      }
      return;
    }

    // Handle empty selection for custom display mode
    if (count === 0 && this.config.selectedDisplayMode === 'custom' && this.config.selectedFormat) {
      textContainer.textContent = this.config.selectedFormat(selectedOptions);
      return;
    }

    // Handle empty selection for other modes
    if (count === 0) {
      textContainer.textContent = this.config.placeholder;
      return;
    }

    switch (this.config.selectedDisplayMode) {
      case 'count':
        textContainer.textContent = formatSelectedText(
          count,
          this.config.selectedTextSingular,
          this.config.selectedTextPlural
        );
        break;

      case 'list': {
        const names = leafOptions.slice(0, this.config.maxSelectedDisplay).map((opt) => opt.text);
        const remaining = count - this.config.maxSelectedDisplay;
        let text = names.join(', ');
        if (remaining > 0) {
          text += ` +${String(remaining)} more`;
        }
        textContainer.textContent = truncate(text, 100);
        break;
      }

      case 'custom':
        if (this.config.selectedFormat) {
          textContainer.textContent = this.config.selectedFormat(leafOptions);
        } else {
          textContainer.textContent = formatSelectedText(
            count,
            this.config.selectedTextSingular,
            this.config.selectedTextPlural
          );
        }
        break;
    }
  }

  /**
   * Render tags in trigger button
   */
  private renderTags(selectedOptions: OptionData[]): void {
    if (!this.trigger) return;

    // Remove existing tags and text container, preserve caret
    const existingTags = this.trigger.querySelector('.ms-multiselect__tags');
    const existingText = this.trigger.querySelector('.ms-multiselect__trigger-text');
    if (existingTags) existingTags.remove();
    if (existingText) existingText.remove();

    const tagsContainer = createElement('div', 'ms-multiselect__tags');
    const visibleOptions = selectedOptions.slice(0, this.config.maxTags);
    const remaining = selectedOptions.length - this.config.maxTags;

    visibleOptions.forEach((option) => {
      const tag = createElement('span', 'ms-multiselect__tag', {
        'data-value': option.value,
      });

      const tagText = createElement('span', 'ms-multiselect__tag-text');
      tagText.textContent = truncate(option.text, 20);
      tag.appendChild(tagText);

      const closeBtn = createElement('span', 'ms-multiselect__tag-close', {
        'aria-label': `Remove ${option.text}`,
      });
      closeBtn.textContent = '×';
      closeBtn.setAttribute('data-action', 'remove-tag');
      closeBtn.setAttribute('data-value', option.value);
      tag.appendChild(closeBtn);

      tagsContainer.appendChild(tag);
    });

    if (remaining > 0) {
      const overflow = createElement('span', 'ms-multiselect__tag-overflow');
      overflow.textContent = `+${String(remaining)}`;
      tagsContainer.appendChild(overflow);
    }

    // Insert before caret
    const caret = this.trigger.querySelector('.ms-multiselect__caret');
    if (caret) {
      this.trigger.insertBefore(tagsContainer, caret);
    } else {
      this.trigger.appendChild(tagsContainer);
    }
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Trigger button click
    const triggerClickHandler = (e: Event) => {
      const target = e.target as HTMLElement;

      // Don't toggle if clicking on a tag or tag close button
      if (
        target.closest('.ms-multiselect__tag') ||
        target.getAttribute('data-action') === 'remove-tag'
      ) {
        return;
      }

      this.toggle();
    };
    this.trigger?.addEventListener('click', triggerClickHandler);
    this.eventHandlers.set('trigger:click', triggerClickHandler);

    // Search input
    if (this.searchInput) {
      let searchHandler: (e: Event) => void;

      if (this.config.searchDebounce > 0) {
        const debouncedSearch = debounce((e: Event) => {
          this.handleSearch(e as InputEvent);
        }, this.config.searchDebounce);
        searchHandler = (e: Event) => {
          debouncedSearch(e);
        };
      } else {
        // No debounce, call immediately (for testing)
        searchHandler = (e: Event) => {
          this.handleSearch(e as InputEvent);
        };
      }

      this.searchInput.addEventListener('input', searchHandler);
      this.eventHandlers.set('search:input', searchHandler);
    }

    // Options list - event delegation
    if (this.optionsList) {
      const optionsClickHandler = (e: Event) => {
        this.handleOptionsClick(e as MouseEvent);
      };
      this.optionsList.addEventListener('click', optionsClickHandler);
      this.eventHandlers.set('options:click', optionsClickHandler);
    }

    // Footer buttons - event delegation
    if (this.footer) {
      const footerClickHandler = (e: Event) => {
        this.handleFooterClick(e as MouseEvent);
      };
      this.footer.addEventListener('click', footerClickHandler);
      this.eventHandlers.set('footer:click', footerClickHandler);
    }

    // Outside click
    const outsideClickHandler = (e: Event) => {
      this.handleOutsideClick(e as MouseEvent);
    };
    document.addEventListener('click', outsideClickHandler);
    this.eventHandlers.set('document:click', outsideClickHandler);

    // Escape key
    const escapeHandler = (e: Event) => {
      this.handleEscapeKey(e as KeyboardEvent);
    };
    document.addEventListener('keydown', escapeHandler);
    this.eventHandlers.set('document:keydown', escapeHandler);

    // Keyboard navigation
    if (this.dropdown) {
      const keyboardHandler = (e: Event) => {
        this.handleKeyboardNav(e as KeyboardEvent);
      };
      this.dropdown.addEventListener('keydown', keyboardHandler);
      this.eventHandlers.set('dropdown:keydown', keyboardHandler);

      // Track focus changes from Tab navigation
      const focusHandler = (e: Event) => {
        this.handleFocusChange(e as FocusEvent);
      };
      this.dropdown.addEventListener('focusin', focusHandler, true);
      this.eventHandlers.set('dropdown:focusin', focusHandler);
    }

    // Tag removal (for tags display mode)
    if (this.trigger) {
      const tagRemoveHandler = (e: Event) => {
        this.handleTagRemove(e as MouseEvent);
      };
      this.trigger.addEventListener('click', tagRemoveHandler);
      this.eventHandlers.set('trigger:tag-remove', tagRemoveHandler);
    }

    // Prevent dropdown clicks from bubbling to document (FR-031)
    if (this.dropdown) {
      const dropdownClickHandler = (e: Event) => {
        // Stop propagation for all clicks inside dropdown
        e.stopPropagation();
      };
      this.dropdown.addEventListener('click', dropdownClickHandler);
      this.eventHandlers.set('dropdown:click', dropdownClickHandler);
    }

    // Window resize - update dropdown position/width
    const resizeHandler = debounce(() => {
      if (this.isOpen && this.dropdown && this.trigger) {
        this.positionDropdown();
      }
    }, 150);
    window.addEventListener('resize', resizeHandler);
    this.eventHandlers.set('window:resize', resizeHandler);

    // Window/document scroll - update dropdown position
    const scrollHandler = () => {
      if (this.isOpen && this.dropdown && this.trigger) {
        this.positionDropdown();
      }
    };
    window.addEventListener('scroll', scrollHandler, true); // Use capture phase to catch all scroll events
    this.eventHandlers.set('window:scroll', scrollHandler);
  }

  /* ===========================
     Event Handlers
     =========================== */

  /**
   * Handle search input
   */
  private handleSearch(e: InputEvent): void {
    const query = (e.target as HTMLInputElement).value;
    this.searchQuery = query;

    if (!query) {
      this.filteredData = null;
      if (this.optionsList) {
        this.renderOptions(this.optionsList);
      }
      const totalCount = this.optionData.length;
      this.announce(
        `Search cleared. ${String(totalCount)} option${totalCount === 1 ? '' : 's'} available.`
      );
    } else {
      this.filteredData = this.filterOptions(query);
      if (this.optionsList) {
        this.renderOptions(this.optionsList, this.filteredData);
      }
      const resultCount = this.filteredData.length;
      this.announce(
        `${String(resultCount)} result${resultCount === 1 ? '' : 's'} found for "${query}".`
      );
    }

    // Reset focused index on search
    this.focusedOptionIndex = -1;

    // Emit search event
    const detail: MultiSelectSearchEventDetail = {
      query,
      resultsCount: this.filteredData?.length ?? this.optionData.length,
      values: this.selectedValues,
      options: NestedOptions.getSelectedOptions(this.optionData),
      instance: this,
    };
    this.emitEvent('multiselect:search', detail);
  }

  /**
   * Filter options based on search query
   */
  private filterOptions(query: string): OptionData[] {
    const filtered: OptionData[] = [];

    this.optionData.forEach((option) => {
      if (this.optionMatches(option, query)) {
        filtered.push(option);

        // Expand parent if expandOnSearch is enabled
        if (this.config.nestedOptions && this.config.expandOnSearch) {
          option.expanded = true;
        }
      }
    });

    return filtered;
  }

  /**
   * Check if option matches search query
   */
  private optionMatches(option: OptionData, query: string): boolean {
    // Check option itself
    if (searchMatch(option.text, query, this.config.searchStrategy)) {
      return true;
    }

    // Check children recursively
    if (option.children.length > 0) {
      return option.children.some((child) => this.optionMatches(child, query));
    }

    return false;
  }

  /**
   * Handle clicks in options list
   */
  private handleOptionsClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const optionEl = target.closest('.ms-multiselect__option')!;

    if (!optionEl) return;

    const value = optionEl.getAttribute('data-value');
    if (!value) return;

    const option = NestedOptions.findOption(this.optionData, value);
    if (!option || option.disabled) return;

    // Handle expand/collapse icon click
    if (target.getAttribute('data-action') === 'expand') {
      e.stopPropagation();
      this.handleExpandToggle(option);
      return;
    }

    // Handle option selection
    this.handleOptionClick(option);
  }

  /**
   * Handle option click (selection toggle)
   */
  private handleOptionClick(option: OptionData): void {
    const wasSelected = option.selected;

    if (option.selected) {
      // Deselect
      if (this.config.nestedOptions && this.config.cascadeSelection) {
        NestedOptions.deselectWithCascade(option, this.optionData, true);
      } else {
        option.selected = false;
      }
    } else {
      // Select
      if (this.config.nestedOptions && this.config.cascadeSelection) {
        NestedOptions.selectWithCascade(option, this.optionData, true);
      } else {
        option.selected = true;
      }
    }

    // Update parent states
    if (this.config.nestedOptions) {
      NestedOptions.updateParentState(option, this.optionData);
    }

    // Update selected values
    this.selectedValues = NestedOptions.getLeafOptions(this.optionData)
      .filter((opt) => opt.selected)
      .map((opt) => opt.value);

    // Sync with native select
    syncNativeSelect(this.selectElement, this.selectedValues);

    // Update UI
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }
    this.updateTriggerText();

    // Announce selection change
    const action = wasSelected ? 'deselected' : 'selected';
    this.announce(
      `${option.text} ${action}. ${String(this.selectedValues.length)} item${this.selectedValues.length === 1 ? '' : 's'} selected.`
    );

    // Emit change event
    this.emitChangeEvent();
  }

  /**
   * Handle expand/collapse toggle
   */
  private handleExpandToggle(option: OptionData): void {
    if (option.children.length === 0) return;

    NestedOptions.toggleExpand(option);

    // Re-render options
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }

    // Announce to screen readers
    const state = option.expanded ? 'expanded' : 'collapsed';
    this.announce(`${option.text} group ${state}.`);

    // Emit expand/collapse event
    const detail: MultiSelectGroupEventDetail = {
      group: option.value,
      values: this.selectedValues,
      options: NestedOptions.getSelectedOptions(this.optionData),
      instance: this,
    };
    this.emitEvent(option.expanded ? 'multiselect:expand' : 'multiselect:collapse', detail);
  }

  /**
   * Handle footer button clicks
   */
  private handleFooterClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const action = target.getAttribute('data-action');

    if (action === 'clear') {
      this.handleClearAll();
    } else if (action === 'close') {
      this.handleClose();
    }
  }

  /**
   * Handle clear all
   */
  private handleClearAll(): void {
    this.clearAll();
    this.announce('All selections cleared.');
  }

  /**
   * Handle close button
   */
  private handleClose(): void {
    this.close();
  }

  /**
   * Handle outside click
   */
  private handleOutsideClick(e: MouseEvent): void {
    if (!this._isOpen || !this.config.closeOnOutsideClick) return;

    const target = e.target as Node;
    if (this.container && !this.container.contains(target)) {
      this.close();
    }
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this._isOpen) {
      e.preventDefault();

      // If search has value, clear it first before closing
      if (this.searchInput?.value) {
        this.searchInput.value = '';
        this.searchInput.dispatchEvent(new Event('input'));
        return;
      }

      // Otherwise close the dropdown
      this.close();
    }
  }

  /**
   * Handle focus changes (for Tab navigation)
   */
  private handleFocusChange(e: FocusEvent): void {
    const target = e.target as HTMLElement;

    // If a checkbox receives focus, update focusedOptionIndex
    if (target?.classList.contains('ms-multiselect__checkbox')) {
      const optionEl = target.closest('.ms-multiselect__option')!;
      if (optionEl) {
        const value = optionEl.getAttribute('data-value');
        if (value) {
          const visibleOptions = this.getVisibleOptions();
          const index = visibleOptions.findIndex((opt) => opt.value === value);
          if (index !== -1) {
            this.focusedOptionIndex = index;
            this.updateOptionFocus(visibleOptions);
          }
        }
      }
    } else if (target && !target.classList.contains('ms-multiselect__search-input')) {
      // Focus moved to non-option element (like footer buttons), reset focusedOptionIndex
      this.focusedOptionIndex = -1;
      // Clear focused class from all options
      if (this.optionsList) {
        const allOptions = this.optionsList.querySelectorAll('.ms-multiselect__option');
        allOptions.forEach((el) => {
          el.classList.remove('ms-multiselect__option--focused');
        });
      }
    }
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNav(e: KeyboardEvent): void {
    if (!this._isOpen || !this.dropdown) return;

    // Focus trap
    if (e.key === 'Tab') {
      trapFocus(this.dropdown, e);
      return;
    }

    const visibleOptions = this.getVisibleOptions();

    // Arrow Down - move to next option (with wrapping and skip disabled)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      let nextIndex = (this.focusedOptionIndex + 1) % visibleOptions.length;
      // Skip disabled options
      while (visibleOptions[nextIndex]?.disabled && nextIndex !== this.focusedOptionIndex) {
        nextIndex = (nextIndex + 1) % visibleOptions.length;
      }
      this.focusedOptionIndex = nextIndex;
      this.updateOptionFocus(visibleOptions);
      this.announceOption(visibleOptions[this.focusedOptionIndex]);
    }

    // Arrow Up - move to previous option (with wrapping and skip disabled)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let prevIndex = this.focusedOptionIndex - 1;
      if (prevIndex < 0) prevIndex = visibleOptions.length - 1;
      // Skip disabled options
      while (visibleOptions[prevIndex]?.disabled && prevIndex !== this.focusedOptionIndex) {
        prevIndex = prevIndex - 1;
        if (prevIndex < 0) prevIndex = visibleOptions.length - 1;
      }
      this.focusedOptionIndex = prevIndex;
      this.updateOptionFocus(visibleOptions);
      this.announceOption(visibleOptions[this.focusedOptionIndex]);
    }

    // Home - first option
    if (e.key === 'Home') {
      e.preventDefault();
      this.focusedOptionIndex = 0;
      this.updateOptionFocus(visibleOptions);
      this.announceOption(visibleOptions[this.focusedOptionIndex]);
    }

    // End - last option
    if (e.key === 'End') {
      e.preventDefault();
      this.focusedOptionIndex = visibleOptions.length - 1;
      this.updateOptionFocus(visibleOptions);
      this.announceOption(visibleOptions[this.focusedOptionIndex]);
    }

    // Enter or Space - toggle selection
    if ((e.key === 'Enter' || e.key === ' ') && this.focusedOptionIndex >= 0) {
      e.preventDefault();
      const option = visibleOptions[this.focusedOptionIndex];
      if (option && !option.disabled) {
        this.handleOptionClick(option);

        // Restore focus to the checkbox after toggle
        requestAnimationFrame(() => {
          const optionEl = this.optionsList?.querySelector(`[data-value="${option.value}"]`);
          if (optionEl) {
            const checkbox = optionEl.querySelector<HTMLInputElement>('.ms-multiselect__checkbox')!;
            if (checkbox) {
              checkbox.focus();
            }
          }
        });
      }
    }

    // Arrow Right - expand group (if parent)
    if (e.key === 'ArrowRight' && this.config.nestedOptions) {
      const option = visibleOptions[this.focusedOptionIndex];
      if (option && option.children.length > 0 && !option.expanded) {
        e.preventDefault();
        this.handleExpandToggle(option);
      }
    }

    // Arrow Left - collapse group (if parent)
    if (e.key === 'ArrowLeft' && this.config.nestedOptions) {
      const option = visibleOptions[this.focusedOptionIndex];
      if (option && option.children.length > 0 && option.expanded) {
        e.preventDefault();
        this.handleExpandToggle(option);
      }
    }
  }

  /**
   * Get visible options (considering search filter)
   */
  private getVisibleOptions(): OptionData[] {
    const dataToUse = this.filteredData ?? this.optionData;
    const visible: OptionData[] = [];

    dataToUse.forEach((option) => {
      visible.push(option);
      if (this.config.nestedOptions && option.expanded && option.children.length > 0) {
        option.children.forEach((child) => visible.push(child));
      }
    });

    return visible;
  }

  /**
   * Update visual focus on option
   */
  private updateOptionFocus(visibleOptions: OptionData[]): void {
    if (!this.optionsList) return;

    // Remove focus class from all
    const allOptions = this.optionsList.querySelectorAll('.ms-multiselect__option');
    allOptions.forEach((el) => {
      el.classList.remove('ms-multiselect__option--focused');
    });

    // Add focus class to current
    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < visibleOptions.length) {
      const focusedOption = visibleOptions[this.focusedOptionIndex];
      if (focusedOption) {
        const optionEl = this.optionsList.querySelector(
          `.ms-multiselect__option[data-value="${focusedOption.value}"]`
        );
        if (optionEl) {
          optionEl.classList.add('ms-multiselect__option--focused');
          // scrollIntoView may not be available in test environment (JSDOM)
          if (typeof optionEl.scrollIntoView === 'function') {
            optionEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      }
    }
  }

  /**
   * Announce option to screen readers
   */
  private announceOption(option: OptionData | undefined): void {
    if (!option || !this.liveRegion) return;

    const state = option.selected ? 'selected' : 'not selected';
    const disabled = option.disabled ? ', disabled' : '';
    const parent = option.children.length > 0 ? ', group' : '';
    const expanded = option.expanded
      ? ', expanded'
      : option.children.length > 0
        ? ', collapsed'
        : '';

    this.liveRegion.textContent = `${option.text}, ${state}${disabled}${parent}${expanded}`;
  }

  /**
   * Announce message to screen readers
   */
  private announce(message: string): void {
    if (!this.liveRegion) return;
    this.liveRegion.textContent = message;
  }

  /**
   * Handle tag removal (for tags display mode)
   */
  private handleTagRemove(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    // Check if clicking on tag close button
    if (target.getAttribute('data-action') === 'remove-tag') {
      e.stopPropagation(); // Don't open dropdown
      e.preventDefault();
      const value = target.getAttribute('data-value');

      if (value) {
        const option = NestedOptions.findOption(this.optionData, value);
        if (option) {
          option.selected = false;

          // Update selected values
          this.selectedValues = this.selectedValues.filter((v) => v !== value);

          // Sync with native select
          syncNativeSelect(this.selectElement, this.selectedValues);

          // Update UI
          this.updateTriggerText();

          // Emit change event
          this.emitChangeEvent();
        }
      }
    }
    // Stop propagation if clicking anywhere on a tag (not just close button)
    else if (target.closest('.ms-multiselect__tag')) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  /**
   * Hide original select element
   */
  private hideOriginalSelect(): void {
    this.selectElement.style.display = 'none';
    this.selectElement.setAttribute('aria-hidden', 'true');
  }

  /**
   * Store instance reference on select element
   */
  private storeInstance(): void {
    (
      this.selectElement as HTMLSelectElement & { multiSelectInstance?: MultiSelect }
    ).multiSelectInstance = this;
    MultiSelect.instances.add(this);
  }

  /* ===========================
     Public API Methods
     =========================== */

  /**
   * Get current selected values
   */
  public getValue(): string[] {
    return [...this.selectedValues];
  }

  /**
   * Set selected values programmatically
   */
  public setValue(values: string[]): void {
    this.selectedValues = [...values];
    syncNativeSelect(this.selectElement, this.selectedValues);

    // Update option data
    NestedOptions.flattenOptions(this.optionData).forEach((option) => {
      option.selected = this.selectedValues.includes(option.value);
    });

    // Update existing DOM elements if dropdown is open
    if (this.optionsList) {
      // Update existing checkboxes and aria-selected attributes
      NestedOptions.flattenOptions(this.optionData).forEach((option) => {
        const optionEl = this.optionsList?.querySelector(`[data-value="${option.value}"]`);
        if (optionEl) {
          // Update aria-selected
          optionEl.setAttribute('aria-selected', option.selected ? 'true' : 'false');

          // Update selected class
          if (option.selected) {
            addClass(optionEl as HTMLElement, 'ms-multiselect__option--selected');
          } else {
            removeClass(optionEl as HTMLElement, 'ms-multiselect__option--selected');
          }

          // Update checkbox
          const checkbox = optionEl.querySelector<HTMLInputElement>('.ms-multiselect__checkbox')!;
          if (checkbox) {
            checkbox.checked = option.selected;
          }
        }
      });
    }

    this.updateTriggerText();
    this.emitChangeEvent();
  }

  /**
   * Select all options
   */
  public selectAll(): void {
    const allValues = this.config.nestedOptions
      ? NestedOptions.getLeafOptions(this.optionData).map((opt) => opt.value)
      : this.optionData.map((opt) => opt.value);

    this.setValue(allValues);
  }

  /**
   * Clear all selections
   */
  public clearAll(): void {
    const previousValues = [...this.selectedValues];
    this.setValue([]);

    // Emit clear event
    const detail: MultiSelectClearEventDetail = {
      values: this.selectedValues,
      options: NestedOptions.getSelectedOptions(this.optionData),
      instance: this,
      previousValues,
    };
    this.emitEvent('multiselect:clear', detail);
  }

  /**
   * Open dropdown
   */
  public open(): void {
    if (this._isOpen) return;

    // Close all other instances
    MultiSelect.instances.forEach((instance) => {
      if (instance !== this && instance.isOpen) {
        instance.close();
      }
    });

    this._isOpen = true;
    removeClass(this.dropdown!, 'ms-multiselect__dropdown--hidden');
    this.trigger?.setAttribute('aria-expanded', 'true');
    addClass(this.trigger!, 'ms-multiselect__trigger--open');
    this.dropdown?.setAttribute('aria-hidden', 'false');

    // Position dropdown
    this.positionDropdown();

    // Focus management
    if (this.searchInput && this.config.searchEnabled && this.config.searchAutoFocus) {
      // Focus search input if enabled and auto-focus is on
      this.searchInput.focus();
    }
    // Always start with no option focused - user navigates with keyboard
    this.focusedOptionIndex = -1;

    // Announce to screen readers
    const optionCount = this.getVisibleOptions().length;
    this.announce(
      `Dropdown opened. ${String(optionCount)} option${optionCount === 1 ? '' : 's'} available.`
    );

    this.emitEvent('multiselect:open');
  }

  /**
   * Close dropdown
   */
  public close(): void {
    if (!this._isOpen) return;

    this._isOpen = false;
    addClass(this.dropdown!, 'ms-multiselect__dropdown--hidden');
    this.trigger?.setAttribute('aria-expanded', 'false');
    removeClass(this.trigger!, 'ms-multiselect__trigger--open');
    this.dropdown?.setAttribute('aria-hidden', 'true');

    // Blur any focused element inside dropdown
    if (this.dropdown && document.activeElement && this.dropdown.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }

    // Clear search if configured
    if (this.config.clearSearchOnClose && this.searchInput) {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.filteredData = null;
      if (this.optionsList) {
        this.renderOptions(this.optionsList);
      }
    }

    // Reset focused option
    this.focusedOptionIndex = -1;

    // Focus management based on config
    if (this.config.returnFocusOnClose) {
      // Return focus to trigger button
      this.trigger?.focus();
    } else {
      // Blur the trigger button to remove focus
      this.trigger?.blur();
    }

    // Announce to screen readers
    const count = this.selectedValues.length;
    this.announce(`Dropdown closed. ${String(count)} item${count === 1 ? '' : 's'} selected.`);

    this.emitEvent('multiselect:close');
  }

  /**
   * Position dropdown
   */
  private positionDropdown(): void {
    if (!this.trigger || !this.dropdown || !this.optionsList) return;

    // Calculate max height to prevent dropdown from going off-screen
    const triggerRect = this.trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Get position from utility function
    const { left, position } = getDropdownPosition(
      this.trigger,
      this.dropdown,
      this.config.position
    );

    // Calculate available height based on position
    let availableHeight: number;
    if (position === 'bottom') {
      // Space below trigger
      availableHeight = viewportHeight - triggerRect.bottom - 20; // 20px margin
    } else {
      // Space above trigger
      availableHeight = triggerRect.top - 20; // 20px margin
    }

    // Calculate height for search and footer
    const searchHeight = this.searchInput?.parentElement?.offsetHeight ?? 0;
    const footerHeight = this.footer?.offsetHeight ?? 0;
    const reservedHeight = searchHeight + footerHeight;

    // Apply max height to options list (not dropdown)
    // Respect the configured maxHeight
    const maxOptionsHeight = Math.min(availableHeight - reservedHeight, this.config.maxHeight);
    this.optionsList.style.maxHeight = `${String(Math.max(100, maxOptionsHeight))}px`;

    // Calculate dropdown total height (search + options + footer)
    const dropdownHeight = searchHeight + Math.max(100, maxOptionsHeight) + footerHeight;

    // Calculate top position based on dropdown height
    let top: number;
    if (position === 'bottom') {
      top = this.trigger.offsetHeight;
    } else {
      // Position above trigger
      top = -dropdownHeight;
    }

    // Apply positioning
    this.dropdown.style.position = 'absolute';
    this.dropdown.style.top = `${String(top)}px`;
    this.dropdown.style.left = `${String(left)}px`;
    this.dropdown.style.width = `${String(this.trigger.offsetWidth)}px`;

    // Add position class
    toggleClass(this.dropdown, 'ms-multiselect__dropdown--top', position === 'top');
    toggleClass(this.dropdown, 'ms-multiselect__dropdown--bottom', position === 'bottom');
  }

  /**
   * Toggle dropdown
   */
  public toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Refresh - re-sync with native select
   */
  public refresh(): void {
    this.parseOptions();
    this.updateTriggerText();

    // Re-render options list
    if (this.optionsList) {
      this.renderOptions(this.optionsList);
    }
  }

  /**
   * Destroy instance
   */
  public destroy(): void {
    // Remove event listeners
    this.eventHandlers.forEach((handler, key) => {
      if (key === 'window:resize') {
        window.removeEventListener('resize', handler);
      } else if (key === 'window:scroll') {
        window.removeEventListener('scroll', handler, true);
      } else if (key === 'document:click') {
        document.removeEventListener('click', handler);
      } else if (key === 'document:keydown') {
        document.removeEventListener('keydown', handler);
      }
      // Element-specific handlers are cleaned up when container is removed
    });
    this.eventHandlers.clear();

    // Remove custom UI
    this.container?.remove();

    // Show original select
    this.selectElement.style.display = '';
    this.selectElement.removeAttribute('aria-hidden');

    // Remove instance reference
    delete (this.selectElement as HTMLSelectElement & { multiSelectInstance?: MultiSelect })
      .multiSelectInstance;
    MultiSelect.instances.delete(this);
  }

  /**
   * Enable component
   */
  public enable(): void {
    this.trigger?.removeAttribute('disabled');
    this.selectElement.disabled = false;
  }

  /**
   * Disable component
   */
  public disable(): void {
    this.trigger?.setAttribute('disabled', 'true');
    this.selectElement.disabled = true;
    if (this._isOpen) {
      this.close();
    }
  }

  /**
   * Expand all parent groups
   */
  public expandAll(): void {
    if (!this.config.nestedOptions) return;
    NestedOptions.expandAll(this.optionData);

    // Re-render options list
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }
  }

  /**
   * Collapse all parent groups
   */
  public collapseAll(): void {
    if (!this.config.nestedOptions) return;
    NestedOptions.collapseAll(this.optionData);

    // Re-render options list
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }
  }

  /**
   * Expand specific group
   */
  public expandGroup(groupValue: string): void {
    if (!this.config.nestedOptions) return;
    const option = NestedOptions.findOption(this.optionData, groupValue);
    if (option && option.children.length > 0 && !option.expanded) {
      option.expanded = true;

      // Update DOM if options list exists
      if (this.optionsList) {
        const parentEl = this.optionsList.querySelector(`[data-value="${option.value}"]`);
        if (parentEl) {
          // Update aria-expanded
          parentEl.setAttribute('aria-expanded', 'true');

          // Update expand icon
          const expandIcon = parentEl.querySelector('.ms-multiselect__expand-icon');
          if (expandIcon) {
            expandIcon.textContent = this.config.expandIconExpanded;
            addClass(expandIcon as HTMLElement, 'ms-multiselect__expand-icon--expanded');
          }

          // Render and insert children after parent
          let insertAfter: Element = parentEl;
          option.children.forEach((child) => {
            const childEl = this.renderOption(child);
            insertAfter.insertAdjacentElement('afterend', childEl);
            insertAfter = childEl;
          });
        }
      }

      // Emit expand event
      const detail: MultiSelectGroupEventDetail = {
        group: option.value,
        values: this.selectedValues,
        options: NestedOptions.getSelectedOptions(this.optionData),
        instance: this,
      };
      this.emitEvent('multiselect:expand', detail);
    }
  }

  /**
   * Collapse specific group
   */
  public collapseGroup(groupValue: string): void {
    if (!this.config.nestedOptions) return;
    const option = NestedOptions.findOption(this.optionData, groupValue);
    if (option && option.children.length > 0 && option.expanded) {
      option.expanded = false;

      // Update DOM if options list exists
      if (this.optionsList) {
        const parentEl = this.optionsList.querySelector(`[data-value="${option.value}"]`);
        if (parentEl) {
          // Update aria-expanded
          parentEl.setAttribute('aria-expanded', 'false');

          // Update expand icon
          const expandIcon = parentEl.querySelector('.ms-multiselect__expand-icon');
          if (expandIcon) {
            expandIcon.textContent = this.config.expandIconCollapsed;
            removeClass(expandIcon as HTMLElement, 'ms-multiselect__expand-icon--expanded');
          }

          // Remove children from DOM
          option.children.forEach((child) => {
            const childEl = this.optionsList?.querySelector(`[data-value="${child.value}"]`);
            if (childEl) {
              childEl.remove();
            }
          });
        }
      }

      // Emit collapse event
      const detail: MultiSelectGroupEventDetail = {
        group: option.value,
        values: this.selectedValues,
        options: NestedOptions.getSelectedOptions(this.optionData),
        instance: this,
      };
      this.emitEvent('multiselect:collapse', detail);
    }
  }

  /* ===========================
     Event Emission Helpers
     =========================== */

  private emitChangeEvent(): void {
    const selectedOptions = NestedOptions.getSelectedOptions(this.optionData);
    this.emitEvent('change', {
      values: this.selectedValues,
      options: selectedOptions,
      instance: this,
    });
  }

  private emitEvent(eventName: string, detail?: MultiSelectEventDetail): void {
    const event = new CustomEvent(eventName, {
      detail: detail ?? {
        values: this.selectedValues,
        options: NestedOptions.getSelectedOptions(this.optionData),
        instance: this,
      },
      bubbles: true,
      cancelable: true,
    });
    this.selectElement.dispatchEvent(event);
  }

  /* ===========================
     Static Methods
     =========================== */

  /**
   * Initialize multiple instances
   */
  public static init(selector: string, config: Partial<MultiSelectConfig> = {}): MultiSelect[] {
    const elements = document.querySelectorAll<HTMLSelectElement>(selector);
    return Array.from(elements).map((element) => new MultiSelect(element, config));
  }
}

// Export as default
export default MultiSelect;
