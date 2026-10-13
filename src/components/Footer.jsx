import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import TransitionLink from "./TransitionLink";
import useFooterViewportClass from "../hook/useFooterViewportClass";
import "../styles/footer.scss";

function Footer({ onOpenSalon }) {
  const location = useLocation();
  const isEnglishPage = /^\/en(?:\/|$)/.test(location.pathname);
  const footerRef = useRef(null);
  useFooterViewportClass(footerRef, location.pathname);


  useLayoutEffect(() => {
  const footer = document.querySelector("footer");

  if (!footer) return;

  const setFooterHeight = () => {
    const wrapper = document.querySelector("main");
    if (!wrapper) return;

    const height = `${footer.offsetHeight}px`;
    wrapper.style.setProperty("--footer-height", height);
    footer.style.setProperty("--footer-height", height);
  };

  const checkFooterActive = () => {
    const footerHeight = footer.offsetHeight;
    const scrollBottom = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollBottom >= documentHeight - footerHeight / 3) {
      footer.classList.add("active");
    } else {
      footer.classList.remove("active");
    }
  };

  setFooterHeight();
  checkFooterActive();

  const frameId = requestAnimationFrame(() => {
    setFooterHeight();
    checkFooterActive();
  });

  const observer = new ResizeObserver(() => {
    setFooterHeight();
    checkFooterActive();
  });

  observer.observe(footer);

  window.addEventListener("resize", setFooterHeight);
  window.addEventListener("resize", checkFooterActive);
  window.addEventListener("scroll", checkFooterActive);

  return () => {
    cancelAnimationFrame(frameId);
    observer.disconnect();
    window.removeEventListener("resize", setFooterHeight);
    window.removeEventListener("resize", checkFooterActive);
    window.removeEventListener("scroll", checkFooterActive);
  };
}, [location.pathname]);

  return (
    <footer ref={footerRef} className="bg-ac-1 ani">
      {/* 영문 / 국문 마크업은 각 영역에서 따로 수정합니다. */}
      {isEnglishPage ? (
        <>
            <div className="footer_inner">
                <TransitionLink className="footer_logo" to="/en"><img src="/img/f_logo.svg"/></TransitionLink>
                <ul className="f_link head-m">
                    <li><TransitionLink to="/en/about">ABOUT id HAIR</TransitionLink></li>
                    <li><button type="button" className="footer_salon_btn" onClick={onOpenSalon}>SALON</button></li>
                    <li><TransitionLink to="/en/magazine">id MAGAZINE</TransitionLink></li>
                    <li><TransitionLink to="/en/academy">id ACADEMY</TransitionLink></li>
                    <li><TransitionLink to="/en/recruit">RECRUIT</TransitionLink></li>
                </ul>
                <div className="icon_w">
                    <a target="_blank" href="https://www.instagram.com/idhair.official"><img src="/img/icon_instagram.svg"/></a>
                    <a target="_blank" href="https://www.youtube.com/channel/UCBMpTq6Z8P646L0UM6URIHA"><img src="/img/icon_youtube.svg"/></a>
                </div>
    
                <ol className="body-m">
                  <li>
                    <div><h4>Email</h4></div>
                    <div><span>idhairkorea@gmail.com</span></div>
                  </li>
    
                  <li>
                    <div><h4>Phone</h4></div>
                    <div><span>+82 2 2039 3301 | 10am - 5pm</span></div>
                  </li>
    
                  <li>
                    <div><h4>Address</h4></div>
                    <div><span>ID Beauty Co., Ltd., 6F and part of 3F, Korea Technology Promotion Institute Building,<br/>11 Yeonhui-ro, Mapo-gu, Seoul, South Korea</span></div>
                  </li>
    
                  <small className="body-m">
                  <div className="footer_copyright">idHAIR © 2026</div>
                  <div>Website made by <a style={{textDecoration: "underline"}} href="https://hummman.com/" target="_blank">hummman</a></div>
                  </small>
                </ol>
            </div>
        </>
      ) : (
        <>
            <div className="footer_inner">
                <TransitionLink className="footer_logo" to="/"><img src="/img/f_logo.svg"/></TransitionLink>
                <ul className="f_link head-m">
                    <li><TransitionLink to="/about">ABOUT id HAIR</TransitionLink></li>
                    <li><button type="button" className="footer_salon_btn" onClick={onOpenSalon}>SALON</button></li>
                    <li><TransitionLink to="/magazine">id MAGAZINE</TransitionLink></li>
                    <li><TransitionLink to="/academy">id ACADEMY</TransitionLink></li>
                    <li><TransitionLink to="/recruit">RECRUIT</TransitionLink></li>
                </ul>
                <div className="icon_w">
                    <a target="_blank" href="https://www.instagram.com/idhair.official"><img src="/img/icon_instagram.svg"/></a>
                    <a target="_blank" href="https://www.youtube.com/channel/UCBMpTq6Z8P646L0UM6URIHA"><img src="/img/icon_youtube.svg"/></a>
                </div>
    
                <ol className="body-m">
                  <li>
                    <div><h4>Email</h4></div>
                    <div><span>idhairkorea@gmail.com</span></div>
                  </li>
    
                  <li>
                    <div><h4>Phone</h4></div>
                    <div><span>+82 2 2039 3301 ㅣ 10am - 5pm</span></div>
                  </li>
    
                  <li>
                    <div><h4>Address</h4></div>
                    <div><span>서울특별시 마포구 연희로 11 한국기술진흥원 6층, 3층 일부 ㈜아이디뷰티</span></div>
                  </li>
    
                  <small className="body-m">
                  <div className="footer_copyright">idHAIR © 2026</div>
                  <div>Website made by <a style={{textDecoration: "underline"}} href="https://hummman.com/" target="_blank">hummman</a></div>
                  </small>
                </ol>
            </div>
        </>
      )}
    </footer>
  );
}

export default Footer;
