export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export type Theme = 'light' | 'dark';

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type ToastContent<T = any> = T | string | (() => T | string);

export interface Action<TEvent = any> {
  label: ToastContent;
  onClick: (event: TEvent) => void;
  actionButtonStyle?: Record<string, any>;
}

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

export interface ToastIcons<TIcon = any> {
  success?: TIcon;
  info?: TIcon;
  warning?: TIcon;
  error?: TIcon;
  loading?: TIcon;
  close?: TIcon;
}

export interface ToastT<TContent = any> {
  id: number | string;
  toasterId?: string;
  title?: ToastContent<TContent>;
  type?: ToastTypes;
  icon?: TContent;
  jsx?: TContent;
  richColors?: boolean;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: ToastContent<TContent>;
  duration?: number;
  delete?: boolean;
  action?: Action | TContent;
  cancel?: Action | TContent;
  onDismiss?: (toast: ToastT<TContent>) => void;
  onAutoClose?: (toast: ToastT<TContent>) => void;
  promise?: PromiseT;
  cancelButtonStyle?: Record<string, any>;
  actionButtonStyle?: Record<string, any>;
  style?: Record<string, any>;
  unstyled?: boolean;
  className?: string;
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  position?: Position;
  testId?: string;
}

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}

export type ExternalToast<TContent = any> = Omit<ToastT<TContent>, 'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise'> & {
  id?: number | string;
  toasterId?: string;
};

export interface PromiseExtendedResult<TContent = any> extends ExternalToast<TContent> {
  message: ToastContent<TContent>;
}

export type PromiseTExtendedResult<Data = any, TContent = any> =
  | PromiseExtendedResult<TContent>
  | ((data: Data) => PromiseExtendedResult<TContent> | Promise<PromiseExtendedResult<TContent>>);

export type PromiseTResult<Data = any, TContent = any> =
  | string
  | TContent
  | ((data: Data) => TContent | string | Promise<TContent | string>);

export type PromiseExternalToast<TContent = any> = Omit<ExternalToast<TContent>, 'description'>;

export type PromiseData<ToastData = any, TContent = any> = PromiseExternalToast<TContent> & {
  loading?: string | TContent;
  success?: PromiseTResult<ToastData, TContent> | PromiseTExtendedResult<ToastData, TContent>;
  error?: PromiseTResult | PromiseTExtendedResult;
  description?: PromiseTResult;
  finally?: () => void | Promise<void>;
};

export interface HeightT {
  height: number;
  toastId: number | string;
  position: Position;
}

export function isAction<TEvent = any, TContent = any>(
  action: Action<TEvent> | TContent
): action is Action<TEvent> {
  return (action as Action<TEvent>).label !== undefined;
}

export type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

export interface ToastOptions {
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: Record<string, any>;
  cancelButtonStyle?: Record<string, any>;
  actionButtonStyle?: Record<string, any>;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
  closeButtonAriaLabel?: string;
  toasterId?: string;
}

export interface ToasterConfig<TContent = any> {
  id?: string;
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
  style?: Record<string, any>;
  offset?: Offset;
  mobileOffset?: Offset;
  dir?: 'rtl' | 'ltr' | 'auto';
  swipeDirections?: SwipeDirection[];
  icons?: ToastIcons<TContent>;
  customAriaLabel?: string;
  containerAriaLabel?: string;
}
