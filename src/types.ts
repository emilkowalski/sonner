import React from 'react';

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export interface PromiseIExtendedResult extends ExternalToast {
  message: React.ReactNode;
}

export type PromiseTExtendedResult<Data = any> =
  | PromiseIExtendedResult
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseTResult<Data = any> =
  | string
  | React.ReactNode
  | ((data: Data) => React.ReactNode | string | Promise<React.ReactNode | string>);

export type PromiseExternalToast = Omit<ExternalToast, 'description'>;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | React.ReactNode | undefined;
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData> | undefined;
  error?: PromiseTResult | PromiseTExtendedResult | undefined;
  description?: PromiseTResult | undefined;
  finally?: (() => void | Promise<void>) | undefined;
};

export interface ToastClassnames {
  toast?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  loader?: string | undefined;
  closeButton?: string | undefined;
  cancelButton?: string | undefined;
  actionButton?: string | undefined;
  success?: string | undefined;
  error?: string | undefined;
  info?: string | undefined;
  warning?: string | undefined;
  loading?: string | undefined;
  default?: string | undefined;
  content?: string | undefined;
  icon?: string | undefined;
}

export interface ToastIcons {
  success?: React.ReactNode | undefined;
  info?: React.ReactNode | undefined;
  warning?: React.ReactNode | undefined;
  error?: React.ReactNode | undefined;
  loading?: React.ReactNode | undefined;
  close?: React.ReactNode | undefined;
}

export interface Action {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  actionButtonStyle?: React.CSSProperties | undefined;
}

export interface ToastT {
  id: number | string;
  toasterId?: string | undefined;
  title?: (() => React.ReactNode) | React.ReactNode | undefined;
  type?: ToastTypes | undefined;
  icon?: React.ReactNode | undefined;
  jsx?: React.ReactNode | undefined;
  richColors?: boolean | undefined;
  invert?: boolean | undefined;
  closeButton?: boolean | undefined;
  dismissible?: boolean | undefined;
  description?: (() => React.ReactNode) | React.ReactNode | undefined;
  duration?: number | undefined;
  delete?: boolean | undefined;
  action?: Action | React.ReactNode | undefined;
  cancel?: Action | React.ReactNode | undefined;
  onDismiss?: ((toast: ToastT) => void) | undefined;
  onAutoClose?: ((toast: ToastT) => void) | undefined;
  promise?: PromiseT | undefined;
  cancelButtonStyle?: React.CSSProperties | undefined;
  actionButtonStyle?: React.CSSProperties | undefined;
  style?: React.CSSProperties | undefined;
  unstyled?: boolean | undefined;
  className?: string | undefined;
  classNames?: ToastClassnames | undefined;
  descriptionClassName?: string | undefined;
  position?: Position | undefined;
  testId?: string | undefined;
}

export function isAction(action: Action | React.ReactNode): action is Action {
  return (action as Action).label !== undefined;
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export interface HeightT {
  height: number;
  toastId: number | string;
  position: Position;
}

interface ToastOptions {
  className?: string | undefined;
  closeButton?: boolean | undefined;
  descriptionClassName?: string | undefined;
  style?: React.CSSProperties | undefined;
  cancelButtonStyle?: React.CSSProperties | undefined;
  actionButtonStyle?: React.CSSProperties | undefined;
  duration?: number | undefined;
  unstyled?: boolean | undefined;
  classNames?: ToastClassnames | undefined;
  closeButtonAriaLabel?: string | undefined;
  toasterId?: string | undefined;
}

type Offset =
  | {
      top?: string | number | undefined;
      right?: string | number | undefined;
      bottom?: string | number | undefined;
      left?: string | number | undefined;
    }
  | string
  | number;

export interface ToasterProps {
  id?: string | undefined;
  invert?: boolean | undefined;
  theme?: 'light' | 'dark' | 'system' | undefined;
  position?: Position | undefined;
  hotkey?: string[] | undefined;
  richColors?: boolean | undefined;
  expand?: boolean | undefined;
  duration?: number | undefined;
  gap?: number | undefined;
  visibleToasts?: number | undefined;
  closeButton?: boolean | undefined;
  toastOptions?: ToastOptions | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  offset?: Offset | undefined;
  mobileOffset?: Offset | undefined;
  dir?: 'rtl' | 'ltr' | 'auto' | undefined;
  swipeDirections?: SwipeDirection[] | undefined;
  icons?: ToastIcons | undefined;
  customAriaLabel?: string | undefined;
  containerAriaLabel?: string | undefined;
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export interface ToastProps {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  swipeDirections?: SwipeDirection[] | undefined;
  expanded: boolean;
  invert: boolean;
  heights: HeightT[];
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  removeToast: (toast: ToastT) => void;
  gap?: number | undefined;
  position: Position;
  visibleToasts: number;
  expandByDefault: boolean;
  closeButton: boolean;
  interacting: boolean;
  style?: React.CSSProperties | undefined;
  cancelButtonStyle?: React.CSSProperties | undefined;
  actionButtonStyle?: React.CSSProperties | undefined;
  duration?: number | undefined;
  className?: string | undefined;
  unstyled?: boolean | undefined;
  descriptionClassName?: string | undefined;
  loadingIcon?: React.ReactNode | undefined;
  classNames?: ToastClassnames | undefined;
  icons?: ToastIcons | undefined;
  closeButtonAriaLabel?: string | undefined;
  defaultRichColors?: boolean | undefined;
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark';

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'> & {
  id?: number | string | undefined;
  toasterId?: string | undefined;
};
