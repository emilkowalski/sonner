import type { ReactElement } from 'react';
import type { AppProps } from 'next/app';

import '../style.css';
import { Toaster } from 'sonner';

export default function Nextra({
  Component,
  pageProps,
}: AppProps): ReactElement {
  return (
    <>
      <Toaster />
      <Component {...pageProps} />
    </>
  );
}
