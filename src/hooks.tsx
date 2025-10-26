import React from 'react';

export const safeUseLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : () => {};

export const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(document.hidden);

  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', callback);
    return () => window.removeEventListener('visibilitychange', callback);
  }, []);

  return isDocumentHidden;
};
