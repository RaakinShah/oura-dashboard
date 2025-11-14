/**
 * Image optimization utilities
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  maxWidth?: number;
  maxHeight?: number;
  lazy?: boolean;
}

/**
 * Generate optimized image URL (for Next.js Image)
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 75, maxWidth, maxHeight } = options;

  const params = new URLSearchParams();
  params.append('url', src);
  params.append('q', quality.toString());

  if (maxWidth) params.append('w', maxWidth.toString());
  if (maxHeight) params.append('h', maxHeight.toString());

  return `/_next/image?${params.toString()}`;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { maxWidth: width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'high'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = priority;
  document.head.appendChild(link);
}

/**
 * Check if image is in viewport
 */
export function isImageInViewport(img: HTMLImageElement): boolean {
  const rect = img.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImages(selector: string = 'img[data-src]'): void {
  const images = document.querySelectorAll<HTMLImageElement>(selector);

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    images.forEach((img) => imageObserver.observe(img));
  } else {
    // Fallback for browsers without Intersection Observer
    images.forEach((img) => {
      const src = img.dataset.src;
      if (src) {
        img.src = src;
      }
    });
  }
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e7e5e4');
  gradient.addColorStop(1, '#d6d3d1');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Calculate optimal image size for container
 */
export function calculateOptimalSize(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  mode: 'contain' | 'cover' = 'cover'
): { width: number; height: number } {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  if (mode === 'cover') {
    if (imageRatio > containerRatio) {
      return {
        width: (containerHeight * imageRatio),
        height: containerHeight,
      };
    } else {
      return {
        width: containerWidth,
        height: containerWidth / imageRatio,
      };
    }
  } else {
    // contain
    if (imageRatio > containerRatio) {
      return {
        width: containerWidth,
        height: containerWidth / imageRatio,
      };
    } else {
      return {
        width: containerHeight * imageRatio,
        height: containerHeight,
      };
    }
  }
}
