import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SingleSelect } from '@/SingleSelect';

describe('SingleSelect Event: change', () => {
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

  it('emits change event on setValue', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ss.setValue('1');

    expect(handler).toHaveBeenCalled();
  });

  it('includes selected value in event detail', () => {
    let eventDetail: any;
    select.addEventListener('change', (e: any) => {
      eventDetail = e.detail;
    });

    ss.setValue('2');

    expect(eventDetail).toBeDefined();
    expect(eventDetail.value).toBe('2');
    expect(eventDetail.option).toBeDefined();
    expect(eventDetail.option.value).toBe('2');
    expect(eventDetail.instance).toBe(ss);
  });

  it('emits change with null value on clear', () => {
    ss.setValue('1');

    let eventDetail: any;
    select.addEventListener('change', (e: any) => {
      eventDetail = e.detail;
    });

    ss.clear();

    expect(eventDetail.value).toBeNull();
    expect(eventDetail.option).toBeNull();
  });

  it('emits change on each setValue call', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ss.setValue('1');
    ss.setValue('2');
    ss.setValue('3');

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('does not emit change when setting same value', () => {
    ss.setValue('1');

    const handler = vi.fn();
    select.addEventListener('change', handler);

    ss.setValue('1');

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('SingleSelect Event: singleselect:open', () => {
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

  it('emits singleselect:open when dropdown opens', () => {
    const handler = vi.fn();
    select.addEventListener('singleselect:open', handler);

    ss.open();

    expect(handler).toHaveBeenCalled();
  });

  it('does not emit when already open', () => {
    ss.open();

    const handler = vi.fn();
    select.addEventListener('singleselect:open', handler);

    ss.open();

    expect(handler).not.toHaveBeenCalled();
  });

  it('includes current value in event detail', () => {
    ss.setValue('1');

    let eventDetail: any;
    select.addEventListener('singleselect:open', (e: any) => {
      eventDetail = e.detail;
    });

    ss.open();

    expect(eventDetail.value).toBe('1');
    expect(eventDetail.instance).toBe(ss);
  });
});

describe('SingleSelect Event: singleselect:close', () => {
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

  it('emits singleselect:close when dropdown closes', () => {
    ss.open();

    const handler = vi.fn();
    select.addEventListener('singleselect:close', handler);

    ss.close();

    expect(handler).toHaveBeenCalled();
  });

  it('does not emit when already closed', () => {
    const handler = vi.fn();
    select.addEventListener('singleselect:close', handler);

    ss.close();

    expect(handler).not.toHaveBeenCalled();
  });

  it('includes current value in event detail', () => {
    ss.setValue('1');
    ss.open();

    let eventDetail: any;
    select.addEventListener('singleselect:close', (e: any) => {
      eventDetail = e.detail;
    });

    ss.close();

    expect(eventDetail.value).toBe('1');
    expect(eventDetail.instance).toBe(ss);
  });
});

describe('SingleSelect Event: singleselect:search', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { searchEnabled: true, searchDebounce: 0 });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('emits singleselect:search on search input', () => {
    const handler = vi.fn();
    select.addEventListener('singleselect:search', handler);

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;
    searchInput.value = 'app';
    searchInput.dispatchEvent(new Event('input'));

    expect(handler).toHaveBeenCalled();
  });

  it('includes search query and results count in event detail', () => {
    let eventDetail: any;
    select.addEventListener('singleselect:search', (e: any) => {
      eventDetail = e.detail;
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;
    searchInput.value = 'app';
    searchInput.dispatchEvent(new Event('input'));

    expect(eventDetail.query).toBe('app');
    expect(eventDetail.resultsCount).toBe(1); // Only "Apple" matches
  });

  it('shows all results when search is cleared', () => {
    let eventDetail: any;
    select.addEventListener('singleselect:search', (e: any) => {
      eventDetail = e.detail;
    });

    ss.open();
    const searchInput = document.querySelector('.ss-singleselect__search-input') as HTMLInputElement;

    searchInput.value = 'app';
    searchInput.dispatchEvent(new Event('input'));

    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));

    expect(eventDetail.query).toBe('');
    expect(eventDetail.resultsCount).toBe(3); // All options
  });
});

describe('SingleSelect Event: singleselect:clear', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="">None</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { showClear: true });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('emits singleselect:clear when clear is called', () => {
    ss.setValue('1');

    const handler = vi.fn();
    select.addEventListener('singleselect:clear', handler);

    ss.clear();

    expect(handler).toHaveBeenCalled();
  });

  it('includes previous value in event detail', () => {
    ss.setValue('2');

    let eventDetail: any;
    select.addEventListener('singleselect:clear', (e: any) => {
      eventDetail = e.detail;
    });

    ss.clear();

    expect(eventDetail.previousValue).toBe('2');
    expect(eventDetail.value).toBeNull();
  });

  it('does not emit when already cleared', () => {
    const handler = vi.fn();
    select.addEventListener('singleselect:clear', handler);

    ss.clear();

    expect(handler).not.toHaveBeenCalled();
  });
});

describe('SingleSelect Event: Nested Options (expand/collapse)', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <optgroup label="Fruits">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </optgroup>
      <optgroup label="Vegetables">
        <option value="carrot">Carrot</option>
        <option value="lettuce">Lettuce</option>
      </optgroup>
    `;
    document.body.appendChild(select);
    ss = new SingleSelect(select, { nestedOptions: true });
  });

  afterEach(() => {
    ss.destroy();
    select.remove();
  });

  it('emits singleselect:expand when group is expanded', () => {
    const handler = vi.fn();
    select.addEventListener('singleselect:expand', handler);

    ss.expandGroup('__group_Fruits');

    expect(handler).toHaveBeenCalled();
  });

  it('emits singleselect:collapse when group is collapsed', () => {
    ss.expandGroup('__group_Fruits');

    const handler = vi.fn();
    select.addEventListener('singleselect:collapse', handler);

    ss.collapseGroup('__group_Fruits');

    expect(handler).toHaveBeenCalled();
  });

  it('includes group value in expand event detail', () => {
    let eventDetail: any;
    select.addEventListener('singleselect:expand', (e: any) => {
      eventDetail = e.detail;
    });

    ss.expandGroup('__group_Vegetables');

    expect(eventDetail.group).toBe('__group_Vegetables');
    expect(eventDetail.instance).toBe(ss);
  });

  it('includes group value in collapse event detail', () => {
    ss.expandGroup('__group_Vegetables');

    let eventDetail: any;
    select.addEventListener('singleselect:collapse', (e: any) => {
      eventDetail = e.detail;
    });

    ss.collapseGroup('__group_Vegetables');

    expect(eventDetail.group).toBe('__group_Vegetables');
    expect(eventDetail.instance).toBe(ss);
  });
});

describe('SingleSelect Event: Native select compatibility', () => {
  let select: HTMLSelectElement;
  let ss: SingleSelect;

  beforeEach(() => {
    select = document.createElement('select');
    select.innerHTML = `
      <option value="">None</option>
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

  it('events fire on original select element', () => {
    const handler = vi.fn();
    select.addEventListener('change', handler);

    ss.setValue('1');

    expect(handler).toHaveBeenCalled();
  });

  it('allows preventDefault on change event', () => {
    select.addEventListener('change', (e) => {
      e.preventDefault();
    });

    ss.setValue('1');

    // Event should still fire even if prevented
    expect(ss.getValue()).toBe('1');
  });
});
