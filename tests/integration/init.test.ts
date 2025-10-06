import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('Initialization Tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('initializes component successfully', () => {
    const select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    container.appendChild(select);

    const ms = new MultiSelect(select);

    expect(ms).toBeInstanceOf(MultiSelect);
    expect(ms.selectElement).toBe(select);
    expect(select.style.display).toBe('none');

    ms.destroy();
  });

  it('creates custom UI elements', () => {
    const select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    container.appendChild(select);

    const ms = new MultiSelect(select);

    expect(container.querySelector('.ms-multiselect')).toBeTruthy();
    expect(container.querySelector('.ms-multiselect__trigger')).toBeTruthy();
    expect(container.querySelector('.ms-multiselect__dropdown')).toBeTruthy();

    ms.destroy();
  });

  it('initializes multiple instances on same page', () => {
    const select1 = document.createElement('select');
    select1.multiple = true;
    select1.className = 'multi';
    select1.innerHTML = '<option value="1">Option 1</option>';

    const select2 = document.createElement('select');
    select2.multiple = true;
    select2.className = 'multi';
    select2.innerHTML = '<option value="2">Option 2</option>';

    container.appendChild(select1);
    container.appendChild(select2);

    const instances = MultiSelect.init('.multi');

    expect(instances).toHaveLength(2);
    expect(instances[0]).toBeInstanceOf(MultiSelect);
    expect(instances[1]).toBeInstanceOf(MultiSelect);

    instances.forEach(ms => ms.destroy());
  });

  it('throws error for invalid selector', () => {
    expect(() => new MultiSelect('#nonexistent')).toThrow();
  });

  it('throws error for non-select element', () => {
    const div = document.createElement('div');
    container.appendChild(div);

    expect(() => new MultiSelect(div as never)).toThrow('is not a <select>');
  });

  it('throws error for non-multiple select', () => {
    const select = document.createElement('select');
    select.innerHTML = '<option value="1">Option 1</option>';
    container.appendChild(select);

    expect(() => new MultiSelect(select)).toThrow('must have "multiple" attribute');
  });

  it('destroys and cleans up properly', () => {
    const select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    container.appendChild(select);

    const ms = new MultiSelect(select);

    expect(container.querySelector('.ms-multiselect')).toBeTruthy();

    ms.destroy();

    expect(container.querySelector('.ms-multiselect')).toBeNull();
    expect(select.style.display).toBe('');
    expect(select.getAttribute('aria-hidden')).toBeNull();
  });

  it('stores instance reference on select element', () => {
    const select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    container.appendChild(select);

    const ms = new MultiSelect(select);

    expect((select as any).multiSelectInstance).toBe(ms);

    ms.destroy();

    expect((select as any).multiSelectInstance).toBeUndefined();
  });
});
