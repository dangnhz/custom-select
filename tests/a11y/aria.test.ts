import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('ARIA: Trigger Button', () => {
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

  it('has role button', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger');
    expect(trigger?.getAttribute('type')).toBe('button');
  });

  it('has aria-haspopup', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('has aria-expanded that reflects state', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger');

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    ms.open();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    ms.close();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('has aria-controls pointing to dropdown', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger');
    const dropdown = document.querySelector('.ms-multiselect__dropdown');

    const controlsId = trigger?.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(dropdown?.getAttribute('id')).toBe(controlsId);
  });

  it('has aria-label or accessible text', () => {
    const trigger = document.querySelector('.ms-multiselect__trigger');
    const hasLabel = trigger?.hasAttribute('aria-label');
    const hasText = (trigger?.textContent || '').trim().length > 0;

    expect(hasLabel || hasText).toBe(true);
  });
});

describe('ARIA: Dropdown Panel', () => {
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

  it('has role dialog', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.getAttribute('role')).toBe('dialog');
  });

  it('has unique id', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.hasAttribute('id')).toBe(true);
    expect(dropdown?.getAttribute('id')).toBeTruthy();
  });

  it('has aria-label', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.hasAttribute('aria-label')).toBe(true);
  });

  it('is hidden when closed', () => {
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(true);
  });

  it('is visible when open', () => {
    ms.open();
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(false);
  });
});

describe('ARIA: Options List', () => {
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
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('has role listbox', () => {
    const optionsList = document.querySelector('.ms-multiselect__options');
    expect(optionsList?.getAttribute('role')).toBe('listbox');
  });

  it('has aria-multiselectable', () => {
    const optionsList = document.querySelector('.ms-multiselect__options');
    expect(optionsList?.getAttribute('aria-multiselectable')).toBe('true');
  });
});

describe('ARIA: Option Items', () => {
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
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('has role option', () => {
    const options = document.querySelectorAll('.ms-multiselect__option');
    options.forEach(option => {
      expect(option.getAttribute('role')).toBe('option');
    });
  });

  it('has aria-selected reflecting state', () => {
    const options = document.querySelectorAll('.ms-multiselect__option');

    options.forEach(option => {
      expect(option.hasAttribute('aria-selected')).toBe(true);
      expect(option.getAttribute('aria-selected')).toBe('false');
    });

    ms.setValue(['1']);

    const option1 = document.querySelector('[data-value="1"]');
    expect(option1?.getAttribute('aria-selected')).toBe('true');

    const option3 = document.querySelector('[data-value="3"]');
    expect(option3?.getAttribute('aria-selected')).toBe('false');
  });

  it('has aria-disabled for disabled options', () => {
    const disabledOption = document.querySelector('[data-value="2"]');
    expect(disabledOption?.getAttribute('aria-disabled')).toBe('true');

    const enabledOption = document.querySelector('[data-value="1"]');
    expect(enabledOption?.hasAttribute('aria-disabled')).toBe(false);
  });

  it('updates aria-selected when selection changes', () => {
    ms.setValue(['1', '3']);

    const option1 = document.querySelector('[data-value="1"]');
    const option3 = document.querySelector('[data-value="3"]');

    expect(option1?.getAttribute('aria-selected')).toBe('true');
    expect(option3?.getAttribute('aria-selected')).toBe('true');

    ms.setValue(['1']);

    expect(option1?.getAttribute('aria-selected')).toBe('true');
    expect(option3?.getAttribute('aria-selected')).toBe('false');
  });
});

describe('ARIA: Search Input', () => {
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

  it('has aria-label', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input');
    expect(searchInput?.hasAttribute('aria-label')).toBe(true);
    expect(searchInput?.getAttribute('aria-label')).toBeTruthy();
  });

  it('has type text', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input');
    expect(searchInput?.getAttribute('type')).toBe('text');
  });

  it('has autocomplete off', () => {
    const searchInput = document.querySelector('.ms-multiselect__search-input');
    expect(searchInput?.getAttribute('autocomplete')).toBe('off');
  });
});

describe('ARIA: Live Region', () => {
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

  it('exists in the DOM', () => {
    const liveRegion = document.querySelector('.ms-multiselect__live-region');
    expect(liveRegion).toBeTruthy();
  });

  it('has aria-live polite', () => {
    const liveRegion = document.querySelector('.ms-multiselect__live-region');
    expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-atomic true', () => {
    const liveRegion = document.querySelector('.ms-multiselect__live-region');
    expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
  });

  it('is visually hidden', () => {
    const liveRegion = document.querySelector('.ms-multiselect__live-region') as HTMLElement;
    expect(liveRegion).toBeTruthy();

    // Should be screen-reader-only (visually hidden but accessible)
    const styles = window.getComputedStyle(liveRegion);
    const isHidden =
      styles.position === 'absolute' ||
      styles.clip === 'rect(0px, 0px, 0px, 0px)' ||
      liveRegion.offsetWidth === 0 ||
      liveRegion.offsetHeight === 0;

    expect(isHidden).toBe(true);
  });
});

describe('ARIA: Nested Options', () => {
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
    ms = new MultiSelect(select, { nestedOptions: true, defaultExpanded: true });
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('parent options have aria-expanded', () => {
    const parentOption = document.querySelector('.ms-multiselect__option--parent');
    expect(parentOption?.hasAttribute('aria-expanded')).toBe(true);
  });

  it('aria-expanded reflects expand/collapse state', () => {
    ms.open();
    const parentOption = document.querySelector('.ms-multiselect__option--parent');

    // Check initial state (depends on defaultExpanded config)
    const initialState = parentOption?.getAttribute('aria-expanded');
    expect(initialState === 'true' || initialState === 'false').toBe(true);

    ms.expandGroup('__group_Group 1');
    expect(parentOption?.getAttribute('aria-expanded')).toBe('true');

    ms.collapseGroup('__group_Group 1');
    expect(parentOption?.getAttribute('aria-expanded')).toBe('false');
  });

  it('child options have appropriate structure', () => {
    const childOptions = document.querySelectorAll('.ms-multiselect__option--child');
    expect(childOptions.length).toBeGreaterThan(0);

    childOptions.forEach(child => {
      expect(child.getAttribute('role')).toBe('option');
      expect(child.hasAttribute('aria-selected')).toBe(true);
    });
  });
});

describe('ARIA: Original Select', () => {
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

  it('has aria-hidden true', () => {
    expect(select.getAttribute('aria-hidden')).toBe('true');
  });

  it('is visually hidden', () => {
    expect(select.style.display).toBe('none');
  });

  it('removes aria-hidden on destroy', () => {
    ms.destroy();
    expect(select.hasAttribute('aria-hidden')).toBe(false);
  });
});
