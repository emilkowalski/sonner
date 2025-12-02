import React from 'react';

import type {
  ToastT as CoreToastT,
  ExternalToast as CoreExternalToast,
  ToasterConfig as CoreToasterConfig,
  ToastOptions as CoreToastOptions,
  ToastIcons as CoreToastIcons,
  Action as CoreAction,
  PromiseData as CorePromiseData,
  ToastClassnames,
  Position,
  SwipeDirection,
  Offset,
  HeightT,
  ToastToDismiss,
  ToastTypes,
} from '../core';

export type ReactNode = React.ReactNode;
export type ReactElement = React.ReactElement;
export type CSSProperties = React.CSSProperties;
export type MouseEvent = React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;

export interface Action extends CoreAction<MouseEvent> {
  label: ReactNode;
  actionButtonStyle?: CSSProperties;
}

export interface ToastIcons extends CoreToastIcons<ReactNode> {}

export interface ToastT extends Omit<CoreToastT<ReactNode>, 'action' | 'cancel' | 'style' | 'cancelButtonStyle' | 'actionButtonStyle'> {
  title?: (() => ReactNode) | ReactNode;
  description?: (() => ReactNode) | ReactNode;
  icon?: ReactNode;
  jsx?: ReactNode;
  action?: Action | ReactNode;
  cancel?: Action | ReactNode;
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
}

export type ExternalToast = Omit<CoreExternalToast<ReactNode>, 'action' | 'cancel' | 'style' | 'cancelButtonStyle' | 'actionButtonStyle'> & {
  action?: Action | ReactNode;
  cancel?: Action | ReactNode;
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
};

export interface ToastOptions extends Omit<CoreToastOptions, 'style' | 'cancelButtonStyle' | 'actionButtonStyle'> {
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
}

export interface ToasterProps extends Omit<CoreToasterConfig<ReactNode>, 'toastOptions' | 'style' | 'icons'> {
  toastOptions?: ToastOptions;
  style?: CSSProperties;
  icons?: ToastIcons;
}

export type PromiseData<ToastData = any> = CorePromiseData<ToastData, ReactNode>;

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
  style?: CSSProperties;
  cancelButtonStyle?: CSSProperties;
  actionButtonStyle?: CSSProperties;
  duration?: number;
  className?: string;
  unstyled?: boolean;
  descriptionClassName?: string;
  loadingIcon?: ReactNode;
  classNames?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
  defaultRichColors?: boolean;
}

export type {
  ToastClassnames,
  Position,
  SwipeDirection,
  Offset,
  HeightT,
  ToastToDismiss,
  ToastTypes,
};

export { isAction } from '../core';
