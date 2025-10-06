/**
 * SingleSelect Entry Point
 * Includes only SingleSelect component and shared styles
 */

// Import base styles (CSS variables)
import './styles/base.css';

// Import SingleSelect-specific styles
import './styles/singleselect.css';

// Export SingleSelect class and related types
export { SingleSelect, SingleSelect as default } from './SingleSelect';
export * from './types';
export * from './utils';
export * as NestedOptions from './NestedOptions';
