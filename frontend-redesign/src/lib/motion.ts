import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

export function initMotion() {
  if (typeof window === 'undefined') return { lenis: null, gsap };

  if (!lenisInstance) {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    lenisInstance = new Lenis({
      autoRaf: false,
      respectReducedMotion: true,
      lerp: prefersReduced ? 1 : 0.1,
      duration: prefersReduced ? 0 : 1.2,
      smoothWheel: !prefersReduced,
    });

    lenisInstance.on('scroll', ScrollTrigger.update);

    tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);
  }

  return { lenis: lenisInstance, gsap };
}

export function destroyMotion() {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function getGsap() {
  return gsap;
}
