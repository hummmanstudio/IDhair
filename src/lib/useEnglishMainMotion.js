import { useEffect } from "react";
import { gsap } from "gsap";
import { ENGLISH_MAIN_MOTION as motion, getEnglishNewsTimeline } from "./englishMainMotion";

const clamp = (value) => Math.max(0, Math.min(1, value));
const viewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

export default function useEnglishMainMotion(sceneRef, newsRef, isMobile, newsCount) {
  useEffect(() => {
    const scene = sceneRef.current;
    const news = newsRef.current;
    if (!scene || !news) return undefined;

    const media = gsap.matchMedia();
    media.add({ all: "all", reduce: "(prefers-reduced-motion: reduce)" }, (context) => {
      const reduced = context.conditions.reduce;
      const panels = [...scene.querySelectorAll(".main_story_panel")];
      const totalWeight = panels.length * motion.contentWeight + (panels.length - 1) * motion.transitionWeight;
      const storyTimeline = gsap.timeline({ paused: true });
      // Retain the accepted reading holds even after the last visible tween ends.
      storyTimeline.to({ value: 0 }, { value: 1, duration: totalWeight, ease: "none" }, 0);

      gsap.set(panels, { clipPath: "none", x: 0, yPercent: 0, scale: 1 });
      panels.forEach((panel, index) => gsap.set(panel, { autoAlpha: index === 0 ? 1 : 0 }));

      let cursor = 0;
      panels.forEach((panel, panelIndex) => {
        const background = panel.querySelector(".main_story_background img");
        const shade = panel.querySelector(".main_story_shade");
        const cards = [...panel.querySelectorAll(".main_story_card")];
        gsap.set(panel.querySelector(".main_story_copy"), { autoAlpha: panelIndex === 0 ? 1 : 0 });

        gsap.set(background, { filter: "blur(0px) brightness(1)", scale: 1 });
        gsap.set(shade, { opacity: 0 });
        if (!reduced) {
          storyTimeline.to(background, {
            filter: "blur(8px) brightness(0.78)", scale: 1.025,
            duration: .4, ease: "sine.inOut",
          }, cursor + .1);
          storyTimeline.to(shade, { opacity: .07, duration: .4, ease: "sine.inOut" }, cursor + .1);
        }

        cards.forEach((card, cardIndex) => {
          const direction = Number(card.dataset.direction) || 1;
          const start = motion.cardStart + cardIndex * motion.cardStartStagger;
          const end = motion.cardEnd + cardIndex * motion.cardEndStagger;
          const fromY = () => direction * viewportHeight() * motion.cardTravel;
          gsap.set(card, { y: reduced ? 0 : fromY, opacity: 0, scale: reduced ? 1 : motion.cardScale });
          if (reduced) {
            storyTimeline.set(card, { opacity: 1 }, cursor + start);
          } else {
            storyTimeline.fromTo(card, { y: fromY, scale: motion.cardScale }, {
              y: 0, scale: 1, duration: end - start, ease: "sine.out", immediateRender: false,
            }, cursor + start);
            storyTimeline.fromTo(card, { opacity: 0 }, {
              opacity: 1, duration: (end - start) * .35, ease: "sine.out", immediateRender: false,
            }, cursor + start);
          }
        });

        cursor += motion.contentWeight;
        const next = panels[panelIndex + 1];
        if (!next) return;
        if (reduced) {
          storyTimeline.set(next, { autoAlpha: 1 }, cursor + motion.transitionWeight);
          storyTimeline.set(next.querySelector(".main_story_copy"), { autoAlpha: 1 }, cursor + motion.transitionWeight);
          storyTimeline.set(panel, { autoAlpha: 0 }, cursor + motion.transitionWeight);
        } else {
          const foreground = [...panel.querySelectorAll(".main_story_cards, .main_story_copy, .main_story_notice")];
          storyTimeline.fromTo(foreground, { autoAlpha: 1 }, {
            autoAlpha: 0, duration: motion.transitionWeight * .3, ease: "sine.out", immediateRender: false,
          }, cursor);
          storyTimeline.fromTo(next, { autoAlpha: 0, yPercent: motion.panelLift, scale: 1.015 }, {
            autoAlpha: 1, yPercent: 0, scale: 1,
            duration: motion.transitionWeight * .78, ease: "sine.inOut", immediateRender: false,
          }, cursor + motion.transitionWeight * .22);
          storyTimeline.fromTo(next.querySelector(".main_story_copy"), { autoAlpha: 0 }, {
            autoAlpha: 1, duration: motion.transitionWeight * .5, ease: "sine.inOut", immediateRender: false,
          }, cursor + motion.transitionWeight * .5);
          // Keep the outgoing scene present until the incoming photograph has arrived.
          storyTimeline.to(panel, {
            autoAlpha: 0, duration: motion.transitionWeight * .6, ease: "sine.in",
          }, cursor + motion.transitionWeight * .4);
        }
        cursor += motion.transitionWeight;
      });

      const newsPanels = [...news.querySelectorAll(".main_news_panel")];
      const { ranges } = getEnglishNewsTimeline(newsPanels.length);
      const newsTimeline = gsap.timeline({ paused: true });
      newsTimeline.to({ value: 0 }, { value: 1, duration: 1, ease: "none" }, 0);
      if (newsPanels.length) gsap.set(newsPanels, { clipPath: "none", yPercent: 0 });
      newsPanels.forEach((panel, index) => {
        gsap.set(panel, { autoAlpha: index === 0 ? 1 : 0 });
        gsap.set(panel.querySelector(".main_news_content"), { autoAlpha: index === 0 ? 1 : 0 });
      });
      newsPanels.forEach((panel, index) => {
        if (index === 0) return;
        const [start, end] = ranges[index];
        if (reduced) {
          newsTimeline.set(panel, { autoAlpha: 1 }, end);
          newsTimeline.set(panel.querySelector(".main_news_content"), { autoAlpha: 1 }, end);
          newsTimeline.set(newsPanels[index - 1], { autoAlpha: 0 }, end);
        } else {
          newsTimeline.fromTo(newsPanels[index - 1].querySelector(".main_news_content"), { autoAlpha: 1 }, {
            autoAlpha: 0, duration: (end - start) * .3, ease: "sine.out", immediateRender: false,
          }, start);
          newsTimeline.fromTo(panel, { autoAlpha: 0, yPercent: 4 }, {
            autoAlpha: 1, yPercent: 0, duration: (end - start) * .78, ease: "sine.inOut", immediateRender: false,
          }, start + (end - start) * .22);
          newsTimeline.fromTo(panel.querySelector(".main_news_content"), { autoAlpha: 0 }, {
            autoAlpha: 1, duration: (end - start) * .5, ease: "sine.inOut", immediateRender: false,
          }, start + (end - start) * .5);
          newsTimeline.to(newsPanels[index - 1], {
            autoAlpha: 0, duration: (end - start) * .6, ease: "sine.in",
          }, start + (end - start) * .4);
        }
      });

      let frame = null;
      const update = () => {
        frame = null;
        const height = viewportHeight();
        const sceneRect = scene.getBoundingClientRect();
        const newsRect = news.getBoundingClientRect();
        storyTimeline.progress(clamp(-sceneRect.top / Math.max(1, sceneRect.height - height) / motion.timelineEnd), true);
        newsTimeline.progress(clamp(-newsRect.top / Math.max(1, newsRect.height - height)), true);
      };
      const requestUpdate = () => {
        if (frame === null) frame = window.requestAnimationFrame(update);
      };
      const resize = () => {
        storyTimeline.invalidate();
        newsTimeline.invalidate();
        requestUpdate();
      };

      update();
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", resize);
      window.visualViewport?.addEventListener("resize", resize);
      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", resize);
        window.visualViewport?.removeEventListener("resize", resize);
      };
    }, scene.closest("main"));

    return () => media.revert();
  }, [sceneRef, newsRef, isMobile, newsCount]);
}
