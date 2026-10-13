import { useEffect, useRef, useState } from "react";
import HandwrittenSignature from "../components/HandwrittenSignature";
import useAboutIntroAnimation from "../lib/useAboutIntroAnimation";
import useAboutNumberCounter from "../lib/useAboutNumberCounter";
import useAboutSmoothScroll from "../lib/useAboutSmoothScroll";
import { fetchAboutSettings } from "../lib/sanityAbout";
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
            행복을 디자인합니다.
            </span>
            <span className=" delay-3">
            행복 스타일리스트.
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
            <b className="apprael_ani ls_s delay-1">아이디헤어(id HAIR)의 'id'는<br className="mob"/> 당신의 정체성, 바로 'identity'를 뜻합니다.</b>
            <span className="apprael_ani ls_s delay-2">
              우리는 고객 한 분 한 분이 가진 고유한 뷰티 아이덴티티를 섬세하게<br/>
              디자인하여, 세상에 단 하나뿐인 '가장 나다운 아름다움'을 완성합니다.
            </span>
            <span className="apprael_ani ls_s delay-3">
              아이디헤어는 언제나 당신이 가진 고유한 색깔을 지지하며,<br/>
              가장 당신다운 모습으로 빛나는 매 순간을 응원하겠습니다.</span>
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
                <span className="apprael_ani ls_s  delay-1">고객의 고유한 아름다움을 찾아주는 든든한 뷰티 파트너로서,</span>
                <span className="apprael_ani ls_s delay-2">구성원과 함께 동반 성장하며 K-뷰티의 새로운 역사를 쓰는</span>
                <span className="apprael_ani ls_s delay-3">위대한 기업으로 도약하겠습니다.</span>
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
                <span className="apprael_ani ls_s delay-1">단순한 헤어 디자인 기술을 넘어 고객의 삶에</span>
                <span className="apprael_ani ls_s delay-2">깊은 감동을 선사하는 '행복 스타일리스트'로서,</span>
                <span className="apprael_ani ls_s delay-3">모든 사람들과 함께 성공하고 꿈을 이뤄갑니다.</span>
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
              <HandwrittenSignature />
              <ul>
                <li className="body-m apprael_ani delay-1 ls_s">
                  <strong className="fw-b">Company Name</strong><p>주식회사 아이디뷰티</p>
                </li>
                <li className="body-m apprael_ani delay-2 ls_s">
                  <strong className="fw-b">Establishment Date</strong><p>1988년, 1호점 오픈</p>
                </li>
                <li className="body-m apprael_ani delay-3 ls_s">
                  <strong className="fw-b">Founder</strong><p>위운미 (We Woon Me)</p>
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
              <span className="apprael_ani ls_s delay-1">1988년 작은 미용실 '미스파마'에서 두 명의 스타일리스트로</span>
              <span className="apprael_ani ls_s delay-2">시작한 아이디헤어는, 이제 대한민국을 대표하는</span>
              <span className="apprael_ani ls_s delay-3">프로페셔널 헤어 브랜드로 성장했습니다. </span>
            </div>
          </div>

          <div className="card_w card_w_s">
            <img src="/img/about_4_card_3.jpg" />
          </div>

          <div className="as_4_3 t_m_w">
            <h1 className="display-l fw-l t_m_2 apprael mob_ani ani_x me_1 number_count">39</h1>



            {/*<div className="body-m as_text_1 t_m_1 ani_x pc">
              <span className="apprael_ani ls_s delay-1">지난 39년간 우리는 단순한 기술자를 넘어 고객의 행복을 디자인하는</span>
              <span className="apprael_ani ls_s delay-2">'행복 스타일리스트'로 달려왔습니다. '함께 성공하는 것'이라는 변치 않는</span>
              <span className="apprael_ani ls_s delay-3">사명 아래, 앞으로도 고객과 동료, 사회와 함께 아름다움의 여정을 이어가겠습니다.</span>
            </div>*/}
            <div className="body-m as_text_1 t_m_1 ani_x pc">
              <span className="apprael_ani ls_s delay-1">지난 39년간 우리는 단순한 기술자를 넘어 고객의 행복을 디자인하는</span>
              <span className="apprael_ani ls_s delay-2">'행복 스타일리스트'로 달려왔습니다. </span>
              <span className="apprael_ani ls_s delay-3">'함께 성공하는 것'이라는 변치 않는 사명 아래,</span>
              <span className="apprael_ani ls_s delay-3">앞으로도 고객과 동료, 사회와 함께 아름다움의 여정을 이어가겠습니다.</span>
            </div>
            <div className="body-m as_text_1 t_m_1 ani_x mob">
              <span className="apprael_ani ls_s delay-1">지난 39년간 우리는 단순한 기술자를 넘어</span>
              <span className="apprael_ani ls_s delay-2">고객의 행복을 디자인하는 '행복 스타일리스트'로 달려왔습니다. </span>
              <span className="apprael_ani ls_s delay-3">'함께 성공하는 것'이라는 변치 않는 사명 아래, 앞으로도</span>
              <span className="apprael_ani ls_s delay-3">고객과 동료, 사회와 함께 아름다움의 여정을 이어가겠습니다.</span>
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
                수십 년간 꾸준히 이어온 장기적인 아동 후원과 나눔을 통해, <br/>
                단순한 뷰티 브랜드를 넘어 사회적 책임을 다하는 진정성 있는 동반자로 함께합니다.
              </span>
              <span className="head-s mob">
                수십 년간 꾸준히 이어온 장기적인 아동 <br/> 
                후원과 나눔을 통해, 단순한 뷰티 브랜드를<br/>
                넘어 사회적 책임을 다하는 진정성 있는<br/>동반자로 함께합니다.
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
              <span className="apprael_ani ls_s delay-1">시장의 다양한 니즈에 대응하기 위해 전략적으로 </span>
              <span className="apprael_ani ls_s delay-2">브랜드 포트폴리오를 확장하며 시장 지배력을 강화하고 있습니다.</span>
            </div>
          </div>
          <div className="as_7_2 t_m_w">
            <ul>
              <li className="body-m  ani_x t_m_4">
                <span className="body-m apprael_ani delay-1 ls_s">전국 매장수 (2026년)</span>
                <div className="b-t b-1 b-c-white b-delay-2">
                  <h1 className="display-l fw-l apprael">112</h1>
                  <p className="body-m">개</p>
                </div>
              </li>
              <li className="body-m  ani_x t_m_5">
                <span className="body-m apprael_ani delay-2 ls_s">10년전 대비 매장 증가율</span>
                <div className="b-t b-1 b-c-white b-delay-2">
                  <h1 className="display-l fw-l apprael">5</h1>
                  <p className="body-m">배</p>
                </div>
              </li>
              <li className="body-m  ani_x t_m_6">
                <span className="body-m apprael_ani delay-3 ls_s">10년간 폐점률</span>
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
                대중적 접근성과 전문적인 서비스를 균형 있게 갖춘 핵심 브랜드로,<br/>
                누구나 쉽게 다가갈 수 있는 전문성과 신뢰를 제공합니다.
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
                <span className="magin_text t_m_3">&#123; 세컨드 하이엔드 브랜드 &#125;</span>
                <span className="span_text ">한남동과 유엔빌리지에 위치한 프리미엄 살롱으로,<br/>셀럽과 VIP 고객을 중심으로 브랜드의 고급 이미지를 강화합니다.</span>
              </div>
            </div>
            
          </div>
        </section>
        
      </div>
    </main>
  );
}

export default About;
