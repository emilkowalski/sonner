'use client';

import React from 'react';
import ReactDOM from 'react-dom';

import DOMPurify from 'dompurify';
import { getAsset, Loader } from './assets';
import { useIsDocumentHidden } from './hooks';
import { toast, ToastState } from './state';
import './styles.css';
import {
  isAction,
  type ExternalToast,
  type HeightT,
  type ToasterProps,
  type ToastProps,
  type ToastT,
  type ToastToDismiss,
} from './types';

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3;

// Viewport padding
const VIEWPORT_OFFSET = '32px';

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000;

// Default toast width
const TOAST_WIDTH = 356;

// Default gap between toasts
const GAP = 14;

// Threshold to dismiss a toast
const SWIPE_THRESHOLD = 20;

// Equal to exit animation duration
const TIME_BEFORE_UNMOUNT = 200;

function _cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const Toast = (props: ToastProps) => {
  const {
    invert: ToasterInvert,
    toast,
    unstyled,
    interacting,
    setHeights,
    visibleToasts,
    heights,
    index,
    toasts,
    expanded,
    removeToast,
    defaultRichColors,
    closeButton: closeButtonFromToaster,
    style,
    cancelButtonStyle,
    actionButtonStyle,
    className = '',
    descriptionClassName = '',
    duration: durationFromToaster,
    position,
    gap,
    loadingIcon: loadingIconProp,
    expandByDefault,
    classNames,
    icons,
    closeButtonAriaLabel = 'Close toast',
    pauseWhenPageIsHidden,
    cn,
  } = props;
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [swiping, setSwiping] = React.useState(false);
  const [swipeOut, setSwipeOut] = React.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const dragStartTime = React.useRef<Date | null>(null);
  const toastRef = React.useRef<HTMLLIElement>(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast.type;
  const dismissible = toast.dismissible !== false;
  const toastClassname = toast.className || '';
  const toastDescriptionClassname = toast.descriptionClassName || '';
  // Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
  const heightIndex = React.useMemo(
    () => heights.findIndex((height) => height.toastId === toast.id) || 0,
    [heights, toast.id],
  );
  const closeButton = React.useMemo(
    () => toast.closeButton ?? closeButtonFromToaster,
    [toast.closeButton, closeButtonFromToaster],
  );
  const duration = React.useMemo(
    () => toast.duration || durationFromToaster || TOAST_LIFETIME,
    [toast.duration, durationFromToaster],
  );
  const closeTimerStartTimeRef = React.useRef(0);
  const offset = React.useRef(0);
  const lastCloseTimerStartTimeRef = React.useRef(0);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [y, x] = position.split('-');
  const toastsHeightBefore = React.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current  toast
      if (reducerIndex >= heightIndex) {
        return prev;
      }

      return prev + curr.height;
    }, 0);
  }, [heights, heightIndex]);
  const isDocumentHidden = useIsDocumentHidden();

  const invert = toast.invert || ToasterInvert;
  const disabled = toastType === 'loading';

  offset.current = React.useMemo(() => heightIndex * gap + toastsHeightBefore, [heightIndex, toastsHeightBefore]);

  React.useEffect(() => {
    // Trigger enter animation without using CSS animation
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = 'auto';
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;

    setInitialHeight(newHeight);

    setHeights((heights) => {
      const alreadyExists = heights.find((height) => height.toastId === toast.id);
      if (!alreadyExists) {
        return [{ toastId: toast.id, height: newHeight, position: toast.position }, ...heights];
      } else {
        return heights.map((height) => (height.toastId === toast.id ? { ...height, height: newHeight } : height));
      }
    });
  }, [mounted, toast.title, toast.description, setHeights, toast.id]);

  const deleteToast = React.useCallback(() => {
    // Save the offset for the exit swipe animation
    setRemoved(true);
    setOffsetBeforeRemove(offset.current);
    setHeights((h) => h.filter((height) => height.toastId !== toast.id));

    setTimeout(() => {
      removeToast(toast);
    }, TIME_BEFORE_UNMOUNT);
  }, [toast, removeToast, setHeights, offset]);

  React.useEffect(() => {
    if ((toast.promise && toastType === 'loading') || toast.duration === Infinity || toast.type === 'loading') return;
    let timeoutId: NodeJS.Timeout;
    let remainingTime = duration;

    // Pause the timer on each hover
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        // Get the elapsed time since the timer started
        const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.current;

        remainingTime = remainingTime - elapsedTime;
      }

      lastCloseTimerStartTimeRef.current = new Date().getTime();
    };

    const startTimer = () => {
      // setTimeout(, Infinity) behaves as if the delay is 0.
      // As a result, the toast would be closed immediately, giving the appearance that it was never rendered.
      // See: https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#an-infinite-timeout
      if (remainingTime === Infinity) return;

      closeTimerStartTimeRef.current = new Date().getTime();

      // Let the toast know it has started
      timeoutId = setTimeout(() => {
        toast.onAutoClose?.(toast);
        deleteToast();
      }, remainingTime);
    };

    if (expanded || interacting || (pauseWhenPageIsHidden && isDocumentHidden)) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => clearTimeout(timeoutId);
  }, [
    expanded,
    interacting,
    expandByDefault,
    toast,
    duration,
    deleteToast,
    toast.promise,
    toastType,
    pauseWhenPageIsHidden,
    isDocumentHidden,
  ]);

  React.useEffect(() => {
    const toastNode = toastRef.current;

    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;

      // Add toast height tot heights array after the toast is mounted
      setInitialHeight(height);
      setHeights((h) => [{ toastId: toast.id, height, position: toast.position }, ...h]);

      return () => setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    }
  }, [setHeights, toast.id]);

  React.useEffect(() => {
    if (toast.delete) {
      deleteToast();
    }
  }, [deleteToast, toast.delete]);

  function getLoadingIcon() {
    if (icons?.loading) {
      return (
        <div className="sonner-loader" data-visible={toastType === 'loading'}>
          {icons.loading}
        </div>
      );
    }

    if (loadingIconProp) {
      return (
        <div className="sonner-loader" data-visible={toastType === 'loading'}>
          {loadingIconProp}
        </div>
      );
    }
    return <Loader visible={toastType === 'loading'} />;
  }

  function sanitizeHTML(html: string): { __html: string } {
    return { __html: DOMPurify.sanitize(html) };
  }

  return (
    <li
      aria-live={toast.important ? 'assertive' : 'polite'}
      aria-atomic="true"
      role="status"
      tabIndex={0}
      ref={toastRef}
      className={cn(
        className,
        toastClassname,
        classNames?.toast,
        toast?.classNames?.toast,
        classNames?.default,
        classNames?.[toastType],
        toast?.classNames?.[toastType],
      )}
      data-sonner-toast=""
      data-rich-colors={toast.richColors ?? defaultRichColors}
      data-styled={!Boolean(toast.jsx || toast.unstyled || unstyled)}
      data-mounted={mounted}
      data-promise={Boolean(toast.promise)}
      data-removed={removed}
      data-visible={isVisible}
      data-y-position={y}
      data-x-position={x}
      data-index={index}
      data-front={isFront}
      data-swiping={swiping}
      data-dismissible={dismissible}
      data-type={toastType}
      data-invert={invert}
      data-swipe-out={swipeOut}
      data-expanded={Boolean(expanded || (expandByDefault && mounted))}
      style={
        {
          '--index': index,
          '--toasts-before': index,
          '--z-index': toasts.length - index,
          '--offset': `${removed ? offsetBeforeRemove : offset.current}px`,
          '--initial-height': expandByDefault ? 'auto' : `${initialHeight}px`,
          ...style,
          ...toast.style,
        } as React.CSSProperties
      }
      onPointerDown={(event) => {
        if (disabled || !dismissible) return;
        dragStartTime.current = new Date();
        setOffsetBeforeRemove(offset.current);
        // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if ((event.target as HTMLElement).tagName === 'BUTTON') return;
        setSwiping(true);
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={() => {
        if (swipeOut || !dismissible) return;

        pointerStartRef.current = null;
        const swipeAmount = Number(toastRef.current?.style.getPropertyValue('--swipe-amount').replace('px', '') || 0);
        const timeTaken = new Date().getTime() - dragStartTime.current?.getTime();
        const velocity = Math.abs(swipeAmount) / timeTaken;

        // Remove only if threshold is met
        if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
          setOffsetBeforeRemove(offset.current);
          toast.onDismiss?.(toast);
          deleteToast();
          setSwipeOut(true);
          return;
        }

        toastRef.current?.style.setProperty('--swipe-amount', '0px');
        setSwiping(false);
      }}
      onPointerMove={(event) => {
        if (!pointerStartRef.current || !dismissible) return;

        const yPosition = event.clientY - pointerStartRef.current.y;
        const xPosition = event.clientX - pointerStartRef.current.x;

        const clamp = y === 'top' ? Math.min : Math.max;
        const clampedY = clamp(0, yPosition);
        const swipeStartThreshold = event.pointerType === 'touch' ? 10 : 2;
        const isAllowedToSwipe = Math.abs(clampedY) > swipeStartThreshold;

        if (isAllowedToSwipe) {
          toastRef.current?.style.setProperty('--swipe-amount', `${yPosition}px`);
        } else if (Math.abs(xPosition) > swipeStartThreshold) {
          // User is swiping in wrong direction so we disable swipe gesture
          // for the current pointer down interaction
          pointerStartRef.current = null;
        }
      }}
    >
      {closeButton && !toast.jsx ? (
        <button
          aria-label={closeButtonAriaLabel}
          data-disabled={disabled}
          data-close-button
          onClick={
            disabled || !dismissible
              ? () => {}
              : () => {
                  deleteToast();
                  toast.onDismiss?.(toast);
                }
          }
          className={cn(classNames?.closeButton, toast?.classNames?.closeButton)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ) : null}
      {toast.jsx || React.isValidElement(toast.title) ? (
        toast.jsx || toast.title
      ) : (
        <>
          {toastType || toast.icon || toast.promise ? (
            <div data-icon="" className={cn(classNames?.icon, toast?.classNames?.icon)}>
              {toast.promise || (toast.type === 'loading' && !toast.icon) ? toast.icon || getLoadingIcon() : null}
              {toast.type !== 'loading' ? toast.icon || icons?.[toastType] || getAsset(toastType) : null}
            </div>
          ) : null}

          <div data-content="" className={cn(classNames?.content, toast?.classNames?.content)}>
            <div
              data-title=""
              className={cn(classNames?.title, toast?.classNames?.title)}
              dangerouslySetInnerHTML={sanitizeHTML(toast.title as string)}
            ></div>
            {toast.description ? (
              <div
                data-description=""
                className={cn(
                  descriptionClassName,
                  toastDescriptionClassname,
                  classNames?.description,
                  toast?.classNames?.description,
                )}
                dangerouslySetInnerHTML={
                  typeof toast.description === 'string' ? sanitizeHTML(toast.description as string) : undefined
                }
              >
                {typeof toast.description === 'object' ? toast.description : null}
              </div>
            ) : null}
          </div>
          {React.isValidElement(toast.cancel) ? (
            toast.cancel
          ) : toast.cancel && isAction(toast.cancel) ? (
            <button
              data-button
              data-cancel
              style={toast.cancelButtonStyle || cancelButtonStyle}
              onClick={(event) => {
                // We need to check twice because typescript
                if (!isAction(toast.cancel)) return;
                if (!dismissible) return;
                deleteToast();
                toast.cancel.onClick(event);
              }}
              className={cn(classNames?.cancelButton, toast?.classNames?.cancelButton)}
            >
              {toast.cancel.label}
            </button>
          ) : null}
          {React.isValidElement(toast.action) ? (
            toast.action
          ) : toast.action && isAction(toast.action) ? (
            <button
              data-button=""
              style={toast.actionButtonStyle || actionButtonStyle}
              onClick={(event) => {
                // We need to check twice because typescript
                if (!isAction(toast.action)) return;
                toast.action.onClick(event);
                if (event.defaultPrevented) return;
                deleteToast();
              }}
              className={cn(classNames?.actionButton, toast?.classNames?.actionButton)}
            >
              {toast.action.label}
            </button>
          ) : null}
        </>
      )}
    </li>
  );
};

function getDocumentDirection(): ToasterProps['dir'] {
  if (typeof window === 'undefined') return 'ltr';
  if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute('dir');

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as ToasterProps['dir'];
  }

  return dirAttribute as ToasterProps['dir'];
}

const Toaster = (props: ToasterProps) => {
  const {
    invert,
    position = 'bottom-right',
    hotkey = ['altKey', 'KeyT'],
    expand,
    closeButton,
    className,
    offset,
    theme = 'light',
    richColors,
    duration,
    style,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    toastOptions,
    dir = getDocumentDirection(),
    gap = GAP,
    loadingIcon,
    icons,
    containerAriaLabel = 'Notifications',
    pauseWhenPageIsHidden,
    cn = _cn,
  } = props;
  const [toasts, setToasts] = React.useState<ToastT[]>([]);
  const possiblePositions = React.useMemo(() => {
    return Array.from(
      new Set([position].concat(toasts.filter((toast) => toast.position).map((toast) => toast.position))),
    );
  }, [toasts, position]);
  const [heights, setHeights] = React.useState<HeightT[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const [interacting, setInteracting] = React.useState(false);
  const [actualTheme, setActualTheme] = React.useState(
    theme !== 'system'
      ? theme
      : typeof window !== 'undefined'
      ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : 'light',
  );

  const listRef = React.useRef<HTMLOListElement>(null);
  const hotkeyLabel = hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');
  const lastFocusedElementRef = React.useRef<HTMLElement>(null);
  const isFocusWithinRef = React.useRef(false);

  const removeToast = React.useCallback(
    (toast: ToastT) => setToasts((toasts) => toasts.filter(({ id }) => id !== toast.id)),
    [],
  );

  React.useEffect(() => {
    return ToastState.subscribe((toast) => {
      if ((toast as ToastToDismiss).dismiss) {
        setToasts((toasts) => toasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t)));
        return;
      }

      // Prevent batching, temp solution.
      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setToasts((toasts) => {
            const indexOfExistingToast = toasts.findIndex((t) => t.id === toast.id);

            // Update the toast if it already exists
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts.slice(0, indexOfExistingToast),
                { ...toasts[indexOfExistingToast], ...toast },
                ...toasts.slice(indexOfExistingToast + 1),
              ];
            }

            return [toast, ...toasts];
          });
        });
      });
    });
  }, []);

  React.useEffect(() => {
    if (theme !== 'system') {
      setActualTheme(theme);
      return;
    }

    if (theme === 'system') {
      // check if current preference is dark
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // it's currently dark
        setActualTheme('dark');
      } else {
        // it's not dark
        setActualTheme('light');
      }
    }

    if (typeof window === 'undefined') return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
      if (matches) {
        setActualTheme('dark');
      } else {
        setActualTheme('light');
      }
    });
  }, [theme]);

  React.useEffect(() => {
    // Ensure expanded is always false when no toasts are present / only one left
    if (toasts.length <= 1) {
      setExpanded(false);
    }
  }, [toasts]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isHotkeyPressed = hotkey.every((key) => (event as any)[key] || event.code === key);

      if (isHotkeyPressed) {
        setExpanded(true);
        listRef.current?.focus();
      }

      if (
        event.code === 'Escape' &&
        (document.activeElement === listRef.current || listRef.current?.contains(document.activeElement))
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hotkey]);

  React.useEffect(() => {
    if (listRef.current) {
      return () => {
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus({ preventScroll: true });
          lastFocusedElementRef.current = null;
          isFocusWithinRef.current = false;
        }
      };
    }
  }, [listRef.current]);

  if (!toasts.length) return null;

  return (
    // Remove item from normal navigation flow, only available via hotkey
    <section aria-label={`${containerAriaLabel} ${hotkeyLabel}`} tabIndex={-1}>
      {possiblePositions.map((position, index) => {
        const [y, x] = position.split('-');
        return (
          <ol
            key={position}
            dir={dir === 'auto' ? getDocumentDirection() : dir}
            tabIndex={-1}
            ref={listRef}
            className={className}
            data-sonner-toaster
            data-theme={actualTheme}
            data-y-position={y}
            data-x-position={x}
            style={
              {
                '--front-toast-height': `${heights[0]?.height || 0}px`,
                '--offset': typeof offset === 'number' ? `${offset}px` : offset || VIEWPORT_OFFSET,
                '--width': `${TOAST_WIDTH}px`,
                '--gap': `${gap}px`,
                ...style,
              } as React.CSSProperties
            }
            onBlur={(event) => {
              if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
                isFocusWithinRef.current = false;
                if (lastFocusedElementRef.current) {
                  lastFocusedElementRef.current.focus({ preventScroll: true });
                  lastFocusedElementRef.current = null;
                }
              }
            }}
            onFocus={(event) => {
              const isNotDismissible =
                event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

              if (isNotDismissible) return;

              if (!isFocusWithinRef.current) {
                isFocusWithinRef.current = true;
                lastFocusedElementRef.current = event.relatedTarget as HTMLElement;
              }
            }}
            onMouseEnter={() => setExpanded(true)}
            onMouseMove={() => setExpanded(true)}
            onMouseLeave={() => {
              // Avoid setting expanded to false when interacting with a toast, e.g. swiping
              if (!interacting) {
                setExpanded(false);
              }
            }}
            onPointerDown={(event) => {
              const isNotDismissible =
                event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

              if (isNotDismissible) return;
              setInteracting(true);
            }}
            onPointerUp={() => setInteracting(false)}
          >
            {toasts
              .filter((toast) => (!toast.position && index === 0) || toast.position === position)
              .map((toast, index) => (
                <Toast
                  key={toast.id}
                  icons={icons}
                  index={index}
                  toast={toast}
                  defaultRichColors={richColors}
                  duration={toastOptions?.duration ?? duration}
                  className={toastOptions?.className}
                  descriptionClassName={toastOptions?.descriptionClassName}
                  invert={invert}
                  visibleToasts={visibleToasts}
                  closeButton={toastOptions?.closeButton ?? closeButton}
                  interacting={interacting}
                  position={position}
                  style={toastOptions?.style}
                  unstyled={toastOptions?.unstyled}
                  classNames={toastOptions?.classNames}
                  cancelButtonStyle={toastOptions?.cancelButtonStyle}
                  actionButtonStyle={toastOptions?.actionButtonStyle}
                  removeToast={removeToast}
                  toasts={toasts.filter((t) => t.position == toast.position)}
                  heights={heights.filter((h) => h.position == toast.position)}
                  setHeights={setHeights}
                  expandByDefault={expand}
                  gap={gap}
                  loadingIcon={loadingIcon}
                  expanded={expanded}
                  pauseWhenPageIsHidden={pauseWhenPageIsHidden}
                  cn={cn}
                />
              ))}
          </ol>
        );
      })}
    </section>
  );
};
export { toast, Toaster, type ExternalToast, type ToastT };
