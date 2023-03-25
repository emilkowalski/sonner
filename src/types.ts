import React from 'react';

export type ToastTypes = 'normal' | 'action' | 'success' | 'error' | 'loading';

export type PromiseT = Promise<any> | (() => Promise<any>);

export type PromiseData = ExternalToast & {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((data: any) => React.ReactNode | string);
  error: string | React.ReactNode | ((error: any) => React.ReactNode | string);
};

export interface ToastT {
  id: number | string;
  title?: string | React.ReactNode;
  type?: ToastTypes;
  icon?: React.ReactNode;
  jsx?: React.ReactNode;
  invert?: boolean;
  description?: string;
  duration?: number;
  delete?: boolean;
  important?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  promise?: PromiseT;
  style?: React.CSSProperties;
  className?: string;
  descriptionClassName?: string;
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export interface HeightT {
  height: number;
  toastId: number | string;
}

interface ToastOptions {
  className?: string;
  descriptionClassName?: string;
  style?: React.CSSProperties;
}

export interface ToasterProps {
  invert?: boolean;
  theme?: 'light' | 'dark';
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  expand?: boolean;
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  className?: string;
  style?: React.CSSProperties;
  offset?: string | number;
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

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title'> & {
  id?: number | string;
};
