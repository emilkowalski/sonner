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

// Initialize the toaster
const toaster = Sonner.init({
  position: 'bottom-right',
  duration: 4000,
});

// Use toast from anywhere
toast('My first toast');
toast.success('Success!');
toast.error('Error!');
toast.promise(fetchData(), {
  loading: 'Loading...',
  success: 'Data loaded!',
  error: 'Failed to load',
});
```

**Features:**
- ✅ No React dependency
- ✅ All toast types: default, success, error, warning, info, loading
- ✅ Promise support with loading/success/error states
- ✅ Action buttons
- ✅ Custom durations
- ✅ Automatic dismiss or infinite duration
- ✅ Same CSS styling as React version

See the [demo page](./demo-vanilla.html) for more examples.

## Documentation

Find the full React API reference in the [documentation](https://sonner.emilkowal.ski/getting-started).
