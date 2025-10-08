import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SingleSelect } from '@/SingleSelect';
import { fireEvent } from '@testing-library/dom';

describe('SingleSelect - Interaction Tests', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="">None</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { searchDebounce: 0 });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('opens dropdown on trigger click', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLElement;
    expect(ss.isOpen).toBe(false);

    fireEvent.click(trigger);

    expect(ss.isOpen).toBe(true);
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.classList.contains('ss-singleselect__dropdown--hidden')).toBe(false);
  });

  it('closes dropdown on trigger click when open', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLElement;

    fireEvent.click(trigger); // Open
    expect(ss.isOpen).toBe(true);

    fireEvent.click(trigger); // Close
    expect(ss.isOpen).toBe(false);
  });

  it('selects option via click', () => {
    ss.open();

    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ss.getValue()).toBe('1');
  });

  it('changes selection via click', () => {
    ss.setValue('1');
    ss.open();

    const option2 = document.querySelector('[data-value="2"]') as HTMLElement;
    fireEvent.click(option2);

    expect(ss.getValue()).toBe('2');
  });

  it('deselects when clicking same option with allowDeselect', () => {
    ss.destroy();
    ss = new SingleSelect(select, { allowDeselect: true });

    ss.setValue('1');
    ss.open();

    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ss.getValue()).toBeNull();
  });

  it('does not deselect when clicking same option without allowDeselect', () => {
    ss.destroy();
    ss = new SingleSelect(select, { allowDeselect: false });

    ss.setValue('1');
    ss.open();

    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ss.getValue()).toBe('1');
  });

  it('auto-closes after selection when closeOnSelect is true', (done) => {
    ss.destroy();
    ss = new SingleSelect(select, { closeOnSelect: true });

    ss.open();
    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    // Wait for close delay (100ms) + animation duration (150ms) + buffer
    setTimeout(() => {
      expect(ss.isOpen).toBe(false);
      done();
    }, 300);
  });

  it('stays open after selection when closeOnSelect is false', () => {
    ss.destroy();
    ss = new SingleSelect(select, { closeOnSelect: false });

    ss.open();
    const option = document.querySelector('[data-value="1"]') as HTMLElement;
    fireEvent.click(option);

    expect(ss.isOpen).toBe(true);
  });

  it('filters options via search', () => {
    ss.destroy();
    ss = new SingleSelect(select, { searchEnabled: true, searchDebounce: 0 });
    ss.open();

    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;
    fireEvent.input(searchInput, { target: { value: 'Option 2' } });

    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(1);
    expect(visibleOptions[0].textContent).toContain('Option 2');
  });

  it('clears selection via clear button', () => {
    ss.destroy();
    ss = new SingleSelect(select, { showClear: true });

    ss.setValue('1');
    ss.open();

    const clearBtn = document.querySelector('[data-action="clear"]') as HTMLElement;
    fireEvent.click(clearBtn);

    expect(ss.getValue()).toBeNull();
  });

  it('closes dropdown via close button', () => {
    ss.open();
    expect(ss.isOpen).toBe(true);

    const closeBtn = document.querySelector('[data-action="close"]') as HTMLElement;
    fireEvent.click(closeBtn);

    expect(ss.isOpen).toBe(false);
  });

  it('closes dropdown on outside click', () => {
    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);

    ss.open();
    expect(ss.isOpen).toBe(true);

    fireEvent.mouseDown(outsideElement);

    expect(ss.isOpen).toBe(false);

    outsideElement.remove();
  });

  it('does not close on inside click', () => {
    ss.open();

    const dropdown = document.querySelector('.ss-singleselect__dropdown') as HTMLElement;
    fireEvent.mouseDown(dropdown);

    expect(ss.isOpen).toBe(true);
  });

  it('updates trigger text on selection', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger-text') as HTMLElement;

    ss.setValue('1');
    expect(trigger.textContent).toBe('Option 1');

    ss.setValue('2');
    expect(trigger.textContent).toBe('Option 2');

    ss.clear();
    expect(trigger.textContent).toBe(ss.config.placeholder);
  });

  it('updates radio button state on selection', () => {
    ss.destroy();
    ss = new SingleSelect(select, { showRadioButtons: true });
    ss.open();

    ss.setValue('1');

    let radio1 = document.querySelector('[data-value="1"] .ss-singleselect__radio') as HTMLInputElement;
    let radio2 = document.querySelector('[data-value="2"] .ss-singleselect__radio') as HTMLInputElement;

    expect(radio1?.checked).toBe(true);
    expect(radio2?.checked).toBe(false);

    ss.setValue('2');

    // Re-query radio buttons after setValue (DOM is re-rendered)
    radio1 = document.querySelector('[data-value="1"] .ss-singleselect__radio') as HTMLInputElement;
    radio2 = document.querySelector('[data-value="2"] .ss-singleselect__radio') as HTMLInputElement;

    expect(radio1?.checked).toBe(false);
    expect(radio2?.checked).toBe(true);
  });

  it('handles disabled options', () => {
    select.innerHTML = `
      <option value="">None</option>
      <option value="1">Option 1</option>
      <option value="2" disabled>Option 2 (disabled)</option>
      <option value="3">Option 3</option>
    `;
    ss.refresh();
    ss.open();

    const option2 = document.querySelector('[data-value="2"]') as HTMLElement;
    fireEvent.click(option2);

    expect(ss.getValue()).toBeNull(); // Should not select disabled option
  });
});

describe('SingleSelect - Search Interaction', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
      <option value="date">Date</option>
      <option value="elderberry">Elderberry</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, {
      searchEnabled: true,
      searchDebounce: 0,
    });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('shows all options when search is empty', () => {
    ss.open();
    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(5);
  });

  it('filters options by search query', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'ber' } });

    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(1); // Only Elderberry
    expect(Array.from(visibleOptions).some(opt => opt.textContent?.includes('Elderberry'))).toBe(true);
  });

  it('shows no results message when no matches', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'xyz' } });

    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(0);
  });

  it('clears search on close when clearSearchOnClose is true', () => {
    ss.destroy();
    ss = new SingleSelect(select, {
      searchEnabled: true,
      searchDebounce: 0,
      clearSearchOnClose: true,
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'apple' } });
    expect(searchInput.value).toBe('apple');

    ss.close();
    ss.open();

    expect(searchInput.value).toBe('');
  });

  it('preserves search on close when clearSearchOnClose is false', () => {
    ss.destroy();
    ss = new SingleSelect(select, {
      searchEnabled: true,
      searchDebounce: 0,
      clearSearchOnClose: false,
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'apple' } });
    ss.close();
    ss.open();

    expect(searchInput.value).toBe('apple');
  });

  it('uses startsWith search strategy', () => {
    ss.destroy();
    ss = new SingleSelect(select, {
      searchEnabled: true,
      searchDebounce: 0,
      searchStrategy: 'startsWith',
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'cher' } });

    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(1);
    expect(visibleOptions[0].textContent).toContain('Cherry');
  });

  it('uses exact search strategy', () => {
    ss.destroy();
    ss = new SingleSelect(select, {
      searchEnabled: true,
      searchDebounce: 0,
      searchStrategy: 'exact',
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'Apple' } });

    const visibleOptions = document.querySelectorAll('.ss-singleselect__option:not(.ss-singleselect__option--hidden)');
    expect(visibleOptions.length).toBe(1);
    expect(visibleOptions[0].textContent).toContain('Apple');
  });
});
