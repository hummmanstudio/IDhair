import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/recruit.scss";
import "../styles/recruit-en.scss";

gsap.registerPlugin(ScrollTrigger);

const recruitGridImages = Array.from(
  { length: 12 },
  (_, index) => `/img/rs_grid_${(index % 9) + 1}.jpg`,
);

function Recruit() {
  const [isNavPopupOpen, setIsNavPopupOpen] = useState(false);
  const pageRef = useRef(null);
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
    // Preserve the compact landscape layout while expressing text sizing in vw.
    const updateValueDescriptionSize = () => {
      pageRef.current?.style.setProperty(
        "--recruit-wide-description-size",
        `${1.6668 * window.innerHeight / window.innerWidth}vw`,
      );
    };
    updateValueDescriptionSize();
    window.addEventListener("resize", updateValueDescriptionSize);
    return () => window.removeEventListener("resize", updateValueDescriptionSize);
  }, []);

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
    <main ref={pageRef} className="page_recruit page_recruit--en" lang="en">
      <section className="rs_head ani">
        <div className="body-s scroll apprael_ani ls_s mob">[ SCROLL ]</div>
        <div className="rs_progress" ref={progressTrackRef}></div>
        <div className="rc_title b-t b-2">
          <h1 className="display-l apprael  apprael_all apprael_ani" >RECRUIT</h1>
          <div className="b-b b-delay-0"></div>
          <div className="body-s scroll apprael_ani ls_s pc">[ SCROLL ]</div>
        </div>
        <div className="middle ani">
          <span className="body-l fw-sb apprael_ani ls_s">We are looking for talented people to grow with id HAIR.</span>
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
              <h1 className="display-m">MY idENTITY  MY id HAIR  </h1>
              <h1 className="display-m">MY idENTITY  MY id HAIR  </h1>
              <h1 className="display-m">MY idENTITY  MY id HAIR  </h1>
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
                <b className="body-s fw-sb">( Honesty )</b>
                <span className="body-s fw-r">Honest success through fair effort</span>
              </li>

              <li>
                <div className="edge_w">
                  <img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/>
                </div>
                
                <img src="/img/rs_1_2.svg" alt="" />
                
                <h1 className="display-xs gt fw-r">warmth</h1>
                <b className="body-s fw-sb">( Warmth )</b>
                <span className="body-s fw-r">A warm heart that treats everyone like family</span>
              </li>

              <li>
                <div className="edge_w">
                  <img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/><img src="/img/edge_2.svg"/>
                </div>
                <img src="/img/rs_1_3.svg" alt="" />
                <h1 className="display-xs gt fw-r">integrity</h1>
                <b className="body-s fw-sb">( Maturity )</b>
                <span className="body-s fw-r">A mature attitude that makes a positive difference</span>
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
                <span>Our longstanding 'id Familism' culture is a driving force behind id HAIR, strengthening bonds among our people and building trust with our clients.</span>
                <span>Through honest success and warmth, we create a culture of shared growth that brings happiness to our colleagues and clients.</span>
              </p>
            </div>
            <div className="rs_2_gallery">
              <ul className="rs_2_grid" ref={gridRef}>
                {recruitGridImages.map((src, index) => (
                  <li className="rs_2_grid_item" key={`${src}-${index}`}>
                    <img
                      className="rs_2_grid_image"
                      src={src}
                      alt={`id HAIR recruit ${index + 1}`}
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
          <b className="head-m fw-b apprael_ani">Our Roles</b>
          <h1 className="display-m apprael apprael_ani">Job Description</h1>
        </div>
        <ul className="rs_3_2 b-b b-dash ani b-delay-6">
          <li className="b-l apprael_ani ls_s rs_3_2_1">
            <span className="body-s">01</span>
            <h4 className="display-xs apprael">Hairstylist</h4>
            <p className="body-m">
              A collaborative partner driven by shared success, and a future star stylist in the making
            </p>
            <ul>
              <li>Masterclasses with leading stylists from id HAIR and beyond</li>
              <li>Development trips tailored to role and sales performance</li>
              <li>Special overseas training for top performers</li>
              <li>Individual coaching to help stylists grow their sales</li>
            </ul>
          </li>

          <li className="b-l b-delay-2 apprael_ani ls_s delay-2 rs_3_2_2">
            <span className="body-s">02</span>
            <h4 className="display-xs apprael">Administrator</h4>
            <p className="body-m">
              A leader who manages salon operations and guides colleagues toward success
            </p>
            <ul>
              <li>Management and leadership training with internal and external experts</li>
              <li>Mentoring and coaching training</li>
              <li>Participation in company-wide management meetings</li>
            </ul>
          </li>

          <li className="b-l b-delay-4 apprael_ani ls_s delay-4 rs_3_2_3">
            <span className="body-s">03</span>
            <h4 className="display-xs apprael">Partner</h4>
            <p className="body-m">
              Future Star Stylist: a partner in shared success, training to become a hairstylist
            </p>
            <ul>
              <li>In-house academy</li>
              <li>Dormitories at all salons</li>
              <li>A dedicated mentor when you join</li>
              <li>A variety of team event days</li>
              <li>Style Work training that develops outstanding technical skills</li>
            </ul>
          </li>
          

        </ul>
        <div className="b-b b-dash b-delay-4 process_w ani">
          <div className="left apprael_ani ls_s">
            <span className="body-s">( Recruitment )</span>
            <h1 className="apprael display-xs">Hiring Process</h1>
            <p className="body-m">Open Year-Round</p>
          </div>
          <div className="right">
            <ol>
              <li>
                <h4 className="apprael display-xs">01</h4>
                <span className="body-m fw-sb">Download the application form from our website</span>
              </li>

              <li>
                <h4 className="apprael display-xs">02</h4>
                <span className="body-m fw-sb">Complete the application form</span>
              </li>

              <li>
                <h4 className="apprael display-xs">03</h4>
                <span className="body-m fw-sb">Submit your application by email</span>
              </li>

              <li>
                <h4 className="apprael display-xs">04</h4>
                <span className="body-m fw-sb">Successful applicants are contacted by phone after the interview</span>
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
          <a download href="/file/idhair_resume.hwp" className="rs_nav_2 txt-ac">Download <br className="mob"/>Application Form</a>
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
            FAQ
          </div>
          <div className={`rs_nav_popup_w${isNavPopupOpen ? " show" : ""}`}>
            <div className="rs_nav_popup" data-lenis-prevent>
              <h1>Frequently Asked Questions</h1>
              <b>How are interviews conducted?</b>
              <span>After reviewing your application, we usually contact you individually to arrange the interview time and location. Wear an outfit that expresses your personality and bring a confident attitude.</span>
              <b>Which salon will I be assigned to?</b>
              <span>Your placement is decided by considering each salon’s staffing needs, your personal qualities and your preferred location. id HAIR uses a matching system to help you find a salon where you can grow and enjoy your work.</span>
              <b>When will I hear the result?</b>
              <span>You will be notified individually within one week of your interview.</span>
              <b>Are there any age or gender restrictions?</b>
              <span>id HAIR welcomes everyone with a passion for hair and beauty. Applicants must be aged 19 or older and legally eligible to work.</span>
              <b>Can I use a dormitory?</b>
              <span>Most id HAIR salons have dormitories, which employees in Partner roles can use at an affordable rate.</span>
              <b>What qualifications are required?</b>
              <span>Applicants with a hairdressing license or qualification can work in Hairstylist or Partner roles. Anyone with a service-oriented mindset may apply for an Administrator role.</span>
              <b>How long does it take to become a Hairstylist?</b>
              <span>After completing approximately two years of training at id Academy, you receive a diploma that qualifies you to work as a Hairstylist.</span>
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
