/**
 * DOM manipulation utilities for vanilla JS toast rendering
 */

import type { VanillaToast, ToastType } from './state';

/**
 * Get SVG icon for toast type
 */
export function getIconForType(type: ToastType): string {
  switch (type) {
    case 'success':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
      </svg>`;
    case 'error':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>`;
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" height="20" width="20">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
      </svg>`;
    case 'info':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
      </svg>`;
    case 'loading':
      return createLoadingSpinner();
    default:
      return '';
  }
}

/**
 * Create a loading spinner element
 */
export function createLoadingSpinner(): string {
  const bars = Array(12).fill(0);
  const barsHtml = bars.map((_, i) => '<div class="sonner-loading-bar"></div>').join('');
  return `<div class="sonner-loading-wrapper" data-visible="true">
    <div class="sonner-spinner">${barsHtml}</div>
  </div>`;
}

/**
 * Create close button SVG
 */
export function getCloseIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>`;
}

/**
 * Render content (string or HTMLElement) into a container
 */
export function renderContent(content: string | HTMLElement, container: HTMLElement): void {
  if (typeof content === 'string') {
    container.innerHTML = content;
  } else {
    container.innerHTML = '';
    container.appendChild(content);
  }
}

/**
 * Apply styles to an element
 */
export function applyStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.keys(styles).forEach((key) => {
    element.style.setProperty(key, styles[key]);
  });
}

/**
 * Join class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Create a toast DOM element
 */
export function createToastElement(toast: VanillaToast, options: {
  closeButton?: boolean;
  onDismiss?: () => void;
}): HTMLElement {
  const toastEl = document.createElement('li');
  toastEl.setAttribute('data-sonner-toast', '');
  toastEl.setAttribute('data-toast-id', String(toast.id));
  
  if (toast.type) {
    toastEl.setAttribute('data-type', toast.type);
  }
  
  // Add classes
  const classes = ['sonner-toast'];
  if (toast.className) {
    classes.push(toast.className);
  }
  if (toast.type) {
    classes.push(`sonner-toast-${toast.type}`);
  }
  toastEl.className = classes.join(' ');
  
  // Apply custom styles
  if (toast.style) {
    applyStyles(toastEl, toast.style);
  }
  
  // Create toast content structure
  const toastContent = document.createElement('div');
  toastContent.className = 'sonner-toast-content';
  
  // Add icon if present or based on type
  if (toast.icon || toast.type) {
    const iconContainer = document.createElement('div');
    iconContainer.className = 'sonner-toast-icon';
    
    if (toast.icon) {
      renderContent(toast.icon, iconContainer);
    } else if (toast.type) {
      iconContainer.innerHTML = getIconForType(toast.type);
    }
    
    toastContent.appendChild(iconContainer);
  }
  
  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'sonner-toast-text';
  
  // Add title
  const titleEl = document.createElement('div');
  titleEl.className = 'sonner-toast-title';
  renderContent(toast.title, titleEl);
  textContainer.appendChild(titleEl);
  
  // Add description if present
  if (toast.description) {
    const descEl = document.createElement('div');
    descEl.className = 'sonner-toast-description';
    renderContent(toast.description, descEl);
    textContainer.appendChild(descEl);
  }
  
  toastContent.appendChild(textContainer);
  
  // Add action button if present
  if (toast.action) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'sonner-toast-action';
    actionBtn.setAttribute('data-button', '');
    actionBtn.textContent = toast.action.label;
    actionBtn.onclick = toast.action.onClick;
    toastContent.appendChild(actionBtn);
  }
  
  // Add cancel button if present
  if (toast.cancel) {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'sonner-toast-cancel';
    cancelBtn.setAttribute('data-button', '');
    cancelBtn.textContent = toast.cancel.label;
    cancelBtn.onclick = toast.cancel.onClick;
    toastContent.appendChild(cancelBtn);
  }
  
  toastEl.appendChild(toastContent);
  
  // Add close button if enabled
  if (options.closeButton) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sonner-toast-close';
    closeBtn.setAttribute('aria-label', 'Close toast');
    closeBtn.innerHTML = getCloseIcon();
    closeBtn.onclick = () => {
      if (options.onDismiss) {
        options.onDismiss();
      }
    };
    toastEl.appendChild(closeBtn);
  }
  
  return toastEl;
}
