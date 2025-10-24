https://github.com/vallezw/sonner/assets/50796600/59b95cb7-9068-4f3e-8469-0b35d9de5cf0

[Sonner](https://sonner.emilkowal.ski/) is an opinionated toast component for React. You can read more about why and how it was built [here](https://emilkowal.ski/ui/building-a-toast-component).

[![npm downloads](https://img.shields.io/npm/dw/sonner.svg)](https://npm-compare.com/sonner) 
[![npm version](https://img.shields.io/npm/v/sonner.svg)](https://www.npmjs.com/package/sonner)
[![npm license](https://img.shields.io/npm/l/sonner.svg)](https://github.com/emilkowalski/sonner)

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

## Documentation

Find the full API reference in the [documentation](https://sonner.emilkowal.ski/getting-started).
