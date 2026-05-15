'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';

// Sibling rendered ABOVE <Toaster /> — its useEffect runs before the Toaster's,
// so toast() fires before ToastState has a subscriber. See issue #723.
function ToastOnMount() {
  React.useEffect(() => {
    toast('Toast fired before Toaster subscribed');
  }, []);
  return null;
}

export default function Issue723Page() {
  return (
    <>
      <ToastOnMount />
      <Toaster />
    </>
  );
}
