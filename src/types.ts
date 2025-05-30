import React from 'react';

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export type PromiseT<Data = unknown> = Promise<Data> | (() => Promise<Data>);

export type PromiseIExtendedResult = {
  message: React.ReactNode;
} & ExternalToast;

export type PromiseTExtendedResult<Data = unknown> =
  | PromiseIExtendedResult
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseTResult<Data = unknown> =
  | React.ReactNode
  | ((data: Data) => React.ReactNode | Promise<React.ReactNode>);

export type PromiseExternalToast = Omit<ExternalToast, 'description'>;

export type PromiseData<ToastData = unknown> = PromiseExternalToast & {
  loading?: React.ReactNode;
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
  error?: PromiseTResult | PromiseTExtendedResult;
  description?: PromiseTResult;
  finally?: () => void | Promise<void>;
};

export type ToastClassnames = {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  content?: string;
  icon?: string;
} & Partial<Record<ToastTypes, string>>;

export type ToastIcons = {
  close?: React.ReactNode;
} & Partial<Record<ToastTypes, React.ReactNode>>;

export type Action = {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  actionButtonStyle?: React.CSSProperties;
};

export type ToastT = {
  id: number | string;
  title?: (() => React.ReactNode) | React.ReactNode;
  type?: ToastTypes;
  icon?: React.ReactNode;
  jsx?: React.ReactNode;
  richColors?: boolean;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: (() => React.ReactNode) | React.ReactNode;
  duration?: number;
  delete?: boolean;
  action?: Action | React.ReactNode;
  cancel?: Action | React.ReactNode;
  onDismiss?: (toast: ToastT) => void;
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
};

export function isAction(action: Action | React.ReactNode): action is Action {
  return (action as Action).label !== undefined;
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type HeightT = {
  height: number;
  toastId: number | string;
  position?: Position;
};

type ToastOptions = {
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
  closeButtonAriaLabel?: string;
};

type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

export type ToasterProps = {
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
  icons?: ToastIcons;
  containerAriaLabel?: string;
};

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export type ToastProps = {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  swipeDirections?: SwipeDirection[];
  expanded: boolean;
  invert: boolean;
  heights: HeightT[];
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  removeToast: (toast: ToastT) => void;
  gap: number;
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
};

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark';

export type ToastToDismiss = {
  id: number | string;
  dismiss: boolean;
};

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'> & {
  id?: number | string;
};
