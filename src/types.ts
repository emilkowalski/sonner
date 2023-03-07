import React from 'react';

export type ToastTypes = 'normal' | 'action' | 'success' | 'error' | 'loading';

export type PromiseT = Promise<any> | (() => Promise<any>);

export type PromiseData = ExternalToast & {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((data: any) => React.ReactNode | string);
  error: string | React.ReactNode | ((error: any) => React.ReactNode | string);
};

export interface ToastT {
  id: number;
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
  toastId: number;
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark';

export interface ToastToDismiss {
  id: number;
  dismiss: boolean;
}

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title'>;
