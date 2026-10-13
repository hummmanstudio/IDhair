import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import Splitting from "splitting";
import "splitting/dist/splitting.css";
import "splitting/dist/splitting-cells.css";
import OurPicks from "./magazine/OurPicks";
import IdNews from "./magazine/IdNews";
import IdEvent from "./magazine/IdEvent";
import IdFamily from "./magazine/IdFamily";
import IdGallery from "./magazine/IdGallery";
import IdPlay from "./magazine/IdPlay";
import { getItemsPerPage, getTotalPages, magazinePageSettings } from "./magazine/magazineConfig";
import { fetchMagazinePostCount, getPostTypeForCategory } from "../lib/sanityNewsEn";
import "../styles/magazine.scss";
import "../styles/ourpicks.scss";
import "../styles/ourpicks-en.scss";

function Magazine() {
  const tabs = [
    { name: "Our PICKS", path: "our-picks", description: ["Discover lifestyle stories through trends<br/>and brand news curated by id HAIR."] },
    { name: "id EVENT", path: "id-event", description: ["아이디헤어에서 진행하는 다양한 이벤트와 특별한 혜택을 만나볼 수 있는 공간"] },
    { name: "id FAMILY", path: "id-family", description: ["아이디헤어를 만들어가는 사람들의<br/>진솔한 이야기"] },
    { name: "id NEWS", path: "id-news", description: ["아이디헤어의 새로운 소식과<br/>주요 이야기를 전하는 뉴스 콘텐츠"] },
    { name: "id GALLERY", path: "id-gallery", description: ["아이디헤어가 제안하는<br/>시즌별 헤어 트렌드 룩북"] },
    { name: "id PLAY", path: "id-play", description: ["아이디헤어의 다채로운 순간을<br/>영상 콘텐츠로 만나는 id PLAY"] },
  ];

  const location = useLocation();
  const navigate = useNavigate();
  const { category, pageSlug } = useParams();

  const currentCategory = category || "our-picks";
  const isTabMove = location.state?.fromMagazineTab === true;
  const currentPage = Number(pageSlug?.replace("list-", "") || 1);
  const [sanityTotalPages, setSanityTotalPages] = useState({});
  const totalPages = sanityTotalPages[currentCategory] || getTotalPages(currentCategory);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const currentTab = tabs.find((tab) => tab.path === currentCategory) || tabs[0];
  const showPagination = currentCategory !== "id-play";
  const [isTitleTabOut, setIsTitleTabOut] = useState(false);
  const tabMoveTimerRef = useRef(null);

  const listComponents = {
    "our-picks": <OurPicks currentPage={currentPage} />,
    "id-event": <IdEvent currentPage={currentPage} />,
    "id-family": <IdFamily currentPage={currentPage} />,
    "id-news": <IdNews currentPage={currentPage} />,
    "id-gallery": <IdGallery currentPage={currentPage} />,
    "id-play": <IdPlay currentPage={currentPage} />,
  };

  const getListUrl = (category, page = 1) => {
    return page === 1 ? `/en/magazine/${category}` : `/en/magazine/${category}/list-${page}`;
  };

  const handleTabClick = (event, tab) => {
    if (tab.path === currentCategory) return;

    event.preventDefault();

    if (tabMoveTimerRef.current) {
      clearTimeout(tabMoveTimerRef.current);
    }

    setIsTitleTabOut(true);
    tabMoveTimerRef.current = setTimeout(() => {
      navigate(getListUrl(tab.path), { state: { fromMagazineTab: true } });
    }, 320);
  };

  useLayoutEffect(() => {
    Splitting();

    const observers = [];

    const runEffect17 = (title) => {
      if (title.hasAttribute("data-effect17-ready")) return;

      title.setAttribute("data-effect17-ready", "true");

      const chars = title.querySelectorAll(".char");

      chars.forEach((char) => {
        gsap.set(char.parentNode, { perspective: 1000 });
      });

      gsap.fromTo(
        chars,
        {
          opacity: 0,
          rotateX: () => gsap.utils.random(-120, 120),
          z: () => gsap.utils.random(-200, 200),
          willChange: "opacity, transform",
        },
        {
          opacity: 1,
          rotateX: 0,
          z: 0,
          duration: 2.4,
          ease: "power3.out",
          stagger: 0.02,
        }
      );
    };

    const timer = setTimeout(() => {
      const titles = document.querySelectorAll("[data-effect17]:not([data-effect17-ready])");

      titles.forEach((title) => {
        const chars = title.querySelectorAll(".char");
        gsap.set(chars, { opacity: 0 });

        const trigger = title.classList.contains("text-effect")
          ? title
          : title.closest(".ani") || title;

        if (trigger.classList.contains("active")) {
          runEffect17(title);
          return;
        }

        const observer = new MutationObserver(() => {
          if (!trigger.classList.contains("active")) return;

          runEffect17(title);
          observer.disconnect();
        });

        observer.observe(trigger, {
          attributes: true,
          attributeFilter: ["class"],
        });

        observers.push(observer);
      });
    }, 30);

    return () => {
      clearTimeout(timer);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [currentCategory, currentPage]);

  useEffect(() => {
    if (!isTabMove) return undefined;

    const timer = setTimeout(() => {
      setIsTitleTabOut(false);
    }, 40);

    return () => clearTimeout(timer);
  }, [currentCategory, isTabMove]);

  useEffect(() => {
    if (!getPostTypeForCategory(currentCategory)) return undefined;

    let isMounted = true;

    fetchMagazinePostCount(currentCategory)
      .then((count) => {
        if (!isMounted) return;

        const setting = magazinePageSettings[currentCategory] || {};
        const firstPageItems = setting.firstPageItems || getItemsPerPage(currentCategory);
        const itemsPerPage = getItemsPerPage(currentCategory);
        const remainingItems = Math.max(count - firstPageItems, 0);
        const nextTotalPages = Math.max(1, 1 + Math.ceil(remainingItems / itemsPerPage));

        setSanityTotalPages((pages) => ({
          ...pages,
          [currentCategory]: nextTotalPages,
        }));
      })
      .catch(() => {
        if (!isMounted) return;

        setSanityTotalPages((pages) => ({
          ...pages,
          [currentCategory]: 1,
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [currentCategory]);

  useEffect(() => (
    () => {
      if (tabMoveTimerRef.current) {
        clearTimeout(tabMoveTimerRef.current);
      }
    }
  ), []);

  return (
    <main className={`page_magazine ${currentCategory} ${isTabMove ? "tab_move" : ""}`}>
      <section className="mg_head b-t b-2 ani" data-keep-active-on-route>
        <div className="mg_title b-b b-delay-0 ">
          <h1 className="display-l apprael  apprael_all apprael_ani" >ID MAGAZINE</h1>
          <div className={`mg_title_right ${isTitleTabOut ? "tab_out" : ""}`}>
            <h4 className="gt display-xs fadeX-2">{currentTab.name}</h4>
            {currentTab.description.map((line, index) => (
              <div className={`body-m fadeX-${3 + index} txt`} key={index}>
                {line.split(/<br\s*\/?\s*>/i).map((text, lineIndex) => (
                  <Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    {text}
                  </Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>

        <ul className="mg_nav b-t b-delay-0">
          {tabs.map((tab, i) => (
            <li key={tab.path} className={`${tab.path === "our-picks" ? "btn_all" : ""} fade-${6 + i}`}>
              <Link
                to={getListUrl(tab.path)}
                state={{ fromMagazineTab: true }}
                className={`body-m ${currentCategory === tab.path ? "active" : ""}`}
                onClick={(event) => handleTabClick(event, tab)}
              >
                <span>{tab.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className={`mg_body ${isTitleTabOut ? "tab_out" : ""}`}>
        {listComponents[currentCategory] || listComponents["our-picks"]}

        {showPagination && <ul className="pagenation body-s txt-gray">
          <li>
            <Link to={getListUrl(currentCategory, Math.max(currentPage - 1, 1))}>
              <img src="/img/arrow_pg_left.svg" alt="" />
            </Link>
          </li>

          {pageNumbers.map((num) => (
            <li key={num}>
              <Link
                to={getListUrl(currentCategory, num)}
                className={currentPage === num ? "active" : ""}
              >
                {num}
              </Link>
            </li>
          ))}

          <li>
            <Link to={getListUrl(currentCategory, Math.min(currentPage + 1, totalPages))}>
              <img src="/img/arrow_pg_right.svg" alt="" />
            </Link>
          </li>
        </ul>}

      </section>
      
    </main>
  );
}

export default Magazine;
