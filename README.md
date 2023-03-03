https://user-images.githubusercontent.com/36730035/220868994-f0c92862-7e7d-487c-ab3a-540e7b48ab4a.mp4

# Introduction

[Sonner](https://sonner.emilkowal.ski/) is an opinionated toast component for React. It's customizable, but styled by default. Comes with a swipe to dismiss animation.

## Usage

To start using the library, install it in your project:

```bash
npm install sonner
```

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered.
After that you can use `toast()` from anywhere in your app.

```jsx
import { Toaster, toast } from 'sonner';

// ...

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast('My first toast')}>Give me a toast</button>
    </div>
  );
}
```

## Types

### Default

Most basic toast. You can customize it (and any other type) by passing an options object as the second argument.

```jsx
toast('Event has been created');
```

With icon and description:

```jsx
toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
  icon: <MyIcon />,
});
```

### Success

Render a checkmark icon in front of the message.

```jsx
toast.success('Event has been created');
```

### Error

Renders an error icon in front of the message.

```jsx
toast.error('Event has not been created');
```

### Action

Renders a button.

```jsx
toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails.

```jsx
toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
  loading: 'Loading',
  success: 'Success',
  error: 'Error',
});
```

### Custom JSX

You can pass jsx as the first argument instead of a string to render custom jsx while maintaining default styling. You can use the headless version below for a custom, unstyled toast.

```jsx
toast(<div>A custom toast with default styling</div>);
```

## Customization

### Headless

You can use `toast.custom` to render an unstyled toast with custom jsx while maintaining the functionality.

````jsx
toast.custom((t) => (
  <div>
    This is a custom component <button onClick={() => toast.dismiss(t)}>close</button>
  </div>
));

### Theme

You can change the theme using the `theme` prop. Default theme is light.

```jsx
<Toaster theme="dark" />
````

### Position

You can change the position through the `position` prop on the `<Toaster />` component. Default is `bottom-right`.

```jsx
// Available positions
// top-left, top-center, top-right, bottom-left, bottom-center, bottom-right

<Toaster position="top-center" />
```

### Expanded

Toasts can also be expanded by default through the `expand` prop. You can also change the amount of visible toasts which is 3 by default.

```jsx
<Toaster expand visibleToasts={9} />
```

### Styling for all toasts

You can style your toasts globally with the `toastOptions` prop in the `Toaster` component.

```jsx
<Toaster
  toastOptions={{ style: { background: 'red' }, className: 'my-toast', descriptionClassName: 'my-toast-description' }}
/>
```

### Styling for individual toast

```jsx
toast('Event has been created', {
  style: {
    background: 'red',
  },
  className: 'my-toast',
  descriptionClassName: 'my-toast-description',
});
```

### Close button

Add a close button to all toasts that shows on hover by adding the `closeButton` prop.

```jsx
<Toaster closeButton />
```

### Rich colors

You can make error and success state more colorful by adding the `richColors` prop.

```jsx
<Toaster richColors />
```

### Custom offset

Offset from the edges of the screen.

```jsx
<Toaster offset="80px" />
```

### Programmatically remove toast

To remove a toast programmatically use `toast.dismiss(id)`.

```jsx
const toastId = toast('Event has been created');

toast.dismiss(toastId);
```

## Keyboard focus

You can focus on the toast area by pressing ⌥/alt + T. You can override it by providing an array of event.code values for each key.

```jsx
<Toaster hotkey={['KeyC']} />
```
