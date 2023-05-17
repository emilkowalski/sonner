import { CodeBlock } from '../CodeBlock';

const anchorCreate = 'create-function';
const anchorCreateMultiple = 'create-function-multiple';

export const Advanced = () => (
  <div>
    <h2>Advanced Usage</h2>

    <p>You will find this useful for the following usages:</p>

    <ol>
      <li>
        <a href={`#${anchorCreateMultiple}`}>
          <strong>Multiple Instance</strong>
        </a>{' '}
        of <code>{`<Toaster />`}</code>. See the usage <a href={`#${anchorCreateMultiple}`}>below</a>.
      </li>

      <li>
        <p>
          <a href={`#${anchorCreate}`}>
            <strong>Avoiding state pollution:</strong>
          </a>
        </p>

        <p>
          This is because <code>sonner</code> is exported with <code>singleton</code> state by default.
          <br />
          So default usage with <code>{`import { Toaster, toast } from 'sonner'`}</code> could sometime introduce
          duplicated toasts.
        </p>

        <p>
          For example when third-party libraries use <code>sonner</code> as part of their library, <code>sonner</code>'s{' '}
          <code>singleton</code> states are being{' '}
          <abbr
            title={`This typically depends on package managers, they tend to re-use the dependencies instead of re-downloading them as part of optimization. Although you won't face this issue easily since this process depends on dependency's semver-range, meaning this would happen if the main project and third-party library uses the same version of sonner.`}
          >
            shared
          </abbr>{' '}
          across project dependencies, all the <code>{`<Toaster />`}</code> component will subscribe to the same{' '}
          <code>sonner</code> instance. Resulting duplicated toasts.
        </p>

        <p>
          So if you're a <strong>library author</strong> shipping <code>sonner</code> as part of the library, it is{' '}
          <strong>highly recommend</strong> to instantiate your toast via{' '}
          <a href={`#${anchorCreate}`}>
            <code>create()</code>
          </a>{' '}
          function. So the <code>singleton</code> will stay inside your library instead of <code>sonner</code>.
        </p>
      </li>
    </ol>

    <h3 id={anchorCreate}>
      <strong>
        <u>Create Function</u>
      </strong>
    </h3>
    <CodeBlock initialHeight={270}>{`// toast-instance.js
import { create } from 'sonner'

export const { Toaster, toast } = create()`}</CodeBlock>

    <CodeBlock initialHeight={270}>{`// app.jsx
import { Toaster, toast } from './toast-instance'

function App() {
  return (
    <div>
      <Toaster />
      <button onClick={() => toast('My first toast')}>
        Give me a toast
      </button>
    </div>
  )
}`}</CodeBlock>

    <h3 id={anchorCreateMultiple}>
      <strong>
        <u>Multiple Instances</u>
      </strong>
    </h3>
    <CodeBlock initialHeight={270}>{`// t-instances.js
import { create } from 'sonner'

export const instance1 = create()
export const instance2 = create()`}</CodeBlock>

    <CodeBlock initialHeight={270}>{`// app.jsx
import { instance1, instance2 } from './t-instances'

function App() {
  return (
    <div>
      <instance1.Toaster />
      <instance2.Toaster />

      <button onClick={() => instance1.toast('From toast instance 1')}>
        Give me a toast 1
      </button>
      <button onClick={() => instance2.toast('From toast instance 2')}>
        Give me a toast 2
      </button>
    </div>
  )
}`}</CodeBlock>
  </div>
);
