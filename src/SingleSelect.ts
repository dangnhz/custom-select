import type {
  SingleSelectConfig,
  SingleSelectInstance,
  OptionData,
  SingleSelectEventDetail,
  SingleSelectSearchEventDetail,
  SingleSelectClearEventDetail,
  SingleSelectGroupEventDetail,
} from './types';
import * as NestedOptions from './NestedOptions';
import {
  getSelectedValues,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  searchMatch,
  getDropdownPosition,
  trapFocus,
  debounce,
} from './utils';

/**
 * Default configuration for SingleSelect
 */
const DEFAULT_CONFIG: SingleSelectConfig = {
  // Basic Options
  placeholder: 'Select an option...',
  searchPlaceholder: 'Search...',
  searchEnabled: true,
  searchDebounce: 300,

  // Footer Options
  showClose: true,
  closeText: 'Close',
  showClear: false,
  clearText: 'Clear',

  // Dropdown Options
  maxHeight: 300,
  position: 'auto',
  closeOnOutsideClick: true,
  returnFocusOnClose: false,
  closeOnSelect: true,

  // Search Options
  searchStrategy: 'contains',
  clearSearchOnClose: true,
  searchAutoFocus: false,

  // Performance Options
  animation: true,

  // Single-Select Specific
  showRadioButtons: true,
  allowDeselect: false,

  // Nested Options
  nestedOptions: false,
  expandOnSearch: true,
  defaultExpanded: false,
  indentSize: 20,
  expandIconCollapsed: '▶',
  expandIconExpanded: '▼',
};

/**
 * SingleSelect class - Single-select dropdown component
 */
export class SingleSelect implements SingleSelectInstance {
  // Static registry of all instances
  private static instances = new Set<SingleSelect>();

  // Core properties
  public readonly config: SingleSelectConfig;
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
  private selectedValue: string | null = null;
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
  constructor(selector: string | HTMLSelectElement, config: Partial<SingleSelectConfig> = {}) {
    // Find select element
    if (typeof selector === 'string') {
      const element = document.querySelector<HTMLSelectElement>(selector);
      if (!element) {
        throw new Error(`SingleSelect: Element not found: ${selector}`);
      }
      if (element.tagName !== 'SELECT') {
        throw new Error(`SingleSelect: Element is not a <select>: ${selector}`);
      }
      this.selectElement = element;
    } else {
      // Validate element type
      if (selector.tagName !== 'SELECT') {
        throw new Error('SingleSelect: Element is not a <select>');
      }
      this.selectElement = selector;
    }

    // Validate it's NOT a multi-select
    if (this.selectElement.multiple) {
      throw new Error(
        'SingleSelect: <select> element must NOT have "multiple" attribute. Use MultiSelect for multi-select dropdowns.'
      );
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

    // Get initial selected value
    const selected = getSelectedValues(this.selectElement);
    // Treat empty string as null for single select
    this.selectedValue = selected.length > 0 && selected[0] !== '' ? selected[0]! : null;

    // Update option data with selected state
    if (this.selectedValue) {
      const option = NestedOptions.findOption(this.optionData, this.selectedValue);
      if (option) {
        option.selected = true;
      }
    }
  }

  /**
   * Create custom UI structure
   */
  private createUI(): void {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'ss-singleselect';

    // Add no-animation class if animations are disabled
    if (!this.config.animation) {
      addClass(this.container, 'ss-singleselect--no-animation');
    }

    // Create trigger button
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
    const trigger = createElement('button', 'ss-singleselect__trigger', {
      type: 'button',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-label': 'Single-select dropdown',
    });

    // Add caret icon
    const caret = createElement('span', 'ss-singleselect__caret', {
      'aria-hidden': 'true',
    });
    trigger.appendChild(caret);

    return trigger;
  }

  /**
   * Create dropdown panel
   */
  private createDropdown(): HTMLElement {
    const dropdownId = `ss-dropdown-${Math.random().toString(36).slice(2, 11)}`;
    const dropdown = createElement(
      'div',
      'ss-singleselect__dropdown ss-singleselect__dropdown--hidden',
      {
        id: dropdownId,
        role: 'dialog',
        'aria-label': 'Single-select options',
        'aria-hidden': 'true',
        'aria-modal': 'false',
        inert: '',
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
    this.liveRegion = createElement('div', 'ss-singleselect__live-region', {
      role: 'status',
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
    const searchContainer = createElement('div', 'ss-singleselect__search');

    this.searchInput = createElement('input', 'ss-singleselect__search-input', {
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
    const list = createElement('div', 'ss-singleselect__options', {
      role: 'listbox',
      'aria-multiselectable': 'false',
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
      const emptyMsg = createElement('div', 'ss-singleselect__empty');
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
    const optionEl = createElement('div', 'ss-singleselect__option', {
      role: 'option',
      'aria-selected': option.selected ? 'true' : 'false',
      'data-value': option.value,
      tabindex: option.disabled ? '-1' : '0',
    });

    if (option.disabled) {
      addClass(optionEl, 'ss-singleselect__option--disabled');
      optionEl.setAttribute('aria-disabled', 'true');
    }

    if (option.selected) {
      addClass(optionEl, 'ss-singleselect__option--selected');
    }

    // Add indentation for nested levels
    if (this.config.nestedOptions && option.level > 0) {
      optionEl.style.paddingLeft = `${String(option.level * this.config.indentSize)}px`;
      addClass(optionEl, `ss-singleselect__option--level-${String(option.level)}`);
      addClass(optionEl, 'ss-singleselect__option--child');
    }

    // Parent group with expand/collapse icon
    if (this.config.nestedOptions && option.children.length > 0) {
      addClass(optionEl, 'ss-singleselect__option--parent');
      optionEl.setAttribute('aria-expanded', option.expanded ? 'true' : 'false');

      const expandIcon = createElement('span', 'ss-singleselect__expand-icon');
      expandIcon.textContent = option.expanded
        ? this.config.expandIconExpanded
        : this.config.expandIconCollapsed;
      if (option.expanded) {
        addClass(expandIcon, 'ss-singleselect__expand-icon--expanded');
      }
      expandIcon.setAttribute('data-action', 'expand');
      optionEl.appendChild(expandIcon);
    }

    // Radio button (if showRadioButtons is true and not a parent group)
    if (this.config.showRadioButtons && !option.children.length) {
      const radioLabel = createElement('label', 'ss-singleselect__radio-label');

      const radio = createElement('input', 'ss-singleselect__radio', {
        type: 'radio',
        name: `ss-radio-${this.selectElement.id || 'select'}`,
        'aria-label': option.text,
        'aria-hidden': 'true',
        tabindex: '-1',
      });

      radio.checked = option.selected;
      radio.disabled = option.disabled;

      radioLabel.appendChild(radio);

      // Add custom radio visual
      const radioCustom = createElement('span', 'ss-singleselect__radio-custom');
      radioLabel.appendChild(radioCustom);

      optionEl.appendChild(radioLabel);
    }

    // Option text
    const textEl = createElement('span', 'ss-singleselect__option-text');
    textEl.textContent = option.text;
    optionEl.appendChild(textEl);

    return optionEl;
  }

  /**
   * Render footer
   */
  private renderFooter(): HTMLElement | null {
    // Don't create footer if no buttons are shown
    if (!this.config.showClear && !this.config.showClose) {
      return null;
    }

    const footer = createElement('div', 'ss-singleselect__footer');

    if (this.config.showClear) {
      const clearBtn = createElement(
        'button',
        'ss-singleselect__button ss-singleselect__button--clear',
        {
          type: 'button',
        }
      );
      clearBtn.textContent = this.config.clearText;
      clearBtn.setAttribute('data-action', 'clear');
      footer.appendChild(clearBtn);
    }

    if (this.config.showClose) {
      const closeBtn = createElement(
        'button',
        'ss-singleselect__button ss-singleselect__button--close',
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
   * Update trigger button text
   */
  private updateTriggerText(): void {
    if (!this.trigger) return;

    // Get or create text container (preserve caret)
    let textContainer = this.trigger.querySelector('.ss-singleselect__trigger-text');
    if (!textContainer) {
      textContainer = createElement('span', 'ss-singleselect__trigger-text');
      // Insert before caret
      const caret = this.trigger.querySelector('.ss-singleselect__caret');
      if (caret) {
        this.trigger.insertBefore(textContainer, caret);
      } else {
        this.trigger.appendChild(textContainer);
      }
    }

    if (this.selectedValue) {
      const selected = NestedOptions.findOption(this.optionData, this.selectedValue);
      textContainer.textContent = selected?.text ?? this.config.placeholder;
    } else {
      textContainer.textContent = this.config.placeholder;
    }
  }

  /**
   * Bind event handlers
   */
  private bindEvents(): void {
    // Trigger button click
    const triggerClickHandler = () => {
      this.toggle();
    };
    this.trigger?.addEventListener('click', triggerClickHandler);
    this.eventHandlers.set('trigger:click', triggerClickHandler);

    // Trigger button keyboard
    const triggerKeyHandler = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Enter' || ke.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    };
    this.trigger?.addEventListener('keydown', triggerKeyHandler);
    this.eventHandlers.set('trigger:keydown', triggerKeyHandler);

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

      // Note: Enter/Space handling is done in handleKeyboardNav which works for both
      // Arrow key navigation and Tab navigation (via focusedOptionIndex sync)

      // Focus handler to sync focusedOptionIndex when tabbing through options
      const optionsFocusHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('ss-singleselect__option')) {
          const value = target.getAttribute('data-value');
          if (value !== null) {
            const visibleOptions = this.getVisibleOptions();
            const index = visibleOptions.findIndex((opt) => opt.value === value);
            if (index !== -1) {
              this.focusedOptionIndex = index;
              this.updateOptionFocus(visibleOptions);
            }
          }
        }
      };
      this.optionsList.addEventListener('focusin', optionsFocusHandler);
      this.eventHandlers.set('options:focusin', optionsFocusHandler);
    }

    // Footer buttons - event delegation
    if (this.footer) {
      const footerClickHandler = (e: Event) => {
        this.handleFooterClick(e as MouseEvent);
      };
      this.footer.addEventListener('click', footerClickHandler);
      this.eventHandlers.set('footer:click', footerClickHandler);
    }

    // Outside click (use mousedown to detect before click is processed)
    const outsideClickHandler = (e: Event) => {
      this.handleOutsideClick(e as MouseEvent);
    };
    document.addEventListener('mousedown', outsideClickHandler);
    this.eventHandlers.set('document:mousedown', outsideClickHandler);

    // Escape key
    const escapeHandler = (e: Event) => {
      this.handleEscapeKey(e as KeyboardEvent);
    };
    document.addEventListener('keydown', escapeHandler);
    this.eventHandlers.set('document:keydown', escapeHandler);

    // Keyboard navigation (on document for global keyboard access)
    const keyboardHandler = (e: Event) => {
      this.handleKeyboardNav(e as KeyboardEvent);
    };
    document.addEventListener('keydown', keyboardHandler);
    this.eventHandlers.set('document:keydown:nav', keyboardHandler);

    // Track focus changes from Tab navigation
    if (this.dropdown) {
      const focusHandler = (e: Event) => {
        this.handleFocusChange(e as FocusEvent);
      };
      this.dropdown.addEventListener('focusin', focusHandler, true);
      this.eventHandlers.set('dropdown:focusin', focusHandler);
    }

    // Prevent dropdown clicks from bubbling to document
    if (this.dropdown) {
      const dropdownClickHandler = (e: Event) => {
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
    window.addEventListener('scroll', scrollHandler, true);
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
    const selectedOption = this.selectedValue
      ? NestedOptions.findOption(this.optionData, this.selectedValue)
      : null;
    const detail: SingleSelectSearchEventDetail = {
      query,
      resultsCount: this.filteredData?.length ?? this.optionData.length,
      value: this.selectedValue,
      option: selectedOption,
      instance: this,
    };
    this.emitEvent('singleselect:search', detail);
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
    const optionEl = target.closest('.ss-singleselect__option');

    if (!optionEl) return;

    const value = optionEl.getAttribute('data-value');
    if (value === null) return; // Only return if attribute doesn't exist

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
   * Handle option click (selection)
   */
  private handleOptionClick(option: OptionData): void {
    // Don't allow selecting disabled options
    if (option.disabled) {
      return;
    }

    const wasSelected = option.selected;

    // Deselect all options first
    this.optionData.forEach((opt) => {
      NestedOptions.flattenOptions([opt]).forEach((flatOpt) => {
        flatOpt.selected = false;
      });
    });

    // Select clicked option (unless it was already selected and allowDeselect is true)
    if (!(wasSelected && this.config.allowDeselect)) {
      option.selected = true;
      // Treat empty string as null
      this.selectedValue = option.value === '' ? null : option.value;
    } else {
      this.selectedValue = null;
    }

    // Sync with native select
    this.selectElement.value = this.selectedValue ?? '';

    // Update UI
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }
    this.updateTriggerText();

    // Announce selection change
    if (this.selectedValue) {
      this.announce(`${option.text} selected.`);
    } else {
      this.announce('Selection cleared.');
    }

    // Emit change event
    this.emitChangeEvent();

    // Auto-close if configured
    if (this.config.closeOnSelect) {
      setTimeout(() => {
        this.close();
      }, 100); // Small delay for UX
    }
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
    const selectedOption = this.selectedValue
      ? NestedOptions.findOption(this.optionData, this.selectedValue)
      : null;
    const detail: SingleSelectGroupEventDetail = {
      group: option.value,
      value: this.selectedValue,
      option: selectedOption,
      instance: this,
    };
    this.emitEvent(option.expanded ? 'singleselect:expand' : 'singleselect:collapse', detail);
  }

  /**
   * Handle footer button clicks
   */
  private handleFooterClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const action = target.getAttribute('data-action');

    if (action === 'clear') {
      this.handleClear();
    } else if (action === 'close') {
      this.handleClose();
    }
  }

  /**
   * Handle clear button
   */
  private handleClear(): void {
    this.clear();
    this.announce('Selection cleared.');
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

    // If a radio button receives focus, update focusedOptionIndex
    if (target?.classList.contains('ss-singleselect__radio')) {
      const optionEl = target.closest('.ss-singleselect__option');
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
    } else if (target && !target.classList.contains('ss-singleselect__search-input')) {
      // Focus moved to non-option element (like footer buttons), reset focusedOptionIndex
      this.focusedOptionIndex = -1;
      // Clear focused class from all options
      if (this.optionsList) {
        const allOptions = this.optionsList.querySelectorAll('.ss-singleselect__option');
        allOptions.forEach((el) => {
          el.classList.remove('ss-singleselect__option--focused');
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

    // Enter or Space - select option
    if ((e.key === 'Enter' || e.key === ' ') && this.focusedOptionIndex >= 0) {
      e.preventDefault();
      const option = visibleOptions[this.focusedOptionIndex];
      if (option && !option.disabled) {
        this.handleOptionClick(option);

        // Restore focus to the radio button after selection if not closing
        if (!this.config.closeOnSelect) {
          requestAnimationFrame(() => {
            const optionEl = this.optionsList?.querySelector(`[data-value="${option.value}"]`);
            if (optionEl) {
              const radio = optionEl.querySelector<HTMLInputElement>('.ss-singleselect__radio');
              if (radio) {
                radio.focus();
              }
            }
          });
        }
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
    const allOptions = this.optionsList.querySelectorAll('.ss-singleselect__option');
    allOptions.forEach((el) => {
      el.classList.remove('ss-singleselect__option--focused');
    });

    // Add focus class to current
    if (this.focusedOptionIndex >= 0 && this.focusedOptionIndex < visibleOptions.length) {
      const focusedOption = visibleOptions[this.focusedOptionIndex];
      if (focusedOption) {
        const optionEl = this.optionsList.querySelector(
          `.ss-singleselect__option[data-value="${focusedOption.value}"]`
        );
        if (optionEl) {
          optionEl.classList.add('ss-singleselect__option--focused');
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
      this.selectElement as HTMLSelectElement & { singleSelectInstance?: SingleSelect }
    ).singleSelectInstance = this;
    SingleSelect.instances.add(this);
  }

  /* ===========================
     Public API Methods
     =========================== */

  /**
   * Get current selected value
   */
  public getValue(): string | null {
    return this.selectedValue;
  }

  /**
   * Set selected value programmatically
   */
  public setValue(value: string | null): void {
    // Treat empty string as null for single select
    const newValue = value === '' ? null : value;

    // If allowDeselect is enabled and setting the same value, deselect it
    if (newValue === this.selectedValue && this.config.allowDeselect && newValue !== null) {
      this.clear();
      return;
    }

    // Don't emit change if value hasn't changed
    if (newValue === this.selectedValue) {
      return;
    }

    this.selectedValue = newValue;

    // Update option data
    NestedOptions.flattenOptions(this.optionData).forEach((option) => {
      option.selected = option.value === newValue;
    });

    // Sync with native select
    this.selectElement.value = newValue ?? '';

    // Update UI
    if (this.optionsList) {
      this.renderOptions(this.optionsList, this.filteredData ?? undefined);
    }
    this.updateTriggerText();

    this.emitChangeEvent();

    // Auto-close if configured and dropdown is open
    if (this._isOpen && this.config.closeOnSelect) {
      setTimeout(() => {
        this.close();
      }, 100); // Small delay for UX
    }
  }

  /**
   * Clear selection
   */
  public clear(): void {
    // Don't emit if already cleared
    if (this.selectedValue === null) {
      return;
    }

    const previousValue = this.selectedValue;
    this.setValue(null);

    // Emit clear event
    const detail: SingleSelectClearEventDetail = {
      value: null,
      option: null,
      instance: this,
      previousValue,
    };
    this.emitEvent('singleselect:clear', detail);
  }

  /**
   * Open dropdown
   */
  public open(): void {
    if (this._isOpen) return;

    // Close all other instances
    SingleSelect.instances.forEach((instance) => {
      if (instance !== this && instance.isOpen) {
        instance.close();
      }
    });

    this._isOpen = true;
    removeClass(this.dropdown!, 'ss-singleselect__dropdown--hidden');
    this.trigger?.setAttribute('aria-expanded', 'true');
    addClass(this.trigger!, 'ss-singleselect__trigger--open');
    this.dropdown?.setAttribute('aria-hidden', 'false');

    // Remove inert to allow focus within dropdown
    this.dropdown?.removeAttribute('inert');

    // Position dropdown
    this.positionDropdown();

    // Focus management
    if (this.searchInput && this.config.searchEnabled && this.config.searchAutoFocus) {
      // Focus search input if enabled and auto-focus is on
      this.searchInput.focus();
    }
    // Start with no option focused (user will navigate with keyboard)
    this.focusedOptionIndex = -1;

    // Announce to screen readers
    const optionCount = this.getVisibleOptions().length;
    this.announce(
      `Dropdown opened. ${String(optionCount)} option${optionCount === 1 ? '' : 's'} available.`
    );

    this.emitEvent('singleselect:open');
  }

  /**
   * Close dropdown
   */
  public close(): void {
    if (!this._isOpen) return;

    this._isOpen = false;
    addClass(this.dropdown!, 'ss-singleselect__dropdown--hidden');
    this.trigger?.setAttribute('aria-expanded', 'false');
    removeClass(this.trigger!, 'ss-singleselect__trigger--open');
    this.dropdown?.setAttribute('aria-hidden', 'true');

    // Add inert to prevent focus on hidden dropdown elements
    this.dropdown?.setAttribute('inert', '');

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
    if (this.selectedValue) {
      const selected = NestedOptions.findOption(this.optionData, this.selectedValue);
      this.announce(`Dropdown closed. ${selected?.text ?? 'No selection'}.`);
    } else {
      this.announce('Dropdown closed. No selection.');
    }

    this.emitEvent('singleselect:close');
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
    toggleClass(this.dropdown, 'ss-singleselect__dropdown--top', position === 'top');
    toggleClass(this.dropdown, 'ss-singleselect__dropdown--bottom', position === 'bottom');
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
      } else if (key === 'document:mousedown') {
        document.removeEventListener('mousedown', handler);
      } else if (key.startsWith('document:keydown')) {
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
    delete (this.selectElement as HTMLSelectElement & { singleSelectInstance?: SingleSelect })
      .singleSelectInstance;
    SingleSelect.instances.delete(this);
  }

  /**
   * Enable component
   */
  public enable(): void {
    if (this.trigger) {
      (this.trigger as HTMLButtonElement).disabled = false;
    }
    this.selectElement.disabled = false;
  }

  /**
   * Disable component
   */
  public disable(): void {
    if (this.trigger) {
      (this.trigger as HTMLButtonElement).disabled = true;
    }
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
          const expandIcon = parentEl.querySelector('.ss-singleselect__expand-icon');
          if (expandIcon) {
            expandIcon.textContent = this.config.expandIconExpanded;
            addClass(expandIcon as HTMLElement, 'ss-singleselect__expand-icon--expanded');
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
      const selectedOption = this.selectedValue
        ? NestedOptions.findOption(this.optionData, this.selectedValue)
        : null;
      const detail: SingleSelectGroupEventDetail = {
        group: option.value,
        value: this.selectedValue,
        option: selectedOption,
        instance: this,
      };
      this.emitEvent('singleselect:expand', detail);
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
          const expandIcon = parentEl.querySelector('.ss-singleselect__expand-icon');
          if (expandIcon) {
            expandIcon.textContent = this.config.expandIconCollapsed;
            removeClass(expandIcon as HTMLElement, 'ss-singleselect__expand-icon--expanded');
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
      const selectedOption = this.selectedValue
        ? NestedOptions.findOption(this.optionData, this.selectedValue)
        : null;
      const detail: SingleSelectGroupEventDetail = {
        group: option.value,
        value: this.selectedValue,
        option: selectedOption,
        instance: this,
      };
      this.emitEvent('singleselect:collapse', detail);
    }
  }

  /* ===========================
     Event Emission Helpers
     =========================== */

  private emitChangeEvent(): void {
    const selectedOption = this.selectedValue
      ? NestedOptions.findOption(this.optionData, this.selectedValue)
      : null;
    this.emitEvent('change', {
      value: this.selectedValue,
      option: selectedOption,
      instance: this,
    });
  }

  private emitEvent(eventName: string, detail?: SingleSelectEventDetail): void {
    const selectedOption = this.selectedValue
      ? NestedOptions.findOption(this.optionData, this.selectedValue)
      : null;
    const event = new CustomEvent(eventName, {
      detail: detail ?? {
        value: this.selectedValue,
        option: selectedOption,
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
  public static init(selector: string, config: Partial<SingleSelectConfig> = {}): SingleSelect[] {
    const elements = document.querySelectorAll<HTMLSelectElement>(selector);
    return Array.from(elements).map((element) => new SingleSelect(element, config));
  }
}

// Export as default
export default SingleSelect;
