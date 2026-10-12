
import { useEffect } from "react";
import { gsap } from "gsap";
import "../styles/academy.scss";
import "../styles/academy-en.scss";

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
    <main className="page_academy page_academy--en" lang="en">
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
            <h1 className="head-l apprael_ani ls_s delay-1">An original training program,<br/>online and in person</h1>
            <span className="mg apprael_ani ls_s delay-2">
              The id STYLE WORK diploma is the hair industry’s first structured hair-technique program.
              Students earn formal certification after completing 56 hair designs over two years and four months.
            </span>
            <span className="apprael_ani ls_s delay-3">
              Our online platform, seezier, offers training in the latest salon styles.
              We also offer id skill mastery, a tailored program that develops hands-on skills in each salon.
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
                  <b>/ Style Work</b>
                  <span>
                    id HAIR’s signature haircutting system covers 56 styles tailored to hair texture, head shape and face shape. Across 14 stages over two years and four months, students progress from foundational skills to advanced applications.
                  </span>
                </div>
              </li>
              <li>
                <div className="l_t b-b">
                  <span>02</span>
                  <h1>start work</h1>
                </div>
                <div className="l_b">
                  <b>/ Start Work</b>
                  <span>
                    Before Style Work, this foundation course builds the mindset and professional skills needed in a salon. Students learn responsibility, professional conduct and how to work with clients and colleagues.
                  </span>
                </div>
              </li>
              <li>
                <div className="l_t b-b">
                  <span>03</span>
                  <h1>salon work</h1>
                </div>
                <div className="l_b">
                  <b>/ Salon Work</b>
                  <span>
                    Experienced id HAIR stylists and guest specialists share techniques and practical expertise through lectures and seminars. Sessions cover cutting, perming, coloring and other skills used in real salon work.
                  </span>
                </div>
              </li>

              <li>
                <div className="l_t b-b">
                  <span>04</span>
                  <h1>technic work</h1>
                </div>
                <div className="l_b">
                  <b>/ Technic Work</b>
                  <span>
                    Learn eight perm techniques and 16 coloring techniques commonly used in salons. Step-by-step lessons cover core principles, treatment procedures, product use and techniques for different designs.
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
              
              <h1 className="title b-b b-2 body-m fw-sb">Training that connects trends with salon experience, helping stylists grow and stay competitive.</h1>
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
                    <span>id HAIR Education Director and representative of the Ewha Womans University Station Branch</span>
                    <span>Creator and developer of id HAIR’s Style Work training program</span>
                    <span>Lead director of Korea’s largest hair shows, The Show and Super Live</span>
                    <span>First Korean representative to serve as lead director of the Midosuji Collection in Osaka, Japan</span>
                    <span>Attended Vidal Sassoon London masterclasses for 10 consecutive years between 2011 and 2022</span>
                  </li>
                  <li>
                    <span>Oversees the operation of id HAIR Academy</span>
                    <span>Plans and develops hair-design curricula</span>
                    <span>Plans and manages in-house training and development programs for new and junior stylists</span>
                    <span>Develops educational content and practical training systems</span>
                  </li>
                  <li>
                    <span>Oversees planning, direction and operation of id HAIR seminars and hair shows</span>
                    <span>Contributed to the development of Style Work</span>
                    <span>Develops and manages id HAIR Academy’s operating systems</span>
                    <span>Participated in directing the Asia Beauty Expo in Osaka in 2018 and 2025</span>
                    <span>Lead stage stylist at The Show hair show in 2018</span>
                  </li>
                  <li>
                    <span>Teaches Style Work haircutting courses</span>
                    <span>Strengthens salon partners’ foundational skills and practical techniques</span>
                    <span>Runs haircutting programs and supports salon partners’ professional growth</span>
                  </li>
                  <li>
                    <span>Core-team instructor and academy operations manager at Osong Academy</span>
                    <span>Provides communication and training support for salons outside Seoul and Gyeonggi</span>
                    <span>Teaches the full Style Work curriculum at Hongdae and Osong Academies</span>
                    <span>Runs practical training on minimizing client complaints</span>
                  </li>
                  <li>
                    <span>Teaches Style Work haircutting techniques and design</span>
                    <span>Plans and manages training programs for salon partners and stylists</span>
                    <span>Creates and manages SEEZIER online academy content</span>
                    <span>Plans and runs stylist education, including Salon Work and seminars</span>
                    <span>Department of Beauty Education, Graduate School of Education, Konkuk University</span>
                  </li>
                  <li>
                    <span>Teaches women’s layered-perm and haircutting techniques and design in Style Work</span>
                    <span>Supports salon partners’ skills and professional growth</span>
                    <span>Current core-team instructor at id HAIR Academy</span>
                    <span>Conducts overseas perm seminars and training for international influencers</span>
                    <span>Former head stylist at id HAIR and salon manager at a Korean hair salon in Chengdu, China</span>
                  </li>

                </ul>
              </div>
              
            </div>
            <ul className="right">
              <li>
                <h4 className="body-l fw-b">Head of id Academy</h4>
                <span className="head-l">Ahn Jeong-jun</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Director</h4>
                <span className="head-l">Lee Eun-hye</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Main Instructor</h4>
                <span className="head-l">Yoon Hun-hee</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">Jin Yeong-jun</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">Choi Yeon-seung</span>
              </li>

              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">Lee Seol-a</span>
              </li>
              <li>
                <h4 className="body-l fw-b">id Academy Instructor</h4>
                <span className="head-l">Jane</span>
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
                <div className="top"><h4 className="body-l">Lee Yu-na</h4><span className="caption-m txt-gray">Gwacheon Branch</span></div>
                <div className="bottom body-s">
                  I enjoyed learning step by step from the basics. Creating a variety of designs helped me develop different techniques. Thank you!
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_2.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Yang Ji-won</h4><span className="caption-m txt-gray">Gwanggyo Jungang Branch</span></div>
                <div className="bottom body-s">
                  Each academy session introduced a different instructor’s approach to haircutting. I loved being able to learn such a wide range of techniques.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_3.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Kim Hye-mi</h4><span className="caption-m txt-gray">Dongtan Mokdong Branch</span></div>
                <div className="bottom body-s">
                  
                  The course reminded me how important the fundamentals are. Being able to try what I learned on a friend’s hair made the experience even more meaningful.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_4.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Hwang Eun-seol</h4><span className="caption-m txt-gray">Olympic Dunchon Branch</span></div>
                <div className="bottom body-s">
                  The well-structured course was easy to follow, and I appreciated the attention to detail. The instructors shared plenty of practical tips I could use in the salon right away.
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_5.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Kim Jun-woo</h4><span className="caption-m txt-gray">Yongin Suji Branch</span></div>
                <div className="bottom body-s">
                  Academy training helped me build stronger fundamentals. I also learned many techniques and practical tips I could apply to my work immediately!
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_6.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Lee Chae-won</h4><span className="caption-m txt-gray">One Mount Branch</span></div>
                <div className="bottom body-s">
                  The instructors’ thoughtful, detailed guidance made the lessons easy to understand, even for beginners. Learning both haircutting fundamentals and the latest hair trends made the course engaging and rewarding. ✨
                </div>
              </div>
            </li>
            <li>
              <img src="/img/ac_3_7.png" alt="" />
              <div className="txt_w">
                <div className="edge_w"><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/><img src="/img/edge.svg"/></div>
                <div className="top"><h4 className="body-l">Kim Yeon-ji</h4><span className="caption-m txt-gray">Jichuk Branch</span></div>
                <div className="bottom body-s">
                  I learned in a structured way, from the basics to practical salon skills. Meeting salon owners and managers also gave me a valuable opportunity to reflect on my attitude and direction as a hair professional. ✨
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="mob_caption mob txt-gray">Tap a person to read their story =)</div>
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
