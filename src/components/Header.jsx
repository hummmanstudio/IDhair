import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import TransitionLink from "./TransitionLink";
import Salon from "./Salon";
import "../styles/header.scss";

const ABOUT_HORIZONTAL_SCROLL_EVENT = "about-horizontal-scroll";
const ABOUT_NAV_HIDE_MIN_WIDTH = 1024;
const NAV_HIDE_THRESHOLD = 100;

function Header({ salonOpen, setSalonOpen }) {
  const [navOpen, setNavOpen] = useState(false);
  const [navHide, setNavHide] = useState(false);
  const [headerActive, setHeaderActive] = useState(false);
  const location = useLocation();
  const isEnglishPage = /^\/en(?:\/|$)/.test(location.pathname);
  const isEnglishAboutPage = /^\/en\/about\/?$/.test(location.pathname);
  const [mainIntroRevealedKey, setMainIntroRevealedKey] = useState(null);
  const isMainPage = ["/", "/en", "/en/"].includes(location.pathname);
  const mainIntroHidden = isMainPage && mainIntroRevealedKey !== location.key;
  const aboutHorizontalXRef = useRef(0);

  useLayoutEffect(() => {
    if (!isMainPage) return;

    let revealTimer;
    const revealHeader = () => {
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(() => {
        setMainIntroRevealedKey(location.key);
        setNavHide(false);
      }, 1000);
    };
    window.addEventListener("main-intro-text-start", revealHeader);
    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("main-intro-text-start", revealHeader);
    };
  }, [isMainPage, location.key]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderActive(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isAboutPage = ["/about", "/en/about"].includes(location.pathname.replace(/\/$/, ""));
    const shouldUseAboutHorizontal = () => isAboutPage && window.innerWidth >= ABOUT_NAV_HIDE_MIN_WIDTH;
    const updateNavHide = () => {
      const scrollValue = shouldUseAboutHorizontal() ? aboutHorizontalXRef.current : window.scrollY;
      setNavHide(scrollValue > NAV_HIDE_THRESHOLD);
    };

    const handleScroll = () => updateNavHide();
    const handleResize = () => updateNavHide();
    const handleAboutHorizontalScroll = (event) => {
      aboutHorizontalXRef.current = event.detail?.x || 0;
      updateNavHide();
    };

    if (!isAboutPage) {
      aboutHorizontalXRef.current = 0;
    }

    updateNavHide();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    window.addEventListener(ABOUT_HORIZONTAL_SCROLL_EVENT, handleAboutHorizontalScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(ABOUT_HORIZONTAL_SCROLL_EVENT, handleAboutHorizontalScroll);
    };
  }, [location.pathname]);

  return (
    <header className={`header ani ${headerActive ? "active" : ""} ${mainIntroHidden || navHide ? "nav_hide" : ""} ${mainIntroHidden ? "hide" : ""}`}>
      {isEnglishPage ? (
        <>
          <div className="logo_w">
            <a href="/en" className="logo">
              <img src="/img/logo_h.png" alt="IDhair" />
            </a>
          </div>
    
          <div className="gnb body-l">
            <TransitionLink to="/en/about"><span>ABOUT id HAIR</span></TransitionLink>
            <TransitionLink to="/en/academy"><span>id ACADEMY</span></TransitionLink>
            <TransitionLink to="/en/magazine"><span>id MAGAZINE</span></TransitionLink>
            <TransitionLink to="/en/recruit"><span>RECRUIT</span></TransitionLink>
          </div>
          
          <div className="header_inner test">
            
    
            <div className="lang body-s">
              <span>(</span>
              <div>KR</div>
              <div className="active">EN</div>
              <span>)</span>
            </div>
    
            <div className="right_w bg-gray-3">
              <button
                type="button"
                className="menu_btn h_nav_open"
                onClick={() => setNavOpen(true)}
              >
                <span></span>
                <span></span>
              </button>
    
              <button
                type="button"
                className="salon_btn bg-ac-1 body-m"
                onClick={() => setSalonOpen(true)}
              >
                SALON
              </button>
            </div>
          </div>
    
          <nav className={`h_nav ${navOpen ? "active" : ""}`}>
            <div className="h_nav_bg"></div>
    
            <div className="h_nav_inner bg-gray-1">
              <button
                type="button"
                className="h_nav_close"
                onClick={() => setNavOpen(false)}
              >
                <span></span>
                <span></span>
              </button>
    
              <div className="h_nav_group_1 gt_all display-xs">
                <a
                  onClick={() => {
                    setNavOpen(false);
                    setSalonOpen(true);
                  }}
                >Salon</a>
                <div className="mob menu_line"></div>
                <TransitionLink to="/en/about" onClick={() => setNavOpen(false)}>About id HAIR</TransitionLink>
                <TransitionLink to="/en/academy" onClick={() => setNavOpen(false)}>id Academy</TransitionLink>
                <TransitionLink to="/en/recruit" onClick={() => setNavOpen(false)}>Recruit</TransitionLink>
                <div className="mob menu_line"></div>
              </div>
    
              <div className="h_nav_group_2">
                <a target="_blank" href="https://www.instagram.com/idhair.official"><img src="/img/icon_instagram.svg"/></a>
                <a target="_blank" href="https://www.youtube.com/channel/UCBMpTq6Z8P646L0UM6URIHA"><img src="/img/icon_youtube.svg"/></a>
              </div>
    
              <div className="h_nav_group_3">
                <TransitionLink className="gt display-xs" to="/en/magazine/our-picks" onClick={() => setNavOpen(false)}>id Magazine</TransitionLink>
                <ul className="body-s">
                  <li><TransitionLink to="/en/magazine/id-event" onClick={() => setNavOpen(false)}>id EVENT</TransitionLink></li>
                  <li><TransitionLink to="/en/magazine/id-family" onClick={() => setNavOpen(false)}>id FAMILY</TransitionLink></li>
                  <li><TransitionLink to="/en/magazine/id-news" onClick={() => setNavOpen(false)}>id NEWS</TransitionLink></li>
                  <li><TransitionLink to="/en/magazine/id-gallery" onClick={() => setNavOpen(false)}>id GALLERY</TransitionLink></li>
                  <li><TransitionLink to="/en/magazine/id-play" onClick={() => setNavOpen(false)}>id PLAY</TransitionLink></li>
                </ul>
              </div>
    
              <div className="h_nav_group_4 txt-gray caption-m">
                {isEnglishAboutPage ? (
                  <>6F, Korea Institute of Patent Information Building,<br />
                    11 Yeonhui-ro, Mapo-gu, Seoul, South Korea<br />
                    ID Beauty Co., Ltd.</>
                ) : (
                  <>서울특별시 마포구 연희로 11 한국특허정보원 6층,<br />
                    (주)아이디뷰티</>
                )}
              </div>
            </div>
          </nav>
        </>
      ) : (
        <>
          <div className="logo_w">
            <a href="/" className="logo">
              <img src="/img/logo_h.png" alt="IDhair" />
            </a>
          </div>
    
          <div className="gnb body-l">
            <TransitionLink to="/about"><span>ABOUT id HAIR</span></TransitionLink>
            <TransitionLink to="/academy"><span>id ACADEMY</span></TransitionLink>
            <TransitionLink to="/magazine"><span>id MAGAZINE</span></TransitionLink>
            <TransitionLink to="/recruit"><span>RECRUIT</span></TransitionLink>
          </div>
          
          <div className="header_inner test">
            
    
            <div className="lang body-s">
              <span>(</span>
              <div className="active">KR</div>
              <div>EN</div>
              <span>)</span>
            </div>
    
            <div className="right_w bg-gray-3">
              <button
                type="button"
                className="menu_btn h_nav_open"
                onClick={() => setNavOpen(true)}
              >
                <span></span>
                <span></span>
              </button>
    
              <button
                type="button"
                className="salon_btn bg-ac-1 body-m"
                onClick={() => setSalonOpen(true)}
              >
                SALON
              </button>
            </div>
          </div>
    
          <nav className={`h_nav ${navOpen ? "active" : ""}`}>
            <div className="h_nav_bg"></div>
    
            <div className="h_nav_inner bg-gray-1">
              <button
                type="button"
                className="h_nav_close"
                onClick={() => setNavOpen(false)}
              >
                <span></span>
                <span></span>
              </button>
    
              <div className="h_nav_group_1 gt_all display-xs">
                <a
                  onClick={() => {
                    setNavOpen(false);
                    setSalonOpen(true);
                  }}
                >Salon</a>
                <div className="mob menu_line"></div>
                <TransitionLink to="/about" onClick={() => setNavOpen(false)}>About id HAIR</TransitionLink>
                <TransitionLink to="/academy" onClick={() => setNavOpen(false)}>id Academy</TransitionLink>
                <TransitionLink to="/recruit" onClick={() => setNavOpen(false)}>Recruit</TransitionLink>
                <div className="mob menu_line"></div>
              </div>
    
              <div className="h_nav_group_2">
                <a target="_blank" href="https://www.instagram.com/idhair.official"><img src="/img/icon_instagram.svg"/></a>
                <a target="_blank" href="https://www.youtube.com/channel/UCBMpTq6Z8P646L0UM6URIHA"><img src="/img/icon_youtube.svg"/></a>
              </div>
    
              <div className="h_nav_group_3">
                <TransitionLink className="gt display-xs" to="/magazine/our-picks" onClick={() => setNavOpen(false)}>id Magazine</TransitionLink>
                <ul className="body-s">
                  <li><TransitionLink to="/magazine/id-event" onClick={() => setNavOpen(false)}>id EVENT</TransitionLink></li>
                  <li><TransitionLink to="/magazine/id-family" onClick={() => setNavOpen(false)}>id FAMILY</TransitionLink></li>
                  <li><TransitionLink to="/magazine/id-news" onClick={() => setNavOpen(false)}>id NEWS</TransitionLink></li>
                  <li><TransitionLink to="/magazine/id-gallery" onClick={() => setNavOpen(false)}>id GALLERY</TransitionLink></li>
                  <li><TransitionLink to="/magazine/id-play" onClick={() => setNavOpen(false)}>id PLAY</TransitionLink></li>
                </ul>
              </div>
    
              <div className="h_nav_group_4 txt-gray caption-m">
                서울특별시 마포구 연희로 11 한국특허정보원 6층,<br />
                (주)아이디뷰티
              </div>
            </div>
          </nav>
        </>
      )}
      <Salon key={isEnglishPage ? "en" : "ko"} language={isEnglishPage ? "en" : "ko"} open={salonOpen} onClose={() => setSalonOpen(false)} />
    </header>
  );
}

export default Header;
