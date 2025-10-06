import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiSelect } from '@/MultiSelect';
import { fireEvent } from '@testing-library/dom';

describe('Interaction Tests', () => {
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
    ms = new MultiSelect(select, { searchDebounce: 0 });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('opens dropdown on trigger click', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(ms.isOpen).toBe(false);

    fireEvent.click(trigger);

    expect(ms.isOpen).toBe(true);
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(false);
  });

  it('closes dropdown on trigger click when open', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    fireEvent.click(trigger); // Open
    expect(ms.isOpen).toBe(true);

    fireEvent.click(trigger); // Close
    expect(ms.isOpen).toBe(false);
  });

  it('selects option via click', () => {
    ms.open();

    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ms.getValue()).toContain('1');
  });

  it('deselects option via click', () => {
    ms.setValue(['1']);
    ms.open();

    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ms.getValue()).not.toContain('1');
  });

  it('filters options via search', () => {
    ms.open();

    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;
    fireEvent.input(searchInput, { target: { value: 'Option 2' } });

    const visibleOptions = document.querySelectorAll('.ms-multiselect__option');
    expect(visibleOptions.length).toBe(1);
    expect(visibleOptions[0].textContent).toContain('Option 2');
  });

  it('clears all selections via clear button', () => {
    ms.setValue(['1', '2']);
    ms.open();

    const clearBtn = document.querySelector('[data-action="clear"]') as HTMLElement;
    fireEvent.click(clearBtn);

    expect(ms.getValue()).toEqual([]);
  });

  it('closes dropdown via close button', () => {
    ms.open();
    expect(ms.isOpen).toBe(true);

    const closeBtn = document.querySelector('[data-action="close"]') as HTMLElement;
    fireEvent.click(closeBtn);

    expect(ms.isOpen).toBe(false);
  });

  it('closes dropdown on outside click', () => {
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    ms.open();
    expect(ms.isOpen).toBe(true);

    fireEvent.click(outsideElement);

    expect(ms.isOpen).toBe(false);

    outsideElement.remove();
  });

  it('does not close on inside click', () => {
    ms.open();

    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;
    fireEvent.click(dropdown);

    expect(ms.isOpen).toBe(true);
  });

  it('closes dropdown on Escape key', () => {
    ms.open();
    expect(ms.isOpen).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(ms.isOpen).toBe(false);
  });
});

describe('Nested Interaction Tests', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <optgroup label="Group 1">
        <option value="1a">Option 1A</option>
        <option value="1b">Option 1B</option>
      </optgroup>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select, { nestedOptions: true });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('expands/collapses groups via icon click', () => {
    ms.open();

    const expandIcon = document.querySelector('.ms-multiselect__expand-icon') as HTMLElement;

    // Initially collapsed (or expanded based on defaultExpanded)
    fireEvent.click(expandIcon);

    // Check that children are visible/hidden based on expanded state
    const parentOption = document.querySelector('.ms-multiselect__option--parent');
    expect(parentOption).toBeTruthy();
  });
});

describe('Tag Removal Tests', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1" selected>Option 1</option>
      <option value="2" selected>Option 2</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select, { selectedDisplayMode: 'tags' });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('removes tag via close button', () => {
    expect(ms.getValue()).toEqual(['1', '2']);

    const closeBtn = document.querySelector('.ms-multiselect__tag-close') as HTMLElement;
    fireEvent.click(closeBtn);

    expect(ms.getValue().length).toBe(1);
  });

  it('does not open dropdown when removing tag', () => {
    expect(ms.isOpen).toBe(false);

    const closeBtn = document.querySelector('.ms-multiselect__tag-close') as HTMLElement;
    fireEvent.click(closeBtn);

    expect(ms.isOpen).toBe(false);
  });
});
