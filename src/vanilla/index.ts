/**
 * Vanilla JavaScript version of Sonner
 * An opinionated toast component - no React required!
 */

export { toast, ToastState } from './state';
export { Toaster, createToaster } from './toaster';
export type { VanillaToast, ToastType } from './state';
export type { ToasterOptions } from './toaster';

// Also export a default convenience method
import { createToaster } from './toaster';
import type { ToasterOptions } from './toaster';

/**
 * Initialize Sonner with default or custom options
 * Usage: Sonner.init({ position: 'top-right' });
 */
export const Sonner = {
  init(options?: ToasterOptions, targetElement?: HTMLElement) {
    return createToaster(options, targetElement);
  },
};
