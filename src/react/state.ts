import React from 'react';
import { createToastState, type ContentValidator } from '../core';

class ReactContentValidator implements ContentValidator<React.ReactNode> {
  isValidElement(content: any): content is React.ReactNode {
    return React.isValidElement(content);
  }
}

const { state: ToastState, toast } = createToastState<React.ReactNode>(new ReactContentValidator());

export { ToastState, toast };
