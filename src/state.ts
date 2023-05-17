import React from 'react';
import { ExternalToast, ToastT, PromiseData, PromiseT, ToastToDismiss } from './types';

class Observer {
  toastsCounter: number;

  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;
  toasts: Array<ToastT | ToastToDismiss>;

  constructor() {
    this.toastsCounter = 0;
    this.subscribers = [];
    this.toasts = [];
  }

  increaseCounter = () => this.toastsCounter++;

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
    this.toasts = [...this.toasts, data];
  };

  dismiss = (id?: number | string) => {
    if (!id) {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
      });
    }

    this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
    return id;
  };

  message = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = data?.id || this.increaseCounter();
    this.publish({ ...data, id, title: message });
    return id;
  };

  error = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = data?.id || this.increaseCounter();
    this.publish({ ...data, id, type: 'error', title: message });
    return id;
  };

  success = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = data?.id || this.increaseCounter();
    this.publish({ ...data, id, type: 'success', title: message });
    return id;
  };

  promise = (promise: PromiseT, data?: PromiseData) => {
    const id = data?.id || this.increaseCounter();
    this.publish({ ...data, promise, id });
    return id;
  };

  // We can't provide the toast we just created as a prop as we didn't creat it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => {
    const id = data?.id || this.increaseCounter();
    this.publish({ jsx: jsx(id), id, ...data });
  };
}

export const createState = () => {
  const ToastState = new Observer();

  // bind this to the toast function
  const toastFunction = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = data?.id || ToastState.increaseCounter();

    ToastState.publish({
      title: message,
      ...data,
      id,
    });
    return id;
  };

  const basicToast = toastFunction;

  // We use `Object.assign` to maintain the correct types as we would lose them otherwise
  const toast = Object.assign(basicToast, {
    success: ToastState.success,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
  });

  return { ToastState, toast };
};
