import { toast } from 'sonner';
import { CodeBlock } from '../CodeBlock';

const directions = ['rtl', 'ltr', 'auto'] as const;

export type Direction = (typeof directions)[number];

export const Direction = ({
  direction: activeDirection,
  setDirection,
}: {
  direction: Direction;
  setDirection: React.Dispatch<React.SetStateAction<Direction>>;
}) => {
  return (
    <div>
      <h2>Direction</h2>
      <p>
        You can change the content direction through the <code>dir</code> prop.
      </p>
      <div className="buttons">
        {directions.map((direction) => (
          <button
            data-active={activeDirection === direction}
            className="button"
            onClick={() => {
              const toastsAmount = document.querySelectorAll('[data-sonner-toast]').length;
              setDirection(direction);
              // No need to show a toast when there is already one
              if (toastsAmount > 0 && direction !== activeDirection) return;

              toast('Event has been created', {
                description: 'Monday, January 3rd at 6:00pm',
              });
            }}
            key={direction}
          >
            {direction}
          </button>
        ))}
      </div>
      {activeDirection === 'auto' ? (
        <CodeBlock>{`/* defaults to dir attribute in html */\n\n<Toaster dir="${activeDirection}" /> `}</CodeBlock>
      ) : (
        <CodeBlock>{`<Toaster dir="${activeDirection}" />`}</CodeBlock>
      )}
    </div>
  );
};
