import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MultiSelect } from '@/MultiSelect';

describe('Configuration Tests', () => {
  let select: HTMLSelectElement;

  beforeEach(() => {
    select = document.createElement('select');
    select.multiple = true;
    select.innerHTML = '<option value="1">Option 1</option>';
    document.body.appendChild(select);
  });

  afterEach(() => {
    select.remove();
  });

  it('uses default configuration', () => {
    const ms = new MultiSelect(select);
    expect(ms.config.placeholder).toBe('Select options...');
    expect(ms.config.searchEnabled).toBe(true);
    expect(ms.config.selectedDisplayMode).toBe('count');
    expect(ms.config.showClearAll).toBe(true);
    expect(ms.config.showClose).toBe(true);
    expect(ms.config.nestedOptions).toBe(false);
    expect(ms.config.cascadeSelection).toBe(false);
    ms.destroy();
  });

  it('merges user config with defaults', () => {
    const ms = new MultiSelect(select, {
      placeholder: 'Custom placeholder',
      searchEnabled: false,
      selectedDisplayMode: 'tags',
    });

    expect(ms.config.placeholder).toBe('Custom placeholder');
    expect(ms.config.searchEnabled).toBe(false);
    expect(ms.config.selectedDisplayMode).toBe('tags');
    expect(ms.config.showClearAll).toBe(true); // Still default
    ms.destroy();
  });

  it('accepts all config options', () => {
    const ms = new MultiSelect(select, {
      placeholder: 'Test',
      searchPlaceholder: 'Search test',
      searchEnabled: false,
      showClearAll: false,
      showClose: false,
      clearAllText: 'Clear',
      closeText: 'Done',
      selectedDisplayMode: 'list',
      maxSelectedDisplay: 5,
      maxTags: 10,
      selectedTextSingular: '{count} selected',
      selectedTextPlural: '{count} selected',
      maxHeight: 400,
      position: 'top',
      searchStrategy: 'startsWith',
      closeOnOutsideClick: false,
      clearSearchOnClose: false,
      virtualScroll: true,
      animation: false,
      nestedOptions: true,
      cascadeSelection: true,
      showParentCheckbox: false,
      expandOnSearch: false,
      defaultExpanded: true,
      indentSize: 30,
    });

    expect(ms.config.placeholder).toBe('Test');
    expect(ms.config.searchPlaceholder).toBe('Search test');
    expect(ms.config.searchEnabled).toBe(false);
    expect(ms.config.showClearAll).toBe(false);
    expect(ms.config.showClose).toBe(false);
    expect(ms.config.clearAllText).toBe('Clear');
    expect(ms.config.closeText).toBe('Done');
    expect(ms.config.selectedDisplayMode).toBe('list');
    expect(ms.config.maxSelectedDisplay).toBe(5);
    expect(ms.config.maxTags).toBe(10);
    expect(ms.config.maxHeight).toBe(400);
    expect(ms.config.position).toBe('top');
    expect(ms.config.searchStrategy).toBe('startsWith');
    expect(ms.config.closeOnOutsideClick).toBe(false);
    expect(ms.config.clearSearchOnClose).toBe(false);
    expect(ms.config.virtualScroll).toBe(true);
    expect(ms.config.animation).toBe(false);
    expect(ms.config.nestedOptions).toBe(true);
    expect(ms.config.cascadeSelection).toBe(true);
    expect(ms.config.showParentCheckbox).toBe(false);
    expect(ms.config.expandOnSearch).toBe(false);
    expect(ms.config.defaultExpanded).toBe(true);
    expect(ms.config.indentSize).toBe(30);
    ms.destroy();
  });

  it('accepts custom formatter function', () => {
    const customFormatter = (options: any[]) => `Custom: ${options.length}`;
    const ms = new MultiSelect(select, {
      selectedDisplayMode: 'custom',
      selectedFormat: customFormatter,
    });

    expect(ms.config.selectedFormat).toBe(customFormatter);
    ms.destroy();
  });
});
