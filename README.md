https://github.com/vallezw/sonner/assets/50796600/59b95cb7-9068-4f3e-8469-0b35d9de5cf0

# Sonner

An opinionated toast component for **React** and **Vanilla JavaScript**.

This is a fork that adds vanilla JavaScript support alongside the original React version. You can read more about why and how the original was built [here](https://emilkowal.ski/ui/building-a-toast-component).

## Installation

```bash
npm install sonner
```

## Usage

### React Version

Add `<Toaster />` to your app, it will be the place where all your toasts will be rendered.
After that you can use `toast()` from anywhere in your app.

```jsx
import { Toaster, toast } from 'sonner';

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast('My first toast')}>Give me a toast</button>
    </div>
  );
}
```

### Vanilla JavaScript Version

For projects without React, import from `sonner/vanilla`:

```javascript
import { Sonner, toast } from 'sonner/vanilla';
import 'sonner/dist/styles.css';

// Initialize the toaster (do this once, typically in your main app file)
const toaster = Sonner.init({
  position: 'bottom-right',  // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'
  duration: 4000,            // Default duration in milliseconds
  closeButton: false,        // Show close button
  richColors: false,         // Enable rich colors
  theme: 'light',           // 'light', 'dark', or 'system'
});

// Basic usage
toast('Event has been created');

// Toast types
toast.success('Successfully saved!');
toast.error('An error occurred');
toast.warning('Be careful!');
toast.info('Did you know?');
toast.loading('Loading...');

// With description
toast('Event Created', {
  description: 'Monday, January 3rd at 6:00pm'
});

// With action button
toast('Event Created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo clicked')
  }
});

// Promise support - automatically shows loading, then success/error
const promise = fetch('/api/data');
toast.promise(promise, {
  loading: 'Loading data...',
  success: (data) => `${data.name} loaded successfully!`,
  error: 'Failed to load data'
});

// Custom duration
toast('Quick message', { duration: 1000 });
toast('Stays forever', { duration: Infinity });

// Dismiss toasts
const id = toast('Message');
toast.dismiss(id);  // Dismiss specific toast
toast.dismiss();    // Dismiss all toasts
```

**Using with CDN (no build step required):**

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sonner/dist/styles.css">
</head>
<body>
  <button id="show-toast">Show Toast</button>
  
  <script type="module">
    import { Sonner, toast } from 'https://cdn.jsdelivr.net/npm/sonner/dist/vanilla/index.mjs';
    
    Sonner.init({ position: 'bottom-right' });
    
    document.getElementById('show-toast').onclick = () => {
      toast('Hello from CDN!');
    };
  </script>
</body>
</html>
```

**Features:**
- ✅ No React dependency
- ✅ All toast types: default, success, error, warning, info, loading
- ✅ Promise support with loading/success/error states
- ✅ Action buttons
- ✅ Custom durations
- ✅ Automatic dismiss or infinite duration
- ✅ Same CSS styling as React version
- ✅ TypeScript support
- ✅ Works with CDN (no build required)

See the [demo page](./demo-vanilla.html) for more examples.

## Documentation

Find the full React API reference in the [documentation](https://sonner.emilkowal.ski/getting-started).
