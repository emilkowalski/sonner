https://github.com/vallezw/sonner/assets/50796600/59b95cb7-9068-4f3e-8469-0b35d9de5cf0

[Sonner](https://sonner.emilkowal.ski/) is an opinionated toast component for React. You can read more about why and how it was built [here](https://emilkowal.ski/ui/building-a-toast-component).

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

## Console Logging

For debugging and automated testing, you can enable console logging of all toast events:

```jsx
// Via Toaster prop
<Toaster consoleLog />

// Or via global configuration
toast.configure({ enabled: true });
```

Options:
- `consoleLog`: Enable console logging
- `consoleLogFormat`: `'human'` (default) or `'json'` for structured output

Human-readable output:
```
[sonner:success] Payment processed (id: 3)
[sonner:dismiss] Toast dismissed (id: 3)
```

JSON output (for automated tools):
```json
{"event":"create","id":3,"type":"success","title":"Payment processed","timestamp":1703...}
```

## Documentation

Find the full API reference in the [documentation](https://sonner.emilkowal.ski/getting-started).
