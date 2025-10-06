/**
 * MultiSelect Entry Point
 * Includes only MultiSelect component and shared styles
 */

// Import base styles (CSS variables)
import './styles/base.css';

// Import MultiSelect-specific styles
import './styles/multiselect.css';

// Export MultiSelect class and related types
export { MultiSelect, MultiSelect as default } from './MultiSelect';
export * from './types';
export * from './utils';
export * as NestedOptions from './NestedOptions';
