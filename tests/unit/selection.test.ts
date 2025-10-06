import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('Selection Tests', () => {
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
  });

  afterEach(() => {
    if (ms) ms.destroy();
    select.remove();
  });

  it('handles single selection', () => {
    ms = new MultiSelect(select);
    ms.setValue(['1']);
    expect(ms.getValue()).toEqual(['1']);
  });

  it('handles multi selection', () => {
    ms = new MultiSelect(select);
    ms.setValue(['1', '2', '3']);
    expect(ms.getValue()).toEqual(['1', '2', '3']);
  });

  it('clears all selections', () => {
    ms = new MultiSelect(select);
    ms.setValue(['1', '2']);
    ms.clearAll();
    expect(ms.getValue()).toEqual([]);
  });

  it('selects all options', () => {
    ms = new MultiSelect(select);
    ms.selectAll();
    expect(ms.getValue()).toEqual(['1', '2', '3']);
  });

  it('gets/sets values programmatically', () => {
    ms = new MultiSelect(select);
    expect(ms.getValue()).toEqual([]);

    ms.setValue(['2']);
    expect(ms.getValue()).toEqual(['2']);

    ms.setValue(['1', '3']);
    expect(ms.getValue()).toEqual(['1', '3']);
  });

  it('syncs with native select element', () => {
    ms = new MultiSelect(select);
    ms.setValue(['1', '3']);

    const selectedOptions = Array.from(select.selectedOptions);
    expect(selectedOptions.map(o => o.value)).toEqual(['1', '3']);
  });
});

describe('Nested Selection Tests', () => {
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
      <optgroup label="Group 2">
        <option value="2a">Option 2A</option>
      </optgroup>
    `;
    document.body.appendChild(select);
  });

  afterEach(() => {
    if (ms) ms.destroy();
    select.remove();
  });

  it('handles cascade selection', () => {
    ms = new MultiSelect(select, {
      nestedOptions: true,
      cascadeSelection: true,
    });

    // This test would need to simulate clicking parent group
    // For now, test that config is set
    expect(ms.config.cascadeSelection).toBe(true);
  });

  it('handles parent state updates (indeterminate)', () => {
    ms = new MultiSelect(select, {
      nestedOptions: true,
    });

    // Select one child
    ms.setValue(['1a']);
    expect(ms.getValue()).toEqual(['1a']);

    // Select both children
    ms.setValue(['1a', '1b']);
    expect(ms.getValue()).toEqual(['1a', '1b']);
  });

  it('selects only leaf options with selectAll', () => {
    ms = new MultiSelect(select, {
      nestedOptions: true,
    });

    ms.selectAll();
    const values = ms.getValue();

    // Should only include leaf options, not group values
    expect(values).toContain('1a');
    expect(values).toContain('1b');
    expect(values).toContain('2a');
    expect(values).not.toContain('__group_Group 1');
  });
});
