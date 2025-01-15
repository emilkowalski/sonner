import { toast, useSonner } from 'sonner';
import { CodeBlock } from '../CodeBlock';
import React from 'react';

const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

export type Position = (typeof positions)[number];

export const Position = ({
  position: activePosition,
  setPosition,
}: {
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
}) => {
  const { toasts } = useSonner();

  function removeAllToasts() {
    toasts.forEach((t) => toast.dismiss(t.id));
  }

  return (
    <div>
      <h2>Position</h2>
      <p>Swipe direction changes depending on the position.</p>
      <div className="buttons">
        {positions.map((position) => (
          <button
            data-active={activePosition === position}
            className="button"
            onClick={() => {
              if (activePosition !== position) {
                setPosition(position);
                removeAllToasts();
              }

              toast('Event has been created', {
                description: 'Monday, January 3rd at 6:00pm',
              });
            }}
            key={position}
          >
            {position}
          </button>
        ))}
      </div>
      <CodeBlock>{`<Toaster position="${activePosition}" />`}</CodeBlock>
    </div>
  );
};
