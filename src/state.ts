import type {
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

// Amount of toasts kept in `toast.getHistory()`. Dismissed toasts above this limit are
// dropped so long-running apps don't hold on to them (and their JSX) forever.
const MAX_HISTORY_SIZE = 100;

type titleT = (() => React.ReactNode) | React.ReactNode;

// A toast keeps the id it was given, otherwise it gets the next one from the counter.
// `custom` needs the same id `create` would pick, as it hands it to the JSX callback.
const getToastId = (data?: { id?: number | string }) => {
  return typeof data?.id === 'number' || data?.id?.length > 0 ? data.id : toastsCounter++;
};

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;
  toasts: Array<ToastT | ToastToDismiss>;
  dismissedToasts: Set<string | number>;
  // Dismissals that have been requested but not handed to the subscribers yet
  private pendingDismissals: Map<string | number, number>;

  constructor() {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
    this.pendingDismissals = new Map();
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    // A toast can be created before the `Toaster` had a chance to subscribe, e.g. when it's
    // called in an effect of a component rendered above the `Toaster`. Replay whatever is
    // still active so it doesn't get lost.
    this.getActiveToasts().forEach((toast) => subscriber(toast as ToastT));

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
    this.trimHistory();
  };

  // Keeps the history bounded without ever dropping a toast that's still on screen.
  private trimHistory = () => {
    let toRemove = this.toasts.length - MAX_HISTORY_SIZE;
    if (toRemove <= 0) return;

    this.toasts = this.toasts.filter((toast) => {
      if (toRemove > 0 && this.dismissedToasts.has(toast.id)) {
        this.dismissedToasts.delete(toast.id);
        toRemove--;
        return false;
      }

      return true;
    });
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
    const id = getToastId(data);

    // A dismissal that hasn't reached the subscribers yet gets cancelled: the toast is still
    // on screen, so this is an update of it rather than a new toast. Without this, creating a
    // toast right after dismissing the same id (React's double effect in StrictMode does
    // exactly that) would have the pending dismissal remove the toast that just got created.
    const pendingDismissal = this.pendingDismissals.get(id);
    if (pendingDismissal !== undefined) {
      cancelAnimationFrame(pendingDismissal);
      this.pendingDismissals.delete(id);
      this.dismissedToasts.delete(id);
    }

    const wasDismissed = this.dismissedToasts.has(id);
    const dismissible = data.dismissible === undefined ? true : data.dismissible;

    if (wasDismissed) {
      this.dismissedToasts.delete(id);
      // The previous toast with this id is gone, so this is a brand new toast. Drop the old
      // one instead of merging into it, otherwise its props (e.g. `action`) leak into the new one.
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }

    const alreadyExists = wasDismissed
      ? undefined
      : this.toasts.find((toast) => {
          return toast.id === id;
        });

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
    if (id === undefined || id === null) {
      this.getActiveToasts().forEach((toast) => {
        this.dismissedToasts.add(toast.id);
        this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
      });

      return id;
    }

    this.dismissedToasts.add(id);

    const alreadyPending = this.pendingDismissals.get(id);
    if (alreadyPending !== undefined) {
      cancelAnimationFrame(alreadyPending);
    }

    this.pendingDismissals.set(
      id,
      requestAnimationFrame(() => {
        this.pendingDismissals.delete(id);
        this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
      }),
    );

    return id;
  };

  message = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    // `type: undefined` resets the type when this updates a toast that had one, e.g. turning
    // a loading toast into a plain one.
    return this.create({ ...data, message, type: undefined });
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
          const promiseData =
            typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error;

          if (!promiseData) return;

          shouldDismiss = false;

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
          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error;

          if (!promiseData) return;

          shouldDismiss = false;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (data.success !== undefined) {
          const promiseData = typeof data.success === 'function' ? await data.success(response) : data.success;

          if (!promiseData) return;

          shouldDismiss = false;

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
          const promiseData = typeof data.error === 'function' ? await data.error(error) : data.error;

          if (!promiseData) return;

          shouldDismiss = false;

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
    const id = getToastId(data);
    // A custom toast has no type, so it resets the one of the toast it replaces
    this.create({ ...data, jsx: jsx(id), id, type: undefined });
    return id;
  };

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
  };
}

export const ToastState = new Observer();

// bind this to the toast function
const toastFunction = (message: titleT, data?: ExternalToast) => {
  return ToastState.message(message, data);
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
  },
  { getHistory, getToasts },
);
