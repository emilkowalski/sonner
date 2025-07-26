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

## Content Security Policy (CSP) Support

If you're using Content Security Policy and need to add a nonce to the injected styles, you can pass a `nonce` prop to the `<Toaster />` component:

```jsx
import { Toaster, toast } from 'sonner';

function App() {
  return (
    <div>
      <Toaster nonce="your-csp-nonce-here" />
      <button onClick={() => toast('My first toast')}>Give me a toast</button>
    </div>
  );
}
```

## Documentation

Find the full API reference in the [documentation](https://sonner.emilkowal.ski/getting-started).

---

## Changes Applied in This Fork

This fork adds Content Security Policy (CSP) nonce support to the original Sonner toast library. Here are the exact changes made:

### New Files Created:
- **`src/styles.ts`** - Contains CSS as a string constant and utility functions for style injection with nonce support

### Files Modified:

#### `src/types.ts`
- Added `nonce?: string` to the `ToasterProps` interface

#### `src/index.tsx`
- Replaced `import './styles.css'` with `import { injectStyles } from './styles'`
- Added `nonce` prop to Toaster component destructuring
- Added `useEffect` hook to inject styles with nonce when component mounts

#### `test/src/app/page.tsx`
- Added test button for nonce functionality
- Added `nonce="test-nonce-value"` prop to Toaster component

#### `test/tests/basic.spec.ts`
- Added test case `'nonce is applied to injected styles'` to verify nonce functionality

### New Exported Functions:
None - all functionality is handled automatically through the `nonce` prop

### Breaking Changes:
None - this fork maintains full backward compatibility with the original Sonner library.
