import type { OptionData } from './types';

/**
 * Parse native select element into hierarchical option tree
 */
export function parseSelectElement(
  selectElement: HTMLSelectElement,
  nestedEnabled: boolean
): OptionData[] {
  if (nestedEnabled) {
    return parseNestedOptions(selectElement);
  }
  return parseFlatOptions(selectElement);
}

/**
 * Parse flat options (no optgroup support)
 */
function parseFlatOptions(selectElement: HTMLSelectElement): OptionData[] {
  return Array.from(selectElement.options).map((option) => ({
    value: option.value,
    text: option.text,
    label: option.text,
    disabled: option.disabled,
    selected: option.selected,
    parent: null,
    children: [],
    level: 0,
    expanded: false,
    indeterminate: false,
  }));
}

/**
 * Parse nested options with optgroup support
 */
function parseNestedOptions(selectElement: HTMLSelectElement): OptionData[] {
  const optionTree: OptionData[] = [];

  Array.from(selectElement.children).forEach((child) => {
    if (child.tagName === 'OPTGROUP') {
      // Create parent group from optgroup
      const optgroup = child as HTMLOptGroupElement;
      const parentOption: OptionData = {
        value: `__group_${optgroup.label}`,
        text: optgroup.label,
        label: optgroup.label,
        disabled: optgroup.disabled,
        selected: false,
        parent: null,
        children: [],
        level: 0,
        expanded: false,
        indeterminate: false,
      };

      // Parse children options
      Array.from(optgroup.children).forEach((child) => {
        if (child instanceof HTMLOptionElement) {
          const childOption: OptionData = {
            value: child.value,
            text: child.text,
            label: child.text,
            disabled: child.disabled,
            selected: child.selected,
            parent: parentOption.value,
            children: [],
            level: 1,
            expanded: false,
            indeterminate: false,
          };
          parentOption.children.push(childOption);
        }
      });

      optionTree.push(parentOption);
    } else if (child.tagName === 'OPTION') {
      // Standalone option (not in optgroup)
      const option = child as HTMLOptionElement;
      const optionData: OptionData = {
        value: option.value,
        text: option.text,
        label: option.text,
        disabled: option.disabled,
        selected: option.selected,
        parent: null,
        children: [],
        level: 0,
        expanded: false,
        indeterminate: false,
      };
      optionTree.push(optionData);
    }
  });

  return optionTree;
}

/**
 * Flatten option tree to a flat array (includes all descendants)
 */
export function flattenOptions(optionTree: OptionData[]): OptionData[] {
  const result: OptionData[] = [];

  function traverse(options: OptionData[]): void {
    options.forEach((option) => {
      result.push(option);
      if (option.children.length > 0) {
        traverse(option.children);
      }
    });
  }

  traverse(optionTree);
  return result;
}

/**
 * Find option by value in option tree
 */
export function findOption(optionTree: OptionData[], value: string): OptionData | null {
  const flattened = flattenOptions(optionTree);
  return flattened.find((option) => option.value === value) ?? null;
}

/**
 * Get parent chain for an option (from root to parent)
 */
export function getParentChain(option: OptionData, optionTree: OptionData[]): OptionData[] {
  const chain: OptionData[] = [];
  let current: OptionData | null = option;

  while (current?.parent) {
    const parent = findOption(optionTree, current.parent);
    if (parent) {
      chain.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Get all child options recursively
 */
export function getChildOptions(option: OptionData): OptionData[] {
  const children: OptionData[] = [];

  function traverse(opt: OptionData): void {
    opt.children.forEach((child) => {
      children.push(child);
      traverse(child);
    });
  }

  traverse(option);
  return children;
}

/**
 * Get all option values from tree
 */
export function getAllValues(optionTree: OptionData[]): string[] {
  return flattenOptions(optionTree).map((option) => option.value);
}

/**
 * Select option with optional cascade to children
 */
export function selectWithCascade(
  option: OptionData,
  optionTree: OptionData[],
  cascade: boolean
): void {
  option.selected = true;

  if (cascade && option.children.length > 0) {
    const children = getChildOptions(option);
    children.forEach((child) => {
      child.selected = true;
    });
  }

  // Update parent states
  updateParentState(option, optionTree);
}

/**
 * Deselect option with optional cascade to children
 */
export function deselectWithCascade(
  option: OptionData,
  optionTree: OptionData[],
  cascade: boolean
): void {
  option.selected = false;
  option.indeterminate = false;

  if (cascade && option.children.length > 0) {
    const children = getChildOptions(option);
    children.forEach((child) => {
      child.selected = false;
    });
  }

  // Update parent states
  updateParentState(option, optionTree);
}

/**
 * Update parent checkbox state (checked/indeterminate/unchecked)
 */
export function updateParentState(option: OptionData, optionTree: OptionData[]): void {
  if (!option.parent) return;

  const parent = findOption(optionTree, option.parent);
  if (!parent || parent.children.length === 0) return;

  const selectedChildren = parent.children.filter((child) => child.selected);
  const totalChildren = parent.children.length;

  if (selectedChildren.length === 0) {
    // No children selected
    parent.selected = false;
    parent.indeterminate = false;
  } else if (selectedChildren.length === totalChildren) {
    // All children selected
    parent.selected = true;
    parent.indeterminate = false;
  } else {
    // Some children selected
    parent.selected = false;
    parent.indeterminate = true;
  }

  // Recursively update grandparents
  updateParentState(parent, optionTree);
}

/**
 * Get all selected options from tree
 */
export function getSelectedOptions(optionTree: OptionData[]): OptionData[] {
  return flattenOptions(optionTree).filter((option) => option.selected);
}

/**
 * Expand all parent groups
 */
export function expandAll(optionTree: OptionData[]): void {
  optionTree.forEach((option) => {
    if (option.children.length > 0) {
      option.expanded = true;
      if (option.children.length > 0) {
        expandAll(option.children);
      }
    }
  });
}

/**
 * Collapse all parent groups
 */
export function collapseAll(optionTree: OptionData[]): void {
  optionTree.forEach((option) => {
    if (option.children.length > 0) {
      option.expanded = false;
      if (option.children.length > 0) {
        collapseAll(option.children);
      }
    }
  });
}

/**
 * Toggle expand/collapse state for an option
 */
export function toggleExpand(option: OptionData): void {
  if (option.children.length > 0) {
    option.expanded = !option.expanded;
  }
}

/**
 * Expand all parent groups for a specific option
 */
export function expandParents(option: OptionData, optionTree: OptionData[]): void {
  const parents = getParentChain(option, optionTree);
  parents.forEach((parent) => {
    parent.expanded = true;
  });
}

/**
 * Check if an option is a parent (has children)
 */
export function isParentOption(option: OptionData): boolean {
  return option.children.length > 0;
}

/**
 * Get only leaf options (options without children)
 */
export function getLeafOptions(optionTree: OptionData[]): OptionData[] {
  return flattenOptions(optionTree).filter((option) => option.children.length === 0);
}
