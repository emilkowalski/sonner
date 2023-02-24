import React from 'react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { CodeBlock } from '../CodeBlock';

export const Other = ({
  setRichColors,
  setCloseButton,
}: {
  setRichColors: React.Dispatch<React.SetStateAction<boolean>>;
  setCloseButton: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const allTypes = useMemo(
    () => [
      {
        name: 'Rich Colors Success',
        snippet: `toast.success('Event has been created')`,
        action: () => {
          toast.success('Event has been created');
          setRichColors(true);
        },
      },
      {
        name: 'Rich Colors Error',
        snippet: `toast.error('Event has not been created')`,
        action: () => {
          toast.error('Event has not been created');
          setRichColors(true);
        },
      },
      {
        name: 'Close Button',
        snippet: `toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
}),`,
        action: () => {
          toast('Event has been created', {
            description: 'Monday, January 3rd at 6:00pm',
          });
          setCloseButton((t) => !t);
        },
      },
    ],
    [setRichColors],
  );

  const [activeType, setActiveType] = React.useState({} as (typeof allTypes)[0]);

  const richColorsActive = activeType?.name?.includes('Rich');
  const closeButtonActive = activeType?.name?.includes('Close');

  return (
    <div>
      <h2>Other</h2>
      <div className="buttons">
        {allTypes.map((type) => (
          <button
            className="button"
            onClick={() => {
              type.action();
              setActiveType(type);
            }}
            key={type.name}
          >
            {type.name}
          </button>
        ))}
      </div>
      <CodeBlock>
        {`${activeType.snippet}

// ...

<Toaster ${richColorsActive ? 'richColors ' : ''} ${closeButtonActive ? 'closeButton ' : ''}/>`}
      </CodeBlock>
    </div>
  );
};
