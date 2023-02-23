import React from 'react';
import { ExternalToast, ToastT, PromiseData, PromiseT } from './types';

let toastsCounter = 0;

class Observer {
  subscribers: Array<(toast: ExternalToast) => void>;

  constructor() {
    this.subscribers = [];
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  message = (message: string, data?: ExternalToast) => {
    this.publish({ ...data, id: toastsCounter++, title: message });
  };

  error = (message: string, data?: ExternalToast) => {
    this.publish({ ...data, id: toastsCounter++, type: 'error', title: message });
  };

  success = (message: string, data?: ExternalToast) => {
    this.publish({ ...data, id: toastsCounter++, type: 'success', title: message });
  };

  promise = (promise: PromiseT, data?: PromiseData) => {
    this.publish({ promiseData: data, promise, id: toastsCounter++ });
  };

  // We can't provide the toast we just created as a prop as we didn't creat it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = (jsx: (id: number) => React.ReactElement) => {
    const id = toastsCounter++;
    this.publish({ jsx: jsx(id), id });
  };
}

export const ToastState = new Observer();

// bind this to the toast function
const toastFunction = (message: string, data?: ExternalToast) => {
  ToastState.publish({
    title: message,
    ...data,
    id: toastsCounter++,
  });
};

const basicToast = toastFunction;

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
});
