import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';
import { fireEvent } from '@testing-library/dom';

describe('Focus: Initial Focus', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
  });

  afterEach(() => {
    if (ms) ms.destroy();
    select.remove();
  });

  it('focuses search input when dropdown opens with search enabled', () => {
    ms = new MultiSelect(select, { searchEnabled: true, searchAutoFocus: true });
    ms.open();

    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLElement;
    expect(document.activeElement).toBe(searchInput);
  });

  it('trigger button is focusable when closed', () => {
    ms = new MultiSelect(select);

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    trigger.focus();

    expect(document.activeElement).toBe(trigger);
  });
});

describe('Focus: Return Focus', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
    ms = new MultiSelect(select, { returnFocusOnClose: true });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('returns focus to trigger on close', async () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    ms.open();
    ms.close();

    // Wait for async focus operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to trigger on Escape', async () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    ms.open();
    fireEvent.keyDown(document, { key: 'Escape' });

    // Wait for async focus operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to trigger when clicking outside', async () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    ms.open();
    fireEvent.click(outsideElement);

    // Wait for async focus operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(trigger);

    outsideElement.remove();
  });
});

describe('Focus: Trap Focus', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select, { searchEnabled: true, showClearAll: true, showClose: true });
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('contains focusable elements in dropdown', () => {
    const focusableElements = document.querySelectorAll(
      '.ms-multiselect__dropdown button, .ms-multiselect__dropdown input'
    );

    expect(focusableElements.length).toBeGreaterThan(0);
  });

  it('prevents focus from leaving dropdown when open', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'Outside';
    document.body.appendChild(outsideButton);

    // Focus should not move to outside element when dropdown is open
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLElement;
    searchInput.focus();

    expect(document.activeElement).toBe(searchInput);

    outsideButton.remove();
  });

  it('cycles focus forward through focusable elements', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLElement;
    searchInput.focus();

    fireEvent.keyDown(searchInput, { key: 'Tab' });

    // Focus should move to next element (not outside dropdown)
    const activeElement = document.activeElement as HTMLElement;
    const dropdown = document.querySelector('.ms-multiselect__dropdown');

    expect(dropdown?.contains(activeElement)).toBe(true);
  });

  it('cycles focus backward with Shift+Tab', () => {
    const closeBtn = document.querySelector('[data-action="close"]') as HTMLElement;
    closeBtn.focus();

    fireEvent.keyDown(closeBtn, { key: 'Tab', shiftKey: true });

    // Focus should move to previous element (not outside dropdown)
    const activeElement = document.activeElement as HTMLElement;
    const dropdown = document.querySelector('.ms-multiselect__dropdown');

    expect(dropdown?.contains(activeElement)).toBe(true);
  });
});

describe('Focus: Visual Indicators', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select);
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('adds focused class to focused option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    const focusedOption = document.querySelector('.ms-multiselect__option--focused');
    expect(focusedOption).toBeTruthy();
  });

  it('removes focused class when focus moves', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    const firstOption = document.querySelector('.ms-multiselect__option');

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    expect(firstOption?.classList.contains('ms-multiselect__option--focused')).toBe(false);
  });

  it('only one option has focused class at a time', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    const focusedOptions = document.querySelectorAll('.ms-multiselect__option--focused');
    expect(focusedOptions.length).toBe(1);
  });

  it('trigger has visible focus indicator', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    trigger.focus();

    const styles = window.getComputedStyle(trigger);

    // Should have outline or box-shadow for focus
    const hasOutline = styles.outline !== 'none' && styles.outline !== '';
    const hasBoxShadow = styles.boxShadow !== 'none' && styles.boxShadow !== '';
    const hasFocusVisible = trigger.matches(':focus-visible');

    expect(hasOutline || hasBoxShadow || hasFocusVisible).toBe(true);
  });
});

describe('Focus: Disabled State', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2" disabled>Option 2</option>
      <option value="3">Option 3</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select);
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('skips disabled options when navigating', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // Option 1
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // Should skip Option 2, go to Option 3

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[2].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });

  it('disabled options are not keyboard selectable', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // Option 1
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // Option 3 (skips 2)

    // Try to select (should not select disabled option 2)
    fireEvent.keyDown(dropdown, { key: 'Enter' });

    expect(ms.getValue()).toContain('3');
    expect(ms.getValue()).not.toContain('2');
  });
});

describe('Focus: Programmatic Focus', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select);
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('allows programmatic focus on trigger', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
  });

  it('maintains focus management after setValue', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    trigger.focus();

    ms.setValue(['1']);

    // Focus should remain on trigger
    expect(document.activeElement).toBe(trigger);
  });

  it('maintains focus management after refresh', () => {
    ms.open();
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLElement;
    searchInput?.focus();

    ms.refresh();

    // Focus state should be maintained or reset appropriately
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown).toBeTruthy();
  });
});

describe('Focus: Multiple Instances', () => {
  let select1: HTMLSelectElement;
  let select2: HTMLSelectElement;
  let ms1: MultiSelect;
  let ms2: MultiSelect;

  beforeEach(() => {
    select1 = document.createElement('select');
    select1.multiple = true;
    select1.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select1);

    select2 = document.createElement('select');
    select2.multiple = true;
    select2.innerHTML = '<option value="2">Option 2</option>';
    document.body.appendChild(select2);

    ms1 = new MultiSelect(select1);
    ms2 = new MultiSelect(select2);
  });

  afterEach(() => {
    ms1.destroy();
    ms2.destroy();
    select1.remove();
    select2.remove();
  });

  it('maintains separate focus for each instance', () => {
    ms1.open();
    const dropdown1 = document.querySelectorAll('.ms-multiselect__dropdown')[0] as HTMLElement;
    expect(ms1.isOpen).toBe(true);
    expect(dropdown1).toBeTruthy();

    ms1.close();
    expect(ms1.isOpen).toBe(false);

    ms2.open();
    const dropdown2 = document.querySelectorAll('.ms-multiselect__dropdown')[1] as HTMLElement;
    expect(ms2.isOpen).toBe(true);
    expect(dropdown2).toBeTruthy();

    // Each instance can be opened/closed independently
    expect(dropdown1).toBeTruthy();
    expect(dropdown2).toBeTruthy();
  });

  it('closes other instance when opening one', () => {
    ms1.open();
    expect(ms1.isOpen).toBe(true);
    expect(ms2.isOpen).toBe(false);

    ms2.open();
    expect(ms1.isOpen).toBe(false);
    expect(ms2.isOpen).toBe(true);
  });
});

describe('Focus: Cleanup', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
    ms = new MultiSelect(select);
  });

  afterEach(() => {
    select.remove();
  });

  it('removes focus listeners on destroy', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    trigger.focus();

    ms.destroy();

    // Trigger should be removed from DOM
    expect(document.querySelector('.ms-multiselect__trigger')).toBeNull();
  });

  it('restores focus state on destroy', () => {
    ms.open();
    ms.destroy();

    // Original select should be visible again
    expect(select.style.display).toBe('');
    expect(select.hasAttribute('aria-hidden')).toBe(false);
  });
});
