import type {
  ConsoleLogConfig,
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types';

import React from 'react';

let toastsCounter = 1;

// Console logging configuration
let consoleLogConfig: ConsoleLogConfig = {
  enabled: false,
  format: 'human',
};

// Extract text from ReactNode for logging
const extractText = (node: React.ReactNode | (() => React.ReactNode)): string => {
  if (typeof node === 'function') {
    try {
      return extractText(node());
    } catch {
      return '[Function]';
    }
  }
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node === null || node === undefined) return '';
  if (React.isValidElement(node)) return '[React Element]';
  if (Array.isArray(node)) return node.map(extractText).join('');
  return '';
};

// Log toast events to console
const logToast = (event: 'create' | 'update' | 'dismiss', toast: ToastT | { id: string | number }) => {
  if (!consoleLogConfig.enabled) return;
  if (typeof window === 'undefined') return; // SSR guard

  const id = toast.id;
  const type = 'type' in toast ? toast.type || 'default' : undefined;
  const title = 'title' in toast ? extractText(toast.title) : undefined;
  const description = 'description' in toast ? extractText(toast.description) : undefined;

  if (consoleLogConfig.format === 'json') {
    console.log(
      JSON.stringify({
        event,
        id,
        type,
        title: title || undefined,
        description: description || undefined,
        timestamp: Date.now(),
      }),
    );
  } else {
    // Human-readable format
    if (event === 'dismiss') {
      console.log(`[sonner:dismiss] Toast dismissed (id: ${id})`);
    } else {
      const descPart = description ? `, description: "${description}"` : '';
      console.log(`[sonner:${type || 'default'}] ${title || '(no title)'} (id: ${id}${descPart})`);
    }
  }
};

type titleT = (() => React.ReactNode) | React.ReactNode;

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;
  toasts: Array<ToastT | ToastToDismiss>;
  dismissedToasts: Set<string | number>;

  constructor() {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  configure = (config: Partial<ConsoleLogConfig>) => {
    consoleLogConfig = { ...consoleLogConfig, ...config };
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
    logToast('create', data);
  };

  create = (
    data: ExternalToast & {
      message?: titleT;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: React.ReactElement;
    },
  ) => {
    const { message, ...rest } = data;
    const id = typeof data?.id === 'number' || data.id?.length > 0 ? data.id : toastsCounter++;
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id;
    });
    const dismissible = data.dismissible === undefined ? true : data.dismissible;

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id);
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message });
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, ...rest, dismissible, id });
    }

    return id;
  };

  dismiss = (id?: number | string) => {
    if (id) {
      this.dismissedToasts.add(id);
      logToast('dismiss', { id });
      requestAnimationFrame(() => this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true })));
    } else {
      this.toasts.forEach((toast) => {
        logToast('dismiss', { id: toast.id });
        this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
      });
    }

    return id;
  };

  message = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message });
  };

  error = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'error' });
  };

  success = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message });
  };

  info = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message });
  };

  warning = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message });
  };

  loading = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message });
  };

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
    if (!data) {
      // Nothing to show
      return;
    }

    let id: string | number | undefined = undefined;
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: 'loading',
        message: data.loading,
        description: typeof data.description !== 'function' ? data.description : undefined,
      });
    }

    const p = Promise.resolve(promise instanceof Function ? promise() : promise);

    let shouldDismiss = id !== undefined;
    let result: ['resolve', ToastData] | ['reject', unknown];

    const originalPromise = p
      .then(async (response) => {
        result = ['resolve', response];
        const isReactElementResponse = React.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({ id, type: 'default', message: response });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;

          const promiseData =
            typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error;

          const description =
            typeof data.description === 'function'
              ? await data.description(`HTTP error! status: ${response.status}`)
              : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (data.success !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.success === 'function' ? await data.success(response) : data.success;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'success', description, ...toastSettings });
        }
      })
      .catch(async (error) => {
        result = ['reject', error];
        if (data.error !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.error === 'function' ? await data.error(error) : data.error;

          const description = typeof data.description === 'function' ? await data.description(error) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          this.dismiss(id);
          id = undefined;
        }

        data.finally?.();
      });

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise.then(() => (result[0] === 'reject' ? reject(result[1]) : resolve(result[1]))).catch(reject),
      );

    if (typeof id !== 'string' && typeof id !== 'number') {
      // cannot Object.assign on undefined
      return { unwrap };
    } else {
      return Object.assign(id, { unwrap });
    }
  };

  custom = (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++;
    this.create({ jsx: jsx(id), ...data, id });
    return id;
  };

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
  };
}

export const ToastState = new Observer();

// bind this to the toast function
const toastFunction = (message: titleT, data?: ExternalToast) => {
  const id = data?.id || toastsCounter++;

  ToastState.addToast({
    title: message,
    ...data,
    id,
  });
  return id;
};

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === 'object' &&
    'ok' in data &&
    typeof data.ok === 'boolean' &&
    'status' in data &&
    typeof data.status === 'number'
  );
};

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = () => ToastState.getActiveToasts();

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading,
    configure: ToastState.configure,
  },
  { getHistory, getToasts },
);
