import { describe, it, expect, beforeEach } from 'vitest';
import * as NestedOptions from '@/NestedOptions';
import type { OptionData } from '@/types';

describe('NestedOptions - Parsing', () => {
  it('parses flat options', () => {
    const select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2" selected>Option 2</option>
      <option value="3" disabled>Option 3</option>
    `;

    const options = NestedOptions.parseSelectElement(select, false);

    expect(options).toHaveLength(3);
    expect(options[0]).toMatchObject({ value: '1', text: 'Option 1', selected: false, disabled: false });
    expect(options[1]).toMatchObject({ value: '2', text: 'Option 2', selected: true });
    expect(options[2]).toMatchObject({ value: '3', text: 'Option 3', disabled: true });
  });

  it('parses nested options with optgroups', () => {
    const select = document.createElement('select');
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

    const options = NestedOptions.parseSelectElement(select, true);

    expect(options).toHaveLength(2);
    expect(options[0].text).toBe('Group 1');
    expect(options[0].children).toHaveLength(2);
    expect(options[0].children[0]).toMatchObject({ value: '1a', text: 'Option 1A', level: 1 });
  });
});

describe('NestedOptions - Tree Operations', () => {
  let tree: OptionData[];

  beforeEach(() => {
    tree = [
      {
        value: 'g1',
        text: 'Group 1',
        disabled: false,
        selected: false,
        parent: null,
        level: 0,
        expanded: false,
        indeterminate: false,
        children: [
          { value: '1a', text: 'Option 1A', disabled: false, selected: false, parent: 'g1', children: [], level: 1, expanded: false, indeterminate: false },
          { value: '1b', text: 'Option 1B', disabled: false, selected: true, parent: 'g1', children: [], level: 1, expanded: false, indeterminate: false },
        ],
      },
      {
        value: '2',
        text: 'Option 2',
        disabled: false,
        selected: false,
        parent: null,
        level: 0,
        expanded: false,
        indeterminate: false,
        children: [],
      },
    ];
  });

  it('flattens option tree', () => {
    const flat = NestedOptions.flattenOptions(tree);
    expect(flat).toHaveLength(4);
    expect(flat.map((o) => o.value)).toEqual(['g1', '1a', '1b', '2']);
  });

  it('finds option by value', () => {
    const option = NestedOptions.findOption(tree, '1a');
    expect(option?.text).toBe('Option 1A');
  });

  it('gets parent chain', () => {
    const child = NestedOptions.findOption(tree, '1b')!;
    const chain = NestedOptions.getParentChain(child, tree);
    expect(chain).toHaveLength(1);
    expect(chain[0].value).toBe('g1');
  });

  it('gets child options recursively', () => {
    const children = NestedOptions.getChildOptions(tree[0]);
    expect(children).toHaveLength(2);
    expect(children.map((c) => c.value)).toEqual(['1a', '1b']);
  });

  it('gets all values', () => {
    const values = NestedOptions.getAllValues(tree);
    expect(values).toEqual(['g1', '1a', '1b', '2']);
  });

  it('gets selected options', () => {
    const selected = NestedOptions.getSelectedOptions(tree);
    expect(selected).toHaveLength(1);
    expect(selected[0].value).toBe('1b');
  });

  it('gets leaf options only', () => {
    const leaves = NestedOptions.getLeafOptions(tree);
    expect(leaves).toHaveLength(3);
    expect(leaves.map((l) => l.value)).toEqual(['1a', '1b', '2']);
  });
});

describe('NestedOptions - Selection Logic', () => {
  let tree: OptionData[];

  beforeEach(() => {
    tree = [
      {
        value: 'g1',
        text: 'Group 1',
        disabled: false,
        selected: false,
        parent: null,
        level: 0,
        expanded: false,
        indeterminate: false,
        children: [
          { value: '1a', text: 'Option 1A', disabled: false, selected: false, parent: 'g1', children: [], level: 1, expanded: false, indeterminate: false },
          { value: '1b', text: 'Option 1B', disabled: false, selected: false, parent: 'g1', children: [], level: 1, expanded: false, indeterminate: false },
        ],
      },
    ];
  });

  it('selects with cascade', () => {
    NestedOptions.selectWithCascade(tree[0], tree, true);
    expect(tree[0].selected).toBe(true);
    expect(tree[0].children[0].selected).toBe(true);
    expect(tree[0].children[1].selected).toBe(true);
  });

  it('deselects with cascade', () => {
    tree[0].selected = true;
    tree[0].children[0].selected = true;
    tree[0].children[1].selected = true;

    NestedOptions.deselectWithCascade(tree[0], tree, true);
    expect(tree[0].selected).toBe(false);
    expect(tree[0].children[0].selected).toBe(false);
    expect(tree[0].children[1].selected).toBe(false);
  });

  it('updates parent state to indeterminate', () => {
    tree[0].children[0].selected = true;
    NestedOptions.updateParentState(tree[0].children[0], tree);
    expect(tree[0].selected).toBe(false);
    expect(tree[0].indeterminate).toBe(true);
  });

  it('updates parent state to checked', () => {
    tree[0].children[0].selected = true;
    tree[0].children[1].selected = true;
    NestedOptions.updateParentState(tree[0].children[0], tree);
    expect(tree[0].selected).toBe(true);
    expect(tree[0].indeterminate).toBe(false);
  });
});

describe('NestedOptions - Expand/Collapse', () => {
  let tree: OptionData[];

  beforeEach(() => {
    tree = [
      {
        value: 'g1',
        text: 'Group 1',
        disabled: false,
        selected: false,
        parent: null,
        level: 0,
        expanded: false,
        indeterminate: false,
        children: [
          { value: '1a', text: 'Option 1A', disabled: false, selected: false, parent: 'g1', children: [], level: 1, expanded: false, indeterminate: false },
        ],
      },
    ];
  });

  it('expands all groups', () => {
    NestedOptions.expandAll(tree);
    expect(tree[0].expanded).toBe(true);
  });

  it('collapses all groups', () => {
    tree[0].expanded = true;
    NestedOptions.collapseAll(tree);
    expect(tree[0].expanded).toBe(false);
  });

  it('toggles expand state', () => {
    NestedOptions.toggleExpand(tree[0]);
    expect(tree[0].expanded).toBe(true);
    NestedOptions.toggleExpand(tree[0]);
    expect(tree[0].expanded).toBe(false);
  });

  it('checks if option is parent', () => {
    expect(NestedOptions.isParentOption(tree[0])).toBe(true);
    expect(NestedOptions.isParentOption(tree[0].children[0])).toBe(false);
  });
});
