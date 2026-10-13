// English-only tuning; keep these values together for the later Korean review.
export const ENGLISH_MAIN_MOTION = {
  storyScreens: 11.8,
  mobileStoryScreens: 10,
  contentWeight: 1,
  transitionWeight: .32,
  timelineEnd: .98,
  cardStart: .20,
  cardStartStagger: .055,
  cardEnd: .72,
  cardEndStagger: .06,
  panelTravel: 12,
};

export const ENGLISH_MAIN_INTRO = {
  scaleDuration: 1400,
  revealDuration: 850,
  openDelay: 800,
  scaleEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
};

export const easeInOutCubic = (t) => t < .5
  ? 4 * t * t * t
  : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

export function getEnglishNewsTimeline(count) {
  // One article needs a short reading hold, rather than three articles' runway.
  const panels = Math.max(1, count);
  const scrollScreens = panels === 1 ? .65 : .3 + (panels - 1) * .4 + (panels - 2) * .2 + .3;
  const ranges = Array.from({ length: panels }, (_, index) => {
    if (index === 0) return [0, 0];
    const start = .3 + (index - 1) * .6;
    return [start / scrollScreens, (start + .4) / scrollScreens];
  });
  return { heightScreens: 1 + scrollScreens, ranges };
}
