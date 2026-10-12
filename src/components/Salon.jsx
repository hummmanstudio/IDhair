import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { fetchSalonRegions } from "../lib/sanitySalon";
import "../styles/Salon.scss";

const defaultSalonRegions = [
  { id: "seoul", name: "서울", stores: [] },
  { id: "gyeonggi", name: "경기", stores: [] },
  { id: "local", name: "지방", stores: [] },
  { id: "atelier", name: "아틀리에", stores: [] },
];

const emptyStore = {
  id: "",
  name: "",
  address: "",
  phone: "",
  hours: "",
  off: "",
  instagramUrl: "",
  reservationUrl: "",
  images: [],
};

const naverMapSearchKeyword = "id헤어";
const naverMapDefaultUrl = `https://map.naver.com/p/search/${encodeURIComponent(naverMapSearchKeyword)}`;

const salonCopy = {
  ko: {
    regions: { seoul: "서울", gyeonggi: "경기", local: "지방", atelier: "아틀리에" },
    search: "주소 or 지점명 검색",
    searchLabel: "매장 검색",
    close: "살롱 닫기",
    atelier: "아틀리에 매장 보기",
    nearby: "가까운 매장찾기",
    empty: "검색결과 없음",
    reservation: "네이버 예약",
    image: "이미지",
    previousImage: "이전 매장 이미지",
    nextImage: "다음 매장 이미지",
  },
  en: {
    regions: { seoul: "Seoul", gyeonggi: "Gyeonggi", local: "Other Regions", atelier: "Atelier" },
    search: "Search by address or salon name",
    searchLabel: "Search salon",
    close: "Close salon popup",
    atelier: "View Atelier salons",
    nearby: "Find a Nearby Salon",
    empty: "No salons found",
    reservation: "Book on Naver",
    image: "image",
    previousImage: "Previous salon image",
    nextImage: "Next salon image",
  },
};

function Salon({ open, onClose, language = "ko" }) {
  const copy = salonCopy[language] ?? salonCopy.ko;
  const [salonRegions, setSalonRegions] = useState(defaultSalonRegions);
  const [selectedRegionId, setSelectedRegionId] = useState(defaultSalonRegions[0].id);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const [detailStore, setDetailStore] = useState(emptyStore);
  const [isDetailVisible, setIsDetailVisible] = useState(true);
  const imageSwiperRef = useRef(null);
  const detailTimerRef = useRef(null);

  const flatStores = useMemo(
    () => salonRegions.flatMap((region) => region.stores),
    [salonRegions]
  );

  const selectedRegion = useMemo(
    () => salonRegions.find((region) => region.id === selectedRegionId) ?? salonRegions[0],
    [salonRegions, selectedRegionId]
  );

  const displayedStores = useMemo(() => {
    const query = submittedSearchQuery.trim().toLowerCase();

    if (!query) return selectedRegion?.stores ?? [];

    return flatStores.filter((store) => (
      store.name.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query)
    ));
  }, [flatStores, submittedSearchQuery, selectedRegion]);

  const selectedStore = useMemo(
    () => (
      displayedStores.find((store) => store.id === selectedStoreId) ??
      displayedStores[0] ??
      flatStores.find((store) => store.id === selectedStoreId) ??
      selectedRegion?.stores?.[0] ??
      emptyStore
    ),
    [displayedStores, flatStores, selectedRegion, selectedStoreId]
  );

  const detailImages = detailStore.images ?? [];
  const hasDetailImages = detailImages.length > 0;
  const hasDetailStore = Boolean(detailStore.id);

  const changeStoreDetail = (store) => {
    if (!store) return;

    if (detailTimerRef.current) {
      clearTimeout(detailTimerRef.current);
    }

    setSelectedStoreId(store.id);

    if (store.id === detailStore.id) {
      setIsDetailVisible(true);
      return;
    }

    setIsDetailVisible(false);
    detailTimerRef.current = setTimeout(() => {
      setDetailStore(store);
      requestAnimationFrame(() => {
        setIsDetailVisible(true);
      });
    }, 300);
  };

  const handleRegionClick = (region) => {
    setSearchQuery("");
    setSubmittedSearchQuery("");
    setSelectedRegionId(region.id);
    changeStoreDetail(region.stores[0] ?? emptyStore);
  };

  const handleAtelierClick = () => {
    const atelierRegion = salonRegions.find((region) => region.id === "atelier");

    if (atelierRegion) handleRegionClick(atelierRegion);
  };

  const handleSearchSubmit = () => {
    if (detailTimerRef.current) {
      clearTimeout(detailTimerRef.current);
    }

    const query = searchQuery.trim().toLowerCase();
    const matchingStores = query
      ? flatStores.filter((store) => (
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query)
        ))
      : selectedRegion.stores;

    setSubmittedSearchQuery(searchQuery);

    if (matchingStores.length === 0) {
      setSelectedStoreId("");
      setIsDetailVisible(false);
      detailTimerRef.current = setTimeout(() => {
        setDetailStore(emptyStore);
      }, 300);
      return;
    }

    changeStoreDetail(matchingStores[0]);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const hasSubmittedSearch = submittedSearchQuery.trim() !== "";

  const handlePrevImage = () => {
    imageSwiperRef.current?.slidePrev();
  };

  const handleNextImage = () => {
    imageSwiperRef.current?.slideNext();
  };

  useEffect(() => {
    let isMounted = true;

    fetchSalonRegions(language)
      .then((regions) => {
        if (!isMounted) return;

        setSalonRegions(regions);

        const firstRegionWithStore = regions.find((region) => region.id !== "atelier" && region.stores.length > 0);
        const firstStore = firstRegionWithStore?.stores[0] ?? emptyStore;

        setSelectedRegionId(firstRegionWithStore?.id ?? regions[0]?.id ?? defaultSalonRegions[0].id);
        setSelectedStoreId(firstStore.id);
        setDetailStore(firstStore);
      })
      .catch((error) => {
        console.error("Failed to load salon locations", error);
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  useEffect(() => (
    () => {
      if (detailTimerRef.current) {
        clearTimeout(detailTimerRef.current);
      }
    }
  ), []);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`salon_popup ${open ? "active" : ""}`} aria-hidden={!open} lang={language}>
      <button type="button" className="salon_close" onClick={onClose} aria-label={copy.close}>
        <span></span><span></span>
      </button>
      <div className="salon_popup_page" role="dialog" aria-modal="true" aria-label="Salon" data-lenis-prevent>
        <div className="head b-b b-2 b-c-white">
          <div className="apprael display-m b-r b-c-white head_left">SALON</div>
          <div className="head_right">
            <div className="search_w b-t b-c-white">
              <input
                className="head-m fw-sm"
                type="text"
                placeholder={copy.search}
                aria-label={copy.search}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button type="button" aria-label={copy.searchLabel} onClick={handleSearchSubmit}><img src="/img/icon_search.svg" alt="" /></button>
            </div>
          </div>
        </div>
        <div className="body">
          <div className="body_left">
            <div className="b_l_l">
              <ol className="head-m">
                {salonRegions.filter((region) => region.id !== "atelier").map((region) => (
                  <li key={region.id} className={!hasSubmittedSearch && region.id === selectedRegion.id ? "active" : ""}>
                    <button type="button" className="head-m" onClick={() => handleRegionClick(region)}>
                      {copy.regions[region.id] ?? region.name}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className={`arc_logo ${!hasSubmittedSearch && selectedRegion.id === "atelier" ? "active" : ""}`}
                onClick={handleAtelierClick}
                aria-label={copy.atelier}
                aria-pressed={!hasSubmittedSearch && selectedRegion.id === "atelier"}
              >
                <img src="/img/arc.png" alt="" />
              </button>
              <a className="find_store" href={naverMapDefaultUrl} target="_blank" rel="noreferrer"><img src="/img/icon_find.png" alt=""/><span className="fw-sb body-l">{copy.nearby}</span></a>
            </div>

            <div className="b_l_r head-s">
              <ul data-lenis-prevent>
                {displayedStores.map((store) => (
                  <li key={store.id} className={store.id === selectedStore.id ? "active" : ""}>
                    <button
                      type="button"
                      className="body-m"
                      onClick={() => {
                        changeStoreDetail(store);
                      }}
                    >
                      {store.name}
                    </button>
                  </li>
                ))}
                {displayedStores.length === 0 && (
                  <li className="empty body-m">{copy.empty}</li>
                )}
              </ul>
            </div>
          </div>
          <div className="body_right">
            <div className={`scroll-y ${hasDetailImages ? "" : "scroll-y_no_images"}`}>
              {hasDetailStore && hasDetailImages && (
                <div className={`store_images ${isDetailVisible ? "store_images_visible" : ""}`}>
                  <Swiper
                    key={detailStore.id}
                    className="img_w"
                    modules={[Autoplay]}
                    loop
                    speed={600}
                    slidesPerView={1}
                    autoplay={detailImages.length > 1 ? {
                      delay: 2000,
                      disableOnInteraction: true,
                    } : false}

                    onSwiper={(swiper) => {
                      imageSwiperRef.current = swiper;
                      swiper.slideToLoop(0, 0);
                    }}
                  >
                    {detailImages.map((image, index) => (
                      <SwiperSlide key={`${image}-${index}`}>
                        <img src={image} alt={`${detailStore.name} ${copy.image} ${index + 1}`} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <button type="button" className="cursor_left" onClick={handlePrevImage} aria-label={copy.previousImage}></button>
                  <button type="button" className="cursor_right" onClick={handleNextImage} aria-label={copy.nextImage}></button>
                </div>
              )}
              {hasDetailStore && (
                <div className={`store_detail store-detail-motion-3 ${isDetailVisible ? "store_detail_visible" : ""}`}>
                  <div className="store_info ">
                    <h2 className="head-m fw-sb ">{detailStore.name}</h2>
                    <address className="body-m ">{detailStore.address}</address>
                    <dl className="body-m ">
                      <div>
                        <dt>(T)&nbsp;&nbsp;&nbsp;&nbsp;</dt>
                        <dd>{detailStore.phone}</dd>
                      </div>
                      <div>
                        <dt>(Hours)&nbsp;&nbsp;&nbsp;&nbsp;</dt>
                        <dd>{detailStore.hours}</dd>
                      </div>
                      {detailStore.off?.trim() && (
                        <div>
                          <dt>(Off)&nbsp;&nbsp;&nbsp;&nbsp;</dt>
                          <dd>{detailStore.off}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="store_links ">
                    <a href={detailStore.instagramUrl} target="_blank" className="insta" rel="noreferrer" aria-label="Instagram">
                      <img src="/img/icon_instagram_w.svg" alt=""/>
                    </a>
                    <a href={detailStore.reservationUrl} target="_blank" rel="noreferrer" className="naver">
                      <img src="/img/icon_naver.svg" alt=""/>
                      <span className="body-m">{copy.reservation}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Salon;
