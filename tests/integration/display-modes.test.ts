import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('Display Mode: Count', () => {
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
    ms.destroy();
    select.remove();
  });

  it('displays count of selected items', () => {
    ms = new MultiSelect(select, { selectedDisplayMode: 'count' });

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Select options');

    ms.setValue(['1', '2']);
    expect(trigger.textContent).toContain('2 selected');
  });

  it('uses custom singular/plural text', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'count',
      selectedTextSingular: '{count} item selected',
      selectedTextPlural: '{count} items selected'
    });

    ms.setValue(['1']);
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('1 item selected');

    ms.setValue(['1', '2']);
    expect(trigger.textContent).toContain('2 items selected');
  });

  it('shows placeholder when nothing selected', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'count',
      placeholder: 'Choose items...'
    });

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Choose items');
  });
});

describe('Display Mode: List', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    `;
    document.body.appendChild(select);
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('displays comma-separated list of selected items', () => {
    ms = new MultiSelect(select, { selectedDisplayMode: 'list' });

    ms.setValue(['1', '2']);
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Option 1, Option 2');
  });

  it('truncates list when max display exceeded', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'list',
      maxSelectedDisplay: 2
    });

    ms.setValue(['1', '2', '3']);
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    const text = trigger.textContent || '';

    expect(text).toContain('Option 1, Option 2');
    expect(text).toContain('+1 more');
  });

  it('shows all items when maxSelectedDisplay not exceeded', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'list',
      maxSelectedDisplay: 5
    });

    ms.setValue(['1', '2', '3']);
    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    const text = trigger.textContent || '';

    expect(text).toContain('Option 1, Option 2, Option 3');
    expect(text).not.toContain('more');
  });
});

describe('Display Mode: Tags', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    `;
    document.body.appendChild(select);
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('displays tags for selected items', () => {
    ms = new MultiSelect(select, { selectedDisplayMode: 'tags' });

    ms.setValue(['1', '2']);

    const tags = document.querySelectorAll('.ms-multiselect__tag');
    expect(tags.length).toBe(2);
    expect(tags[0].textContent).toContain('Option 1');
    expect(tags[1].textContent).toContain('Option 2');
  });

  it('includes close button on each tag', () => {
    ms = new MultiSelect(select, { selectedDisplayMode: 'tags' });

    ms.setValue(['1', '2']);

    const closeBtns = document.querySelectorAll('.ms-multiselect__tag-close');
    expect(closeBtns.length).toBe(2);
  });

  it('limits tags when maxTags exceeded', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'tags',
      maxTags: 2
    });

    ms.setValue(['1', '2', '3', '4']);

    const tags = document.querySelectorAll('.ms-multiselect__tag');
    expect(tags.length).toBe(2);

    const overflow = document.querySelector('.ms-multiselect__tag-overflow');
    expect(overflow).toBeTruthy();
    expect(overflow?.textContent).toContain('+2');
  });

  it('shows all tags when maxTags not exceeded', () => {
    ms = new MultiSelect(select, {
      selectedDisplayMode: 'tags',
      maxTags: 10
    });

    ms.setValue(['1', '2', '3']);

    const tags = document.querySelectorAll('.ms-multiselect__tag');
    expect(tags.length).toBe(3);

    const overflow = document.querySelector('.ms-multiselect__tag-overflow');
    expect(overflow).toBeNull();
  });

  it('updates tags when selection changes', () => {
    ms = new MultiSelect(select, { selectedDisplayMode: 'tags' });

    ms.setValue(['1', '2']);
    expect(document.querySelectorAll('.ms-multiselect__tag').length).toBe(2);

    ms.setValue(['1']);
    expect(document.querySelectorAll('.ms-multiselect__tag').length).toBe(1);

    ms.setValue([]);
    expect(document.querySelectorAll('.ms-multiselect__tag').length).toBe(0);
  });
});

describe('Display Mode: Custom', () => {
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
    ms.destroy();
    select.remove();
  });

  it('uses custom formatter function', () => {
    const customFormatter = (options: any[]) => {
      if (options.length === 0) return 'Nothing selected';
      return `You chose: ${options.map(o => o.label).join(' & ')}`;
    };

    ms = new MultiSelect(select, {
      selectedDisplayMode: 'custom',
      selectedFormat: customFormatter
    });

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;
    expect(trigger.textContent).toContain('Nothing selected');

    ms.setValue(['1', '2']);
    expect(trigger.textContent).toContain('You chose: Option 1 & Option 2');
  });

  it('passes correct option data to formatter', () => {
    let capturedOptions: any[] = [];

    const customFormatter = (options: any[]) => {
      capturedOptions = options;
      return `${options.length} items`;
    };

    ms = new MultiSelect(select, {
      selectedDisplayMode: 'custom',
      selectedFormat: customFormatter
    });

    ms.setValue(['1', '2']);

    expect(capturedOptions.length).toBe(2);
    expect(capturedOptions[0]).toHaveProperty('value', '1');
    expect(capturedOptions[0]).toHaveProperty('label', 'Option 1');
    expect(capturedOptions[1]).toHaveProperty('value', '2');
    expect(capturedOptions[1]).toHaveProperty('label', 'Option 2');
  });

  it('updates display when formatter result changes', () => {
    let counter = 0;
    const customFormatter = (options: any[]) => {
      counter++;
      return `Update #${counter}: ${options.length} selected`;
    };

    ms = new MultiSelect(select, {
      selectedDisplayMode: 'custom',
      selectedFormat: customFormatter
    });

    const trigger = document.querySelector('.ms-multiselect__trigger') as HTMLElement;

    ms.setValue(['1']);
    expect(trigger.textContent).toContain('Update #2: 1 selected');

    ms.setValue(['1', '2']);
    expect(trigger.textContent).toContain('Update #3: 2 selected');
  });
});
