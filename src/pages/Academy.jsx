
import { useEffect } from "react";
import { gsap } from "gsap";
import "../styles/academy.scss";

function Academy() {
  useEffect(() => {
    const section = document.querySelector(".page_academy .ac_1");
    const videoGrowthTrack = section?.querySelector(".ac_1_bg_height");
    const videoWrap = section?.querySelector(".video_w");
    const academyViewport = section?.querySelector(".ac_1_wrap");
    const workSection = section?.querySelector(".ac_1_3");
    const workImages = workSection ? [...workSection.querySelectorAll(".left img")] : [];
    const workItems = workSection ? [...workSection.querySelectorAll(".right li")] : [];
    const workList = workSection?.querySelector(".right");
    const workVisual = workSection?.querySelector(".left");
    const teamSection = document.querySelector(".page_academy .ac_2");
    const teamImageWrap = teamSection?.querySelector(".img_w");
    const teamCounter = teamImageWrap?.querySelector(".number_count");
    const teamCounterNumber = teamCounter?.querySelector("b");
    const teamImages = teamImageWrap
      ? [...teamImageWrap.querySelectorAll(".img img")]
      : [];
    const teamDetailItems = teamImageWrap
      ? [...teamImageWrap.querySelectorAll(":scope > ul > li")]
      : [];
    const teamList = teamSection?.querySelector(".right");
    const teamItems = teamList ? [...teamList.querySelectorAll("li")] : [];
    const teamFlexWrap = teamSection?.querySelector(".flex_w");
    const teamFlex = teamFlexWrap?.querySelector(".flex");
    const extendBorder = teamFlex?.querySelector(".extend-border");
    const academyOutro = document.querySelector(".page_academy .ac_3");
    const backgroundChecker = academyOutro?.querySelector(".bg_checker");
    const sectionNameItems = [
      ...document.querySelectorAll(".page_academy .section_name li"),
    ];
    const sectionNameSpans = sectionNameItems.map((item) => [
      ...item.querySelectorAll("span"),
    ]);
    const allSectionNameSpans = sectionNameSpans.flat();
    const sectionNameTriggers = [
      section.querySelector(".ac_1_2 article"),
      section.querySelector(".ac_1_3"),
      teamSection,
      academyOutro?.querySelector(".img_map"),
    ];

    if (!section || !videoGrowthTrack || !videoWrap) return undefined;

    let frameId = null;
    let activeSectionNameIndex = -1;

    // Layout coordinates stay independent of browser toolbar/visual viewport changes.
    const getLayoutOffset = (element) => {
      let top = 0;
      let left = 0;
      for (let node = element; node; node = node.offsetParent) {
        top += node.offsetTop;
        left += node.offsetLeft;
      }
      return { top, left };
    };

    gsap.set(allSectionNameSpans, {
      y: 20,
      autoAlpha: 0,
      rotationX: -90,
      transformOrigin: "50% 50%",
      transformPerspective: 500,
    });

    const updateVideoClip = () => {
      frameId = null;

      const growthRect = videoGrowthTrack.getBoundingClientRect();
      const viewportHeight = academyViewport?.offsetHeight || window.innerHeight;
      const videoViewportHeight = videoWrap.offsetHeight || viewportHeight;
      const growthRange = Math.max(1, growthRect.height - viewportHeight);
      const progress = Math.min(1, Math.max(0, -growthRect.top / growthRange));
      const remaining = 1 - progress;
      const viewportWidth = window.innerWidth;
      const isMobileLayout = viewportWidth <= 1024;
      const videoTop = isMobileLayout
        ? Number.parseFloat(getComputedStyle(videoWrap).top) || 0
        : 0;
      const sectionOffset = getLayoutOffset(section);
      const titleOffset = getLayoutOffset(academyViewport.querySelector(".title"));
      const titleOffsetTop = titleOffset.top - sectionOffset.top;
      const initialWidth = isMobileLayout
        ? 120
        : videoViewportHeight * 0.53333;
      const initialHeight = isMobileLayout
        ? 240
        : videoViewportHeight * 0.53333;
      const initialTop = isMobileLayout
        ? titleOffsetTop + 53 - videoTop
        : videoViewportHeight * 0.352;
      const initialSide = Math.max(0, (viewportWidth - initialWidth) / 2);
      const initialBottom = Math.max(0, videoViewportHeight - initialTop - initialHeight);
      const videoTravel = Math.max(0, section.offsetHeight - videoViewportHeight - videoTop);
      const videoTravelProgress = videoTravel > 0
        ? Math.min(1, Math.max(0, (window.scrollY - sectionOffset.top) / videoTravel))
        : 0;
      const videoTravelRatio = videoTravel / videoViewportHeight;
      const videoYRatio = videoTravelRatio * videoTravelProgress;

      videoWrap.style.setProperty("--ac-video-clip-top", `${initialTop / videoViewportHeight * remaining * 100}%`);
      videoWrap.style.setProperty("--ac-video-clip-side", `${initialSide * remaining}px`);
      videoWrap.style.setProperty("--ac-video-clip-bottom", `${initialBottom / videoViewportHeight * remaining * 100}%`);
      // Mobile positioning is handled by sticky, not scroll-event transforms.
      videoWrap.style.setProperty("--ac-video-y", isMobileLayout ? "0px" : `${videoYRatio * 100}%`);
      videoWrap.style.setProperty("--ac-video-width", `${viewportWidth}px`);
      videoWrap.style.setProperty("--ac-video-overlay-opacity", String(progress));
      // Release the mobile reveal mask entirely once the oversized video is open.
      if (isMobileLayout && progress >= 1) {
        videoWrap.style.clipPath = "none";
      } else {
        videoWrap.style.removeProperty("clip-path");
      }

      if (workSection && workItems.length) {
        const workRect = workSection.getBoundingClientRect();
        const workRange = Math.max(1, workRect.height - viewportHeight);
        const workProgress = Math.min(1, Math.max(0, -workRect.top / workRange));
        const workPosition = Math.min(
          workItems.length - 1,
          workProgress * workItems.length,
        );
        const activeIndex = Math.round(workPosition);
        const visualHeight = workVisual?.getBoundingClientRect().height || 0;
        const titleHeight = workItems[0]?.querySelector(".l_t")?.getBoundingClientRect().height || 0;
        const itemStyle = getComputedStyle(workItems[0]);
        const itemPaddingBlock =
          (Number.parseFloat(itemStyle.paddingTop) || 0)
          + (Number.parseFloat(itemStyle.paddingBottom) || 0);
        const itemStep = titleHeight + itemPaddingBlock;
        const expandedItemHeight = Math.max(
          ...workItems.map((item) => item.scrollHeight),
        );
        const listHeight = Math.max(
          visualHeight,
          expandedItemHeight + (workItems.length - 1) * itemStep,
        );

        if (workList) {
          const listOffsetY = Math.max(0, (listHeight - visualHeight) / 2);

          workList.style.height = `${listHeight}px`;
          workList.style.transform = `translate3d(0, ${listOffsetY}px, 0)`;
        }

        workItems.forEach((item, index) => {
          const revealProgress = index === 0
            ? 1
            : Math.min(1, Math.max(0, workPosition - (index - 1)));
          const pendingItemCount = workItems.length - index;
          const collapsedY = index === 0
            ? 0
            : Math.max(
              0,
              listHeight
                - pendingItemCount * itemStep,
            );
          const expandedY = index * titleHeight;
          const itemY = collapsedY + (expandedY - collapsedY) * revealProgress;

          item.classList.toggle("active", index === activeIndex);
          item.style.setProperty("--work-item-y", `${itemY}px`);
          item.style.zIndex = String(index + 1);
        });

        workImages.forEach((image, index) => {
          const revealProgress = index === 0
            ? 1
            : Math.min(1, Math.max(0, workPosition - (index - 1)));
          const topInset = (1 - revealProgress) * 100;

          image.classList.toggle("active", index === activeIndex);
          image.style.opacity = "1";
          image.style.zIndex = String(index + 1);
          image.style.willChange = "clip-path";
          image.style.clipPath = `inset(${topInset}% 0% 0% 0%)`;
        });
      }

      if (teamSection && teamImageWrap && teamCounter && teamItems.length) {
        const teamRect = teamSection.getBoundingClientRect();
        const teamRange = Math.max(1, teamRect.height - viewportHeight);
        const teamProgress = Math.min(1, Math.max(0, -teamRect.top / teamRange));
        const titleProgress = Math.min(1, teamProgress / 0.9);
        const teamPosition = titleProgress * teamItems.length;
        const activeTeamIndex = Math.min(
          teamItems.length - 1,
          Math.floor(teamPosition),
        );
        const listRect = teamList.getBoundingClientRect();
        const totalItemHeight = teamItems.reduce((height, item) => {
          const itemStyle = getComputedStyle(item);

          return height
            + item.offsetHeight
            + (Number.parseFloat(itemStyle.marginTop) || 0)
            + (Number.parseFloat(itemStyle.marginBottom) || 0);
        }, 0);
        const titleTravel = Math.max(0, listRect.height - totalItemHeight);
        const counterTravel = Math.max(
          0,
          teamImageWrap.clientHeight - teamCounter.offsetHeight,
        );

        teamItems.forEach((item, index) => {
          const itemProgress = Math.min(1, Math.max(0, teamPosition - index));

          item.classList.toggle("active", index === activeTeamIndex);
          item.style.transform = `translate3d(0, ${-titleTravel * itemProgress}px, 0)`;
        });

        teamDetailItems.forEach((item, index) => {
          item.classList.toggle("active", index === activeTeamIndex);
        });

        teamImages.forEach((image, index) => {
          const revealProgress = index === 0
            ? 1
            : Math.min(1, Math.max(0, teamPosition - (index - 1)));
          const topInset = (1 - revealProgress) * 100;

          image.classList.toggle("active", index === activeTeamIndex);
          image.style.zIndex = String(index + 1);
          image.style.willChange = "clip-path";
          image.style.clipPath = `inset(${topInset}% 0% 0% 0%)`;
        });

        teamCounter.style.transform = `translate3d(0, ${counterTravel * teamProgress}px, 0)`;

        if (teamCounterNumber) {
          teamCounterNumber.textContent = String(activeTeamIndex + 1).padStart(2, "0");
        }
      }

      if (teamSection && teamFlexWrap && teamFlex && extendBorder) {
        const teamRect = teamSection.getBoundingClientRect();
        const flexWrapRect = teamFlexWrap.getBoundingClientRect();
        const extensionRange = Math.max(0, teamRect.height - flexWrapRect.height);
        const extension = Math.min(
          extensionRange,
          Math.max(0, teamFlex.offsetHeight - flexWrapRect.bottom),
        );

        extendBorder.style.setProperty(
          "--extend-border-extra",
          `${extension}px`,
        );
      }

      if (academyOutro && backgroundChecker) {
        const checkerRect = backgroundChecker.getBoundingClientRect();
        const backgroundProgress = Math.min(
          1,
          Math.max(0, (viewportHeight - checkerRect.top) / viewportHeight),
        );

        const backgroundColor = `rgb(237 237 237 / ${backgroundProgress * 100}%)`;

        academyOutro.style.backgroundColor = backgroundColor;
        teamSection?.style.setProperty("background-color", backgroundColor);
      }

      if (sectionNameItems.length) {
        const nextSectionNameIndex = sectionNameTriggers.reduce(
          (activeIndex, trigger, index) => (
            trigger && trigger.getBoundingClientRect().top <= viewportHeight * 0.5
              ? index
              : activeIndex
          ),
          -1,
        );

        if (nextSectionNameIndex !== activeSectionNameIndex) {
          const previousItem = sectionNameItems[activeSectionNameIndex];
          const nextItem = sectionNameItems[nextSectionNameIndex];
          const previousSpans = sectionNameSpans[activeSectionNameIndex];
          const nextSpans = sectionNameSpans[nextSectionNameIndex];

          if (previousItem) {
            gsap.killTweensOf(previousSpans);
            previousItem.classList.remove("active");
            gsap.to(previousSpans, {
              y: -20,
              autoAlpha: 0,
              rotationX: 90,
              duration: 0.4,
              ease: "power2.out",
              overwrite: true,
            });
          }

          if (nextItem) {
            gsap.killTweensOf(nextSpans);
            nextItem.classList.add("active");
            gsap.fromTo(
              nextSpans,
              { y: 20, autoAlpha: 0, rotationX: -90 },
              {
                y: 0,
                autoAlpha: 1,
                rotationX: 0,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true,
              },
            );
          }

          activeSectionNameIndex = nextSectionNameIndex;
        }
      }
    };

    const requestClipUpdate = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateVideoClip);
    };

    updateVideoClip();
    window.addEventListener("scroll", requestClipUpdate, { passive: true });
    window.addEventListener("touchmove", requestClipUpdate, { passive: true });
    window.addEventListener("touchend", requestClipUpdate, { passive: true });
    window.addEventListener("resize", requestClipUpdate);
    window.visualViewport?.addEventListener("resize", requestClipUpdate);

    return () => {
      window.removeEventListener("scroll", requestClipUpdate);
      window.removeEventListener("touchmove", requestClipUpdate);
      window.removeEventListener("touchend", requestClipUpdate);
      window.removeEventListener("resize", requestClipUpdate);
      window.visualViewport?.removeEventListener("resize", requestClipUpdate);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      gsap.killTweensOf(allSectionNameSpans);
    };
  }, []);

  return (
    <main className="page_academy">
      <section className="ac_1 bg-gray-1">
        <div className="ac_1_bg_height"></div>
        <div className="ac_video_track">
          <div className="video_w">
            <video src="/video/academy_1.mp4" autoPlay muted loop playsInline preload="auto" />
          </div>
        </div>
        <div className="ac_1_wrap ani">
          <div className="title b-t b-4">
            <div className="b-b"></div>
            <div className="display-l apprael title_txt apprael_ani">ID ACADEMY</div>
            
          </div>
          <div className="scroll">
            <div className="body-s scroll_left">[ SCROLL ]</div>
            <div className="body-s scroll_right">[ SCROLL ]</div>
          </div>
          <div className="title_b txt-ac apprael_ani delay-2">
            <span>Meet</span>
            <div className="cross"></div>
            <span>The</span>
            <div className="cross"></div>
            <span>Experts</span>
          </div>
        </div>
        <div className="ac_1_2">
          <article className="body-m txt-white ani">
            <h1 className="head-l apprael_ani ls_s delay-1">온/오프라인을<br/>아우르는 독자적 교육 프로그램</h1>
            <span className="mg apprael_ani ls_s delay-2">
              id STYLE WORK 디플로마는 2년 4개월간 <br className="mob"/>총 56개의 헤어 작품을 이수하면<br className="pc"/>
              정식 자격을 부여하는 <br className="mob"/>미용업계 최초의 체계적 헤어 기술 프로그램입니다.
            </span>
            <span className="apprael_ani ls_s delay-3">
              온라인 플랫폼 &lt;seezier&gt;를 통해 최신 살롱 스타일까지 <br className="mob"/>학습할 수 있으며,<br className="pc"/>
              각 매장에서 현장 실전 감각을 익히는 맞춤형 <br className="mob"/>과정인 id skill mastery까지 함께 제공됩니다.
            </span>
          </article>
        </div>
        <div className="ac_1_3">
          <div className="flex">
            <div className="left">
              <img src="/img/ac_1_3_1.jpg"/>
              <img src="/img/ac_1_3_2.jpg"/>
              <img src="/img/ac_1_3_3.jpg"/>
              <img src="/img/ac_1_3_4.jpg"/>
            </div>
            <ul className="right">
              <li>
                <div className="l_t b-b">
                  <span>01</span>
                  <h1>style work</h1>
                </div>
                <div className="l_b">
                  <b>/    스타일 워크</b>
                  <span>
                    id HAIR만의 커트 교육 시스템으로, 모질·두상·얼굴형에 따른 총 56가지 커트 스타일을 14단계, 2년 4개월의 과정​으로 세분화하여 기초부터 응용까지 단계적으로 트레이닝합니다.
                  </span>
                </div>
              </li>
              <li>
                <div className="l_t b-b">
                  <span>02</span>
                  <h1>start work</h1>
                </div>
                <div className="l_b">
                  <b>/    스타트 워크</b>
                  <span>
                    스타일워크에 앞서 살롱 구성원으로서 필요한 기본 자세와 책임감, 고객과 동료를 대하는 태도를 배우며 미용인으로서의 기본 소양과 마인드를 갖추는 기초 교육 과정입니다.
                  </span>
                </div>
              </li>
              <li>
                <div className="l_t b-b">
                  <span>03</span>
                  <h1>salon work</h1>
                </div>
                <div className="l_b">
                  <b>/    살롱 워크</b>
                  <span>
                    id HAIR 내부에서 풍부한 현장 경험과 노하우를 가진 디자이너와 다양한 분야의 외부 전문 디자이너를 초청하여, 실제 살롱에서 직접 활용하고 있는 커트·펌·염색 등 다양한 테크닉과 시술 노하우를 강의 또는 세미나 형태로 공유합니다.
                  </span>
                </div>
              </li>

              <li>
                <div className="l_t b-b">
                  <span>04</span>
                  <h1>technic work</h1>
                </div>
                <div className="l_b">
                  <b>/    테크닉 워크</b>
                  <span>
                    펌과 염색을 중심으로 살롱에서 자주 활용되는 8가지 펌 테크닉과 16가지 염색 테크닉 강의를 통해 기본 원리부터 시술 과정, 약제 활용, 디자인별 테크닉까지 단계적으로 학습합니다.
                  </span>
                </div>
              </li>
            </ul>
          </div>
          
        </div>
        
      </section>

      <section className="ac_2 ">
        
        <div className="flex_w">
          <div className="flex ani">
            <div className="b-l b-delay-6 extend-border"></div>
            
            <div className="left">
              
              <h1 className="title b-b b-2 body-m fw-sb">트렌드와 현장 경험을 연결한 교육을 통해<br/>디자이너의 성장과 경쟁력을 함께 완성합니다.</h1>
              <div className="img_w">
                <div className="number_count"><b>01</b><span>/ 07</span></div>
                <div className="img">
                  <img src="/img/ac_2_1.jpg"/>
                  <img src="/img/ac_2_1.jpg"/>
                  <img src="/img/ac_2_2.jpg"/>
                  <img src="/img/ac_2_3.jpg"/>
                  <img src="/img/ac_2_4.jpg"/>
                  <img src="/img/ac_2_5.jpg"/>
                  <img src="/img/ac_2_6.jpg"/>
                  <img src="/img/ac_2_7.jpg"/>
                </div>
                <ul>
                  <li>
                    <span>id HAIR 교육총괄이사</span>
                    <span>아이디헤어 교육프로그램 ‘스타일워크’ 기획·개발 및 창시</span>
                    <span>대한민국 최대 헤어쇼 ‘The Show’ / ‘Super Live’ 메인 디렉터</span>
                    <span>일본 오사카 ‘미도스지 컬렉션’ 대한민국 최초 대표 메인 디렉터</span>
                    <span>2011~2022년 비달사순 런던 마스터클래스 10년 연속 참가</span>
                  </li>
                  <li>
                    <span>id HAIR Academy 총괄 운영</span>
                    <span>헤어 디자인 커리큘럼 기획 및 개발</span>
                    <span>사내 교육 / 신입·주니어 디자이너 육성 프로그램 기획 및 운영</span>
                    <span>교육 콘텐츠 및 실무 교육 시스템 구축</span>
                  </li>
                  <li>
                    <span>id HAIR 세미나 및 헤어쇼 관련 기획·연출·운영 총괄</span>
                    <span>스타일워크 개발 참여</span>
                    <span>id HAIR Academy 운영 시스템 개발 및 운영</span>
                    <span>2025년, 2018년 OSAKA 아시아 뷰티 엑스포 연출 참여</span>
                    <span>2018년 「THE SHOW」 헤어쇼 무대 메인 디자이너 참여</span>
                  </li>
                  <li>
                    <span>스타일워크 커트 교육 담당</span>
                    <span>파트너 기본기 및 실무 테크닉 역량 강화 교육</span>
                    <span>커트 교육 프로그램 운영 및 파트너 성장 지원</span>
                  </li>
                  <li>
                    <span>오송 아카데미 코어팀 강사 및 아카데미 운영·관리</span>
                    <span>서울·경기권 외 지역 매장 커뮤니케이션 및 교육 지원</span>
                    <span>홍대·오송 아카데미 스타일워크 전 작품 강의</span>
                    <span>컴플레인 최소화 노하우 교육 운영</span>
                  </li>
                  <li>
                    <span>스타일워크 커트 기술 및 디자인 교육 담당</span>
                    <span>파트너 및 디자이너 교육 프로그램 기획·운영</span>
                    <span>SEEZIER 온라인 아카데미 콘텐츠 제작 및 운영</span>
                    <span>살롱워크·세미나 등 디자이너 교육 프로그램 기획 및 운영</span>
                    <span>건국대학교 교육대학원 미용교육학과</span>
                  </li>
                  <li>
                    <span>스타일워크 여성 레이어드펌·커트 테크닉 및 디자인 교육</span>
                    <span>파트너 역량 및 성장 지원</span>
                    <span>현 id HAIR 아카데미 코어팀 강사</span>
                    <span>해외 펌 세미나 교육 및 해외 인플루언서 교육 진행</span>
                    <span>전 id HAIR 수석실장 및 중국 청두 한국계 헤어살롱 실장</span>
                  </li>

                </ul>
              </div>
              
            </div>
            <ul className="right">
              <li>
                <h4 className="body-l fw-b">Head of id Academy</h4>
                <span className="head-l">안정준 이사</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Director</h4>
                <span className="head-l">이은혜 교장</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Main Instructor</h4>
                <span className="head-l">윤훈희 교감</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">진영준 강사</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">최연승 강사</span>
              </li>

              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">이설아 강사</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">제인 강사</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="ac_2_b_ani b-b ani b-delay-8"><div></div><div></div></div>
      </section>
      <section className="ac_3">
        <div className="bg_checker"></div>
        <div className="img_map">
          <h1 className="display-l apprael">ID STYLE <br className="mob"/>WORK</h1>
          <ul className="img_w">
            <li>
              <img src="/img/ac_3_1.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">이 유 나&nbsp;<p className="body-s"> 님</p></h4><span className="caption-m txt-gray">과천점</span></div>
                <div className="bottom body-s">
                  기초부터 차근차근 배울 수 있어 좋았고, <br/>
                  다양한 작품을 만들며 여러 기술을 익힐 수 있었습니다.<br/>
                  감사합니다.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_2.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l"> 양 지 원&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">광교중앙점</span></div>
                <div className="bottom body-s">
                  아카데미 교육을 들으면서 회차마다 각 선생님들마다<br/> 
                  다른 스타일의 컷트교육을 해주셔서 다양한 기술을<br/> 
                  배울 수 있어서 좋았습니다.                 
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_3.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">김 혜 미&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">동탄목동점</span></div>
                <div className="bottom body-s">
                  
                  기본기의 중요성을 다시 한번 느낄 수 있었고,<br/>
                  배운 내용을 실제로 친구 머리에 적용해 볼 수 있어 <br/>
                  더욱 뜻깊은 교육이었습니다.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_4.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">황 은 설&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">올림픽둔촌점</span></div>
                <div className="bottom body-s">
                  교육이 체계적으로 구성되어 있어서 이해하기 쉬웠고,<br/>
                  디테일한 부분까지 꼼꼼하게 배울 수 있어 좋았습니다.<br/>
                  살롱에서 바로 적용할 수 있는 실전 노하우를 많이<br/>
                  알려주셔서 도움이 많이 됐습니다.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_5.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">김 준 우&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">용인수지점</span></div>
                <div className="bottom body-s">
                  아카데미 교육을 통해 기본기를 더욱 탄탄하게 다질 수 있었고<br/>
                  실무에 바로 적용할 수 있는 기술과 노하우들을 많이 배웠습니다!
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_6.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">이 채 원&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">원마운트</span></div>
                <div className="bottom body-s">
                  강사님들의 꼼꼼하고 세심한 지도 덕분에<br/>
                  처음 배우는 사람도 쉽게 이해할 수 있었으며,<br/>
                  커트의 기본기와 최신 헤어 트렌드까지 함께 배울 수 있어<br/>
                  더욱 흥미롭고 유익한 교육이었습니다. ✨
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_7.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">김 연 지&nbsp; <p className="body-s"> 님</p></h4><span className="caption-m txt-gray">지축점</span></div>
                <div className="bottom body-s">
                  기본기부터 실무 기술까지 체계적으로 배울 수 있었으며,<br/>
                  다양한 원장님과 점장님을 만나 미용인으로서의 자세와<br/>
                  방향성을 되돌아볼 수 있는 뜻깊은 교육이었습니다. ✨
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="mob_caption mob txt-gray">인물을 터치해 주세요 &#61;&#41;</div>
      </section>
      <div className="section_name head-l fw-sb">
        <ul>
          <li className="sn_1"><span>About Academy</span><span>About Academy</span></li>
          <li className="sn_2"><span>Curriculum</span><span>Curriculum</span></li>
          <li className="sn_3"><span>Instructor</span><span>Instructor</span></li>
          <li className="sn_4"><span>Case Study</span><span>Case Study</span></li>
          </ul>
      </div>
      
    </main>

  );
}

export default Academy;
