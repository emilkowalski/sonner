/**
 * Vanilla JavaScript Toaster implementation
 * Main class for managing toast container and rendering
 */

import { ToastState, type VanillaToast, type ToastToDismiss } from './state';
import { createToastElement } from './dom';

export interface ToasterOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  duration?: number;
  closeButton?: boolean;
  richColors?: boolean;
  expand?: boolean;
  visibleToasts?: number;
  gap?: number;
  theme?: 'light' | 'dark' | 'system';
  className?: string;
  style?: Record<string, string>;
  offset?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
}

const TOAST_LIFETIME = 4000;
const GAP = 14;
const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = '24px';
const TIME_BEFORE_UNMOUNT = 200;

/**
 * Vanilla JS Toaster class
 */
export class Toaster {
  private container: HTMLElement | null = null;
  private toastElements = new Map<string | number, HTMLElement>();
  private toastTimers = new Map<string | number, number>();
  private unsubscribe?: () => void;
  private options: ToasterOptions;

  constructor(options: ToasterOptions = {}) {
    this.options = {
      position: options.position || 'bottom-right',
      duration: options.duration || TOAST_LIFETIME,
      closeButton: options.closeButton !== undefined ? options.closeButton : false,
      richColors: options.richColors || false,
      expand: options.expand || false,
      visibleToasts: options.visibleToasts || VISIBLE_TOASTS_AMOUNT,
      gap: options.gap || GAP,
      theme: options.theme || 'light',
      offset: options.offset || VIEWPORT_OFFSET,
      dir: options.dir || 'auto',
      ...options,
    };
  }

  /**
   * Initialize the toaster and mount it to the DOM
   */
  mount(targetElement?: HTMLElement): void {
    if (this.container) {
      return; // Already mounted
    }

    // Create container element
    this.container = document.createElement('ol');
    this.container.setAttribute('data-sonner-toaster', '');
    this.container.setAttribute('data-theme', this.options.theme!);
    this.container.setAttribute('data-rich-colors', String(this.options.richColors));
    this.container.setAttribute('dir', this.options.dir!);
    
    if (this.options.className) {
      this.container.className = this.options.className;
    }

    // Set position
    const [y, x] = (this.options.position || 'bottom-right').split('-');
    this.container.style.setProperty('--front-toast-height', '0px');
    this.container.style.setProperty('--offset', this.options.offset!);
    this.container.style.setProperty('--gap', `${this.options.gap}px`);
    
    // Position the container
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '9999';
    this.container.style.listStyle = 'none';
    this.container.style.padding = '0';
    this.container.style.margin = '0';
    
    if (y === 'top') {
      this.container.style.top = this.options.offset!;
    } else {
      this.container.style.bottom = this.options.offset!;
    }
    
    if (x === 'left') {
      this.container.style.left = this.options.offset!;
    } else if (x === 'right') {
      this.container.style.right = this.options.offset!;
    } else {
      // center
      this.container.style.left = '50%';
      this.container.style.transform = 'translateX(-50%)';
    }

    // Apply custom styles
    if (this.options.style) {
      Object.keys(this.options.style).forEach((key) => {
        this.container!.style.setProperty(key, this.options.style![key]);
      });
    }

    // Mount to DOM
    const target = targetElement || document.body;
    target.appendChild(this.container);

    // Subscribe to toast state changes
    this.unsubscribe = ToastState.subscribe((data) => {
      this.handleToastUpdate(data);
    });
  }

  /**
   * Unmount the toaster from the DOM
   */
  unmount(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    // Clear all timers
    this.toastTimers.forEach((timer) => clearTimeout(timer));
    this.toastTimers.clear();

    // Remove container from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.toastElements.clear();
  }

  /**
   * Handle toast state updates
   */
  private handleToastUpdate(data: VanillaToast | ToastToDismiss): void {
    if ('dismiss' in data && data.dismiss) {
      this.dismissToast(data.id);
    } else {
      this.addToast(data as VanillaToast);
    }
  }

  /**
   * Add a toast to the DOM
   */
  private addToast(toast: VanillaToast): void {
    if (!this.container) {
      return;
    }

    // Create toast element
    const toastEl = createToastElement(toast, {
      closeButton: this.options.closeButton,
      onDismiss: () => {
        if (toast.onDismiss) {
          toast.onDismiss(toast);
        }
        ToastState.dismiss(toast.id);
      },
    });

    // Add to container
    this.container.appendChild(toastEl);
    this.toastElements.set(toast.id, toastEl);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      toastEl.setAttribute('data-mounted', '');
    });

    // Set up auto-dismiss timer if duration is set
    const duration = toast.duration !== undefined ? toast.duration : this.options.duration;
    if (duration && duration > 0 && duration !== Infinity) {
      const timer = window.setTimeout(() => {
        if (toast.onAutoClose) {
          toast.onAutoClose(toast);
        }
        ToastState.dismiss(toast.id);
      }, duration);
      
      this.toastTimers.set(toast.id, timer);
    }
  }

  /**
   * Dismiss a toast
   */
  private dismissToast(id: string | number): void {
    const toastEl = this.toastElements.get(id);
    if (!toastEl) {
      return;
    }

    // Clear timer if exists
    const timer = this.toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.toastTimers.delete(id);
    }

    // Trigger exit animation
    toastEl.setAttribute('data-removed', '');

    // Remove from DOM after animation
    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
      this.toastElements.delete(id);
    }, TIME_BEFORE_UNMOUNT);
  }
}

/**
 * Create and mount a toaster instance
 * Returns the toaster instance for further control
 */
export function createToaster(options?: ToasterOptions, targetElement?: HTMLElement): Toaster {
  const toaster = new Toaster(options);
  toaster.mount(targetElement);
  return toaster;
}
