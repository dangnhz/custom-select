import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SingleSelect } from '@/SingleSelect';

describe('SingleSelect - Initialization', () => {
  let container: HTMLDivElement;
  let select: HTMLSelectElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    select = document.createElement('select');
    select.innerHTML = `
      <option value="">Choose...</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    `;
    container.appendChild(select);
  });

  afterEach(() => {
    container.remove();
  });

  it('initializes successfully', () => {
    const ss = new SingleSelect(select);
    expect(ss).toBeInstanceOf(SingleSelect);
    expect(select.style.display).toBe('none');
  });

  it('throws error for non-select element', () => {
    const div = document.createElement('div');
    expect(() => new SingleSelect(div as never)).toThrow();
  });

  it('throws error for multiple select', () => {
    const multiSelect = document.createElement('select');
    multiSelect.multiple = true;
    expect(() => new SingleSelect(multiSelect)).toThrow();
  });

  it('creates custom UI elements', () => {
    new SingleSelect(select);
    expect(document.querySelector('.ss-singleselect')).toBeTruthy();
    expect(document.querySelector('.ss-singleselect__trigger')).toBeTruthy();
    expect(document.querySelector('.ss-singleselect__dropdown')).toBeTruthy();
  });

  it('initializes multiple instances', () => {
    select.classList.add('single');
    const select2 = select.cloneNode(true) as HTMLSelectElement;
    select2.classList.add('single');
    container.appendChild(select2);

    const instances = SingleSelect.init('.single');
    expect(instances).toHaveLength(2);
  });
});

describe('SingleSelect - Selection', () => {
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
    ss = new SingleSelect(select);
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('gets initial null value', () => {
    expect(ss.getValue()).toBeNull();
  });

  it('gets pre-selected value', () => {
    ss.destroy();
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3">Option 3</option>
    `;
    ss = new SingleSelect(select);
    expect(ss.getValue()).toBe('2');
  });

  it('sets value programmatically', () => {
    ss.setValue('2');
    expect(ss.getValue()).toBe('2');
  });

  it('sets null value programmatically', () => {
    ss.setValue('2');
    ss.setValue(null);
    expect(ss.getValue()).toBeNull();
  });

  it('clears selection', () => {
    ss.setValue('2');
    ss.clear();
    expect(ss.getValue()).toBeNull();
  });

  it('syncs with native select element', () => {
    ss.setValue('2');
    expect(select.value).toBe('2');
    expect(select.options[2].selected).toBe(true);
  });

  it('only allows one value to be selected', () => {
    ss.setValue('1');
    ss.setValue('2');
    expect(ss.getValue()).toBe('2');

    // Check native select has only one selected
    const selectedOptions = Array.from(select.options).filter(opt => opt.selected);
    expect(selectedOptions).toHaveLength(1);
  });
});

describe('SingleSelect - Dropdown Control', () => {
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

  it('opens dropdown', () => {
    ss.open();
    expect(ss.isOpen).toBe(true);
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.classList.contains('ss-singleselect__dropdown--hidden')).toBe(false);
  });

  it('closes dropdown', () => {
    ss.open();
    ss.close();
    expect(ss.isOpen).toBe(false);
    const dropdown = document.querySelector('.ss-singleselect__dropdown');
    expect(dropdown?.classList.contains('ss-singleselect__dropdown--hidden')).toBe(true);
  });

  it('toggles dropdown', () => {
    ss.toggle();
    expect(ss.isOpen).toBe(true);
    ss.toggle();
    expect(ss.isOpen).toBe(false);
  });

  it('closes on select when closeOnSelect is true', (done) => {
    ss.destroy();
    ss = new SingleSelect(select, { closeOnSelect: true });

    ss.open();
    ss.setValue('1');

    // closeOnSelect uses setTimeout
    setTimeout(() => {
      expect(ss.isOpen).toBe(false);
      done();
    }, 200);
  });

  it('stays open when closeOnSelect is false', () => {
    ss.destroy();
    ss = new SingleSelect(select, { closeOnSelect: false });

    ss.open();
    ss.setValue('1');

    expect(ss.isOpen).toBe(true);
  });
});

describe('SingleSelect - Configuration', () => {
  let select: HTMLSelectElement;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="">None</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
  });

  afterEach(() => {
    select.remove();
  });

  it('respects placeholder config', () => {
    const ss = new SingleSelect(select, { placeholder: 'Custom placeholder' });
    const trigger = document.querySelector('.ss-singleselect__trigger-text');
    expect(trigger?.textContent).toBe('Custom placeholder');
    ss.destroy();
  });

  it('respects searchEnabled config', () => {
    const ss = new SingleSelect(select, { searchEnabled: true });
    const searchInput = document.querySelector('.ss-singleselect__search');
    expect(searchInput).toBeTruthy();
    ss.destroy();

    const ss2 = new SingleSelect(select, { searchEnabled: false });
    const searchInput2 = document.querySelector('.ss-singleselect__search');
    expect(searchInput2).toBeFalsy();
    ss2.destroy();
  });

  it('respects showRadioButtons config', () => {
    const ss = new SingleSelect(select, { showRadioButtons: true });
    ss.open();
    const radio = document.querySelector('.ss-singleselect__radio');
    expect(radio).toBeTruthy();
    ss.destroy();

    const ss2 = new SingleSelect(select, { showRadioButtons: false });
    ss2.open();
    const radio2 = document.querySelector('.ss-singleselect__radio');
    expect(radio2).toBeFalsy();
    ss2.destroy();
  });

  it('respects allowDeselect config', () => {
    const ss = new SingleSelect(select, { allowDeselect: true });
    ss.setValue('1');
    ss.setValue('1'); // Click same option again
    expect(ss.getValue()).toBeNull();
    ss.destroy();

    const ss2 = new SingleSelect(select, { allowDeselect: false });
    ss2.setValue('1');
    ss2.setValue('1'); // Click same option again
    expect(ss2.getValue()).toBe('1'); // Should still be selected
    ss2.destroy();
  });

  it('respects showClear config', () => {
    const ss = new SingleSelect(select, { showClear: true });
    const clearBtn = document.querySelector('.ss-singleselect__button--clear');
    expect(clearBtn).toBeTruthy();
    ss.destroy();

    const ss2 = new SingleSelect(select, { showClear: false });
    const clearBtn2 = document.querySelector('.ss-singleselect__button--clear');
    expect(clearBtn2).toBeFalsy();
    ss2.destroy();
  });
});

describe('SingleSelect - Lifecycle', () => {
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
    // Clean up if not already destroyed
    if (document.querySelector('.ss-singleselect')) {
      ss.destroy();
    }
    select.remove();
  });

  it('refreshes from native select', () => {
    select.innerHTML = `
      <option value="a">Option A</option>
      <option value="b">Option B</option>
      <option value="c">Option C</option>
    `;

    ss.refresh();

    ss.setValue('b');
    expect(ss.getValue()).toBe('b');
  });

  it('destroys instance', () => {
    ss.setValue('1');
    ss.destroy();

    expect(select.style.display).not.toBe('none');
    expect(document.querySelector('.ss-singleselect')).toBeFalsy();
  });

  it('enables and disables component', () => {
    const trigger = document.querySelector('.ss-singleselect__trigger') as HTMLButtonElement;

    ss.disable();
    expect(trigger?.disabled).toBe(true);
    expect(select.disabled).toBe(true);

    ss.enable();
    expect(trigger?.disabled).toBe(false);
    expect(select.disabled).toBe(false);
  });

  it('exposes readonly properties', () => {
    expect(ss.selectElement).toBe(select);
    expect(ss.config).toBeDefined();
    expect(ss.isOpen).toBe(false);
  });
});
