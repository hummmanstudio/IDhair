import { useEffect } from "react";
import { easeOutSine } from "./englishMainMotion";

export default function useEnglishMainScroll() {
  useEffect(() => {
    const lenis = window.lenis;
    if (!lenis) return undefined;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previous = {
      duration: lenis.options.duration,
      easing: lenis.options.easing,
      smoothWheel: lenis.options.smoothWheel,
    };
    const update = () => {
      lenis.options.duration = 1.35;
      lenis.options.easing = easeOutSine;
      lenis.options.smoothWheel = !motion.matches;
    };

    update();
    motion.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      Object.assign(lenis.options, previous);
    };
  }, []);
}
