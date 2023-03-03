import React from 'react';
import { ExternalToast, ToastT, PromiseData, PromiseT, ToastToDismiss } from './types';

let toastsCounter = 0;

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>;

  constructor() {
    this.subscribers = [];
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

  dismiss = (id: number) => {
    this.subscribers.forEach((subscriber) => subscriber({ id, dismiss: true }));
    return id;
  };

  message = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = toastsCounter++;
    this.publish({ ...data, id, title: message });
    return id;
  };

  error = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = toastsCounter++;
    this.publish({ ...data, id, type: 'error', title: message });
    return id;
  };

  success = (message: string | React.ReactNode, data?: ExternalToast) => {
    const id = toastsCounter++;
    this.publish({ ...data, id, type: 'success', title: message });
    return id;
  };

  promise = (promise: PromiseT, data?: PromiseData) => {
    const id = toastsCounter++;
    this.publish({ promiseData: data, promise, id });
    return id;
  };

  // We can't provide the toast we just created as a prop as we didn't creat it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = (jsx: (id: number) => React.ReactElement, data?: ExternalToast) => {
    const id = toastsCounter++;
    this.publish({ jsx: jsx(id), id, ...data });
  };
}

export const ToastState = new Observer();

// bind this to the toast function
const toastFunction = (message: string | React.ReactNode, data?: ExternalToast) => {
  const id = toastsCounter++;
  ToastState.publish({
    title: message,
    ...data,
    id,
  });
  return id;
};

const basicToast = toastFunction;

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
});
