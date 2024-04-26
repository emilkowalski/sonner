// @deno-types="npm:@types/react@^18.2.0"
import React from 'react';

export const useIsDocumentHidden = (): boolean => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState<boolean>(false);

  React.useEffect(() => {
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', callback);
    return () => window.removeEventListener('visibilitychange', callback);
  }, []);

  return isDocumentHidden;
};
