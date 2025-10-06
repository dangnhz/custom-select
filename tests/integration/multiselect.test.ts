import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('MultiSelect - Initialization', () => {
  let container: HTMLDivElement;
  let select: HTMLSelectElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
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
    const ms = new MultiSelect(select);
    expect(ms).toBeInstanceOf(MultiSelect);
    expect(select.style.display).toBe('none');
  });

  it('throws error for non-select element', () => {
    const div = document.createElement('div');
    expect(() => new MultiSelect(div as never)).toThrow();
  });

  it('throws error for non-multiple select', () => {
    const singleSelect = document.createElement('select');
    expect(() => new MultiSelect(singleSelect)).toThrow();
  });

  it('creates custom UI elements', () => {
    new MultiSelect(select);
    expect(document.querySelector('.ms-multiselect')).toBeTruthy();
    expect(document.querySelector('.ms-multiselect__trigger')).toBeTruthy();
    expect(document.querySelector('.ms-multiselect__dropdown')).toBeTruthy();
  });

  it('initializes multiple instances', () => {
    select.classList.add('multi');
    const select2 = select.cloneNode(true) as HTMLSelectElement;
    select2.classList.add('multi');
    container.appendChild(select2);

    const instances = MultiSelect.init('.multi');
    expect(instances).toHaveLength(2);
  });
});

describe('MultiSelect - Selection', () => {
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

  it('gets initial empty value', () => {
    expect(ms.getValue()).toEqual([]);
  });

  it('sets value programmatically', () => {
    ms.setValue(['1', '2']);
    expect(ms.getValue()).toEqual(['1', '2']);
  });

  it('selects all options', () => {
    ms.selectAll();
    expect(ms.getValue()).toEqual(['1', '2', '3']);
  });

  it('clears all selections', () => {
    ms.setValue(['1', '2']);
    ms.clearAll();
    expect(ms.getValue()).toEqual([]);
  });

  it('syncs with native select', () => {
    ms.setValue(['2']);
    expect(Array.from(select.selectedOptions).map((o) => o.value)).toEqual(['2']);
  });
});

describe('MultiSelect - Dropdown', () => {
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

  it('opens dropdown', () => {
    ms.open();
    expect(ms.isOpen).toBe(true);
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(false);
  });

  it('closes dropdown', () => {
    ms.open();
    ms.close();
    expect(ms.isOpen).toBe(false);
    const dropdown = document.querySelector('.ms-multiselect__dropdown');
    expect(dropdown?.classList.contains('ms-multiselect__dropdown--hidden')).toBe(true);
  });

  it('toggles dropdown', () => {
    ms.toggle();
    expect(ms.isOpen).toBe(true);
    ms.toggle();
    expect(ms.isOpen).toBe(false);
  });
});

describe('MultiSelect - Events', () => {
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

  it('emits change event', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);
    ms.setValue(['1']);
    expect(handler).toHaveBeenCalled();
  });

  it('emits open event', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:open', handler);
    ms.open();
    expect(handler).toHaveBeenCalled();
  });

  it('emits close event', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:close', handler);
    ms.open();
    ms.close();
    expect(handler).toHaveBeenCalled();
  });
});

describe('MultiSelect - Destroy', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `<option value="1">Option 1</option>`;
    document.body.appendChild(select);
    ms = new MultiSelect(select);
  });

  afterEach(() => {
    select.remove();
  });

  it('cleans up on destroy', () => {
    ms.destroy();
    expect(select.style.display).toBe('');
    expect(document.querySelector('.ms-multiselect')).toBeNull();
  });
});

describe('MultiSelect - Enable/Disable', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `<option value="1">Option 1</option>`;
    document.body.appendChild(select);
    ms = new MultiSelect(select);
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('disables component', () => {
    ms.disable();
    expect(select.disabled).toBe(true);
    const trigger = document.querySelector('.ms-multiselect__trigger');
    expect(trigger?.getAttribute('disabled')).toBe('true');
  });

  it('enables component', () => {
    ms.disable();
    ms.enable();
    expect(select.disabled).toBe(false);
    const trigger = document.querySelector('.ms-multiselect__trigger');
    expect(trigger?.hasAttribute('disabled')).toBe(false);
  });
});
