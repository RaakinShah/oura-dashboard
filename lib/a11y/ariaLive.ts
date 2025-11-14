export type AriaLive = 'off' | 'polite' | 'assertive';
export type AriaRelevant = 'additions' | 'removals' | 'text' | 'all';

export interface AriaLiveRegionProps {
  live?: AriaLive;
  atomic?: boolean;
  relevant?: AriaRelevant;
  busy?: boolean;
}

export function createAriaLiveRegion(
  message: string,
  props: AriaLiveRegionProps = {}
): HTMLDivElement {
  const {
    live = 'polite',
    atomic = true,
    relevant = 'additions',
    busy = false,
  } = props;

  const region = document.createElement('div');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', live);
  region.setAttribute('aria-atomic', String(atomic));
  region.setAttribute('aria-relevant', relevant);
  region.setAttribute('aria-busy', String(busy));
  region.textContent = message;

  region.style.position = 'absolute';
  region.style.left = '-10000px';
  region.style.width = '1px';
  region.style.height = '1px';
  region.style.overflow = 'hidden';

  return region;
}

export function announceToScreenReader(
  message: string,
  priority: AriaLive = 'polite'
) {
  if (typeof document === 'undefined') return;

  const region = createAriaLiveRegion(message, { live: priority });
  document.body.appendChild(region);

  setTimeout(() => {
    document.body.removeChild(region);
  }, 1000);
}
