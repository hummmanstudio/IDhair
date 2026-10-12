import { useEffect, useRef, useState } from "react";
import TransitionLink from "../components/TransitionLink";
import MainNotice from "../components/MainNotice";
import useAboutSmoothScroll from "../lib/useAboutSmoothScroll";
import useMainIntroAnimation from "../lib/useMainIntroAnimation";
import {
  fetchGalleryPosts,
  fetchNewsPosts,
  formatNewsDate,
  getNewsImageUrl,
} from "../lib/sanityNewsEn";
import "../styles/main.scss";

const MAIN_STORIES = [
  {
    background: "/img/main_1_1_bg.jpg",
    backgroundAlt: "id HAIR MY IDENTITY campaign",
    cards: ["/img/main_1_1_1.jpg", "/img/main_1_1_2.jpg", "/img/main_1_1_3.jpg"],
    cardsMob: ["/img/main_1_1_2.jpg", "/img/main_1_1_3.jpg"],
    theme: "green",
  },
  {
    background: "/img/main_1_2_bg.jpg",
    mobileBackground: "/img/main_1_2_bg_mob.jpg",
    backgroundAlt: "LOOK BETTER, FEEL BETTER",
    cards: ["/img/main_1_2_1.jpg", "/img/main_1_2_2.jpg", "/img/main_1_2_3.jpg"],
    cardsMob: ["/img/main_1_2_1.jpg", "/img/main_1_2_3.jpg"],
    theme: "green",
  },
  {
    background: "/img/main_1_3_bg.jpg",
    mobileBackground: "/img/main_1_3_bg_mob.jpg",
    backgroundAlt: "id HAIR MY IDENTITY white campaign",
    cards: ["/img/main_1_3_1.jpg", "/img/main_1_3_2.jpg", "/img/main_1_3_3.jpg"],
    cardsMob: ["/img/main_1_3_1.jpg", "/img/main_1_3_3.jpg"],
    theme: "white",
  },
];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const getRangeProgress = (progress, start, end) =>
  clamp((progress - start) / Math.max(0.001, end - start));

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const MOBILE_CARD_QUERY = "(max-width: 1024px)";

function MainStoryPanel({ story, index, isMobile }) {
  const cards = isMobile && story.cardsMob ? story.cardsMob : story.cards;

  return (
    <div
      className={`main_story_panel main_story_panel_${index + 1} theme_${story.theme}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="main_story_background">
        <picture>
          {story.mobileBackground && (
            <source media="(max-width: 1024px)" srcSet={story.mobileBackground} />
          )}
          <img
            src={story.background}
            alt={story.backgroundAlt}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </picture>
      </div>
      <div className="main_story_shade" aria-hidden="true" />

      <div className="main_story_copy apprael_all display-l ani apprael_ani" data-main-intro-ani={index === 0 ? "" : undefined} aria-hidden="true">
        {index === 4 ? (
          <>
            <span>MY<br/>IDENTITY</span>
            <span>MY<br/>id HAIR</span>
          </>
        ) : (
          <>
            <span>LOOK<br/>BETTER,</span>
            <span>FEEL<br/>BETTER</span>
            
          </>
        )}
      </div>

      <div className="main_story_cards">
        {cards.map((source, cardIndex) => (
          <div
            className={`main_story_card_slot main_story_card_slot_${cardIndex + 1}`}
            key={source}
          >
            <figure
              className="main_story_card"
              data-direction={cardIndex % 2 === 0 ? "1" : "-1"}
            >
              <img src={source} alt={`id HAIR campaign cut ${cardIndex + 1}`} />
            </figure>
          </div>
        ))}
      </div>

      {index === 0 && <MainNotice language="en" />}

      <div className="main_story_scroll body-s" aria-hidden="true">
        <span>[ SCROLL ]</span>
      </div>
    </div>
  );
}

function Main() {
  useAboutSmoothScroll({ verticalOnly: true });
  const sceneRef = useRef(null);
  useMainIntroAnimation(sceneRef);
  const newsRevealRef = useRef(null);
  const [isMobileCards, setIsMobileCards] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_CARD_QUERY).matches;
  });
  const [collectionPosting, setCollectionPosting] = useState({
    image: "/img/main_3_bg.jpg",
    title: "id GALLERY",
  });
  const [mainNews, setMainNews] = useState([]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_CARD_QUERY);
    const handleChange = () => setIsMobileCards(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchNewsPosts()
      .then((posts) => {
        if (!isMounted || !posts.length) return;

        setMainNews(posts.slice(0, 3).map((post) => ({
          date: formatNewsDate(post.publishedAt),
          dateTime: post.publishedAt || "",
          image: getNewsImageUrl(post.thumbnail, 960),
          title: post.title,
          url: `/en/magazine/id-news/post/${post._id}`,
        })));
      })
      .catch((error) => {
        console.error("Failed to load latest news posts on main", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchGalleryPosts()
      .then(([featuredPost]) => {
        if (!isMounted || !featuredPost) return;

        const coverImage = featuredPost.thumbnail || featuredPost.images?.[0];
        const image = getNewsImageUrl(coverImage, 1280);

        if (image) {
          setCollectionPosting({
            image,
            title: featuredPost.title || "id GALLERY",
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load featured gallery post on main", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) return undefined;

    const panels = [...scene.querySelectorAll(".main_story_panel")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = null;

    const updatePanel = (panel, progress) => {
      const background = panel.querySelector(".main_story_background img");
      const shade = panel.querySelector(".main_story_shade");
      const cards = [...panel.querySelectorAll(".main_story_card")];
      const notice = panel.querySelector(".main_story_notice");
      const scrollIndicator = panel.querySelector(".main_story_scroll");
      const blurProgress = easeOutCubic(getRangeProgress(progress, 0.1, 0.38));

      background.style.filter = `blur(${blurProgress * 12}px) brightness(${1 - blurProgress * 0.42})`;
      background.style.transform = `scale(${1 + blurProgress * 0.04})`;
      shade.style.opacity = String(blurProgress * 0.12);

      cards.forEach((card, index) => {
        const start = 0.24 + index * 0.06;
        const end = 0.52 + index * 0.045;
        const cardProgress = reducedMotion.matches
          ? progress > start ? 1 : 0
          : easeOutCubic(getRangeProgress(progress, start, end));
        const direction = Number(card.dataset.direction) || 1;
        const translateY = direction * 112 * (1 - cardProgress);

        card.style.opacity = String(getRangeProgress(cardProgress, 0, 0.14));
        card.style.transform = `translate3d(0, ${translateY}vh, 0)`;
      });

      /*if (notice) notice.style.opacity = String(1 - getRangeProgress(progress, 0.08, 0.24));
      scrollIndicator.style.opacity = String(1 - getRangeProgress(progress, 0.08, 0.22));*/
    };

    const updateScene = () => {
      frameId = null;

      const rect = scene.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const scrollRange = Math.max(1, rect.height - viewportHeight);
      const progress = clamp(-rect.top / scrollRange);
      const contentWeight = 1;
      const transitionWeight = 0.55;
      const timelineEnd = 0.98;
      const totalWeight = panels.length * contentWeight + Math.max(0, panels.length - 1) * transitionWeight;
      let timelineCursor = 0;

      panels.forEach((panel, index) => {
        const contentStart = (timelineCursor / totalWeight) * timelineEnd;
        const contentEnd = ((timelineCursor + contentWeight) / totalWeight) * timelineEnd;
        const panelProgress = getRangeProgress(progress, contentStart, contentEnd);

        updatePanel(panel, panelProgress);
        timelineCursor += contentWeight;

        const nextPanel = panels[index + 1];
        if (!nextPanel) return;

        const transitionStart = (timelineCursor / totalWeight) * timelineEnd;
        const transitionEnd = ((timelineCursor + transitionWeight) / totalWeight) * timelineEnd;
        const transitionProgress = reducedMotion.matches
          ? progress >= transitionEnd ? 1 : 0
          : easeOutCubic(getRangeProgress(progress, transitionStart, transitionEnd));

        nextPanel.style.clipPath = `inset(0 0 0 ${100 - transitionProgress * 100}%)`;
        nextPanel.style.transform = `translate3d(${(1 - transitionProgress) * 18}vw, 0, 0)`;
        timelineCursor += transitionWeight;
      });
    };

    const requestSceneUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateScene);
    };

    updateScene();
    window.addEventListener("scroll", requestSceneUpdate, { passive: true });
    window.addEventListener("resize", requestSceneUpdate);
    window.visualViewport?.addEventListener("resize", requestSceneUpdate);
    reducedMotion.addEventListener("change", requestSceneUpdate);

    return () => {
      window.removeEventListener("scroll", requestSceneUpdate);
      window.removeEventListener("resize", requestSceneUpdate);
      window.visualViewport?.removeEventListener("resize", requestSceneUpdate);
      reducedMotion.removeEventListener("change", requestSceneUpdate);

      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [isMobileCards]);

  useEffect(() => {
    const section = newsRevealRef.current;

    if (!section) return undefined;

    const panels = [...section.querySelectorAll(".main_news_panel")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = null;

    const updateNewsReveal = () => {
      frameId = null;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const scrollRange = Math.max(1, rect.height - viewportHeight);
      const sectionProgress = clamp(-rect.top / scrollRange);
      const ranges = [
        [0.06, 0.28],
        [0.37, 0.59],
        [0.68, 0.9],
      ];

      panels.forEach((panel, index) => {
        if (panel.classList.contains("main_news_panel_1")) return;

        const [start, end] = ranges[index];
        const revealProgress = reducedMotion.matches
          ? sectionProgress >= start ? 1 : 0
          : easeOutCubic(getRangeProgress(sectionProgress, start, end));
        const topInset = (1 - revealProgress) * 100;

        panel.style.clipPath = `inset(${topInset}% 0% 0% 0%)`;
      });

    };

    const requestNewsUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateNewsReveal);
    };

    updateNewsReveal();
    window.addEventListener("scroll", requestNewsUpdate, { passive: true });
    window.addEventListener("resize", requestNewsUpdate);
    window.visualViewport?.addEventListener("resize", requestNewsUpdate);
    reducedMotion.addEventListener("change", requestNewsUpdate);

    return () => {
      window.removeEventListener("scroll", requestNewsUpdate);
      window.removeEventListener("resize", requestNewsUpdate);
      window.visualViewport?.removeEventListener("resize", requestNewsUpdate);
      reducedMotion.removeEventListener("change", requestNewsUpdate);

      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [mainNews.length]);

  return (
    <main className="page_main">
      <section className="main_story" ref={sceneRef}>
        <div className="main_story_stage">
          {MAIN_STORIES.map((story, index) => (
            <MainStoryPanel story={story} index={index} isMobile={isMobileCards} key={story.background} />
          ))}
        </div>
      </section>

      <section className="main_news_reveal" ref={newsRevealRef}>
        <div className="main_news_stage">
          <div className="main_news_background" aria-hidden="true">
            <img className="pc" src="/img/main_2_bg.jpg" alt="" />
            <img className="mob" src="/img/main_2_bg_mob.jpg" alt="" />
          </div>

          <div className="main_news_panels">
            {mainNews.map((news, index) => (
              <article className={`main_news_panel main_news_panel_${index + 1}`} key={`main-news-${index}`}>
                <div className="main_news_thumbnail">
                  <img src={news.image} alt="id NEWS" />
                </div>

                <div className="main_news_content">
                  <time className="caption-m" dateTime={news.dateTime}>{news.date}</time>
                  <h2 className="display-xs fw-r gt_all">id NEWS</h2>
                  <p className="head-s fw-sb">{news.title}</p>
                  <TransitionLink className="main_news_more" to={news.url}>
                    <span className="body-s fw-b">VIEW MORE</span>
                    <img src="/img/arrow_right_l.svg"/>
                  </TransitionLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="main_collection">
        <div className="inner">
          <img className="bg pc" src="/img/main_3_bg.jpg"/>
          <img className="bg mob" src="/img/main_3_bg_mob.jpg"/>
          <TransitionLink
            className="posting"
            to="/en/magazine/id-gallery"
          >
            <img src={collectionPosting.image} alt={collectionPosting.title}/>
          </TransitionLink>
          <h1 className="txt-ac display-l apprael title_txt fw-l">2026 S/S<br/>COLLECTION</h1>
        </div>
        

      </section>
      <section className="main_collection_fake">
            
      </section>
    </main>
  );
}

export default Main;
