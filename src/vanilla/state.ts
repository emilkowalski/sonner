import { createToastState } from '../core';

const { state: ToastState, toast: toastFunction } = createToastState();

export const toast = toastFunction;

export { ToastState };
