import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';
import { fireEvent } from '@testing-library/dom';

describe('Keyboard: Arrow Down', () => {
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

  it('moves focus to next option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[0].classList.contains('ms-multiselect__option--focused')).toBe(true);

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    expect(options[1].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });

  it('wraps to first option from last', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Navigate to last option
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    // Press down again - should wrap to first
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[0].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });

  it('skips disabled options', () => {
    ms.destroy();
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2" disabled>Option 2</option>
      <option value="3">Option 3</option>
    `;
    ms = new MultiSelect(select);
    ms.open();

    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    // Should skip option 2 (disabled) and land on option 3
    expect(options[2].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });
});

describe('Keyboard: Arrow Up', () => {
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

  it('moves focus to previous option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Navigate down first
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    // Then navigate up
    fireEvent.keyDown(dropdown, { key: 'ArrowUp' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[0].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });

  it('wraps to last option from first', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Press up when at first option
    fireEvent.keyDown(dropdown, { key: 'ArrowUp' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[2].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });
});

describe('Keyboard: Home and End', () => {
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

  it('Home key focuses first option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Navigate to middle
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    // Press Home
    fireEvent.keyDown(dropdown, { key: 'Home' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[0].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });

  it('End key focuses last option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Press End
    fireEvent.keyDown(dropdown, { key: 'End' });

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[2].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });
});

describe('Keyboard: Enter and Space', () => {
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

  it('Enter key toggles focused option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'Enter' });

    expect(ms.getValue()).toContain('1');

    fireEvent.keyDown(dropdown, { key: 'Enter' });
    expect(ms.getValue()).not.toContain('1');
  });

  it('Space key toggles focused option', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: ' ' });

    expect(ms.getValue()).toContain('1');

    fireEvent.keyDown(dropdown, { key: ' ' });
    expect(ms.getValue()).not.toContain('1');
  });

  it('does not toggle disabled option', () => {
    ms.destroy();
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2" disabled>Option 2</option>
    `;
    ms = new MultiSelect(select);
    ms.open();

    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Focus and try to select disabled option
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });
    fireEvent.keyDown(dropdown, { key: 'Enter' });

    expect(ms.getValue()).not.toContain('2');
  });
});

describe('Keyboard: Escape', () => {
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
    ms.destroy();
    select.remove();
  });

  it('closes dropdown', () => {
    ms.open();
    expect(ms.isOpen).toBe(true);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(ms.isOpen).toBe(false);
  });

  it('returns focus to trigger', async () => {
    // Create a new instance with returnFocusOnClose enabled for this specific test
    ms.destroy();
    const msWithFocus = new MultiSelect(select, { returnFocusOnClose: true });
    msWithFocus.open();

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    fireEvent.keyDown(document, { key: 'Escape' });

    // Wait for async focus operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(trigger);
    msWithFocus.destroy();
  });
});

describe('Keyboard: Tab', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
    ms = new MultiSelect(select, { searchEnabled: true });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });


  it('allows tabbing away when dropdown closed', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    trigger.focus();

    // Tab should not be prevented when closed
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    trigger.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(false);
  });
});

describe('Keyboard: Nested Options', () => {
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
    ms = new MultiSelect(select, { nestedOptions: true, defaultExpanded: false });
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('Arrow Right expands collapsed group', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Focus parent group
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    // Expand with Arrow Right
    fireEvent.keyDown(dropdown, { key: 'ArrowRight' });

    const parentOption = document.querySelector('.ms-multiselect__option--parent');
    expect(parentOption?.getAttribute('aria-expanded')).toBe('true');
  });

  it('Arrow Left collapses expanded group', () => {
    ms.expandGroup('__group_Group 1');

    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Focus parent group
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' });

    // Collapse with Arrow Left
    fireEvent.keyDown(dropdown, { key: 'ArrowLeft' });

    const parentOption = document.querySelector('.ms-multiselect__option--parent');
    expect(parentOption?.getAttribute('aria-expanded')).toBe('false');
  });

  it('navigates through nested hierarchy', () => {
    ms.expandGroup('__group_Group 1');

    const dropdown = document.querySelector('.ms-multiselect__dropdown') as HTMLElement;

    // Navigate down through parent and children
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // Parent
    fireEvent.keyDown(dropdown, { key: 'ArrowDown' }); // First child

    const options = document.querySelectorAll('.ms-multiselect__option');
    expect(options[1].classList.contains('ms-multiselect__option--focused')).toBe(true);
  });
});

describe('Keyboard: Search Input', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Apple</option>
      <option value="2">Banana</option>
      <option value="3">Cherry</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select, { searchEnabled: true, searchDebounce: 0 });
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('does not close dropdown on search input keypress', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;

    fireEvent.keyDown(searchInput, { key: 'a' });
    expect(ms.isOpen).toBe(true);

    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(ms.isOpen).toBe(true);
  });

  it('filters options as user types', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'Ba' } });

    const visibleOptions = Array.from(document.querySelectorAll('.ms-multiselect__option'))
      .filter(opt => !opt.classList.contains('ms-multiselect__option--hidden'));

    expect(visibleOptions.length).toBe(1);
    expect(visibleOptions[0].textContent).toContain('Banana');
  });

  it('Escape clears search before closing', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;

    fireEvent.input(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    fireEvent.keyDown(searchInput, { key: 'Escape' });

    // First Escape should clear search
    expect(searchInput.value).toBe('');
    expect(ms.isOpen).toBe(true);

    // Second Escape should close dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(ms.isOpen).toBe(false);
  });
});
