export interface KeyboardNavOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onSpace?: () => void;
}

export function createKeyboardHandler(options: KeyboardNavOptions) {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        options.onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        options.onArrowDown?.();
        break;
      case 'ArrowLeft':
        options.onArrowLeft?.();
        break;
      case 'ArrowRight':
        options.onArrowRight?.();
        break;
      case 'Enter':
        options.onEnter?.();
        break;
      case 'Escape':
        options.onEscape?.();
        break;
      case 'Tab':
        options.onTab?.();
        break;
      case ' ':
        event.preventDefault();
        options.onSpace?.();
        break;
    }
  };
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

export function focusNextElement(currentElement: HTMLElement, container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex < focusableElements.length - 1) {
    focusableElements[currentIndex + 1].focus();
    return true;
  }

  return false;
}

export function focusPreviousElement(currentElement: HTMLElement, container: HTMLElement): boolean {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex > 0) {
    focusableElements[currentIndex - 1].focus();
    return true;
  }

  return false;
}
