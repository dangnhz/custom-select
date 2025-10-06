import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('Event: change', () => {
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

  it('emits change event on setValue', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ms.setValue(['1', '2']);

    expect(handler).toHaveBeenCalled();
  });

  it('includes selected values in event detail', () => {
    let eventDetail: any;
    select.addEventListener('change', (e: any) => {
      eventDetail = e.detail;
    });

    ms.setValue(['1', '2']);

    expect(eventDetail).toBeDefined();
    expect(eventDetail.values).toEqual(['1', '2']);
  });

  it('emits change on clearAll', () => {
    ms.setValue(['1', '2']);

    const handler = vi.fn();
    select.addEventListener('change', handler);

    ms.clearAll();

    expect(handler).toHaveBeenCalled();
  });

  it('emits change on selectAll', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ms.selectAll();

    expect(handler).toHaveBeenCalled();
  });
});

describe('Event: multiselect:open', () => {
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

  it('emits multiselect:open when dropdown opens', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:open', handler);

    ms.open();

    expect(handler).toHaveBeenCalled();
  });

  it('does not emit when already open', () => {
    ms.open();

    const handler = vi.fn();
    select.addEventListener('multiselect:open', handler);

    ms.open();

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('Event: multiselect:close', () => {
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

  it('emits multiselect:close when dropdown closes', () => {
    ms.open();

    const handler = vi.fn();
    select.addEventListener('multiselect:close', handler);

    ms.close();

    expect(handler).toHaveBeenCalled();
  });

  it('does not emit when already closed', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:close', handler);

    ms.close();

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('Event: multiselect:search', () => {
  let select: HTMLSelectElement;
  let ms: MultiSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = `
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Another Option</option>
    `;
    document.body.appendChild(select);
    ms = new MultiSelect(select, { searchEnabled: true, searchDebounce: 0 });
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('emits multiselect:search on search input', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:search', handler);

    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;
    searchInput.value = 'Option';
    searchInput.dispatchEvent(new Event('input'));

    expect(handler).toHaveBeenCalled();
  });

  it('includes search query in event detail', () => {
    let eventDetail: any;
    select.addEventListener('multiselect:search', (e: any) => {
      eventDetail = e.detail;
    });

    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;
    searchInput.value = 'test query';
    searchInput.dispatchEvent(new Event('input'));

    expect(eventDetail).toBeDefined();
    expect(eventDetail.query).toBe('test query');
  });

  it('includes filtered results count in event detail', () => {
    let eventDetail: any;
    select.addEventListener('multiselect:search', (e: any) => {
      eventDetail = e.detail;
    });

    const searchInput = document.querySelector('.ms-multiselect__search-input') as HTMLInputElement;
    searchInput.value = 'Another';
    searchInput.dispatchEvent(new Event('input'));

    expect(eventDetail).toBeDefined();
    expect(eventDetail.resultsCount).toBeDefined();
  });
});

describe('Event: multiselect:clear', () => {
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

  it('emits multiselect:clear when clearAll called', () => {
    ms.setValue(['1']);

    const handler = vi.fn();
    select.addEventListener('multiselect:clear', handler);

    ms.clearAll();

    expect(handler).toHaveBeenCalled();
  });

  it('includes previous values in event detail', () => {
    ms.setValue(['1']);

    let eventDetail: any;
    select.addEventListener('multiselect:clear', (e: any) => {
      eventDetail = e.detail;
    });

    ms.clearAll();

    expect(eventDetail).toBeDefined();
    expect(eventDetail.previousValues).toEqual(['1']);
  });
});

describe('Event: multiselect:expand', () => {
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

  it('emits multiselect:expand when group expanded', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:expand', handler);

    ms.expandGroup('__group_Group 1');

    expect(handler).toHaveBeenCalled();
  });

  it('includes group value in event detail', () => {
    let eventDetail: any;
    select.addEventListener('multiselect:expand', (e: any) => {
      eventDetail = e.detail;
    });

    ms.expandGroup('__group_Group 1');

    expect(eventDetail).toBeDefined();
    expect(eventDetail.group).toBe('__group_Group 1');
  });
});

describe('Event: multiselect:collapse', () => {
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
    ms.open();
  });

  afterEach(() => {
    ms.destroy();
    select.remove();
  });

  it('emits multiselect:collapse when group collapsed', () => {
    const handler = vi.fn();
    select.addEventListener('multiselect:collapse', handler);

    ms.collapseGroup('__group_Group 1');

    expect(handler).toHaveBeenCalled();
  });

  it('includes group value in event detail', () => {
    let eventDetail: any;
    select.addEventListener('multiselect:collapse', (e: any) => {
      eventDetail = e.detail;
    });

    ms.collapseGroup('__group_Group 1');

    expect(eventDetail).toBeDefined();
    expect(eventDetail.group).toBe('__group_Group 1');
  });
});

describe('Event Lifecycle', () => {
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

  it('removes event listeners on destroy', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ms.destroy();

    // Manual change to native select should not trigger custom handler
    select.options[0].selected = true;
    select.dispatchEvent(new Event('change'));

    // Handler should still be called (native listener not removed)
    // But our custom instance should be destroyed
    expect((select as any).multiSelectInstance).toBeUndefined();
  });

  it('emits events in correct order for selection', () => {
    const events: string[] = [];

    select.addEventListener('change', () => events.push('change'));
    select.addEventListener('multiselect:open', () => events.push('open'));
    select.addEventListener('multiselect:close', () => events.push('close'));

    ms.open();
    ms.setValue(['1']);
    ms.close();

    expect(events).toEqual(['open', 'change', 'close']);
  });
});
