import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/recruit.scss";

gsap.registerPlugin(ScrollTrigger);

const recruitGridImages = Array.from(
  { length: 12 },
  (_, index) => `/img/rs_grid_${(index % 9) + 1}.jpg`,
);

function Recruit() {
  const [isNavPopupOpen, setIsNavPopupOpen] = useState(false);
  const progressTrackRef = useRef(null);
  const maskTrackRef = useRef(null);
  const maskOriginRef = useRef(null);
  const maskImageRef = useRef(null);
  const downPageRef = useRef(null);
  const gridSectionRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const gridRef = useRef(null);
  const gridContentRef = useRef(null);

  useEffect(() => {
    const progressTrack = progressTrackRef.current;
    const maskTrack = maskTrackRef.current;
    const maskOrigin = maskOriginRef.current;
    const maskImage = maskImageRef.current;
    const downPage = downPageRef.current;
    const gridSection = gridSectionRef.current;
    const downSticky = downPage?.querySelector(":scope > .sticky_w");
    const downItems = downPage
      ? [...downPage.querySelectorAll(":scope > .sticky_w > ul > li")]
      : [];
    const recruitHeader = maskTrack?.closest(".rs_head");

    if (
      !progressTrack
      || !maskTrack
      || !maskOrigin
      || !maskImage
      || !downPage
      || !gridSection
      || !downSticky
      || !recruitHeader
    ) {
      return undefined;
    }

    let frameId = null;

    const updateMask = () => {
      frameId = null;

      const progressRect = progressTrack.getBoundingClientRect();
      const originRect = maskOrigin.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const progressStart = progressRect.top + window.scrollY;
      const progressRange = Math.max(1, progressRect.height);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - progressStart) / progressRange),
      );
      const remaining = 1 - progress;
      const progressValue = progress * 100;
      const initialHeight = originRect.height;
      const initialTop = Math.max(0, originRect.top + window.scrollY);
      const initialLeft = Math.max(0, originRect.left);
      const initialRight = Math.max(0, viewportWidth - originRect.right);
      const initialBottom = Math.max(
        0,
        viewportHeight - initialTop - initialHeight,
      );
      const initialCenterY = initialTop + initialHeight / 2;
      const imageOffsetY = (initialCenterY - viewportHeight / 2) * remaining;

      maskTrack.style.setProperty("--recruit-mask-width", `${viewportWidth}px`);
      maskTrack.style.setProperty("--recruit-mask-height", `${viewportHeight}px`);
      recruitHeader.style.setProperty(
        "--recruit-progress",
        progressValue.toFixed(3),
      );
      recruitHeader.style.setProperty(
        "--recruit-progress-inverse",
        String(remaining),
      );
      maskTrack.style.setProperty(
        "--recruit-mask-clip-top",
        `${initialTop * remaining}px`,
      );
      maskTrack.style.setProperty(
        "--recruit-mask-clip-right",
        `${initialRight * remaining}px`,
      );
      maskTrack.style.setProperty(
        "--recruit-mask-clip-bottom",
        `${initialBottom * remaining}px`,
      );
      maskTrack.style.setProperty(
        "--recruit-mask-clip-left",
        `${initialLeft * remaining}px`,
      );
      maskTrack.style.setProperty(
        "--recruit-image-y",
        `${imageOffsetY}px`,
      );

      const downRect = downPage.getBoundingClientRect();
      const gridRect = gridSection.getBoundingClientRect();
      downSticky.classList.toggle(
        "float",
        downRect.top >= viewportHeight * (5 / 6),
      );
      downSticky.classList.toggle("over", gridRect.top <= viewportHeight);
      const downRange = Math.max(1, downRect.height - viewportHeight);
      const downProgress = Math.min(
        1,
        Math.max(0, -downRect.top / downRange),
      );
      const itemDuration = 0.4;
      const itemStagger = 0.2;

      downPage.style.setProperty(
        "--recruit-down-progress",
        (downProgress * 100).toFixed(3),
      );

      downItems.forEach((item, index) => {
        const itemStart = index * itemStagger;
        const itemProgress = Math.min(
          1,
          Math.max(0, (downProgress - itemStart) / itemDuration),
        );
        const itemY = (1 - itemProgress) * viewportHeight * 0.65;

        item.style.setProperty(
          "--recruit-item-progress",
          String(itemProgress),
        );
        item.style.setProperty("--recruit-item-y", `${itemY}px`);
      });
    };

    const requestMaskUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateMask);
    };

    updateMask();
    window.addEventListener("scroll", requestMaskUpdate, { passive: true });
    window.addEventListener("touchmove", requestMaskUpdate, { passive: true });
    window.addEventListener("touchend", requestMaskUpdate, { passive: true });
    window.addEventListener("resize", requestMaskUpdate);
    window.visualViewport?.addEventListener("resize", requestMaskUpdate);

    return () => {
      window.removeEventListener("scroll", requestMaskUpdate);
      window.removeEventListener("touchmove", requestMaskUpdate);
      window.removeEventListener("touchend", requestMaskUpdate);
      window.removeEventListener("resize", requestMaskUpdate);
      window.visualViewport?.removeEventListener("resize", requestMaskUpdate);
      downSticky.classList.remove("over");

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    const block = gridSectionRef.current;
    const wrapper = gridWrapperRef.current;
    const content = gridContentRef.current;
    const grid = gridRef.current;
    const title = content?.querySelector(".rs_2_content_title");
    const description = content?.querySelector(".rs_2_content_description");
    const items = grid
      ? [...grid.querySelectorAll(".rs_2_grid_item")]
      : [];

    if (
      !block
      || !wrapper
      || !content
      || !grid
      || !title
      || !description
      || !items.length
    ) {
      return undefined;
    }

    const images = items.map((item) => item.querySelector("img"));
    const columns = Array.from({ length: 3 }, () => []);
    let gsapContext = null;
    let cancelled = false;

    items.forEach((item, index) => {
      columns[index % columns.length].push(item);
    });

    const imageReady = images.map((image) => {
      if (image.complete) return Promise.resolve();

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });

    Promise.all(imageReady).then(() => {
      if (cancelled) return;

      gsapContext = gsap.context(() => {
        ScrollTrigger.create({
          trigger: block,
          start: "top top",
          onEnter: () => wrapper.classList.remove("float"),
          onLeaveBack: () => wrapper.classList.add("float"),
          onRefresh: (self) => {
            wrapper.classList.toggle("float", window.scrollY < self.start);
          },
        });

        gsap.set([description], {
          opacity: 0,
          pointerEvents: "none",
        });

        const dy = (content.offsetHeight - title.offsetHeight) / 2;
        const titleOffsetY = (dy / content.offsetHeight) * 100;

        gsap.set(title, { yPercent: titleOffsetY });

        /*gsap.from(title, {
          duration: 0.7,
          ease: "power1.out",
          scrollTrigger: {
            trigger: block,
            start: "top 57%",
            toggleActions: "play none none reset",
          },
        });*/

        const gridRevealTimeline = () => {
          const timeline = gsap.timeline();
          const wh = window.innerHeight;
          const revealY = wh - (wh - grid.offsetHeight) / 2;

          columns.forEach((column, columnIndex) => {
            const fromTop = columnIndex % 2 === 0;

            timeline.from(
              column,
              {
                y: revealY * (fromTop ? -1 : 1),
                stagger: {
                  each: 0.06,
                  from: fromTop ? "end" : "start",
                },
                ease: "power1.inOut",
              },
              "grid-reveal",
            );
          });

          return timeline;
        };

        const gridZoomTimeline = () => {
          const timeline = gsap.timeline({
            defaults: {
              duration: 1,
              ease: "power3.inOut",
            },
          });

          timeline.to(grid, { scale: 2.05 });
          timeline.to(columns[0], { xPercent: -40 }, "<");
          timeline.to(columns[2], { xPercent: 40 }, "<");
          timeline.to(
            columns[1],
            {
              yPercent: (index) =>
                (index < Math.floor(columns[1].length / 2) ? -1 : 1) * 40,
              duration: 0.5,
              ease: "power1.inOut",
            },
            "-=0.5",
          );

          return timeline;
        };

        const toggleContent = (isVisible = true) => {
          gsap.timeline({ defaults: { overwrite: true } })
            .to(title, {
              yPercent: isVisible ? 0 : titleOffsetY,
              duration: 0.7,
              ease: "power2.inOut",
            })
            .to(
              [description],
              {
                opacity: isVisible ? 1 : 0,
                duration: 0.4,
                ease: `power1.${isVisible ? "inOut" : "out"}`,
                pointerEvents: isVisible ? "all" : "none",
              },
              isVisible ? "-=90%" : "<",
            );
        };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: "top 25%",
            end: "bottom bottom",
            scrub: true,
          },
        });

        timeline
          .add(gridRevealTimeline())
          .add(gridZoomTimeline(), "-=0.6")
          .add(
            () => toggleContent(timeline.scrollTrigger.direction === 1),
            "-=0.32",
          );
      }, block);

      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      gsapContext?.revert();
    };
  }, []);

  return (
    <main className="page_recruit">
      <section className="rs_head ani">
        <div className="body-s scroll apprael_ani ls_s mob">[ SCROLL ]</div>
        <div className="rs_progress" ref={progressTrackRef}></div>
        <div className="rc_title b-t b-2">
          <h1 className="display-l apprael  apprael_all apprael_ani" >CAREERS</h1>
          <div className="b-b b-delay-0"></div>
          <div className="body-s scroll apprael_ani ls_s pc">[ SCROLL ]</div>
        </div>
        <div className="middle ani">
          <span className="body-l fw-sb apprael_ani ls_s">idHAIR와 함께 성장할 인재를 찾습니다.</span>
          <div className="title_b txt-ac apprael_ani delay-2 gt_all">
            <span className="display-m">let&#39;s</span>
            <img src="/img/recruit_cross.svg"/>
            <span className="display-m">work</span><br className="mob"/>
            <img className="pc" src="/img/recruit_cross.svg"/>
            <span className="display-m">together</span>
          </div>
        </div>
        <div className="mask_origin" ref={maskOriginRef}></div>
        <div className="mask_w" ref={maskTrackRef}>
          <div className="mask_sticky">
            <img
              className="mask_el pc"
              ref={maskImageRef}
              src="/img/recruit_1.jpg"
              alt=""
            />
            <img
              className="mask_el mob"
              ref={maskImageRef}
              src="/img/recruit_1_mob.png"
              alt=""
            />
          </div>
        </div>

        <div className="down_p" ref={downPageRef}>
          <div className="sticky_w ani float">
            <div className="rolling apprael_all display-m">
              <h1 className="display-m">MY idENTITY  MY idHAIR  </h1>
              <h1 className="display-m">MY idENTITY  MY idHAIR  </h1>
              <h1 className="display-m">MY idENTITY  MY idHAIR  </h1>
            </div>

            <ul className="">
              <li>
                <div className="edge_w">
                  <img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/>
                </div>
                {/*<DotLottieReact
                  className="value-lottie"
                  src="/lottie/Loader-Linear-Diamond-Spin.lottie"
                  loop
                  autoplay
                  aria-hidden="true"
                /> */    }           
                <img src="/img/rs_1_1.svg" alt="" />
                <h1 className="display-xs gt fw-r">honest</h1>
                <b className="body-s fw-sb">( 정직함 )</b>
                <span className="body-s fw-r">공정한 노력을 통한 정직한 성공</span>
              </li>

              <li>
                <div className="edge_w">
                  <img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/>
                </div>
                
                <img src="/img/rs_1_2.svg" alt="" />
                
                <h1 className="display-xs gt fw-r">warmth</h1>
                <b className="body-s fw-sb">( 따뜻함 )</b>
                <span className="body-s fw-r">모두를 가족처럼 대하는 따뜻한 마음</span>
              </li>

              <li>
                <div className="edge_w">
                  <img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/>
                </div>
                <img src="/img/rs_1_3.svg" alt="" />
                <h1 className="display-xs gt fw-r">integrity</h1>
                <b className="body-s fw-sb">( 성숙함 )</b>
                <span className="body-s fw-r">선한 영향력을 줄 수 있는 성숙한 태도</span>
              </li>
            </ul>
          </div>
        </div>

      </section>
      <section className="rs_2" ref={gridSectionRef}>
        <div className="rs_2_sticky">
          <div className="rs_2_sticky_inner float" ref={gridWrapperRef}>
            <div className="rs_2_content txt-ac" ref={gridContentRef}>
              <h2 className="rs_2_content_title apprael">
                ID FAMILY
              </h2>
              <p className="rs_2_content_description">
                오랜 시간 이어온 'id 패밀리즘'은 구성원의 유대와 고객의<br/> 신뢰를 쌓아온 아이디헤어의 가장 강력한 원동력입니다.<br/><br/>
                정직한 성공과 따뜻한 마음을 바탕으로 동료와 고객 모두가<br/> 행복한 진정한 동반 성장의 문화를 만들어갑니다.
              </p>
            </div>
            <div className="rs_2_gallery">
              <ul className="rs_2_grid" ref={gridRef}>
                {recruitGridImages.map((src, index) => (
                  <li className="rs_2_grid_item" key={`${src}-${index}`}>
                    <img
                      className="rs_2_grid_image"
                      src={src}
                      alt={`idHAIR careers ${index + 1}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="rs_3 txt-white">
        <div className="top b-b b-dash b-delay-4 ani">
          <b className="head-m fw-b apprael_ani">직무소개</b>
          <h1 className="display-m apprael apprael_ani">Job Description</h1>
        </div>
        <ul className="rs_3_2 b-b b-dash ani b-delay-6">
          <li className="b-l apprael_ani ls_s rs_3_2_1">
            <span className="body-s">(디자이너)</span>
            <h4 className="display-xs apprael">Designer</h4>
            <p className="body-m">
              매장·고객·동료에게 행복을 전해주고,<br/>함께 성장하는 스타 디자이너
            </p>
            <ul>
              <li>대/내외 스타 디자이너 초청 특강</li>
              <li>직급별/매출별 성장여행</li>
              <li>하이퍼포머 특별 해외연수</li>
              <li>개별 디자이너 매출 성장 코칭</li>
            </ul>
          </li>

          <li className="b-l b-delay-2 apprael_ani ls_s delay-2 rs_3_2_2">
            <span className="body-s">(관리자)</span>
            <h4 className="display-xs apprael">Administrator</h4>
            <p className="body-m">
              매장을 관리/운영하며,<br/>함께하는 동료들을 성공으로 이끄는 경영자
            </p>
            <ul>
              <li>대/내외 경영 리더십 교육</li>
              <li>멘토 코칭 교육</li>
              <li>전체 경영회의 참석</li>
            </ul>
          </li>

          <li className="b-l b-delay-4 apprael_ani ls_s delay-4 rs_3_2_3">
            <span className="body-s">(파트너)</span>
            <h4 className="display-xs apprael">Partner</h4>
            <p className="body-m">
              함께 성공하고자 하는 동료이자<br/>헤어디자이너를 준비하는 예비 스타 디자이너
            </p>
            <ul>
              <li>사내 아카데미 보유</li>
              <li>전 매장 기숙사 보유</li>
              <li>입사 시, 일대일 멘토 지정</li>
              <li>각종 이벤트 데이</li>
              <li>최고의 기술력을 전해주는 스타일워크 교육</li>
            </ul>
          </li>
          

        </ul>
        <div className="b-b b-dash b-delay-4 process_w ani">
          <div className="left apprael_ani ls_s">
            <span className="body-s">(채용절차)</span>
            <h1 className="apprael display-xs">Hiring Process</h1>
            <p className="body-m">상시 채용</p>
          </div>
          <div className="right">
            <ol>
              <li>
                <h4 className="apprael display-xs">01</h4>
                <span className="body-m fw-sb">홈페이지 내<br/>입사 지원서 다운로드</span>
              </li>

              <li>
                <h4 className="apprael display-xs">02</h4>
                <span className="body-m fw-sb">입사지원서 작성</span>
              </li>

              <li>
                <h4 className="apprael display-xs">03</h4>
                <span className="body-m fw-sb">메일로 지원서 제출</span>
              </li>

              <li>
                <h4 className="apprael display-xs">04</h4>
                <span className="body-m fw-sb">면접 후 합격자<br/>개별 유선 연락</span>
              </li>

            </ol>
          </div>
        </div>
      </section>

      <div className="rs_nav_w">
        <nav className="body-m rs_nav">
          <div className="rs_nav_1">
            <span>E-mail</span>
            <h4>idhair1988@naver.com</h4>
            <p>/</p>
            <br className="mob"/>
            <span>Instagram</span>
            <h4>idhair_hello</h4>
          </div>
          <a download href="/file/idhair_resume.hwp" className="rs_nav_2 txt-ac">입사지원서 <br className="mob"/>다운로드</a>
          <div
            className={`rs_nav_3${isNavPopupOpen ? " active" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={isNavPopupOpen}
            onClick={() => setIsNavPopupOpen((isOpen) => !isOpen)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsNavPopupOpen((isOpen) => !isOpen);
              }
            }}
          >
            자주 하는 <br className="mob"/>질문
          </div>
          <div className={`rs_nav_popup_w${isNavPopupOpen ? " show" : ""}`}>
            <div className="rs_nav_popup" data-lenis-prevent>
              <h1>자주하는 질문</h1>
              <b>면접은 어떻게 진행되나요?</b>
              <span>면접은 일반적으로 서류 심사 후 개별 연락을 통해 일정 및 장소가 조율됩니다. 면접 시에는 본인의 개성을 살릴 수 있는 복장과 자신감 있는 태도를 준비해 오시면 됩니다.</span>
              <b>매장은 어디로 배정되나요?</b>
              <span>각 매장의 필요 인원과 지원자 개인의 성향과 희망 매장을 서로 조율하여 최종 근무지가 결정됩니다. 아이디헤어에서는 여러분이 가장 잘 성장하고 즐겁게 일할 수 있는 매장을 찾기 위해 성향 매칭 시스템을 운영 중입니다.</span>
              <b>결과는 언제쯤 알 수 있을까요?</b>
              <span>면접 후 일주일 이내 개별 통보됩니다.</span>
              <b>나이/성별 제한 있나요?</b>
              <span>아이디헤어는 미용에 열정을 가진 모든 인재를 환영합니다. (법적 근무가 가능한 만 19세 이상)</span>
              <b>기숙사를 사용할 수 있나요?</b>
              <span>아이디헤어의 대부분 매장은 기숙사를 보유 중이며, 파트너 직급의 직원들은 해당 시설을 저렴한 가격으로 이용 가능합니다.</span>
              <b>필수 자격조건이 있나요?</b>
              <span>미용사 면허증(또는 자격증) 소지자들은 디자이너/파트너 직군 근무가 가능합니다. 관리자 직군은 서비스 마인드를 가진 인재들이면 누구나 입사 지원 가능합니다.</span>
              <b>승급 기간은 얼마나 되나요?</b>
              <span>아이디 아카데미 입학 후 약 2년간의 교육을 이수하면 디자이너로 활동할 수 있는 디플로마가 수여됩니다.</span>
            </div>
            <div
              className="rs_nav_close body-s"
              role="button"
              tabIndex={0}
              onClick={() => setIsNavPopupOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setIsNavPopupOpen(false);
                }
              }}
            >
              Close
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}

export default Recruit;
