import { useEffect, useRef, useState } from "react";
import TransitionLink from "../components/TransitionLink";
import MainNotice from "../components/MainNotice";
import useEnglishMainScroll from "../lib/useEnglishMainScroll";
import useEnglishMainMotion from "../lib/useEnglishMainMotion";
import useMainIntroAnimation from "../lib/useMainIntroAnimation";
import { ENGLISH_MAIN_MOTION, ENGLISH_MAIN_INTRO, getEnglishNewsTimeline } from "../lib/englishMainMotion";
import {
  fetchGalleryPosts,
  fetchNewsPosts,
  formatNewsDate,
  getNewsImageUrl,
} from "../lib/sanityNewsEn";
import "../styles/main.scss";
import "../styles/main-en.scss";

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
  useEnglishMainScroll();
  const sceneRef = useRef(null);
  useMainIntroAnimation(sceneRef, ENGLISH_MAIN_INTRO);
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
  const newsTimeline = getEnglishNewsTimeline(mainNews.length);
  useEnglishMainMotion(sceneRef, newsRevealRef, isMobileCards, mainNews.length);

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

  return (
    <main className="page_main page_main--en" lang="en" style={{
      "--main-story-height": `${(isMobileCards ? ENGLISH_MAIN_MOTION.mobileStoryScreens : ENGLISH_MAIN_MOTION.storyScreens) * 100}svh`,
      "--main-news-height": `${newsTimeline.heightScreens * 100}svh`,
    }}>
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
