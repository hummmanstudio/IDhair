import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { animatePlayRect, resizePlayViewer } from "../../lib/playViewerMotion";
import TransitionLink from "../../components/TransitionLink";
import {
  fetchGalleryPosts,
  fetchMagazinePosts,
  fetchPlayPosts,
  formatGalleryDate,
  formatNewsDate,
  getNewsImageUrl,
} from "../../lib/sanityNewsEn";
import { eventItems, familyItems, galleryItems, magazinePageSettings, makeMagazineItems, playItems } from "./magazineConfig";

const NEWS_CATEGORY = "id-news";
const EVENT_CATEGORY = "id-event";
const FAMILY_CATEGORY = "id-family";
const GALLERY_CATEGORY = "id-gallery";
const PLAY_CATEGORY = "id-play";

const tabs = [
  { name: "Our PICKS", path: "our-picks" },
  { name: "id EVENT", path: "id-event" },
  { name: "id FAMILY", path: "id-family" },
  { name: "id NEWS", path: "id-news" },
  { name: "id GALLERY", path: "id-gallery" },
  { name: "id PLAY", path: "id-play" },
];

const newsTitles = [
  "새로운 브랜드 캠페인을 통해 선보이는 아이디헤어의 방향성과 감각",
  "강남지점 리뉴얼로 완성된 편안하고 세련된 공간",
  "아카데미 신규 교육 프로그램으로 강화된 전문 커리큘럼",
  "고객 경험 강화를 위한 서비스 전반의 리뉴얼",
  "브랜드 비주얼 아이덴티티 정비를 통한 일관된 이미지 구축",
];

const NEWS_ITEMS = makeMagazineItems(
  NEWS_CATEGORY,
  "id NEWS layout",
  magazinePageSettings[NEWS_CATEGORY].totalItems
).slice(0, 5).map((item, index) => ({
  ...item,
  title: newsTitles[index],
}));

const EVENT_ITEMS = eventItems(
  EVENT_CATEGORY,
  "id EVENT layout",
  magazinePageSettings[EVENT_CATEGORY].totalItems
).slice(0, 4);

const FAMILY_ITEMS = familyItems(
  FAMILY_CATEGORY,
  "id FAMILY layout",
  magazinePageSettings[FAMILY_CATEGORY].totalItems
).slice(0, 2);

const GALLERY_ITEMS = galleryItems(
  GALLERY_CATEGORY,
  "id GALLERY layout",
  magazinePageSettings[GALLERY_CATEGORY].totalItems
);

const PLAY_ITEMS = playItems(
  PLAY_CATEGORY,
  "id PLAY layout",
  magazinePageSettings[PLAY_CATEGORY].totalItems
).slice(0, 10);

const getPlayTypeClass = (item, index = 0) => {
  if (item?.displayType === "type-a" || item?.displayType === "type-b") {
    return item.displayType;
  }

  return index % 2 === 0 ? "type-a" : "type-b";
};

const getPlayAspect = (item, index = 0) => {
  return getPlayTypeClass(item, index) === "type-a" ? "9 / 16" : "16 / 9";
};

const getPlayViewerCursorClass = (index, activeIndex) => {
  if (index === activeIndex - 1) return "cursor_left";
  if (index === activeIndex + 1) return "cursor_right";

  return "";
};

const getYoutubeId = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (host.endsWith("youtube.com")) {
      if (parsedUrl.pathname.startsWith("/shorts/") || parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/").filter(Boolean)[1] || "";
      }

      return parsedUrl.searchParams.get("v") || "";
    }
  } catch {
    return "";
  }

  return "";
};

const getYoutubeEmbedUrl = (url) => {
  const id = getYoutubeId(url);

  if (!id) return "";

  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&autohide=1&playsinline=1&loop=1&playlist=${id}&controls=1&rel=0&modestbranding=1&disablekb=0&fs=0&iv_load_policy=3&cc_load_policy=0`;
};

const getPlayVideoUrl = (item) => item?.youtubeUrl || item?.videoUrl || item?.url || "";

const mapPlayMedia = (post, media, mediaIndex) => {
  const youtubeUrl = getPlayVideoUrl(media);
  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);
  const displayType = media.displayType || getPlayTypeClass(null, mediaIndex);

  if (embedUrl) {
    const thumbnailUrl = getNewsImageUrl(media.thumbnail, 1600);

    if (!thumbnailUrl) return null;

    return {
      id: `${post._id}-${media._key || mediaIndex}`,
      parentId: post._id,
      category: PLAY_CATEGORY,
      date: formatNewsDate(post.publishedAt),
      title: media.title || post.title || "id PLAY",
      displayType,
      mediaType: "youtube",
      img: thumbnailUrl,
      youtubeUrl,
      embedUrl,
    };
  }

  const imageUrl = getNewsImageUrl(media, 1600);

  if (!imageUrl) return null;

  return {
    id: `${post._id}-${media._key || mediaIndex}`,
    parentId: post._id,
    category: PLAY_CATEGORY,
    date: formatNewsDate(post.publishedAt),
    title: post.title || "id PLAY",
    displayType,
    mediaType: "image",
    img: imageUrl,
  };
};

const renderPlayMedia = (item, alt = "Magazine Image", shouldPlay = false) => (
  <>
    <img className="play_media" src={item.img} alt={alt} loading="lazy" decoding="async" />
    {item.mediaType === "youtube" && shouldPlay && (
      <iframe
        className="play_media play_media_youtube"
        src={item.embedUrl}
        title={item.title || "YouTube video"}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      ></iframe>
    )}
  </>
);

const getListUrl = (category, page = 1) => {
  return page === 1 ? `/en/magazine/${category}` : `/en/magazine/${category}/list-${page}`;
};

const ZOOM_IN_DURATION = 1.2;
const ZOOM_OUT_DURATION = 1.2;
const PLAY_ZOOM_DURATION = 1.05;

const mapMagazinePost = (post, category) => ({
  id: post._id,
  category,
  date: formatNewsDate(post.publishedAt),
  title: post.title,
  img: getNewsImageUrl(post.thumbnail, 1280),
});

const mapGalleryPost = (post) => {
  const galleryImages = post.images?.length ? post.images : [];
  const coverImage = post.thumbnail || galleryImages[0];
  const date = formatGalleryDate(post.publishedAt);

  return {
    id: post._id,
    category: GALLERY_CATEGORY,
    date,
    title: post.title,
    content: post.content,
    img: getNewsImageUrl(coverImage, 1280),
    images: galleryImages.map((image, imageIndex) => ({
      id: `${post._id}-${image._key || imageIndex}`,
      parentId: post._id,
      category: GALLERY_CATEGORY,
      date,
      title: post.title,
      img: getNewsImageUrl(image, 1280),
    })),
  };
};

const mapPlayPost = (post) => {
  const mediaItems = (post.images || [])
    .map((media, mediaIndex) => mapPlayMedia(post, media, mediaIndex))
    .filter(Boolean);
  const thumbnail = mediaItems[0];

  if (!thumbnail) return null;

  return {
    id: post._id,
    category: PLAY_CATEGORY,
    date: formatNewsDate(post.publishedAt),
    title: post.title || "id PLAY",
    displayType: thumbnail.displayType,
    img: thumbnail.img,
    mediaType: thumbnail.mediaType,
    embedUrl: thumbnail.embedUrl,
    youtubeUrl: thumbnail.youtubeUrl,
    images: mediaItems,
  };
};

const getViewerImageTarget = () => {
  const isMobile = window.innerWidth <= 1024;
  const width = isMobile ? window.innerWidth * 0.76 : Math.min(window.innerWidth * 0.375, 620);
  const height = isMobile ? window.innerHeight * 0.6 : Math.min(window.innerHeight * 0.78, 720);
  const centerX = isMobile
    ? window.innerWidth * 0.5
    : window.innerWidth * 0.326 + (window.innerWidth - window.innerWidth * 0.326 - window.innerWidth * 0.109) / 2;
  const centerY = window.innerHeight * 0.5;

  return { width, height, centerX, centerY };
};

const getViewerImageStackTarget = (stackElement) => {
  if (!stackElement) return getViewerImageTarget();

  const rect = stackElement.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    left: rect.left,
    top: rect.top,
  };
};

function OurPicks() {
  const [newsItems, setNewsItems] = useState(NEWS_ITEMS);
  const [eventItemsList, setEventItemsList] = useState(EVENT_ITEMS);
  const [familyItemsList, setFamilyItemsList] = useState(FAMILY_ITEMS);
  const [galleryItemsList, setGalleryItemsList] = useState(GALLERY_ITEMS.slice(0, 3));
  const [playItemsList, setPlayItemsList] = useState(PLAY_ITEMS);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isGalleryViewerOpen, setIsGalleryViewerOpen] = useState(false);
  const [galleryViewerStartIndex, setGalleryViewerStartIndex] = useState(0);
  const [galleryViewerCurrentIndex, setGalleryViewerCurrentIndex] = useState(0);
  const [activeGalleryViewerItems, setActiveGalleryViewerItems] = useState([]);
  const [playViewerOpen, setPlayViewerOpen] = useState(false);
  const [playViewerReady, setPlayViewerReady] = useState(false);
  const [activePlayIndex, setActivePlayIndex] = useState(0);
  const [activePlayAspect, setActivePlayAspect] = useState(getPlayAspect(null, 0));
  const [activePlayViewerItems, setActivePlayViewerItems] = useState([]);
  const previewRefs = useRef([]);
  const gallerySectionRef = useRef(null);
  const stickyWrapRef = useRef(null);
  const galleryZoomedItemRef = useRef(null);
  const galleryZoomTimelineRef = useRef(null);
  const galleryTransitionCloneRef = useRef(null);
  const galleryViewerScrollRef = useRef(null);
  const galleryViewerContentRef = useRef(null);
  const galleryViewerImageStackRef = useRef(null);
  const galleryViewerLayerRefs = useRef([]);
  const galleryViewerThumbRefs = useRef([]);
  const galleryViewerThumbsWrapRef = useRef(null);
  const galleryViewerThumbsRef = useRef(null);
  const galleryViewerFrameRef = useRef(null);
  const galleryViewerTitleRef = useRef(null);
  const galleryViewerLenisRef = useRef(null);
  const galleryBackdropTimerRef = useRef(null);
  const galleryControlsTimerRef = useRef(null);
  const playViewerFrameRef = useRef(null);
  const playCloneRef = useRef(null);
  const activePlaySourceImageRef = useRef(null);
  const playItemRefs = useRef([]);
  const playViewerSlideRefs = useRef([]);
  const playTimelineRef = useRef(null);
  const playViewerSwiperRef = useRef(null);
  const galleryViewerItems = activeGalleryViewerItems;
  const galleryViewerItem = galleryViewerItems[galleryViewerCurrentIndex] || galleryViewerItems[0];
  const shouldRenderGalleryViewer = isGalleryViewerOpen || activeGalleryViewerItems.length > 0;
  const playViewerItems = activePlayViewerItems;
  const shouldRenderPlayViewer = playViewerOpen || playViewerItems.length > 0;

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchMagazinePosts(NEWS_CATEGORY),
      fetchMagazinePosts(EVENT_CATEGORY),
      fetchMagazinePosts(FAMILY_CATEGORY),
      fetchGalleryPosts(),
      fetchPlayPosts(),
    ])
      .then(([newsPosts, eventPosts, familyPosts, galleryPosts, playPosts]) => {
        if (!isMounted) return;

        setNewsItems(newsPosts.slice(0, 5).map((post) => mapMagazinePost(post, NEWS_CATEGORY)));
        setEventItemsList(eventPosts.slice(0, 4).map((post) => mapMagazinePost(post, EVENT_CATEGORY)));
        setFamilyItemsList(familyPosts.slice(0, 2).map((post) => mapMagazinePost(post, FAMILY_CATEGORY)));
        setGalleryItemsList(galleryPosts.slice(0, 3).map(mapGalleryPost));
        setPlayItemsList(playPosts.slice(0, 10).map(mapPlayPost).filter(Boolean));
      })
      .catch((error) => {
        console.error("Failed to load Sanity our picks", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNewsEnter = (index) => {
    if (index === activeNewsIndex) return;

    setActiveNewsIndex(index);
  };

  const getOurPicksGalleryDomItems = () => {
    return [...document.querySelectorAll(".ourpicks_gallery_card.mg_li")];
  };

  const removeGalleryTransitionClone = () => {
    galleryTransitionCloneRef.current?.remove();
    galleryTransitionCloneRef.current = null;
  };

  const clearGalleryBackdropTimer = () => {
    if (!galleryBackdropTimerRef.current) return;
    window.clearTimeout(galleryBackdropTimerRef.current);
    galleryBackdropTimerRef.current = null;
  };

  const clearGalleryControlsTimer = () => {
    if (!galleryControlsTimerRef.current) return;
    window.clearTimeout(galleryControlsTimerRef.current);
    galleryControlsTimerRef.current = null;
  };

  const hideGalleryBackdrop = () => {
    clearGalleryBackdropTimer();
    document.body.classList.remove("gallery-backdrop-active");
  };

  const hideGalleryControls = () => {
    clearGalleryControlsTimer();
    document.body.classList.remove("gallery-controls-active");
  };

  const showGallerySourceImage = () => {
    const sourceImage = galleryZoomedItemRef.current?.querySelector("img");
    if (sourceImage) {
      gsap.set(sourceImage, { clearProps: "visibility" });
    }
  };

  const clearGalleryZoom = () => {
    const items = getOurPicksGalleryDomItems();
    const images = items.map((item) => item.querySelector("img")).filter(Boolean);

    galleryZoomTimelineRef.current?.kill();
    removeGalleryTransitionClone();
    hideGalleryBackdrop();
    hideGalleryControls();
    showGallerySourceImage();
    galleryZoomedItemRef.current?.classList.remove("is_zoomed");
    galleryZoomedItemRef.current = null;
    setActiveGalleryViewerItems([]);
    setIsGalleryViewerOpen(false);
    document.body.classList.remove("gallery-zooming", "gallery-scroll-locked", "gallery-viewer-open");
    document.documentElement.style.removeProperty("--gallery-viewer-image-width");
    document.documentElement.style.removeProperty("--gallery-viewer-image-height");
    window.lenis?.start?.();
    gsap.set([...items, ...images], { clearProps: "opacity,scale,scaleX,scaleY,x,y,zIndex,willChange" });
  };

  const resetGalleryZoom = () => {
    const items = getOurPicksGalleryDomItems();
    const images = items.map((item) => item.querySelector("img")).filter(Boolean);
    const currentItem = galleryZoomedItemRef.current;
    const currentImage = currentItem?.querySelector("img");

    galleryZoomTimelineRef.current?.kill();
    removeGalleryTransitionClone();
    hideGalleryBackdrop();
    hideGalleryControls();
    galleryZoomedItemRef.current?.classList.remove("is_zoomed");
    galleryZoomedItemRef.current = null;
    setIsGalleryViewerOpen(false);
    document.body.classList.remove("gallery-viewer-open");
    setActiveGalleryViewerItems([]);

    if (currentImage) {
      const viewerTarget = getViewerImageStackTarget(galleryViewerImageStackRef.current);
      const rect = currentImage.getBoundingClientRect();
      const clone = currentImage.cloneNode(true);
      const startLeft = viewerTarget.left ?? viewerTarget.centerX - viewerTarget.width / 2;
      const startTop = viewerTarget.top ?? viewerTarget.centerY - viewerTarget.height / 2;

      galleryTransitionCloneRef.current = clone;
      clone.className = "gallery_transition_clone";
      document.body.appendChild(clone);

      gsap.set(clone, {
        left: startLeft,
        top: startTop,
        width: viewerTarget.width,
        height: viewerTarget.height,
        visibility: "visible",
      });

      galleryZoomTimelineRef.current = gsap.timeline({
        defaults: { duration: ZOOM_OUT_DURATION, ease: "expo.inOut" },
        onComplete: () => {
          gsap.set(currentImage, { clearProps: "visibility" });
          removeGalleryTransitionClone();
          document.body.classList.remove("gallery-zooming", "gallery-scroll-locked", "gallery-viewer-open");
          document.documentElement.style.removeProperty("--gallery-viewer-image-width");
          document.documentElement.style.removeProperty("--gallery-viewer-image-height");
          window.lenis?.start?.();
          gsap.set([...items, ...images], { clearProps: "opacity,scale,scaleX,scaleY,x,y,zIndex,willChange" });
        },
      });

      galleryZoomTimelineRef.current
        .to(clone, { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, 0)
        .to(items, { opacity: 1, scale: 1 }, 0);
    }
  };

  const openGalleryViewer = (event, index) => {
    const item = event.currentTarget.closest(".mg_li");
    const image = item?.querySelector("img");
    if (!item || !image) return;

    if (galleryZoomedItemRef.current === item) {
      resetGalleryZoom();
      return;
    }

    if (galleryZoomedItemRef.current) {
      clearGalleryZoom();
    }

    const initialViewerTarget = getViewerImageStackTarget(galleryViewerImageStackRef.current);
    document.documentElement.style.setProperty("--gallery-viewer-image-width", `${initialViewerTarget.width}px`);
    document.documentElement.style.setProperty("--gallery-viewer-image-height", `${initialViewerTarget.height}px`);

    document.body.classList.add("gallery-zooming", "gallery-scroll-locked");
    clearGalleryBackdropTimer();
    galleryBackdropTimerRef.current = window.setTimeout(() => {
      document.body.classList.add("gallery-backdrop-active");
      galleryBackdropTimerRef.current = null;
    }, 500);
    window.lenis?.stop?.();

    const rect = image.getBoundingClientRect();
    const clone = image.cloneNode(true);
    const galleryItems = getOurPicksGalleryDomItems();
    const otherItems = galleryItems.filter((li) => li !== item);

    removeGalleryTransitionClone();
    galleryTransitionCloneRef.current = clone;
    clone.className = "gallery_transition_clone";
    document.body.appendChild(clone);

    gsap.set(clone, { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    gsap.set(image, { visibility: "hidden" });

    gsap.killTweensOf([item, image, otherItems, clone]);
    galleryZoomTimelineRef.current?.kill();
    galleryZoomedItemRef.current = item;
    item.classList.add("is_zoomed");
    const selectedViewerItems = galleryItemsList[index]?.images?.length ? galleryItemsList[index].images : [galleryItemsList[index]].filter(Boolean);

    setActiveGalleryViewerItems(selectedViewerItems);
    setGalleryViewerStartIndex(0);
    setGalleryViewerCurrentIndex(0);
    setIsGalleryViewerOpen(false);

    requestAnimationFrame(() => {
      const viewerTarget = getViewerImageStackTarget(galleryViewerImageStackRef.current);
      const targetLeft = viewerTarget.left ?? viewerTarget.centerX - viewerTarget.width / 2;
      const targetTop = viewerTarget.top ?? viewerTarget.centerY - viewerTarget.height / 2;

      galleryZoomTimelineRef.current = gsap.timeline({
        defaults: { duration: ZOOM_IN_DURATION, ease: "expo.inOut" },
        onComplete: () => {
          document.body.classList.add("gallery-viewer-open");
          setIsGalleryViewerOpen(true);
          clearGalleryControlsTimer();
          galleryControlsTimerRef.current = window.setTimeout(() => {
            document.body.classList.add("gallery-controls-active");
            galleryControlsTimerRef.current = null;
          }, 120);
          window.setTimeout(removeGalleryTransitionClone, 80);
        },
      });

      galleryZoomTimelineRef.current
        .set(otherItems, { willChange: "transform, opacity" }, 0)
        .to(clone, { left: targetLeft, top: targetTop, width: viewerTarget.width, height: viewerTarget.height }, 0)
        .to(otherItems, { opacity: 0, scale: 0.8, stagger: { amount: 0.2, from: "center" } }, 0);
    });
  };

  const closeGalleryViewer = () => {
    setIsGalleryViewerOpen(false);
    document.body.classList.remove("gallery-viewer-open");
    hideGalleryBackdrop();
    hideGalleryControls();
    resetGalleryZoom();
  };

  const handleGalleryViewerThumbClick = (index) => {
    galleryViewerLenisRef.current?.scrollTo(index * window.innerHeight, { duration: 1, force: true });
  };

  const updateGalleryViewerClipPath = (scrollValue) => {
    const scroller = galleryViewerScrollRef.current;
    if (!scroller || galleryViewerItems.length === 0) return;

    const currentScroll = typeof scrollValue === "number" ? scrollValue : scroller.scrollTop;
    const progress = currentScroll / Math.max(window.innerHeight, 1);
    const clampedProgress = Math.min(galleryViewerItems.length - 1, Math.max(0, progress));
    const nextIndex = Math.min(galleryViewerItems.length - 1, Math.max(0, Math.round(progress)));
    let clippingIndex = nextIndex;

    galleryViewerLayerRefs.current.forEach((layer, index) => {
      if (!layer) return;
      if (index === 0) {
        layer.style.clipPath = "inset(0% 0% 0% 0%)";
        return;
      }
      const revealProgress = Math.min(1, Math.max(0, progress - (index - 1)));
      if (revealProgress > 0 && revealProgress < 1) clippingIndex = index;
      layer.style.clipPath = `inset(${(1 - revealProgress) * 100}% 0% 0% 0%)`;
    });

    setGalleryViewerCurrentIndex(clippingIndex);

    const thumbs = galleryViewerThumbsRef.current;
    const thumbsWrap = galleryViewerThumbsWrapRef.current;
    const currentThumb = galleryViewerThumbRefs.current[clippingIndex];
    if (thumbs && thumbsWrap && currentThumb) {
      const isMobileThumbs = window.innerWidth <= 1024;
      const fromIndex = Math.floor(clampedProgress);
      const toIndex = Math.min(galleryViewerItems.length - 1, fromIndex + 1);
      const progressBetweenThumbs = clampedProgress - fromIndex;
      const fromThumb = galleryViewerThumbRefs.current[fromIndex] || currentThumb;
      const toThumb = galleryViewerThumbRefs.current[toIndex] || fromThumb;
      const fromCenter = isMobileThumbs
        ? fromThumb.offsetLeft + fromThumb.offsetWidth / 2
        : fromThumb.offsetTop + fromThumb.offsetHeight / 2;
      const toCenter = isMobileThumbs
        ? toThumb.offsetLeft + toThumb.offsetWidth / 2
        : toThumb.offsetTop + toThumb.offsetHeight / 2;
      const thumbCenter = fromCenter + (toCenter - fromCenter) * progressBetweenThumbs;
      const target = isMobileThumbs ? thumbsWrap.clientWidth / 2 - thumbCenter : thumbsWrap.clientHeight / 2 - thumbCenter;
      gsap.to(thumbs, { x: isMobileThumbs ? target : 0, y: isMobileThumbs ? 0 : target, duration: 0, overwrite: true });
    }
  };

  const handleGalleryViewerScroll = () => {
    if (galleryViewerFrameRef.current) return;
    galleryViewerFrameRef.current = requestAnimationFrame(() => {
      galleryViewerFrameRef.current = null;
      updateGalleryViewerClipPath();
    });
  };

  const removePlayClone = () => {
    playCloneRef.current?.remove();
    playCloneRef.current = null;
  };

  const showPlaySourceImage = () => {
    if (activePlaySourceImageRef.current) {
      gsap.set(activePlaySourceImageRef.current, { clearProps: "visibility" });
    }
  };

  const openPlayViewer = (event, index) => {
    const sourceMedia = event.currentTarget.querySelector(".play_media");
    if (!sourceMedia) return;

    const sourceRect = sourceMedia.getBoundingClientRect();
    const clone = sourceMedia.cloneNode(true);

    playTimelineRef.current?.kill();
    removePlayClone();
    showPlaySourceImage();

    clone.className = "play_transition_clone";
    document.body.appendChild(clone);
    playCloneRef.current = clone;
    activePlaySourceImageRef.current = sourceMedia;

    gsap.set(clone, {
      left: sourceRect.left,
      top: sourceRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
    });
    gsap.set(sourceMedia, { visibility: "hidden" });

    document.body.classList.add("play-viewer-locked", "play-viewer-zooming", "play-viewer-animating");
    window.lenis?.stop?.();
    flushSync(() => {
      const selectedViewerItems = playItemsList[index]?.images?.length ? playItemsList[index].images : [playItemsList[index]].filter(Boolean);

      setActivePlayViewerItems(selectedViewerItems);
      setActivePlayIndex(0);
      setActivePlayAspect(getPlayAspect(selectedViewerItems[0], 0));
      setPlayViewerReady(false);
      setPlayViewerOpen(true);
    });
    playViewerSwiperRef.current?.update();
    playViewerSwiperRef.current?.slideTo(0, 0, false);

    requestAnimationFrame(() => {
      playViewerSwiperRef.current?.update();
      playViewerSwiperRef.current?.slideTo(0, 0, false);
      requestAnimationFrame(() => {
        playViewerSwiperRef.current?.update();
        playViewerSwiperRef.current?.slideTo(0, 0, false);
        requestAnimationFrame(() => {
          if (!playViewerFrameRef.current) return;

          playTimelineRef.current = gsap.timeline({
            defaults: { duration: PLAY_ZOOM_DURATION, ease: "expo.inOut" },
            onComplete: () => {
              document.body.classList.remove("play-viewer-zooming", "play-viewer-animating");
              setPlayViewerReady(true);
              window.setTimeout(removePlayClone, 80);
            },
          });

          animatePlayRect(playTimelineRef.current, clone, sourceRect, () => playViewerFrameRef.current);
        });
      });
    });
  };

  const closePlayViewer = () => {
    const target = playViewerFrameRef.current;
    const originalSourceImage = activePlaySourceImageRef.current;
    const sourceImage = originalSourceImage;

    if (!sourceImage || !target) {
      showPlaySourceImage();
      setActivePlayViewerItems([]);
      setPlayViewerOpen(false);
      setPlayViewerReady(false);
      document.body.classList.remove("play-viewer-locked", "play-viewer-zooming", "play-viewer-animating");
      window.lenis?.start?.();
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const activeItem = playViewerItems[activePlayIndex];
    const clone = activeItem ? document.createElement("img") : null;
    if (!clone) return;

    playTimelineRef.current?.kill();
    removePlayClone();

    clone.src = activeItem.img;
    clone.alt = "";
    clone.className = "play_transition_clone";
    document.body.appendChild(clone);
    playCloneRef.current = clone;

    if (originalSourceImage && originalSourceImage !== sourceImage) {
      gsap.set(originalSourceImage, { clearProps: "visibility" });
    }

    gsap.set(sourceImage, { visibility: "hidden" });
    gsap.set(clone, { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height });

    setPlayViewerOpen(false);
    setPlayViewerReady(false);
    document.body.classList.add("play-viewer-zooming");

    playTimelineRef.current = gsap.timeline({
      defaults: { duration: PLAY_ZOOM_DURATION, ease: "expo.inOut" },
      onComplete: () => {
        gsap.set(sourceImage, { clearProps: "visibility" });
        activePlaySourceImageRef.current = null;
        setActivePlayViewerItems([]);
        removePlayClone();
        document.body.classList.remove("play-viewer-locked", "play-viewer-zooming", "play-viewer-animating");
        window.lenis?.start?.();
      },
    });

    animatePlayRect(playTimelineRef.current, clone, targetRect, () => sourceImage);
  };

  useEffect(() => {
    const previews = previewRefs.current.filter(Boolean);

    if (!previews.length) return undefined;

    previews.forEach((preview, index) => {
      gsap.to(preview, {
        clipPath: index <= activeNewsIndex ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
        opacity: 1,
        duration: 0.72,
        ease: "expo.inOut",
        overwrite: "auto",
      });
    });

    return () => {
      gsap.killTweensOf(previews);
    };
  }, [activeNewsIndex]);

  useEffect(() => {
    const gallerySection = gallerySectionRef.current;
    if (!gallerySection) return undefined;

    const updateGalleryBackground = () => {
      const triggerPoint = gallerySection.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.42;
      document.body.classList.toggle("ourpicks-gallery-active", window.scrollY >= triggerPoint);
    };

    updateGalleryBackground();
    window.addEventListener("scroll", updateGalleryBackground);
    window.addEventListener("resize", updateGalleryBackground);

    return () => {
      window.removeEventListener("scroll", updateGalleryBackground);
      window.removeEventListener("resize", updateGalleryBackground);
      document.body.classList.remove("ourpicks-gallery-active");
    };
  }, []);

  useEffect(() => {
    if (!isGalleryViewerOpen) return undefined;

    const scroller = galleryViewerScrollRef.current;
    const content = galleryViewerContentRef.current;
    if (!scroller || !content) return undefined;

    let isCancelled = false;
    galleryViewerLenisRef.current?.destroy();

    import("lenis").then(({ default: Lenis }) => {
      if (isCancelled) return;

      const viewerLenis = new Lenis({
        wrapper: scroller,
        content,
        eventsTarget: scroller,
        autoRaf: true,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
      });

      galleryViewerLenisRef.current = viewerLenis;
      viewerLenis.on("scroll", ({ scroll }) => {
        updateGalleryViewerClipPath(scroll);
      });

      const scrollTop = galleryViewerStartIndex * window.innerHeight;
      viewerLenis.scrollTo(scrollTop, { immediate: true, force: true });
      updateGalleryViewerClipPath(scrollTop);
    });

    return () => {
      isCancelled = true;
      galleryViewerLenisRef.current?.destroy();
      galleryViewerLenisRef.current = null;
    };
  }, [isGalleryViewerOpen, galleryViewerStartIndex, galleryViewerItems.length]);


  useEffect(() => {
    return () => {
      if (galleryViewerFrameRef.current) {
        cancelAnimationFrame(galleryViewerFrameRef.current);
      }
      galleryViewerLenisRef.current?.destroy();
      galleryZoomTimelineRef.current?.kill();
      playTimelineRef.current?.kill();
      removeGalleryTransitionClone();
      removePlayClone();
      hideGalleryBackdrop();
      hideGalleryControls();
      showPlaySourceImage();
      document.body.classList.remove(
        "gallery-zooming",
        "gallery-scroll-locked",
        "gallery-viewer-open",
        "play-viewer-locked",
        "play-viewer-zooming",
        "play-viewer-animating"
      );
      document.documentElement.style.removeProperty("--gallery-viewer-image-width");
      document.documentElement.style.removeProperty("--gallery-viewer-image-height");
      window.lenis?.start?.();
    };
  }, []);

  useEffect(() => {
    const section = stickyWrapRef.current;
    if (!section) return undefined;

    const updateSectionActive = () => {
      const currentScroll = window.scrollY;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + currentScroll;
      const sectionStart = sectionTop - window.innerHeight;
      const sectionEnd = sectionTop + section.offsetHeight - window.innerHeight;
      const isActive = currentScroll >= sectionStart;
      const isBottom = currentScroll > sectionEnd;

      //console.log("Current Scroll:", currentScroll, "Section Range:", sectionStart, sectionEnd, "Active:", isActive);
      section.classList.toggle("active", isActive);
      section.classList.toggle("bottom", isBottom);
    };

    updateSectionActive();
    window.addEventListener("scroll", updateSectionActive, { passive: true });
    window.addEventListener("resize", updateSectionActive);

    return () => {
      window.removeEventListener("scroll", updateSectionActive);
      window.removeEventListener("resize", updateSectionActive);
    };
  }, []);

  return (
    <div className="ourpicks_page ourpicks_page--en">
      <div ref={stickyWrapRef} className="sticky_w">
        <ul className="mg_nav b-t b-delay-4">
          {tabs.map((tab, i) => (
            <li key={tab.path} className={`${tab.path === "our-picks" ? "btn_all" : ""} fadeFake-${1 + i}`}>
              <TransitionLink
                to={getListUrl(tab.path)}
                state={{ fromMagazineTab: true }}
                className={`body-m ${tab.path === "our-picks" ? "active" : ""}`}
              >
                <span>{tab.name}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
      

      <section className="ourpicks_news ani ">
        <div className="ourpicks_section_head">
          <div className="ourpicks_section_title fadeX-1">
            <h2 className="display-xs gt ">id EVENT</h2>
            <p className="body-s txt-gray ">Discover id HAIR events and exclusive offers.</p>
          </div>
          <TransitionLink to="/en/magazine/id-event" className="ourpicks_view_all body-m fadeX-5">
            <span>VIEW ALL</span>
            <span aria-hidden="true"></span>
          </TransitionLink>
        </div>

        <ul className="mg_list mg_list_event ani  b-t b-2 b-delay-4">
          {eventItemsList.map((item) => (
            <li className="mg_li ani" key={item.id}>
              <TransitionLink to={`/en/magazine/${EVENT_CATEGORY}/post/${item.id}`} className="mg_a">
                <img src={item.img} alt="Magazine Image" loading="lazy" decoding="async" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="ourpicks_news ani">
        <div className="ourpicks_section_head">
          <div className="ourpicks_section_title fadeX-1">
            <h2 className="display-xs gt ">id FAMILY</h2>
            <p className="body-s txt-gray ">Real stories from the people behind id HAIR.</p>
          </div>
          <TransitionLink to="/en/magazine/id-family" className="ourpicks_view_all body-m fadeX-5">
            <span>VIEW ALL</span>
            <span aria-hidden="true"></span>
          </TransitionLink>
        </div>

        <ul className="mg_list mg_list_family ani b-t b-2 b-delay-4">
          {familyItemsList.map((item) => (
            <li className="mg_li ani" key={item.id}>
              <TransitionLink to={`/en/magazine/${FAMILY_CATEGORY}/post/${item.id}`} className="mg_a">
                <img src={item.img} alt="Magazine Image" loading="lazy" decoding="async" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="ourpicks_news ani">
        <div className="ourpicks_section_head">
          <div className="ourpicks_section_title fadeX-1">
            <h2 className="display-xs gt ">id NEWS</h2>
            <p className="body-s txt-gray ">The latest news and key stories from id HAIR.</p>
          </div>
          <TransitionLink to="/en/magazine/id-news" className="ourpicks_view_all body-m fadeX-5">
            <span>VIEW ALL</span>
            <span aria-hidden="true"></span>
          </TransitionLink>
        </div>

        <div className="ourpicks_news_body b-t b-2 b-delay-4">
          <div className="ourpicks_news_preview" aria-hidden="true">
            {newsItems.map((item, index) => (
              <img
                className={`ourpicks_news_preview_img ${activeNewsIndex === index ? "active" : ""}`}
                src={item.img}
                alt=""
                key={item.id}
                ref={(element) => {
                  previewRefs.current[index] = element;
                }}
              />
            ))}
          </div>

          <ul className="ourpicks_news_list b-l b-delay-6">
            {newsItems.map((item, index) => (
              <li
                className={`ourpicks_news_item fadeX-${1 + 3} ${activeNewsIndex === index ? "active" : ""}`}
                key={item.id}
                onMouseEnter={() => handleNewsEnter(index)}
                onFocus={() => handleNewsEnter(index)}
              >
                <TransitionLink to={`/en/magazine/${NEWS_CATEGORY}/post/${item.id}`} className="ourpicks_news_link">
                  <span className="date txt-gray caption-m">{item.date}</span>
                  <strong className="head-s">{item.title}</strong>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ourpicks_news ourpicks_gallery ani" ref={gallerySectionRef}>
        <div className="ourpicks_section_head">
          <div className="ourpicks_section_title fadeX-1">
            <h2 className="display-xs gt ">id GALLERY</h2>
            <p className="body-s txt-gray ">Seasonal hair trend lookbooks curated by id HAIR.</p>
          </div>
          <TransitionLink to="/en/magazine/id-gallery" className="ourpicks_view_all body-m fadeX-5">
            <span>VIEW ALL</span>
            <span aria-hidden="true"></span>
          </TransitionLink>
        </div>

        <div className="ourpicks_gallery_visual ani b-t b-2 b-delay-4 flex">
          <button
            type="button"
            onClick={(event) => openGalleryViewer(event, 0)}
            className="mg_li ourpicks_gallery_card flex_left ourpicks_gallery_card_main ani"
          >
            <img src={galleryItemsList[0]?.img} alt="Magazine Image" loading="lazy" decoding="async" />
          </button>

          <div className="flex_right b-l b-c-gray b-delay-10">
            <div className="ourpicks_gallery_title ani">
              <h3 className="display-s apprael apprael_all ani apprael_ani">
                <span>{galleryItemsList[0]?.date} </span><br/>
                <span>{galleryItemsList[0]?.title || "Collection"}</span>
              </h3>
              <p className="body-l fadeX-3">“ {galleryItemsList[0]?.content} “</p>
            </div>

            <div className="img_s_w">
              <button
                type="button"
                onClick={(event) => openGalleryViewer(event, 1)}
                className="mg_li ourpicks_gallery_card ourpicks_gallery_card_sub ani"
              >
                <img src={galleryItemsList[1]?.img} alt="Magazine Image" loading="lazy" decoding="async" />
                <span className="body-m fadeX-8">{galleryItemsList[1]?.date}<br />{galleryItemsList[1]?.title}</span>
              </button>

              <button
                type="button"
                onClick={(event) => openGalleryViewer(event, 2)}
                className="mg_li ourpicks_gallery_card ourpicks_gallery_card_side ani"
              >
                <span className="body-m fadeX-8">{galleryItemsList[2]?.date}<br />{galleryItemsList[2]?.title}</span>
                <img src={galleryItemsList[2]?.img} alt="Magazine Image" loading="lazy" decoding="async" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="ourpicks_news ourpicks_play ani">
        <div className="ourpicks_section_head ani b-b b-2 b-c-gray b-delay-4">
          <div className="ourpicks_section_title fadeX-1">
            <h2 className="display-xs gt ">id PLAY</h2>
            <p className="body-s txt-gray ">Experience the many moments of id HAIR through video.</p>
          </div>
          <TransitionLink to="/en/magazine/id-play" className="ourpicks_view_all body-m fadeX-5">
            <span>VIEW ALL</span>
            <span aria-hidden="true"></span>
          </TransitionLink>
        </div>

        <div className="ourpicks_play_slider ">
          <Swiper
            className="ourpicks_play_swiper"
            slidesPerView="auto"
            //spaceBetween={40}
            grabCursor
            /*breakpoints={{
              0: {
                spaceBetween: 16,
              },
              1025: {
                spaceBetween: 40,
              },
            }}*/
          >
            {playItemsList.map((item, index) => (
              <SwiperSlide className={`ourpicks_play_slide ${getPlayTypeClass(item, index)}`} key={item.id}>
                <button
                  type="button"
                  className="ourpicks_play_link"
                  onClick={(event) => openPlayViewer(event, index)}
                  ref={(element) => {
                    playItemRefs.current[index] = element;
                  }}
                >
                  {renderPlayMedia(item)}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {shouldRenderGalleryViewer && <div
        className={`gallery_viewer ${isGalleryViewerOpen ? "active" : ""}`}
        aria-hidden={!isGalleryViewerOpen}
        aria-modal="true"
        role="dialog"
      >
        <div
          className="gallery_viewer_scroll"
          ref={galleryViewerScrollRef}
          onScroll={handleGalleryViewerScroll}
        >
          <div
            className="gallery_viewer_space"
            ref={galleryViewerContentRef}
            style={{ height: `${Math.max(galleryViewerItems.length, 1) * 100}vh` }}
          >
            <div className="gallery_viewer_stage">
              <div className="gallery_viewer_left">
                <button type="button" className="gallery_viewer_close body-m" onClick={closeGalleryViewer}>
                  Close
                </button>
                <h2
                  className="gallery_viewer_title apprael display-s apprael_all apprael_ani"
                  data-id={galleryViewerItem?.id}
                  data-category={galleryViewerItem?.category}
                  key={activeGalleryViewerItems[0]?.parentId || activeGalleryViewerItems[0]?.id || "ourpicks-gallery-viewer-title"}
                  ref={galleryViewerTitleRef}
                >
                  {galleryViewerItem?.date} {galleryViewerItem?.title}
                </h2>
                <div className="gallery_viewer_hint body-m">
                  <span>Scroll</span>
                  <span aria-hidden="true">v</span>
                </div>
              </div>

              <div className="gallery_viewer_visual">
                <div className="gallery_viewer_count gallery_viewer_count_start body-m">
                  {String(galleryViewerCurrentIndex + 1).padStart(2, "0")}
                </div>
                <div className="gallery_viewer_image_stack" ref={galleryViewerImageStackRef}>
                  {galleryViewerItems.map((item, index) => (
                    <div
                      className="gallery_viewer_layer"
                      key={item.id}
                      ref={(element) => {
                        galleryViewerLayerRefs.current[index] = element;
                      }}
                      style={{ zIndex: index + 1 }}
                    >
                      <img src={item.img} alt="Magazine Image" />
                    </div>
                  ))}
                </div>
                <div className="gallery_viewer_count gallery_viewer_count_end body-m">
                  {String(galleryViewerItems.length).padStart(2, "0")}
                </div>
              </div>

              <div
                className="gallery_viewer_thumbs_wrap"
                ref={galleryViewerThumbsWrapRef}
                aria-label="Gallery thumbnails"
              >
                <div className="gallery_viewer_thumbs" ref={galleryViewerThumbsRef}>
                  {galleryViewerItems.map((item, index) => (
                    <button
                      type="button"
                      className={`gallery_viewer_thumb ${galleryViewerCurrentIndex === index ? "active" : ""}`}
                      key={item.id}
                      ref={(element) => {
                        galleryViewerThumbRefs.current[index] = element;
                      }}
                      onClick={() => handleGalleryViewerThumbClick(index)}
                    >
                      <img src={item.img} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {shouldRenderPlayViewer && <div className={`play_viewer id_play_viewer ${activePlayAspect === "9 / 16" ? "is_portrait" : "is_landscape"} ${playViewerOpen ? "active" : ""} ${playViewerReady ? "ready" : ""}`} aria-hidden={!playViewerOpen}>
        <button type="button" className="play_viewer_close" onClick={closePlayViewer} aria-label="Close">
          <span></span>
          <span></span>
        </button>
        <div className="play_viewer_bg" aria-hidden="true"></div>
        <div className="play_viewer_stage">
          <Swiper
            className="play_viewer_swiper"
            onResize={resizePlayViewer}
            slidesPerView="auto"
            centeredSlides
            direction={window.innerWidth < 1024 ? "vertical" : "horizontal"}
            initialSlide={0}
            speed={800}
            spaceBetween={0}
            breakpoints={{
              0: {
                direction: "vertical",
              },
              1024: {
                direction: "horizontal",
                spaceBetween: 0,
              },
            }}
            slideToClickedSlide
            onSwiper={(swiper) => {
              playViewerSwiperRef.current = swiper;
              swiper.slideTo(0, 0);
            }}
            onSlideChange={(swiper) => {
              setActivePlayIndex(swiper.activeIndex);
              setActivePlayAspect(getPlayAspect(playViewerItems[swiper.activeIndex], swiper.activeIndex));
            }}
          >
            {playViewerItems.map((item, index) => (
              <SwiperSlide
                className={`play_viewer_slide ${getPlayTypeClass(item, index)} ${getPlayViewerCursorClass(index, activePlayIndex)}`}
                key={item.id}
                ref={(element) => {
                  playViewerSlideRefs.current[index] = element;
                }}
              >
                <button type="button" className="play_viewer_slide_btn">
                  {renderPlayMedia(item, item.title, playViewerReady && index === activePlayIndex)}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
          <div
            className="play_viewer_frame"
            ref={playViewerFrameRef}
            aria-hidden="true"
            style={{ "--play-viewer-aspect": activePlayAspect }}
          ></div>
        </div>
      </div>}
      
    </div>
  );
}

export default OurPicks;
