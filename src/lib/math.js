export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -9 * x));
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const smooth = (x) => x * x * (3 - 2 * x);

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isSmallScreen = () =>
  typeof matchMedia === 'function' && matchMedia('(max-width: 640px)').matches;
