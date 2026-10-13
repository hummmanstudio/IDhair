import { useEffect, useLayoutEffect } from "react";

const INTRO_SCALE_DURATION = 1600;
const INTRO_IMAGE_REVEAL_DURATION = 900;
// Match the header's delay after main-intro-text-start.
const INTRO_OPEN_DELAY = 1000;
const INTRO_TEXT_START_SCALE = 0.4;

export default function useMainIntroAnimation(sceneRef, {
  scaleDuration = INTRO_SCALE_DURATION,
  revealDuration = INTRO_IMAGE_REVEAL_DURATION,
  openDelay = INTRO_OPEN_DELAY,
  scaleEasing = "ease",
} = {}) {
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    window.lenis?.scrollTo(0, { immediate: true, force: true });

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const panel = scene.querySelector(".main_story_panel_1");
    const picture = panel.querySelector(".main_story_background picture");
    const image = picture.querySelector("img");
    const text = panel.querySelector("[data-main-intro-ani]");
    const controller = new AbortController();
    const { signal } = controller;
    let scaleAnimation;
    let imageRevealAnimation;
    let openTimer;
    let frameId;

    function waitForEvent(target, events) {
      return new Promise((resolve) => {
        const finish = () => {
          events.forEach((event) => target.removeEventListener(event, finish));
          signal.removeEventListener("abort", finish);
          resolve();
        };
        events.forEach((event) => target.addEventListener(event, finish, { once: true }));
        signal.addEventListener("abort", finish, { once: true });
      });
    }

    async function start() {
      // Start as soon as the opening image is ready. News, gallery images,
      // other story panels and fonts must not hold the first image back.
      if (!image.complete) await waitForEvent(image, ["load", "error"]);
      if (!signal.aborted) await image.decode().catch(() => {});
      if (signal.aborted) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      imageRevealAnimation = image.animate(
        [
          { clipPath: "inset(calc(100% + 2px) -2px -2px -2px)" },
          { clipPath: "inset(-2px)" },
        ],
        {
          duration: reducedMotion ? 0 : revealDuration,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );
      await imageRevealAnimation.finished.catch(() => {});
      if (signal.aborted) return;

      imageRevealAnimation.cancel();
      image.style.clipPath = "none";

      scaleAnimation = picture.animate(
        [{ transform: "scale(0.3)" }, { transform: "scale(1)" }],
        { duration: reducedMotion ? 0 : scaleDuration, easing: scaleEasing, fill: "forwards" },
      );
      function checkScale() {
        if (signal.aborted) return;
        const progress = scaleAnimation.effect.getComputedTiming().progress ?? 0;
        const scale = 0.3 + (1 - 0.3) * progress;

        if (scale >= INTRO_TEXT_START_SCALE) {
          text.classList.add("active");
          window.dispatchEvent(new Event("main-intro-text-start"));
          openTimer = window.setTimeout(() => {
            if (!signal.aborted) panel.classList.add("open");
          }, openDelay);
          return;
        }
        frameId = window.requestAnimationFrame(checkScale);
      }
      frameId = window.requestAnimationFrame(checkScale);
    }

    start();
    return () => {
      controller.abort();
      window.clearTimeout(openTimer);
      window.cancelAnimationFrame(frameId);
      imageRevealAnimation?.cancel();
      scaleAnimation?.cancel();
      image.style.removeProperty("clip-path");
      text.classList.remove("active");
      panel.classList.remove("open");
    };
  }, [sceneRef, scaleDuration, revealDuration, openDelay, scaleEasing]);
}
