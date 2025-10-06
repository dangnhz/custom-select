import { describe, it, expect, beforeEach } from 'vitest';
import {
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  searchMatch,
  normalizeText,
  formatSelectedText,
  truncate,
  escapeHtml,
  unique,
  arraysEqual,
} from '@/utils';

describe('DOM Utilities', () => {
  it('creates element with className and attributes', () => {
    const el = createElement('div', 'test-class', { 'data-id': '123' });
    expect(el.tagName).toBe('DIV');
    expect(el.className).toBe('test-class');
    expect(el.getAttribute('data-id')).toBe('123');
  });

  it('adds CSS class', () => {
    const el = document.createElement('div');
    addClass(el, 'new-class');
    expect(el.classList.contains('new-class')).toBe(true);
  });

  it('removes CSS class', () => {
    const el = document.createElement('div');
    el.className = 'test-class';
    removeClass(el, 'test-class');
    expect(el.classList.contains('test-class')).toBe(false);
  });

  it('toggles CSS class', () => {
    const el = document.createElement('div');
    toggleClass(el, 'test-class');
    expect(el.classList.contains('test-class')).toBe(true);
    toggleClass(el, 'test-class');
    expect(el.classList.contains('test-class')).toBe(false);
  });

  it('checks if element has class', () => {
    const el = document.createElement('div');
    el.className = 'test-class';
    expect(hasClass(el, 'test-class')).toBe(true);
    expect(hasClass(el, 'other-class')).toBe(false);
  });
});

describe('Search Utilities', () => {
  it('normalizes text', () => {
    expect(normalizeText('  Hello World  ')).toBe('hello world');
    expect(normalizeText('UPPERCASE')).toBe('uppercase');
  });

  it('matches text with contains strategy', () => {
    expect(searchMatch('Hello World', 'world', 'contains')).toBe(true);
    expect(searchMatch('Hello World', 'foo', 'contains')).toBe(false);
  });

  it('matches text with startsWith strategy', () => {
    expect(searchMatch('Hello World', 'hello', 'startsWith')).toBe(true);
    expect(searchMatch('Hello World', 'world', 'startsWith')).toBe(false);
  });

  it('matches text with exact strategy', () => {
    expect(searchMatch('Hello', 'hello', 'exact')).toBe(true);
    expect(searchMatch('Hello World', 'hello', 'exact')).toBe(false);
  });

  it('returns true for empty query', () => {
    expect(searchMatch('anything', '', 'contains')).toBe(true);
  });
});

describe('String Utilities', () => {
  it('formats selected text with singular/plural', () => {
    expect(formatSelectedText(1, '{count} item selected', '{count} items selected'))
      .toBe('1 item selected');
    expect(formatSelectedText(3, '{count} item selected', '{count} items selected'))
      .toBe('3 items selected');
  });

  it('truncates text with ellipsis', () => {
    expect(truncate('Hello World', 5)).toBe('He...');
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>'))
      .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escapeHtml("It's & \"good\""))
      .toBe('It&#039;s &amp; &quot;good&quot;');
  });
});

describe('Array Utilities', () => {
  it('returns unique values', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('checks array equality', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arraysEqual([1, 2, 3], [3, 2, 1])).toBe(true);
    expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false);
  });
});
