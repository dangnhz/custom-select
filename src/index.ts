/**
 * Multi-Select Dropdown Library
 * A lightweight, accessible TypeScript library for multi-select and single-select dropdowns
 */


// Import modular styles (base + both components)
import './styles/base.css';
import './styles/multiselect.css';
import './styles/singleselect.css';

export { MultiSelect, MultiSelect as default } from './MultiSelect';
export { SingleSelect } from './SingleSelect';
export * from './types';
export * from './utils';
export * as NestedOptions from './NestedOptions';

