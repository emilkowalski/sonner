import type {
  ExternalToast,
  PromiseData,
  PromiseExtendedResult,
  PromiseT,
  ToastContent,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types';

let toastsCounter = 1;

export interface ContentValidator<TContent = any> {
  isValidElement: (content: any) => content is TContent;
}

class DefaultContentValidator implements ContentValidator {
  isValidElement(content: any): content is any {
    return false;
  }
}

class Observer<TContent = any> {
  subscribers: Array<(toast: ExternalToast<TContent> | ToastToDismiss) => void>;
  toasts: Array<ToastT<TContent> | ToastToDismiss>;
  dismissedToasts: Set<string | number>;
  contentValidator: ContentValidator<TContent>;

  constructor(contentValidator?: ContentValidator<TContent>) {
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = new Set();
    this.contentValidator = contentValidator || new DefaultContentValidator();
  }

  setContentValidator(validator: ContentValidator<TContent>) {
    this.contentValidator = validator;
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT<TContent> | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT<TContent>) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  addToast = (data: ToastT<TContent>) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  };

  create = (
    data: ExternalToast<TContent> & {
      message?: ToastContent<TContent>;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: TContent;
    }
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
          const updatedToast = {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          };
          this.publish(updatedToast);
          return updatedToast;
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
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true })));
      } else {
        // Fallback for environments without requestAnimationFrame
        setTimeout(() => this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true })), 0);
      }
    } else {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
      });
    }

    return id;
  };

  message = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, message });
  };

  error = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, message, type: 'error' });
  };

  success = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, type: 'success', message });
  };

  info = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, type: 'info', message });
  };

  warning = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, type: 'warning', message });
  };

  loading = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    return this.create({ ...data, type: 'loading', message });
  };

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData, TContent>) => {
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
        const isElementResponse = this.contentValidator.isValidElement(response);
        if (isElementResponse) {
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

          const isExtendedResult = typeof promiseData === 'object' && !this.contentValidator.isValidElement(promiseData);

          const toastSettings: PromiseExtendedResult<TContent> = isExtendedResult
            ? (promiseData as PromiseExtendedResult<TContent>)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !this.contentValidator.isValidElement(promiseData);

          const toastSettings: PromiseExtendedResult<TContent> = isExtendedResult
            ? (promiseData as PromiseExtendedResult<TContent>)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (data.success !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.success === 'function' ? await (data.success as Function)(response) : data.success;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !this.contentValidator.isValidElement(promiseData);

          const toastSettings: PromiseExtendedResult<TContent> = isExtendedResult
            ? (promiseData as PromiseExtendedResult<TContent>)
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

          const isExtendedResult = typeof promiseData === 'object' && !this.contentValidator.isValidElement(promiseData);

          const toastSettings: PromiseExtendedResult<TContent> = isExtendedResult
            ? (promiseData as PromiseExtendedResult<TContent>)
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

  custom = (jsx: (id: number | string) => TContent, data?: ExternalToast<TContent>) => {
    const id = data?.id || toastsCounter++;
    this.create({ jsx: jsx(id), id, ...data });
    return id;
  };

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
  };
}

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

export function createToastState<TContent = any>(contentValidator?: ContentValidator<TContent>) {
  const state = new Observer<TContent>(contentValidator);

  const basicToast = (message: ToastContent<TContent>, data?: ExternalToast<TContent>) => {
    const id = data?.id || toastsCounter++;

    state.addToast({
      title: message,
      ...data,
      id,
    });
    return id;
  };

  const getHistory = () => state.toasts;
  const getToasts = () => state.getActiveToasts();

  // We use `Object.assign` to maintain the correct types as we would lose them otherwise
  const toast = Object.assign(
    basicToast,
    {
      success: state.success,
      info: state.info,
      warning: state.warning,
      error: state.error,
      custom: state.custom,
      message: state.message,
      promise: state.promise,
      dismiss: state.dismiss,
      loading: state.loading,
    },
    { getHistory, getToasts },
  );

  return { state, toast };
}
