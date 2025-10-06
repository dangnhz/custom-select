import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('UI Rendering Tests', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    document.body.appendChild(select);
  });

  afterEach(() => {
    if (ms) ms.destroy();
    select.remove();
  });

  it('renders trigger button', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select);

    const trigger = document.querySelector('.ms-multiselect__trigger');
    expect(trigger).toBeTruthy();
    expect(trigger?.getAttribute('type')).toBe('button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders dropdown panel', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select);

    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown).toBeTruthy();
    expect(dropdown?.getAttribute('role')).toBe('dialog');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(true);
  });

  it('renders options list (flat)', () => {
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    `;
    ms = new MultiSelect(select);

    const optionsList = document.querySelector('.ms-multiselect__options');
    expect(optionsList).toBeTruthy();

    const options = optionsList?.querySelectorAll('.ms-multiselect__option');
    expect(options?.length).toBe(3);
  });

  it('renders options with nested hierarchy', () => {
    select.innerHTML = `
      <optgroup label="Group 1">
        <option value="1a">Option 1A</option>
        <option value="1b">Option 1B</option>
      </optgroup>
    `;
    ms = new MultiSelect(select, { nestedOptions: true });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options.length).toBeGreaterThan(0);

    // Check for parent group
    const parentOption = document.querySelector('.ms-multiselect__option--parent');
    expect(parentOption).toBeTruthy();

    // Check for expand icon
    const expandIcon = document.querySelector('.ms-multiselect__expand-icon');
    expect(expandIcon).toBeTruthy();
  });

  it('renders search input when enabled', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select, { searchEnabled: true });

    const searchInput = document.querySelector('.ms-multiselect__search-input');
    expect(searchInput).toBeTruthy();
    expect(searchInput?.getAttribute('type')).toBe('text');
    expect(searchInput?.getAttribute('aria-label')).toBe('Search options');
  });

  it('does not render search when disabled', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select, { searchEnabled: false });

    const searchInput = document.querySelector('.ms-multiselect__search-input');
    expect(searchInput).toBeNull();
  });

  it('renders footer with configurable buttons', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select, {
      showClearAll: true,
      showClose: true
    });

    const footer = document.querySelector('.ms-multiselect__footer');
    expect(footer).toBeTruthy();

    const clearBtn = document.querySelector('[data-action="clear"]');
    const closeBtn = document.querySelector('[data-action="close"]');

    expect(clearBtn).toBeTruthy();
    expect(closeBtn).toBeTruthy();
    expect(clearBtn?.textContent).toBe('Clear All');
    expect(closeBtn?.textContent).toBe('Close');
  });

  it('hides footer buttons when configured', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select, {
      showClearAll: false,
      showClose: false
    });

    const clearBtn = document.querySelector('[data-action="clear"]');
    const closeBtn = document.querySelector('[data-action="close"]');

    expect(clearBtn).toBeNull();
    expect(closeBtn).toBeNull();
  });

  it('renders tag mode display', () => {
    select.innerHTML = `
      <option value="1" selected>Option 1</option>
      <option value="2" selected>Option 2</option>
    `;
    ms = new MultiSelect(select, { selectedDisplayMode: 'tags' });

    const tagsContainer = document.querySelector('.ms-multiselect__tags');
    expect(tagsContainer).toBeTruthy();

    const tags = tagsContainer?.querySelectorAll('.ms-multiselect__tag');
    expect(tags?.length).toBe(2);

    // Check for close buttons
    const closeBtns = document.querySelectorAll('.ms-multiselect__tag-close');
    expect(closeBtns.length).toBe(2);
  });

  it('renders live region for screen readers', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select);

    const liveRegion = document.querySelector('.ms-multiselect__live-region');
    expect(liveRegion).toBeTruthy();
    expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
    expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
  });

  it('renders checkboxes for options', () => {
    select.innerHTML = '<option value="1">Option 1</option>';
    ms = new MultiSelect(select);

    const checkbox = document.querySelector('.ms-multiselect__checkbox');
    expect(checkbox).toBeTruthy();
    expect(checkbox?.getAttribute('type')).toBe('checkbox');
  });

  it('renders disabled options correctly', () => {
    select.innerHTML = '<option value="1" disabled>Disabled Option</option>';
    ms = new MultiSelect(select);

    const option = document.querySelector('.ms-multiselect__option');
    expect(option?.classList.contains('ms-multiselect__option--disabled')).toBe(true);
    expect(option?.getAttribute('aria-disabled')).toBe('true');
  });
});
