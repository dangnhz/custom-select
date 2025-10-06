import type { SearchStrategy } from './types';

/* ===========================
   DOM Utilities
   =========================== */

/**
 * Create a DOM element with optional class name and attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}

/**
 * Add CSS class to element
 */
export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

/**
 * Remove CSS class from element
 */
export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

/**
 * Toggle CSS class on element
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): void {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
}

/**
 * Check if element has CSS class
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/* ===========================
   Event Utilities
   =========================== */

/**
 * Add event listener to element
 */
export function on<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Document | Window,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  element.addEventListener(event, handler as EventListener, options);
}

/**
 * Remove event listener from element
 */
export function off<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Document | Window,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void
): void {
  element.removeEventListener(event, handler as EventListener);
}

/**
 * Dispatch custom event on element
 */
export function trigger<T = unknown>(
  element: HTMLElement,
  eventName: string,
  detail?: T
): boolean {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
  });
  return element.dispatchEvent(event);
}

/* ===========================
   Search Utilities
   =========================== */

/**
 * Normalize text for searching (lowercase, trim)
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Match text against query based on search strategy
 */
export function searchMatch(text: string, query: string, strategy: SearchStrategy): boolean {
  if (!query) return true;

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  switch (strategy) {
    case 'exact':
      return normalizedText === normalizedQuery;
    case 'startsWith':
      return normalizedText.startsWith(normalizedQuery);
    case 'contains':
    default:
      return normalizedText.includes(normalizedQuery);
  }
}

/* ===========================
   Selection Utilities
   =========================== */

/**
 * Get array of selected values from native select element
 */
export function getSelectedValues(selectElement: HTMLSelectElement): string[] {
  return Array.from(selectElement.selectedOptions).map((option) => option.value);
}

/**
 * Set selected values on native select element
 */
export function setSelectedValues(selectElement: HTMLSelectElement, values: string[]): void {
  const valueSet = new Set(values);

  Array.from(selectElement.options).forEach((option) => {
    option.selected = valueSet.has(option.value);
  });
}

/**
 * Sync custom UI selection with native select element
 * Note: Does not emit change event - caller should handle that
 */
export function syncNativeSelect(selectElement: HTMLSelectElement, values: string[]): void {
  setSelectedValues(selectElement, values);
}

/* ===========================
   Positioning Utilities
   =========================== */

/**
 * Get viewport dimensions
 */
export function getViewportBounds(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportBounds();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
}

/**
 * Calculate dropdown position based on trigger and available space
 * Position is relative to the container (which has position: relative)
 */
export function getDropdownPosition(
  triggerElement: HTMLElement,
  _dropdownElement: HTMLElement,
  position: 'auto' | 'top' | 'bottom'
): { top: number; left: number; position: 'top' | 'bottom' } {
  const triggerRect = triggerElement.getBoundingClientRect();
  const viewport = getViewportBounds();

  const spaceBelow = viewport.height - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  let finalPosition: 'top' | 'bottom';

  if (position === 'auto') {
    // Always use bottom position for consistency unless there's very little space
    // This ensures consistent behavior across all screen sizes
    const minSpaceRequired = 150; // Minimum space needed for bottom position

    if (spaceBelow >= minSpaceRequired) {
      // Use bottom if there's at least minimum space
      finalPosition = 'bottom';
    } else if (spaceAbove > spaceBelow) {
      // Only use top if there's more space above and not enough below
      finalPosition = 'top';
    } else {
      // Default to bottom for consistency
      finalPosition = 'bottom';
    }
  } else {
    finalPosition = position;
  }

  // Position relative to container (trigger's parent)
  const top = finalPosition === 'bottom' ? triggerElement.offsetHeight : 0;
  const left = 0; // Align with trigger (same width as trigger)

  return { top, left, position: finalPosition };
}

/* ===========================
   String Utilities
   =========================== */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format selected count text with singular/plural templates
 */
export function formatSelectedText(
  count: number,
  singular: string,
  plural: string
): string {
  const template = count === 1 ? singular : plural;
  return template.replace('{count}', count.toString());
}

/* ===========================
   Array Utilities
   =========================== */

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Check if arrays are equal
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

/* ===========================
   Focus Utilities
   =========================== */

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Trap focus within a container
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key !== 'Tab') return;

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/* ===========================
   Debounce/Throttle Utilities
   =========================== */

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    const context = this;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
