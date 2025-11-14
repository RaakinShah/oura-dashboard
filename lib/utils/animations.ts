/**
 * Animation and transition utilities
 */

export type EasingFunction = (t: number) => number;

/**
 * Easing functions
 */
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
};

/**
 * Animate a value over time
 */
export function animate(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing: EasingFunction = easings.easeInOutQuad
): () => void {
  let startTime: number | null = null;
  let rafId: number;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = easing(progress);
    const currentValue = from + (to - from) * easedProgress;

    onUpdate(currentValue);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    }
  };

  rafId = requestAnimationFrame(step);

  return () => cancelAnimationFrame(rafId);
}

/**
 * Stagger animation delays
 */
export function stagger(
  count: number,
  delay: number
): (index: number) => number {
  return (index: number) => index * delay;
}

/**
 * Spring physics animation
 */
export function spring(
  value: number,
  target: number,
  velocity: number,
  options: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } = {}
): { value: number; velocity: number; done: boolean } {
  const { stiffness = 100, damping = 10, mass = 1 } = options;

  const delta = target - value;
  const springForce = stiffness * delta;
  const dampingForce = damping * velocity;

  const acceleration = (springForce - dampingForce) / mass;
  const newVelocity = velocity + acceleration * 0.016; // 60fps
  const newValue = value + newVelocity * 0.016;

  const done = Math.abs(newVelocity) < 0.01 && Math.abs(delta) < 0.01;

  return {
    value: newValue,
    velocity: newVelocity,
    done,
  };
}

/**
 * CSS animation classes generator
 */
export function generateAnimationClasses(name: string, keyframes: Record<string, Record<string, string>>): string {
  const keyframeRules = Object.entries(keyframes)
    .map(([step, styles]) => {
      const styleRules = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${step} { ${styleRules} }`;
    })
    .join(' ');

  return `@keyframes ${name} { ${keyframeRules} }`;
}

/**
 * Animate element entrance
 */
export function animateEntrance(
  element: HTMLElement,
  animation: 'fade' | 'slide' | 'scale' | 'bounce' = 'fade',
  duration = 300
): void {
  const animations = {
    fade: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slide: {
      from: { transform: 'translateY(20px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    scale: {
      from: { transform: 'scale(0.9)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    bounce: {
      from: { transform: 'scale(0.3)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
  };

  const { from, to } = animations[animation];

  element.animate([from, to], {
    duration,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
  });
}

/**
 * Parallax scroll effect
 */
export function parallax(
  element: HTMLElement,
  speed: number = 0.5
): () => void {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const offset = element.offsetTop;
    const distance = scrolled - offset;
    element.style.transform = `translateY(${distance * speed}px)`;
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}
