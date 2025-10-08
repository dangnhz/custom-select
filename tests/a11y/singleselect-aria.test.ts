import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SingleSelect } from '@/SingleSelect';
import { fireEvent } from '@testing-library/dom';

describe('SingleSelect ARIA: Trigger Button', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('has role button', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger');
    expect(trigger?.getAttribute('type')).toBe('button');
  });

  it('has aria-haspopup', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
  });

  it('has aria-expanded that reflects state', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger');

    expect(trigger?.getAttribute('aria-expanded')).toBe('false');

    ss.open();
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    ss.close();
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('has aria-controls pointing to dropdown', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger');
    const dropdown = document.querySelector('.ss-singleselect__dropdown');

    const controlsId = trigger?.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(dropdown?.getAttribute('id')).toBe(controlsId);
  });

  it('has aria-label or accessible text', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger');
    const hasLabel = trigger?.hasAttribute('aria-label');
    const hasText = (trigger?.textContent || '').trim().length > 0;

    expect(hasLabel || hasText).toBe(true);
  });

  it('is disabled when component is disabled', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLButtonElement;

    expect(trigger?.disabled).toBe(false);

    ss.disable();
    expect(trigger?.disabled).toBe(true);

    ss.enable();
    expect(trigger?.disabled).toBe(false);
  });
});

describe('SingleSelect ARIA: Dropdown Panel', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('has role dialog', () => {
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.getAttribute('role')).toBe('dialog');
  });

  it('has unique id', () => {
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.hasAttribute('id')).toBe(true);
    expect(dropdown?.getAttribute('id')).toBeTruthy();
  });

  it('has aria-label', () => {
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.hasAttribute('aria-label')).toBe(true);
  });

  it('is hidden when closed', () => {
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.classList.contains('ss-singleselect__dropdown--hidden')).toBe(true);
  });

  it('is visible when open', () => {
    ss.open();
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.classList.contains('ss-singleselect__dropdown--hidden')).toBe(false);
  });
});

describe('SingleSelect ARIA: Options List', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="">Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3 (disabled)</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('has role listbox', () => {
    const optionsList = document.querySelector('.ss-singleselect__options');
    expect(optionsList?.getAttribute('role')).toBe('listbox');
  });

  it('options have role option', () => {
    ss.open();
    const options = document.querySelectorAll('.ss-singleselect__option');
    options.forEach(option => {
      expect(option.getAttribute('role')).toBe('option');
    });
  });

  it('selected option has aria-selected="true"', () => {
    ss.setValue('2');
    ss.open();

    const option1 = document.querySelector('[data-value="1"]');
    const option2 = document.querySelector('[data-value="2"]');

    expect(option1?.getAttribute('aria-selected')).toBe('false');
    expect(option2?.getAttribute('aria-selected')).toBe('true');
  });

  it('unselected options have aria-selected="false"', () => {
    ss.open();
    const options = document.querySelectorAll('.ss-singleselect__option');
    // Filter out the empty value option which is selected by default
    const nonEmptyOptions = Array.from(options).filter(opt => opt.getAttribute('data-value') !== '');
    nonEmptyOptions.forEach(option => {
      expect(option.getAttribute('aria-selected')).toBe('false');
    });
  });

  it('disabled options have aria-disabled="true"', () => {
    ss.open();
    const option3 = document.querySelector('[data-value="3"]');
    expect(option3?.getAttribute('aria-disabled')).toBe('true');
  });

  it('enabled options do not have aria-disabled', () => {
    ss.open();
    const option1 = document.querySelector('[data-value="1"]');
    expect(option1?.hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('SingleSelect ARIA: Search Input', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { searchEnabled: true });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('search input has proper type', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input');
    expect(searchInput?.getAttribute('type')).toBe('text');
  });

  it('search input has placeholder', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input');
    expect(searchInput?.hasAttribute('placeholder')).toBe(true);
  });

  it('search input has aria-label or label', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input');
    const hasAriaLabel = searchInput?.hasAttribute('aria-label');
    const hasPlaceholder = searchInput?.hasAttribute('placeholder');

    expect(hasAriaLabel || hasPlaceholder).toBe(true);
  });
});

describe('SingleSelect ARIA: Radio Buttons', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { showRadioButtons: true });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('radio buttons have type radio', () => {
    ss.open();
    const radios = document.querySelectorAll('.ss-singleselect__radio');
    radios.forEach(radio => {
      expect(radio.getAttribute('type')).toBe('radio');
    });
  });

  it('radio buttons have same name attribute', () => {
    ss.open();
    const radios = document.querySelectorAll('.ss-singleselect__radio');
    const names = Array.from(radios).map(r => r.getAttribute('name'));

    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(1); // All have same name
  });

  it('selected option radio is checked', () => {
    ss.setValue('2');
    ss.open();

    const radio1 = document.querySelector('[data-value="1"] .ss-singleselect__radio') as HTMLInputElement;
    const radio2 = document.querySelector('[data-value="2"] .ss-singleselect__radio') as HTMLInputElement;

    expect(radio1?.checked).toBe(false);
    expect(radio2?.checked).toBe(true);
  });

  it('radio buttons are hidden from screen readers', () => {
    ss.open();
    const radios = document.querySelectorAll('.ss-singleselect__radio');
    radios.forEach(radio => {
      expect(radio.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

describe('SingleSelect ARIA: Focus Management', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { searchEnabled: true, searchAutoFocus: true });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('focuses search input when opened with searchAutoFocus', () => {
    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;
    expect(document.activeElement).toBe(searchInput);
  });

  it('does not focus search when searchAutoFocus is false', () => {
    ss.destroy();
    ss = new SingleSelect(select, { searchEnabled: true, searchAutoFocus: false });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input');
    expect(document.activeElement).not.toBe(searchInput);
  });

  it('returns focus to trigger on close when returnFocusOnClose is true', async () => {
    ss.destroy();
    ss = new SingleSelect(select, { returnFocusOnClose: true });

    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLButtonElement;

    ss.open();
    ss.close();

    // Wait for async focus operation
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(trigger);
  });

  it('blurs trigger on close when returnFocusOnClose is false', () => {
    ss.destroy();
    ss = new SingleSelect(select, { returnFocusOnClose: false });

    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLButtonElement;

    ss.open();
    ss.close();

    expect(document.activeElement).not.toBe(trigger);
  });
});

describe('SingleSelect ARIA: Keyboard Navigation', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { searchEnabled: false });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('opens dropdown on Enter key', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLElement;
    trigger.focus();

    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(ss.isOpen).toBe(true);
  });

  it('opens dropdown on Space key', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLElement;
    trigger.focus();

    fireEvent.keyDown(trigger, { key: ' ' });

    expect(ss.isOpen).toBe(true);
  });

  it('closes dropdown on Escape key', () => {
    ss.open();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(ss.isOpen).toBe(false);
  });

  it('navigates options with Arrow Down', () => {
    ss.open();

    fireEvent.keyDown(document, { key: 'ArrowDown' });

    const firstOption = document.querySelector('[data-value="1"]');
    expect(firstOption?.classList.contains('ss-singleselect__option--focused')).toBe(true);
  });

  it('navigates options with Arrow Up', () => {
    ss.open();

    fireEvent.keyDown(document, { key: 'ArrowUp' });

    const lastOption = document.querySelector('[data-value="3"]');
    expect(lastOption?.classList.contains('ss-singleselect__option--focused')).toBe(true);
  });

  it('selects focused option with Enter', () => {
    ss.open();

    fireEvent.keyDown(document, { key: 'ArrowDown' }); // Focus first option
    fireEvent.keyDown(document, { key: 'Enter' }); // Select it

    expect(ss.getValue()).toBe('1');
  });

  it('selects focused option with Space', () => {
    ss.open();

    fireEvent.keyDown(document, { key: 'ArrowDown' }); // Focus first option
    fireEvent.keyDown(document, { key: ' ' }); // Select it

    expect(ss.getValue()).toBe('1');
  });
});

describe('SingleSelect ARIA: Live Regions', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('has live region for announcements', () => {
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeTruthy();
  });

  it('announces selection changes', (done) => {
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]') as HTMLElement;

    ss.setValue('1');

    setTimeout(() => {
      try {
        expect(liveRegion.textContent).toContain('Option 1');
        done();
      } catch (error) {
        done(error);
      }
    }, 150);
  });
});

describe('SingleSelect ARIA: Native Select Sync', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('hides native select from visual display', () => {
    expect(select.style.display).toBe('none');
  });

  it('keeps native select in DOM for screen readers', () => {
    expect(document.body.contains(select)).toBe(true);
  });

  it('syncs selection to native select', () => {
    ss.setValue('2');

    expect(select.value).toBe('2');
    expect(select.options[1].selected).toBe(true);
  });

  it('syncs disabled state to native select', () => {
    ss.disable();
    expect(select.disabled).toBe(true);

    ss.enable();
    expect(select.disabled).toBe(false);
  });
});
