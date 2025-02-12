import React from 'react';

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export type PromiseTResult<Data = any> =
  | string
  | React.ReactNode
  | ((data: Data) => React.ReactNode | string | Promise<React.ReactNode | string>);

export type PromiseExternalToast = Omit<ExternalToast, 'description'>;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | React.ReactNode;
  success?: PromiseTResult<ToastData>;
  error?: PromiseTResult;
  description?: PromiseTResult;
  finally?: () => void | Promise<void>;
};

export interface ToastClassnames {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  success?: string;
  error?: string;
  info?: string;
  warning?: string;
  loading?: string;
  default?: string;
  content?: string;
  icon?: string;
}

export interface ToastIcons {
  success?: React.ReactNode;
  info?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  loading?: React.ReactNode;
  close?: React.ReactNode;
}

export interface Action {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  actionButtonStyle?: React.CSSProperties;
}

export interface ToastT {
  id: number | string;
  title?: (() => React.ReactNode) | React.ReactNode;
  type?: ToastTypes;
  icon?: React.ReactNode;
  jsx?: React.ReactNode;
  richColors?: boolean;
  /** Whether to invert the toast colors, useful if you want your toast to stand out
   *
   * @default false
   */
  invert?: boolean;
  /** Whether to show a close button on the toast */
  closeButton?: boolean;
  /**
   * Whether the user is able to dismiss the toast by swiping.
   * @default true
   */
  dismissible?: boolean;
  /** Description of the toast, rendered below the title */
  description?: (() => React.ReactNode) | React.ReactNode;
  /**
   * How long the toast should stay visible (in ms).
   * @default 4000
   */
  duration?: number;
  delete?: boolean;
  /** Action button of the toast */
  action?: Action | React.ReactNode;
  /** Cancel button of the toast */
  cancel?: Action | React.ReactNode;
  /** Callback when the toast is dismissed either programmatically or by swiping */
  onDismiss?: (toast: ToastT) => void;
  /** Callback when the toast is automatically closed */
  onAutoClose?: (toast: ToastT) => void;
  promise?: PromiseT;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  unstyled?: boolean;
  className?: string;
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  position?: Position;
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
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
}

type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

export interface ToasterProps {
  invert?: boolean;
  theme?: 'light' | 'dark' | 'system';
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  gap?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  className?: string;
  style?: React.CSSProperties;
  offset?: Offset;
  mobileOffset?: Offset;
  dir?: 'rtl' | 'ltr' | 'auto';
  swipeDirections?: SwipeDirection[];
  /**
   * @deprecated Please use the `icons` prop instead:
   * ```jsx
   * <Toaster
   *   icons={{ loading: <LoadingIcon /> }}
   * />
   * ```
   */
  loadingIcon?: React.ReactNode;
  icons?: ToastIcons;
  containerAriaLabel?: string;
  pauseWhenPageIsHidden?: boolean;
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export interface ToastProps {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  swipeDirections?: SwipeDirection[];
  expanded: boolean;
  invert: boolean;
  heights: HeightT[];
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  removeToast: (toast: ToastT) => void;
  gap?: number;
  position: Position;
  visibleToasts: number;
  expandByDefault: boolean;
  closeButton: boolean;
  interacting: boolean;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  className?: string;
  unstyled?: boolean;
  descriptionClassName?: string;
  loadingIcon?: React.ReactNode;
  classNames?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
  pauseWhenPageIsHidden: boolean;
  defaultRichColors?: boolean;
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
  id?: number | string;
};
