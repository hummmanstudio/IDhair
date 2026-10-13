import { useEffect, useRef, useState } from "react";
import HandwrittenSignature from "../components/HandwrittenSignature";
import useAboutIntroAnimation from "../lib/useAboutIntroAnimation";
import useAboutNumberCounter from "../lib/useAboutNumberCounter";
import useAboutSmoothScroll from "../lib/useAboutSmoothScroll";
import { fetchAboutSettings } from "../lib/sanityAboutEn";
import "../styles/about.scss";

const FALLBACK_INTRO_VIDEO_URL = "/video/About_intro.mp4";

function About() {
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const switchRef = useRef(null);

  useAboutIntroAnimation(introVideoUrl);
  useAboutNumberCounter();
  useAboutSmoothScroll();

  useEffect(() => {
    let cancelled = false;

    fetchAboutSettings()
      .then((settings) => {
        if (!cancelled) {
          setIntroVideoUrl(settings?.introVideoUrl || FALLBACK_INTRO_VIDEO_URL);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIntroVideoUrl(FALLBACK_INTRO_VIDEO_URL);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!introVideoUrl) return undefined;

    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "video";
    preloadLink.href = introVideoUrl;
    document.head.appendChild(preloadLink);

    return () => {
      preloadLink.remove();
    };
  }, [introVideoUrl]);

  useEffect(() => {
    const switchElement = switchRef.current;
    const images = switchElement
      ? [...switchElement.querySelectorAll(":scope > .t_m_1")]
      : [];

    if (!switchElement || images.length === 0) return undefined;

    let frameId = null;
    let horizontalX = 0;

    const updateSwitchImage = () => {
      frameId = null;

      const isVertical = window.matchMedia("(max-width: 1024px)").matches;
      const rect = switchElement.getBoundingClientRect();
      let progress;

      if (isVertical) {
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        progress = Math.min(
          1,
          Math.max(0, (viewportHeight - rect.top) / Math.max(1, viewportHeight)),
        );
      } else {
        const track = document.querySelector("[data-about-horizontal-track]");
        const viewportWidth = document.documentElement.clientWidth;
        const maxHorizontalX = Math.max(
          0,
          (track?.scrollWidth ?? viewportWidth) - viewportWidth,
        );
        const elementTrackRight = rect.right + horizontalX;
        const entryX = elementTrackRight - viewportWidth;
        const availableRange = Math.max(1, maxHorizontalX - entryX);

        progress = Math.min(
          1,
          Math.max(0, (horizontalX - entryX) / availableRange),
        );
      }
      const activeIndex = Math.min(
        images.length - 1,
        Math.floor(progress * images.length),
      );

      images.forEach((image, index) => {
        image.classList.toggle("active", index === activeIndex);
      });
    };

    const requestSwitchUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateSwitchImage);
    };

    const handleHorizontalScroll = (event) => {
      horizontalX = Number(event.detail?.x) || 0;
      requestSwitchUpdate();
    };

    updateSwitchImage();
    window.addEventListener("about-horizontal-scroll", handleHorizontalScroll);
    window.addEventListener("scroll", requestSwitchUpdate, { passive: true });
    window.addEventListener("resize", requestSwitchUpdate);
    window.visualViewport?.addEventListener("resize", requestSwitchUpdate);

    return () => {
      window.removeEventListener("about-horizontal-scroll", handleHorizontalScroll);
      window.removeEventListener("scroll", requestSwitchUpdate);
      window.removeEventListener("resize", requestSwitchUpdate);
      window.visualViewport?.removeEventListener("resize", requestSwitchUpdate);

      if (frameId !== null) window.cancelAnimationFrame(frameId);
      images.forEach((image) => image.classList.remove("active"));
    };
  }, []);

  return (
    <main
      className="page_about"
      lang="en"
      style={{
        //width: "600vw",
        
      }}
    >
      <div className="about_bg_1">
          <img src="/img/about_bg_1.png" />
        </div>
      <div className="about_intro ">
        <div className="mob_wrap">
          <div className="b-t b-4 b-c-white ani" data-about-intro-ani></div>
          <h1 className="display-l fw-l"><span className="apprael">ABOUT <br className="mob"/>ID HAIR</span></h1>
          <div className="b-t b-1 b-c-white dotted ani" data-about-intro-ani></div>
        </div>
        <div className="years_w head-m fw-sb">
          <div className="years_num">
            <h2>1988</h2>
          </div>
        </div>
        <div className="intro_video_w">
          <div className="intro_video">
            {introVideoUrl ? (
              <video key={introVideoUrl} src={introVideoUrl} autoPlay muted loop playsInline preload="auto" />
            ) : null}
          </div>
        </div>
      </div>
      <div data-about-horizontal-track>
        <section className="as_1 t_m_w">
          <div className="t_m_bg_w">
            <img className="t_m_bg_el pc" src="/img/about_1.jpg" />
            <img className="mob" src="/img/about_1_m.jpg" />
          </div>
          <div className="as_text ">
            <h1 className="display-l fw-l apprael t_m_1">My identity,</h1>
            <h1 className="display-l fw-l apprael t_m_2">My id HAIR</h1>
            {/*<h1 className="display-l fw-l apprael_all t_m_3"><span>Be&nbsp;</span><span>You</span></h1>*/}
          </div>
          <div className="as_1_text_2 head-s ani_x">
            <span className=" delay-1">
            We design happiness.
            </span>
            <span className=" delay-3">
            Happiness stylists.
            </span>
            </div>
          <div className="scroll_indicator">
            <span className="body-s">[ SCROLL ]</span>
            <div className="bar"><div className="inner"></div></div>
          </div>
        </section>
        <section className="as_2 t_m_w">
          <div className="as_text neulis mob_ani">
            <h1 className="as_title fw-r t_m_1 me_1">Brand</h1>
            <h1 className="as_title fw-r t_m_2 me_2">Story</h1>
          </div>
          <div className="as_text_2 head-s ani_x t_m_3">
            <b className="apprael_ani ls_s delay-1">The 'id' in id HAIR stands for<br className="mob"/> your identity.</b>
            <span className="apprael_ani ls_s delay-2">
              We thoughtfully shape each client's unique beauty identity,<br/>
              creating a one-of-a-kind look that is truly their own.
            </span>
            <span className="apprael_ani ls_s delay-3">
              At id HAIR, we celebrate your unique individuality<br/>
              and every moment you shine as your true self.</span>
          </div>
        </section>
        <section className="as_3">
          <div className="as_3_1 ">
            <div className="card_w ">
              <img src="/img/about_3_card_1.jpg" />
            </div>
            <div className="as_text as_text_1 neulis t_m_w mob_ani">
              <h1 className="as_title fw-r t_m_1 me_1">Our</h1>
              <h1 className="as_title fw-r t_m_2 me_2">identity</h1>
            </div>
          </div>

          <div className="as_3_2 ">
            <div className="card_w">
              <img src="/img/about_3_card_2.jpg" />
            </div>
            <div className="as_text t_m_w ani_x">
              <h1 className="t_m_1 t_1 txt-ac fw-r neulis mob_ani me_1">vision</h1>
              <span className="body-m t_2 t_m_2">( a )</span>
              <div className="body-m as_text_1 t_m_3">
                <span className="apprael_ani ls_s delay-1">As a trusted partner in discovering each client's unique beauty, we aim to grow alongside our team and become a great company that writes a new chapter in K-beauty.</span>
              </div>
            </div>
          </div>

          <div className="as_3_3 ">
            <div className="card_w">
              <img src="/img/about_3_card_3.jpg" />
            </div>
            <div className="as_text t_m_w ani_x">
              <h1 className="t_m_1 t_1 txt-ac fw-r neulis  mob_ani me_1">mission</h1>
              <span className="body-m t_2  t_m_2">( b )</span>
              <div className="body-m as_text_1 t_m_3">
                <span className="apprael_ani ls_s delay-1">Beyond the art of hair design, we are 'happiness stylists'</span>
                <span className="apprael_ani ls_s delay-2">who bring meaningful joy to our clients' lives.</span>
                <span className="apprael_ani ls_s delay-3">Together, we achieve success and make dreams come true.</span>
              </div>
            </div>
          </div>
        </section>
        <section className="as_4 bg-gray-2">
          <div className="as_4_bg_1">
            <img src="/img/about_bg_1.png" />
          </div>
          <div className="t_m_bg_w">
            <img className="t_m_bg_el pc" src="/img/about_4_card_1.jpg" />
            <img className="mob" src="/img/about_4_card_1.jpg" />
          </div>
          <div className="as_4_1 t_m_w">
            <div className="as_text as_text_1 neulis mob_ani">
              <h1 className="as_title fw-r t_m_1 me_1">CEO</h1>
              <h1 className="as_title fw-r t_m_2 me_2">Message</h1>
            </div>
            <div className="as_text_2 ani_x">
              <HandwrittenSignature label="We Woon Me's signature" />
              <ul>
                <li className="body-m apprael_ani delay-1 ls_s">
                  <strong className="fw-b">Company Name</strong><p>ID Beauty Co., Ltd.</p>
                </li>
                <li className="body-m apprael_ani delay-2 ls_s">
                  <strong className="fw-b">Establishment Date</strong><p>First salon opened in 1988</p>
                </li>
                <li className="body-m apprael_ani delay-3 ls_s">
                  <strong className="fw-b">Founder</strong><p>We Woon Me</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="card_w card_w_s">
            <img src="/img/about_4_card_2.jpg" />
          </div>
          <div className="as_4_2 t_m_w">
            <h1 className="display-l fw-l t_m_2 apprael mob_ani ani_x me_1 number_count">1988</h1>
            <div className="body-m as_text_1 t_m_1 ani_x">
              <span className="apprael_ani ls_s delay-1">Founded in 1988 by two stylists at a small salon called 'Miss Parma',</span>
              <span className="apprael_ani ls_s delay-2">id HAIR has grown into one of South Korea's leading professional hair brands.</span>
            </div>
          </div>

          <div className="card_w card_w_s">
            <img src="/img/about_4_card_3.jpg" />
          </div>

          <div className="as_4_3 t_m_w">
            <h1 className="display-l fw-l t_m_2 apprael mob_ani ani_x me_1 number_count">39</h1>



            <div className="body-m as_text_1 t_m_1 ani_x pc">
              <span className="apprael_ani ls_s delay-1">For 39 years, we have gone beyond technical expertise</span>
              <span className="apprael_ani ls_s delay-2">to become 'happiness stylists' who design happiness for our clients.</span>
              <span className="apprael_ani ls_s delay-3">Guided by our enduring mission to 'succeed together',</span>
              <span className="apprael_ani ls_s delay-3">we continue our journey in beauty with clients, colleagues and society.</span>
            </div>
            <div className="body-m as_text_1 t_m_1 ani_x mob">
              <span className="apprael_ani ls_s delay-1">For 39 years, we have gone beyond technical expertise</span>
              <span className="apprael_ani ls_s delay-2">to become 'happiness stylists' who design happiness for our clients.</span>
              <span className="apprael_ani ls_s delay-3">Guided by our enduring mission to 'succeed together',</span>
              <span className="apprael_ani ls_s delay-3">we continue our journey in beauty with clients, colleagues and society.</span>
            </div>
            
          </div>
        </section>

        <section className="as_5">
          <div className="t_m_bg_w">
            <img className="t_m_bg_el pc" src="/img/about_5.jpg" />
            <img className="mob" src="/img/about_5_m.jpg" />
          </div>
          <div className="as_text_1 t_m_w txt-ac mob_ani">
            <h1 className="display-l fw-l t_m_1 apprael me_1">Corporate</h1>
            <h1 className="display-l fw-l t_m_2 apprael me_2">Social</h1>
            <h1 className="display-l fw-l t_m_3 apprael me_3">Responsibility</h1>
          </div>

        </section>
        <section className="as_6">
          <div className="as_6_1">
            <div className="as_6_text">
              <img src="/img/icon_heart.svg"/>
              <span className="head-s pc">
                Through decades of sustained child sponsorship and giving,<br/>
                we go beyond beauty to be a committed partner in social responsibility.
              </span>
              <span className="head-s mob">
                Through decades of sustained<br/>
                child sponsorship and giving, we go<br/>
                beyond beauty to be a committed<br/>partner in social responsibility.
              </span>
            </div>
            <div className="as_6_bg_w">
              <img className="as_6_bg_el" src="/img/about_6.jpg" />
            </div>
          </div>

        </section>

        <section className="as_7 txt-white">
          <div className="as_7_1 t_m_w">
            <div className="as_text as_text_1 neulis mob_ani">
              <h1 className="as_title fw-r t_m_1 me_1">Family</h1>
              <h1 className="as_title fw-r t_m_2 me_2">Brand</h1>
            </div>
            <div className="body-m as_text_2 t_m_3 ani_x">
              <span className="apprael_ani ls_s delay-1">We strategically expand our brand portfolio to meet<br/>diverse market needs</span>
              <span className="apprael_ani ls_s delay-2">and strengthen our position in the market.</span>
            </div>
          </div>
          <div className="as_7_2 t_m_w">
            <ul>
              <li className="body-m  ani_x t_m_4">
                <span className="body-m apprael_ani delay-1 ls_s">Salons Nationwide (2026)</span>
                <div className="b-t b-1 b-c-white b-delay-2">
                  <h1 className="display-l fw-l apprael">112</h1>
                  <p className="body-m">salons</p>
                </div>
              </li>
              <li className="body-m  ani_x t_m_5">
                <span className="body-m apprael_ani delay-2 ls_s">Salon Growth vs. 10 Years Ago</span>
                <div className="b-t b-1 b-c-white b-delay-2">
                  <h1 className="display-l fw-l apprael">5</h1>
                  <p className="body-m">times</p>
                </div>
              </li>
              <li className="body-m  ani_x t_m_6">
                <span className="body-m apprael_ani delay-3 ls_s">10-Year Closure Rate</span>
                <div className="b-t b-1 b-c-white b-delay-2">
                  <h1 className="display-l fw-l apprael">0</h1>
                  <p className="body-m">%</p>
                </div>
              </li>
            </ul>
          </div>


        </section>
        <section className="as_8 txt-white">
          <div className="as_8_1 ani_x t_m_w">
            <div className="img_w ">
              <img className="t_m_1" src="/img/as_7_3.jpg"/>
              <div className="as_text apprael_ani ls_s delay-1  body-m t_m_2">
              <img className="t_m_2" src="/img/logo_w.png"/>
              <span className="span_text">
                Our core brand balances accessibility with professional service,<br/>
                offering expertise and trust that everyone can rely on.
              </span>
            </div>
            </div>
            
          </div>
          <div className="as_8_2 ani_x t_m_w">
            <div className="img_w">
              <div className="switch_w" ref={switchRef}>
                <img className="t_m_1" src="/img/as_7_3_1.jpg"/>
                <img className="t_m_1" src="/img/as_7_3_2.jpg"/>
                <img className="t_m_1" src="/img/as_7_3_3.jpg"/>
                <img className="t_m_1" src="/img/as_7_3_4.jpg"/>
              </div>
              <div className="as_text body-m">
                <img className="t_m_2" src="/img/as_7_4_3.png"/>
                <span className="magin_text t_m_3">&#123; Second High-End Brand &#125;</span>
                <span className="span_text ">Premium salons in Hannam-dong and UN Village,<br/>strengthening our luxury image among celebrities and VIP clients.</span>
              </div>
            </div>
            
          </div>
        </section>
        
      </div>
    </main>
  );
}

export default About;
