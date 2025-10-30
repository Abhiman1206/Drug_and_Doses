import { useEffect, useRef } from 'react';

// Selectors for focusable elements
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const useFocusTrap = <T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void
): React.RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen || !ref.current) {
      return;
    }

    const trapElement = ref.current;
    const focusableElements = Array.from(
      trapElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when the trap opens
    firstElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      }
    };

    trapElement.addEventListener('keydown', handleKeyDown);

    return () => {
      trapElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return ref;
};
