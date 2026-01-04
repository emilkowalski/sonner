import React from 'react';

export const useIsDocumentHidden = () => {
  const [isDocumentHidden, setIsDocumentHidden] = React.useState(false);

  React.useEffect(() => {
    setIsDocumentHidden(document.hidden);
    const callback = () => {
      setIsDocumentHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', callback);
    return () => document.removeEventListener('visibilitychange', callback);
  }, []);

  return isDocumentHidden;
};
