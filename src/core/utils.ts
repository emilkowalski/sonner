import type { Position, SwipeDirection, Offset } from './types';
import { VIEWPORT_OFFSET, MOBILE_VIEWPORT_OFFSET } from './constants';

export function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDefaultSwipeDirections(position: string): Array<SwipeDirection> {
  const [y, x] = position.split('-');
  const directions: Array<SwipeDirection> = [];

  if (y) {
    directions.push(y as SwipeDirection);
  }

  if (x) {
    directions.push(x as SwipeDirection);
  }

  return directions;
}

export function getDocumentDirection(): 'ltr' | 'rtl' | 'auto' {
  if (typeof window === 'undefined') return 'ltr';
  if (typeof document === 'undefined') return 'ltr';

  const dirAttribute = document.documentElement.getAttribute('dir');

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as 'ltr' | 'rtl' | 'auto';
  }

  return dirAttribute as 'ltr' | 'rtl' | 'auto';
}

export function assignOffset(defaultOffset?: Offset, mobileOffset?: Offset): Record<string, string> {
  const styles: Record<string, string> = {};

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? '--mobile-offset' : '--offset';
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    function assignAll(offset: string | number) {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof offset === 'number' ? `${offset}px` : offset;
      });
    }

    if (typeof offset === 'number' || typeof offset === 'string') {
      assignAll(offset);
    } else if (typeof offset === 'object' && offset !== null) {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        if (offset[key as keyof typeof offset] === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          const value = offset[key as keyof typeof offset];
          styles[`${prefix}-${key}`] = typeof value === 'number' ? `${value}px` : String(value);
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function calculateOffset(
  heights: Array<{ height: number; toastId: number | string; position: Position }>,
  heightIndex: number,
  gap: number
): number {
  return heights.reduce((prev, curr, reducerIndex) => {
    if (reducerIndex >= heightIndex) {
      return prev;
    }
    return prev + curr.height;
  }, 0) + heightIndex * gap;
}
