import { ToastState } from './state';
import type { HeightT, Position, ToastClassnames, ToasterConfig, ToastT, ToastToDismiss } from '../core';
import {
  assignOffset,
  cn,
  GAP,
  getDefaultSwipeDirections,
  getDocumentDirection,
  getSystemTheme,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
  TOAST_WIDTH,
  VISIBLE_TOASTS_AMOUNT,
} from '../core';
import { closeIcon, createLoader, getAssetIcon } from './assets';

import '../styles.css';

export { toast } from './state';
export type {
  ToastT,
  ExternalToast,
  ToasterConfig,
  ToastTypes,
  Position,
  Theme,
  ToastClassnames,
  Action,
} from '../core';

export interface ToasterOptions extends ToasterConfig {
  /**
   * Container element to render toasts in
   * If not provided, will be appended to document.body
   */
  container?: HTMLElement;
}

interface ToastElementState {
  element: HTMLLIElement;
  toast: ToastT;
  mounted: boolean;
  removed: boolean;
  swiping: boolean;
  swipeOut: boolean;
  isSwiped: boolean;
  swipeDirection: 'x' | 'y' | null;
  swipeOutDirection: 'left' | 'right' | 'up' | 'down' | null;
  offsetBeforeRemove: number;
  initialHeight: number;
  remainingTime: number;
  closeTimerStartTime: number;
  lastCloseTimerStartTime: number;
  dragStartTime: number | null;
  pointerStart: { x: number; y: number } | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

export class Toaster {
  private container: HTMLElement;
  private readonly section: HTMLElement;
  private toastLists: Map<Position, HTMLOListElement> = new Map();
  private toastElements: Map<string | number, ToastElementState> = new Map();
  private toasts: ToastT[] = [];
  private heights: HeightT[] = [];
  private expanded: boolean = false;
  private interacting: boolean = false;
  private unsubscribe?: () => void;
  private documentHidden: boolean = false;
  private actualTheme: 'light' | 'dark';
  private readonly resizeObserver?: ResizeObserver;

  // Configuration
  private config: Required<
    Omit<
      ToasterConfig,
      'icons' | 'toastOptions' | 'customAriaLabel' | 'containerAriaLabel' | 'hotkey' | 'swipeDirections'
    >
  > & {
    icons?: ToasterConfig['icons'];
    toastOptions?: ToasterConfig['toastOptions'];
    customAriaLabel?: string;
    containerAriaLabel: string;
    hotkey: string[];
    swipeDirections?: ToasterConfig['swipeDirections'];
  };

  constructor(options: ToasterOptions = {}) {
    this.config = {
      id: options.id,
      invert: options.invert ?? false,
      theme: options.theme ?? 'light',
      position: options.position ?? 'bottom-right',
      hotkey: options.hotkey ?? ['altKey', 'KeyT'],
      richColors: options.richColors ?? false,
      expand: options.expand ?? false,
      duration: options.duration,
      gap: options.gap ?? GAP,
      visibleToasts: options.visibleToasts ?? VISIBLE_TOASTS_AMOUNT,
      closeButton: options.closeButton ?? false,
      toastOptions: options.toastOptions,
      className: options.className ?? '',
      style: options.style ?? {},
      offset: options.offset,
      mobileOffset: options.mobileOffset,
      dir: options.dir ?? getDocumentDirection(),
      icons: options.icons,
      customAriaLabel: options.customAriaLabel,
      containerAriaLabel: options.containerAriaLabel ?? 'Notifications',
      swipeDirections: options.swipeDirections,
    };

    this.actualTheme = this.config.theme !== 'system' ? this.config.theme : getSystemTheme();

    this.container = options.container ?? document.body;
    this.section = this.createSection();
    this.container.appendChild(this.section);

    this.subscribe();

    this.setupThemeListener();

    this.setupVisibilityListener();

    this.setupHotkeyListener();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const toastId = (entry.target as HTMLElement).dataset.toastId;
          if (toastId) {
            const state = this.toastElements.get(toastId);
            if (state && state.mounted) {
              this.updateToastHeight(toastId, entry.contentRect.height);
            }
          }
        }
      });
    }
  }

  private createSection(): HTMLElement {
    const section = document.createElement('section');
    const hotkeyLabel = this.config.hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');

    section.setAttribute(
      'aria-label',
      this.config.customAriaLabel ?? `${this.config.containerAriaLabel} ${hotkeyLabel}`,
    );
    section.setAttribute('tabIndex', '-1');
    section.setAttribute('aria-live', 'polite');
    section.setAttribute('aria-relevant', 'additions text');
    section.setAttribute('aria-atomic', 'false');
    section.setAttribute('data-react-aria-top-layer', '');

    return section;
  }

  private subscribe(): void {
    this.unsubscribe = ToastState.subscribe((toast) => {
      if ((toast as ToastToDismiss).dismiss) {
        requestAnimationFrame(() => {
          const existing = this.toasts.find((t) => t.id === toast.id);
          if (existing) {
            this.toasts = this.toasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));
            this.updateToastElement(toast.id, { delete: true });
          }
        });
        return;
      }

      const indexOfExisting = this.toasts.findIndex((t) => t.id === toast.id);

      if (indexOfExisting !== -1) {
        // Update existing toast
        this.toasts = [
          ...this.toasts.slice(0, indexOfExisting),
          { ...this.toasts[indexOfExisting], ...toast },
          ...this.toasts.slice(indexOfExisting + 1),
        ];
        this.updateToastElement(toast.id, toast);
      } else {
        // Add new toast
        this.toasts = [toast as ToastT, ...this.toasts];
        this.renderToast(toast as ToastT);
      }

      this.updateToastPositions();
    });
  }

  private setupThemeListener(): void {
    if (this.config.theme === 'system' && typeof window !== 'undefined') {
      const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const updateTheme = (matches: boolean) => {
        this.actualTheme = matches ? 'dark' : 'light';
        this.updateThemeAttribute();
      };

      try {
        // Modern browsers
        darkMediaQuery.addEventListener('change', (e) => updateTheme(e.matches));
      } catch {
        // Safari < 14
        darkMediaQuery.addListener((e) => updateTheme(e.matches));
      }
    }
  }

  private updateThemeAttribute(): void {
    this.toastLists.forEach((list) => {
      list.setAttribute('data-sonner-theme', this.actualTheme);
    });
  }

  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      this.documentHidden = document.hidden;

      if (this.documentHidden) {
        this.pauseAllTimers();
      } else if (!this.expanded && !this.interacting) {
        this.resumeAllTimers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  private setupHotkeyListener(): void {
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isHotkeyPressed =
        this.config.hotkey.length > 0 && this.config.hotkey.every((key) => (event as any)[key] || event.code === key);

      if (isHotkeyPressed) {
        this.expanded = true;
        this.updateExpandedState();
        const firstList = Array.from(this.toastLists.values())[0];
        firstList?.focus();
      }

      if (event.code === 'Escape') {
        const activeElement = document.activeElement;
        this.toastLists.forEach((list) => {
          if (activeElement === list || list.contains(activeElement)) {
            this.expanded = false;
            this.updateExpandedState();
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
  }

  private getToastList(position: Position): HTMLOListElement {
    if (this.toastLists.has(position)) {
      return this.toastLists.get(position)!;
    }

    const list = document.createElement('ol');
    const [y, x] = position.split('-');

    list.setAttribute('dir', this.config.dir === 'auto' ? getDocumentDirection() : this.config.dir);
    list.setAttribute('tabIndex', '-1');
    list.className = this.config.className;
    list.setAttribute('data-sonner-toaster', '');
    list.setAttribute('data-sonner-theme', this.actualTheme);
    list.setAttribute('data-y-position', y);
    list.setAttribute('data-x-position', x);

    const styles = {
      '--front-toast-height': '0px',
      '--width': `${TOAST_WIDTH}px`,
      '--gap': `${this.config.gap}px`,
      ...this.config.style,
      ...assignOffset(this.config.offset, this.config.mobileOffset),
    };

    Object.entries(styles).forEach(([key, value]) => {
      list.style.setProperty(key, String(value));
    });

    list.addEventListener('mouseenter', () => {
      this.expanded = true;
      this.updateExpandedState();
    });

    list.addEventListener('mousemove', () => {
      this.expanded = true;
      this.updateExpandedState();
    });

    list.addEventListener('mouseleave', () => {
      if (!this.interacting) {
        this.expanded = false;
        this.updateExpandedState();
      }
    });

    list.addEventListener('dragend', () => {
      this.expanded = false;
      this.updateExpandedState();
    });

    list.addEventListener('pointerdown', (event) => {
      const target = event.target as HTMLElement;
      const isNotDismissible = target.dataset.dismissible === 'false';
      if (!isNotDismissible) {
        this.interacting = true;
        this.pauseAllTimers();
      }
    });

    list.addEventListener('pointerup', () => {
      this.interacting = false;
      if (!this.expanded && !this.documentHidden) {
        this.resumeAllTimers();
      }
    });

    this.toastLists.set(position, list);
    this.section.appendChild(list);

    return list;
  }

  private renderToast(toast: ToastT): void {
    const position = toast.position ?? this.config.position;
    const list = this.getToastList(position);

    const toastEl = document.createElement('li');
    toastEl.setAttribute('tabIndex', '0');
    toastEl.setAttribute('data-toast-id', String(toast.id));
    toastEl.setAttribute('data-sonner-toast', '');

    const state: ToastElementState = {
      element: toastEl,
      toast,
      mounted: false,
      removed: false,
      swiping: false,
      swipeOut: false,
      isSwiped: false,
      swipeDirection: null,
      swipeOutDirection: null,
      offsetBeforeRemove: 0,
      initialHeight: 0,
      remainingTime: toast.duration || this.config.duration || TOAST_LIFETIME,
      closeTimerStartTime: 0,
      lastCloseTimerStartTime: 0,
      dragStartTime: null,
      pointerStart: null,
      timeoutId: null,
    };

    this.toastElements.set(toast.id, state);

    this.buildToastContent(toastEl, toast, state);

    this.setupToastInteractions(toastEl, toast, state);

    list.insertBefore(toastEl, list.firstChild);

    if (this.resizeObserver) {
      this.resizeObserver.observe(toastEl);
    }

    requestAnimationFrame(() => {
      const height = toastEl.getBoundingClientRect().height;
      state.initialHeight = height;
      state.mounted = true;

      this.heights = [{ toastId: toast.id, height, position }, ...this.heights];

      this.updateToastAttributes(toastEl, toast, state);
      this.updateToastPositions();

      this.startAutoCloseTimer(toast.id);
    });
  }

  private buildToastContent(toastEl: HTMLLIElement, toast: ToastT, state: ToastElementState): void {
    const toastType = toast.type ?? 'default';
    const dismissible = toast.dismissible !== false;
    const closeButton = toast.closeButton ?? this.config.closeButton;

    if (closeButton && !toast.jsx && toastType !== 'loading') {
      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('aria-label', this.config.toastOptions?.closeButtonAriaLabel ?? 'Close toast');
      closeBtn.setAttribute('data-close-button', '');
      closeBtn.className = cn(this.config.toastOptions?.classNames?.closeButton, toast.classNames?.closeButton);
      closeBtn.innerHTML = this.config.icons?.close ?? closeIcon;
      closeBtn.addEventListener('click', () => {
        if (dismissible) {
          this.deleteToast(toast.id);
          toast.onDismiss?.(toast);
        }
      });
      toastEl.appendChild(closeBtn);
    }

    const customIcon =
      toastType !== 'default' && toastType !== 'action' && toastType !== 'normal' && toastType !== 'loading'
        ? this.config.icons?.[toastType]
        : undefined;

    const icon = toast.icon ?? customIcon ?? getAssetIcon(toastType);

    const shouldShowIcon =
      (toastType || toast.icon || toast.promise) &&
      toast.icon !== null &&
      (this.config.icons?.[toastType] !== null || toast.icon || toast.promise);

    if (shouldShowIcon) {
      const iconDiv = document.createElement('div');
      iconDiv.setAttribute('data-icon', '');
      iconDiv.className = cn(this.config.toastOptions?.classNames?.icon, toast.classNames?.icon);

      if (toast.promise || (toast.type === 'loading' && !toast.icon)) {
        if (toast.icon) {
          iconDiv.innerHTML = String(toast.icon);
        } else {
          iconDiv.appendChild(createLoader(true));
        }
      } else if (toast.type !== 'loading' && icon) {
        iconDiv.innerHTML = String(icon);
      }

      if (iconDiv.children.length > 0 || iconDiv.innerHTML) {
        toastEl.appendChild(iconDiv);
      }
    }

    // Content
    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('data-content', '');
    contentDiv.className = cn(this.config.toastOptions?.classNames?.content, toast.classNames?.content);

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.setAttribute('data-title', '');
    titleDiv.className = cn(this.config.toastOptions?.classNames?.title, toast.classNames?.title);

    const titleContent = toast.jsx ?? (typeof toast.title === 'function' ? toast.title() : toast.title);
    titleDiv.textContent = String(titleContent ?? '');
    contentDiv.appendChild(titleDiv);

    // Description
    if (toast.description) {
      const descDiv = document.createElement('div');
      descDiv.setAttribute('data-description', '');
      descDiv.className = cn(
        this.config.toastOptions?.descriptionClassName,
        toast.descriptionClassName,
        this.config.toastOptions?.classNames?.description,
        toast.classNames?.description,
      );
      const descContent = typeof toast.description === 'function' ? toast.description() : toast.description;
      descDiv.textContent = String(descContent ?? '');
      contentDiv.appendChild(descDiv);
    }

    toastEl.appendChild(contentDiv);

    this.addActionButtons(toastEl, toast, state);
  }

  private addActionButtons(toastEl: HTMLLIElement, toast: ToastT, state: ToastElementState): void {
    const dismissible = toast.dismissible !== false;

    // Cancel button
    if (toast.cancel && typeof toast.cancel === 'object' && 'label' in toast.cancel) {
      const cancelBtn = document.createElement('button');
      cancelBtn.setAttribute('data-button', '');
      cancelBtn.setAttribute('data-cancel', '');
      cancelBtn.className = cn(this.config.toastOptions?.classNames?.cancelButton, toast.classNames?.cancelButton);
      cancelBtn.textContent = String(toast.cancel.label);

      if (toast.cancelButtonStyle || this.config.toastOptions?.cancelButtonStyle) {
        Object.assign(cancelBtn.style, toast.cancelButtonStyle ?? this.config.toastOptions?.cancelButtonStyle);
      }

      cancelBtn.addEventListener('click', (event) => {
        if (dismissible && typeof toast.cancel === 'object' && 'onClick' in toast.cancel) {
          toast.cancel.onClick?.(event);
          this.deleteToast(toast.id);
        }
      });

      toastEl.appendChild(cancelBtn);
    }

    // Action button
    if (toast.action && typeof toast.action === 'object' && 'label' in toast.action) {
      const actionBtn = document.createElement('button');
      actionBtn.setAttribute('data-button', '');
      actionBtn.setAttribute('data-action', '');
      actionBtn.className = cn(this.config.toastOptions?.classNames?.actionButton, toast.classNames?.actionButton);
      actionBtn.textContent = String(toast.action.label);

      if (toast.actionButtonStyle || this.config.toastOptions?.actionButtonStyle) {
        Object.assign(actionBtn.style, toast.actionButtonStyle ?? this.config.toastOptions?.actionButtonStyle);
      }

      actionBtn.addEventListener('click', (event) => {
        if (typeof toast.action === 'object' && 'onClick' in toast.action) {
          toast.action.onClick?.(event);
          if (!event.defaultPrevented) {
            this.deleteToast(toast.id);
          }
        }
      });

      toastEl.appendChild(actionBtn);
    }
  }

  private setupToastInteractions(toastEl: HTMLLIElement, toast: ToastT, state: ToastElementState): void {
    const dismissible = toast.dismissible !== false;
    const disabled = toast.type === 'loading';
    const position = toast.position ?? this.config.position;

    toastEl.addEventListener('pointerdown', (event) => {
      if (event.button === 2) return; // Right click
      if (disabled || !dismissible) return;

      state.dragStartTime = Date.now();
      state.offsetBeforeRemove = this.getToastOffset(toast.id);

      const target = event.target as HTMLElement;
      target.setPointerCapture(event.pointerId);

      if (target.tagName === 'BUTTON') return;

      state.swiping = true;
      state.pointerStart = { x: event.clientX, y: event.clientY };
    });

    toastEl.addEventListener('pointerup', () => {
      if (state.swipeOut || !dismissible) return;

      state.pointerStart = null;

      const swipeAmountX = parseFloat(toastEl.style.getPropertyValue('--swipe-amount-x') || '0');
      const swipeAmountY = parseFloat(toastEl.style.getPropertyValue('--swipe-amount-y') || '0');
      const timeTaken = state.dragStartTime ? Date.now() - state.dragStartTime : 0;

      const swipeAmount = state.swipeDirection === 'x' ? swipeAmountX : swipeAmountY;
      const velocity = Math.abs(swipeAmount) / timeTaken;

      if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
        state.offsetBeforeRemove = this.getToastOffset(toast.id);
        toast.onDismiss?.(toast);

        if (state.swipeDirection === 'x') {
          state.swipeOutDirection = swipeAmountX > 0 ? 'right' : 'left';
        } else {
          state.swipeOutDirection = swipeAmountY > 0 ? 'down' : 'up';
        }

        this.deleteToast(toast.id);
        state.swipeOut = true;
      } else {
        toastEl.style.setProperty('--swipe-amount-x', '0px');
        toastEl.style.setProperty('--swipe-amount-y', '0px');
      }

      state.isSwiped = false;
      state.swiping = false;
      state.swipeDirection = null;
      this.updateToastAttributes(toastEl, toast, state);
    });

    toastEl.addEventListener('pointermove', (event) => {
      if (!state.pointerStart || !dismissible) return;

      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;

      const yDelta = event.clientY - state.pointerStart.y;
      const xDelta = event.clientX - state.pointerStart.x;

      const swipeDirections = this.config.swipeDirections ?? getDefaultSwipeDirections(position);

      if (!state.swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
        state.swipeDirection = Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y';
      }

      let swipeAmount = { x: 0, y: 0 };

      const getDampening = (delta: number) => {
        const factor = Math.abs(delta) / 20;
        return 1 / (1.5 + factor);
      };

      if (state.swipeDirection === 'y') {
        if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
          if ((swipeDirections.includes('top') && yDelta < 0) || (swipeDirections.includes('bottom') && yDelta > 0)) {
            swipeAmount.y = yDelta;
          } else {
            const dampenedDelta = yDelta * getDampening(yDelta);
            swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
          }
        }
      } else if (state.swipeDirection === 'x') {
        if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
          if ((swipeDirections.includes('left') && xDelta < 0) || (swipeDirections.includes('right') && xDelta > 0)) {
            swipeAmount.x = xDelta;
          } else {
            const dampenedDelta = xDelta * getDampening(xDelta);
            swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
          }
        }
      }

      if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
        state.isSwiped = true;
      }

      toastEl.style.setProperty('--swipe-amount-x', `${swipeAmount.x}px`);
      toastEl.style.setProperty('--swipe-amount-y', `${swipeAmount.y}px`);
      this.updateToastAttributes(toastEl, toast, state);
    });

    toastEl.addEventListener('dragend', () => {
      state.swiping = false;
      state.swipeDirection = null;
      state.pointerStart = null;
      this.updateToastAttributes(toastEl, toast, state);
    });
  }

  private updateToastAttributes(toastEl: HTMLLIElement, toast: ToastT, state: ToastElementState): void {
    const position = toast.position ?? this.config.position;
    const [y, x] = position.split('-');
    const index = this.getToastIndex(toast.id);
    const isFront = index === 0;
    const isVisible = index + 1 <= this.config.visibleToasts;
    const toastType = toast.type ?? 'default';
    const dismissible = toast.dismissible !== false;
    const invert = toast.invert ?? this.config.invert;

    toastEl.className = cn(
      this.config.toastOptions?.className,
      toast.className,
      this.config.toastOptions?.classNames?.toast,
      toast.classNames?.toast,
      this.config.toastOptions?.classNames?.default,
      this.config.toastOptions?.classNames?.[toastType as keyof ToastClassnames],
      toast.classNames?.[toastType as keyof ToastClassnames],
    );

    toastEl.setAttribute('data-rich-colors', String(toast.richColors ?? this.config.richColors));
    toastEl.setAttribute(
      'data-styled',
      String(!Boolean(toast.jsx || toast.unstyled || this.config.toastOptions?.unstyled)),
    );
    toastEl.setAttribute('data-mounted', String(state.mounted));
    toastEl.setAttribute('data-promise', String(Boolean(toast.promise)));
    toastEl.setAttribute('data-swiped', String(state.isSwiped));
    toastEl.setAttribute('data-removed', String(state.removed));
    toastEl.setAttribute('data-visible', String(isVisible));
    toastEl.setAttribute('data-y-position', y);
    toastEl.setAttribute('data-x-position', x);
    toastEl.setAttribute('data-index', String(index));
    toastEl.setAttribute('data-front', String(isFront));
    toastEl.setAttribute('data-swiping', String(state.swiping));
    toastEl.setAttribute('data-dismissible', String(dismissible));
    toastEl.setAttribute('data-type', toastType);
    toastEl.setAttribute('data-invert', String(invert));
    toastEl.setAttribute('data-swipe-out', String(state.swipeOut));
    toastEl.setAttribute('data-swipe-direction', state.swipeOutDirection ?? '');
    toastEl.setAttribute('data-expanded', String(this.expanded || this.config.expand));

    if (toast.testId) {
      toastEl.setAttribute('data-testid', toast.testId);
    }

    const offset = this.getToastOffset(toast.id);
    const styles = {
      '--index': String(index),
      '--toasts-before': String(index),
      '--z-index': String(this.toasts.length - index),
      '--offset': `${state.removed ? state.offsetBeforeRemove : offset}px`,
      '--initial-height': this.config.expand ? 'auto' : `${state.initialHeight}px`,
      ...this.config.toastOptions?.style,
      ...toast.style,
    };

    Object.entries(styles).forEach(([key, value]) => {
      toastEl.style.setProperty(key, String(value));
    });
  }

  private getToastIndex(toastId: string | number): number {
    const position = this.toasts.find((t) => t.id === toastId)?.position ?? this.config.position;
    const positionToasts = this.toasts.filter((t) => (t.position ?? this.config.position) === position);
    return positionToasts.findIndex((t) => t.id === toastId);
  }

  private getToastOffset(toastId: string | number): number {
    const position = this.toasts.find((t) => t.id === toastId)?.position ?? this.config.position;
    const positionHeights = this.heights.filter((h) => h.position === position);
    const heightIndex = positionHeights.findIndex((h) => h.toastId === toastId);

    if (heightIndex === -1) return 0;

    const toastsHeightBefore = positionHeights.reduce((prev, curr, reducerIndex) => {
      if (reducerIndex >= heightIndex) return prev;
      return prev + curr.height;
    }, 0);

    return heightIndex * this.config.gap + toastsHeightBefore;
  }

  private startAutoCloseTimer(toastId: string | number): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    const toast = state.toast;
    const toastType = toast.type;

    if ((toast.promise && toastType === 'loading') || toast.duration === Infinity || toastType === 'loading') {
      return;
    }

    if (!this.expanded && !this.interacting && !this.documentHidden) {
      this.resumeTimer(toastId);
    }
  }

  private pauseTimer(toastId: string | number): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }

    if (state.closeTimerStartTime > 0) {
      const elapsedTime = Date.now() - state.closeTimerStartTime;
      state.remainingTime = Math.max(0, state.remainingTime - elapsedTime);
      state.closeTimerStartTime = 0;
    }
  }

  private resumeTimer(toastId: string | number): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    const toast = state.toast;

    if (state.remainingTime === Infinity || state.remainingTime <= 0) return;

    state.closeTimerStartTime = Date.now();

    state.timeoutId = setTimeout(() => {
      toast.onAutoClose?.(toast);
      this.deleteToast(toastId);
    }, state.remainingTime);
  }

  private pauseAllTimers(): void {
    this.toastElements.forEach((state, id) => {
      this.pauseTimer(id);
    });
  }

  private resumeAllTimers(): void {
    this.toastElements.forEach((state, id) => {
      const toast = state.toast;
      const toastType = toast.type;

      // Don't resume loading toasts or infinite duration toasts
      if ((toast.promise && toastType === 'loading') || toast.duration === Infinity || toastType === 'loading') {
        return;
      }

      this.resumeTimer(id);
    });
  }

  private updateExpandedState(): void {
    this.toastElements.forEach((state, id) => {
      this.updateToastAttributes(state.element, state.toast, state);
    });

    if (this.expanded || this.interacting || this.documentHidden) {
      this.pauseAllTimers();
    } else {
      this.resumeAllTimers();
    }
  }

  private deleteToast(toastId: string | number): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    state.removed = true;
    state.offsetBeforeRemove = this.getToastOffset(toastId);
    this.updateToastAttributes(state.element, state.toast, state);

    this.heights = this.heights.filter((h) => h.toastId !== toastId);
    this.updateToastPositions();

    setTimeout(() => {
      this.removeToastElement(toastId);
    }, TIME_BEFORE_UNMOUNT);
  }

  private removeToastElement(toastId: string | number): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    if (this.resizeObserver) {
      this.resizeObserver.unobserve(state.element);
    }

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    state.element.remove();
    this.toastElements.delete(toastId);

    this.toasts = this.toasts.filter((t) => t.id !== toastId);

    this.updateToastPositions();

    this.cleanupEmptyLists();
  }

  private updateToastElement(toastId: string | number, updates: Partial<ToastT>): void {
    const state = this.toastElements.get(toastId);
    if (!state) return;

    state.toast = { ...state.toast, ...updates };

    if (updates.title || updates.description || updates.icon || updates.type) {
      state.element.innerHTML = '';
      this.buildToastContent(state.element, state.toast, state);
    }

    this.updateToastAttributes(state.element, state.toast, state);

    if (updates.delete) {
      this.deleteToast(toastId);
    }
  }

  private updateToastHeight(toastId: string | number, newHeight: number): void {
    const existing = this.heights.find((h) => h.toastId === toastId);
    if (existing && Math.abs(existing.height - newHeight) > 1) {
      this.heights = this.heights.map((h) => (h.toastId === toastId ? { ...h, height: newHeight } : h));
      this.updateToastPositions();
    }
  }

  private updateToastPositions(): void {
    const positions = new Set(this.toasts.map((t) => t.position ?? this.config.position));

    positions.forEach((position) => {
      const list = this.toastLists.get(position);
      if (!list) return;

      const positionHeights = this.heights.filter((h) => h.position === position);
      const frontHeight = positionHeights[0]?.height ?? 0;

      list.style.setProperty('--front-toast-height', `${frontHeight}px`);

      const positionToasts = this.toasts.filter((t) => (t.position ?? this.config.position) === position);
      positionToasts.forEach((toast) => {
        const state = this.toastElements.get(toast.id);
        if (state) {
          this.updateToastAttributes(state.element, toast, state);
        }
      });
    });

    if (this.toasts.length <= 1) {
      this.expanded = false;
    }
  }

  private cleanupEmptyLists(): void {
    this.toastLists.forEach((list, position) => {
      if (list.children.length === 0) {
        list.remove();
        this.toastLists.delete(position);
      }
    });
  }

  destroy(): void {
    this.unsubscribe?.();

    this.toastElements.forEach((state) => {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
    });

    this.resizeObserver?.disconnect();

    this.section.remove();

    this.toastElements.clear();
    this.toastLists.clear();
    this.toasts = [];
    this.heights = [];
  }
}

export function createToaster(options?: ToasterOptions): Toaster {
  return new Toaster(options);
}
