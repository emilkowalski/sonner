import { toast } from 'sonner';
import { CodeBlock } from '../CodeBlock';

type ExpandModesProps = {
  expand: boolean;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ExpandModes = ({ expand, setExpand }: ExpandModesProps) => {
  return (
    <div>
      <h2>Expand</h2>
      <p>
        You can change the amount of toasts visible through the <code>visibleToasts</code> prop.
      </p>
      <div className="buttons">
        <button
          data-active={expand}
          className="button"
          onClick={() => {
            toast('Event has been created', {
              description: 'Monday, January 3rd at 6:00pm',
            });
            setExpand(true);
          }}
        >
          Expand
        </button>
        <button
          data-active={!expand}
          className="button"
          onClick={() => {
            toast('Event has been created', {
              description: 'Monday, January 3rd at 6:00pm',
            });
            setExpand(false);
          }}
        >
          Default
        </button>
      </div>
      <CodeBlock>{`<Toaster expand={${expand}} />`}</CodeBlock>
    </div>
  );
};
