/**
 * Vanilla JavaScript state management for Sonner toasts
 * No React dependencies - pure JavaScript implementation
 */

export type ToastType = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export interface VanillaToast {
  id: number | string;
  type?: ToastType;
  title: string | HTMLElement;
  description?: string | HTMLElement;
  duration?: number;
  dismissible?: boolean;
  onDismiss?: (toast: VanillaToast) => void;
  onAutoClose?: (toast: VanillaToast) => void;
  action?: {
    label: string;
    onClick: (event: MouseEvent) => void;
  };
  cancel?: {
    label: string;
    onClick: (event: MouseEvent) => void;
  };
  icon?: string | HTMLElement;
  className?: string;
  style?: Record<string, string>;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}

type Subscriber = (toast: VanillaToast | ToastToDismiss) => void;

let toastsCounter = 1;

/**
 * Observer pattern for managing toast state
 */
class ToastObserver {
  private subscribers: Subscriber[] = [];
  private toasts: (VanillaToast | ToastToDismiss)[] = [];
  private dismissedToasts: Set<string | number> = new Set();

  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.push(subscriber);
    
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private publish(data: VanillaToast | ToastToDismiss): void {
    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  addToast(data: VanillaToast): void {
    this.publish(data);
    this.toasts.push(data);
  }

  create(data: Partial<VanillaToast> & { title: string | HTMLElement }): number | string {
    const id = data.id || toastsCounter++;
    
    const toast: VanillaToast = {
      ...data,
      id,
      title: data.title,
      dismissible: data.dismissible !== false,
    };
    
    this.addToast(toast);
    return id;
  }

  dismiss(id?: number | string): void {
    if (id === undefined) {
      // Dismiss all toasts
      this.toasts.forEach((toast) => {
        if ('id' in toast) {
          this.dismissedToasts.add(toast.id);
          this.publish({ id: toast.id, dismiss: true });
        }
      });
    } else {
      this.dismissedToasts.add(id);
      this.publish({ id, dismiss: true });
    }
  }

  message(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'default' });
  }

  success(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'success' });
  }

  error(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'error' });
  }

  info(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'info' });
  }

  warning(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'warning' });
  }

  loading(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
    return this.create({ ...data, title, type: 'loading' });
  }

  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    options?: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: any) => string);
    }
  ): Promise<T> {
    if (!options) {
      return promise instanceof Function ? promise() : promise;
    }

    let id: string | number | undefined;
    
    if (options.loading) {
      id = this.create({
        title: options.loading,
        type: 'loading',
      });
    }

    const p = promise instanceof Function ? promise() : promise;

    p.then((data) => {
      if (options.success) {
        const message = typeof options.success === 'function' ? options.success(data) : options.success;
        if (id !== undefined) {
          this.dismiss(id);
        }
        this.success(message);
      }
    }).catch((error) => {
      if (options.error) {
        const message = typeof options.error === 'function' ? options.error(error) : options.error;
        if (id !== undefined) {
          this.dismiss(id);
        }
        this.error(message);
      }
    });

    return p;
  }

  getActiveToasts(): VanillaToast[] {
    return this.toasts.filter(
      (toast): toast is VanillaToast => 
        'title' in toast && !this.dismissedToasts.has(toast.id)
    );
  }

  getHistory(): (VanillaToast | ToastToDismiss)[] {
    return [...this.toasts];
  }
}

export const ToastState = new ToastObserver();

// Create the main toast function
function toastFunction(title: string | HTMLElement, data?: Partial<VanillaToast>): number | string {
  const id = data?.id || toastsCounter++;
  
  ToastState.addToast({
    title,
    ...data,
    id,
    dismissible: data?.dismissible !== false,
  });
  
  return id;
}

// Export the toast function with all its methods
export const toast = Object.assign(toastFunction, {
  success: ToastState.success.bind(ToastState),
  info: ToastState.info.bind(ToastState),
  warning: ToastState.warning.bind(ToastState),
  error: ToastState.error.bind(ToastState),
  message: ToastState.message.bind(ToastState),
  promise: ToastState.promise.bind(ToastState),
  dismiss: ToastState.dismiss.bind(ToastState),
  loading: ToastState.loading.bind(ToastState),
  getHistory: () => ToastState.getHistory(),
  getToasts: () => ToastState.getActiveToasts(),
});
