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
  /** Whether to invert the toast colors, useful if you want your toast to stand out
   *
   * @default false
   */
  invert?: boolean;
  theme?: 'light' | 'dark' | 'system';
  position?: Position;
  /**
   * The keys to use as the keyboard shortcut that will move focus to the toast viewport.
   * @default ['altKey', 'KeyT']
   */
  hotkey?: string[];
  richColors?: boolean;
  /** Disables toast stacking and renders them on top of each other if `true`
   *
   * @default false
   */
  expand?: boolean;
  /**
   * How long the toast should stay visible (in ms). Applies to all toasts.
   *
   * @default 4000
   */
  duration?: number;
  /** The gap between toasts.
   *
   * @default 14
   */
  gap?: number;
  /** The maximum number of toasts that can be visible at once.
   *
   * @default 3
   */
  visibleToasts?: number;
  /** Whether to show a close button on the toast. Applies to all toasts.
   *
   * @default false
   */
  closeButton?: boolean;
  /** Options for the toast. Applies to all toasts. */
  toastOptions?: ToastOptions;
  /** Toaster's class name. */
  className?: string;
  /** Toaster's style. */
  style?: React.CSSProperties;
  /** Offset from the edge of the screen. Can either be a number or an object with top, right, bottom, and left properties.
   *
   * @default 24
   */
  offset?: Offset;
  /** Offset from the edge of the screen on mobile (< 600px). Can either be a number or an object with top, right, bottom, and left properties.
   *
   * @default 16
   */
  mobileOffset?: Offset;
  /** Text direction. */
  dir?: 'rtl' | 'ltr' | 'auto';
  /** The directions in which the toast can be swiped to dismiss. */
  swipeDirections?: SwipeDirection[];
  /** Icons for the toast. */
  icons?: ToastIcons;
  /** Aria label for the container. */
  containerAriaLabel?: string;
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
  classNames?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
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
