import { toast } from 'sonner';
import { CodeBlock } from '../CodeBlock';

const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

export type Position = (typeof positions)[number];

export const Position = ({
  position: activePosition,
  setPosition,
}: {
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
}) => {
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
              const toastsAmount = document.querySelectorAll('[data-sonner-toast]').length;
              setPosition(position);
              // No need to show a toast when there is already one
              if (toastsAmount > 0 && position !== activePosition) return;

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
