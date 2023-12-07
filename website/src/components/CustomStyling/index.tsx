import { toast } from 'sonner';
import { CodeBlock } from '../CodeBlock';

export const CustomStyling = () => {
  return (
    <div>
      <h2>Advanced custom styling</h2>
      <p>This example uses Tailwind class names, but you can use any CSS classes.</p>
      <div className="buttons">
        <button
          className="button"
          onClick={() => {
            toast('Event has been created', {
              description: 'Monday, January 3rd at 6:00pm',
              icon: <span className="text-2xl">📆</span>,
              action: {
                label: 'Action',
                onClick: () => {
                  alert('Action clicked');
                },
              },
              unstyled: true,
              classNames: {
                toast: 'border rounded-md p-4 w-full bg-white shadow-lg gap-2 flex',
                title: 'font-bold',
                actionButton: 'bg-black/10 px-3 py-1 rounded-md shrink-0 self-end',
                closeButton: 'bg-red-200 absolute top-4 right-4 rounded-full p-1',
              },
            });
          }}
        >
          Add toast
        </button>
      </div>
      <CodeBlock>{`toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
  icon: <span className="text-2xl">📆</span>,
  action: {
    label: 'Action',
  },
  // Remove default styling
  unstyled: true,
  // Add custom class names
  classNames: {
    toast: 'border rounded-md p-4 w-full bg-white shadow-lg gap-2 flex',
    title: 'font-bold',
    actionButton: 'bg-black/10 px-3 py-1 rounded-md shrink-0 self-end',
    closeButton: 'bg-red-200 absolute top-4 right-4 rounded-full p-1',
  },
});`}</CodeBlock>
      <p>
        You can also pass the <code>classNames</code> to the Toaster if you want to style all toasts the same way.
      </p>
      <CodeBlock>{`<Toaster toastOptions={{
  unstyled: true,
  classNames: {
    // ...
  },
}} />`}</CodeBlock>
    </div>
  );
};
