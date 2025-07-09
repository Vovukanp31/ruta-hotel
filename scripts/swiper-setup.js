document.addEventListener("DOMContentLoaded", () => {
  const swiperInstances = [];

  function fixAriaRoles() {
    document
      .querySelectorAll('.swiper-wrapper[role="list"]')
      .forEach((wrapper) => {
        wrapper
          .querySelectorAll('.swiper-slide[role="group"]')
          .forEach((slide) => {
            slide.setAttribute("role", "listitem");
          });
      });
  }

  function initCustomSwiper(selector, options = {}) {
    document.querySelectorAll(selector).forEach((swiperEl, index) => {
      const slides = swiperEl.querySelectorAll(".swiper-slide");
      if (slides.length === 0) return;

      const parent = swiperEl.closest(".swiper-slider");
      const nextBtns = parent?.querySelectorAll(".slider-button-right") || [];
      const prevBtns = parent?.querySelectorAll(".slider-button-left") || [];
      if (!parent || nextBtns.length === 0 || prevBtns.length === 0) return;

      const uniqueClass = `${selector
        .replace(".", "")
        .replace(/[^a-zA-Z0-9_-]/g, "")}-instance-${index}`;
      swiperEl.classList.add(uniqueClass);

      const isThreePerSlide = swiperEl.classList.contains("swiper-3-per-slide");

      const customBreakpoints = isThreePerSlide
        ? {
            768: { slidesPerView: 3, slidesPerGroup: 3 },
            992: { slidesPerView: 3, slidesPerGroup: 3 },
          }
        : {};

      const optionBreakpoints = options.breakpoints || {};

      const mergedBreakpoints = Object.keys({
        ...customBreakpoints,
        ...optionBreakpoints,
      }).reduce((acc, key) => {
        acc[key] = {
          ...(customBreakpoints[key] || {}),
          ...(optionBreakpoints[key] || {}),
        };
        return acc;
      }, {});

      const swiper = new Swiper(`.${uniqueClass}`, {
        ...options,
        breakpoints: mergedBreakpoints,
      });

      nextBtns.forEach((btn) =>
        btn.addEventListener("click", () => swiper.slideNext())
      );
      prevBtns.forEach((btn) =>
        btn.addEventListener("click", () => swiper.slidePrev())
      );

      swiperInstances.push({ swiper, swiperEl });

      swiper.on("init", () => updateNavState(swiper, nextBtns, prevBtns));
      swiper.on("slideChange", () =>
        updateNavState(swiper, nextBtns, prevBtns)
      );

      fixAriaRoles();
      updateNavState(swiper, nextBtns, prevBtns);
    });
  }

  function updateNavState(swiper, nextBtns, prevBtns) {
    const { isEnd, isBeginning } = swiper;

    const toggleButtonState = (btn, state) =>
      btn.classList[state ? "add" : "remove"]("disabled");

    nextBtns.forEach((btn) => toggleButtonState(btn, isEnd));
    prevBtns.forEach((btn) => toggleButtonState(btn, isBeginning));
  }

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function applyCardStackEffect(swiper) {
    const slides = swiper.slides;
    const activeIndex = swiper.activeIndex;
    const maxOffset = 2;

    requestAnimationFrame(() => {
      const transitionStyle =
        "transform 0.5s ease, opacity 0.5s ease, z-index 0.5s ease";

      slides.forEach((slide, index) => {
        const rawOffset = index - activeIndex;
        const absOffset = Math.max(0, rawOffset);

        if (rawOffset < 0 || absOffset > maxOffset) {
          Object.assign(slide.style, {
            opacity: "0",
            transform: "scale(0.8)",
            zIndex: "0",
            pointerEvents: "none",
            transition: transitionStyle,
          });
        } else {
          const scale = 1 - absOffset * 0.2;
          const zIndex = 10 - absOffset;
          const translateX = rawOffset * 50;

          Object.assign(slide.style, {
            opacity: "1",
            pointerEvents: "auto",
            zIndex: zIndex,
            transform: `translateX(${translateX}px) scale(${scale})`,
            transition: transitionStyle,
          });
        }
      });
    });
  }

  function applyMobileCardScaleEffect(swiper) {
    const slides = swiper.slides;
    const activeIndex = swiper.activeIndex;
    const transitionStyle = "transform 0.3s ease, opacity 0.3s ease";

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      Object.assign(slide.style, {
        transform: `scale(${isActive ? 1.1 : 0.9})`,
        opacity: "1",
        zIndex: isActive ? 2 : 1,
        pointerEvents: "auto",
        transition: transitionStyle,
      });
    });
  }

  function resetCardStyles(swiper) {
    swiper.slides.forEach((slide) => {
      slide.style.opacity = "";
      slide.style.transform = "";
      slide.style.zIndex = "";
      slide.style.pointerEvents = "";
      slide.style.transition = "";
    });
  }

  function handleCardEffectByWidth(swiper) {
    const width = window.innerWidth;
    if (width < 768) {
      applyMobileCardScaleEffect(swiper);
    } else if (width >= 768 && width < 992) {
      resetCardStyles(swiper);
    } else {
      applyCardStackEffect(swiper);
    }
  }

  function initAllSwipers() {
    const needsBasic = document.querySelector(".basic-swiper");
    const needsGallery = document.querySelector(".gallery-image-slider");
    const needsCard = document.querySelector(".swiper-cards");

    if (!needsBasic && !needsGallery && !needsCard) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js";

    script.onload = () => {
      if (needsBasic) {
        initCustomSwiper(".basic-swiper", {
          slidesPerView: "auto",
          slidesPerGroup: 1,
          centeredSlides: true,
          allowTouchMove: true,
          spaceBetween: 8,
          breakpoints: {
            768: {
              centeredSlides: false,
              allowTouchMove: false,
            },
            992: {
              centeredSlides: false,
              allowTouchMove: false,
              spaceBetween: 11,
            },
          },
        });
      }

      if (needsGallery) {
        initCustomSwiper(".gallery-image-slider", {
          observer: true,
          observeParents: true,
          centeredSlides: false,
        });
      }

      if (needsCard) {
        const sampleSlide = document.querySelector(
          ".swiper-cards .swiper-slide"
        );
        const slideWidth = sampleSlide?.offsetWidth || 300;

        initCustomSwiper(".swiper-cards", {
          centeredSlides: true,
          allowTouchMove: true,
          slidesPerView: "auto",
          slidesPerGroup: 1,
          spaceBetween: -0.5 * slideWidth,
          breakpoints: {
            768: {
              spaceBetween: 8,
              slidesPerView: "auto",
              centeredSlides: false,
              allowTouchMove: false,
            },
            992: {
              spaceBetween: -0.5 * slideWidth,
              allowTouchMove: false,
              slidesPerView: 1,
              centeredSlides: false,
            },
          },
          on: {
            init(swiper) {
              handleCardEffectByWidth(swiper);
            },
            slideChange(swiper) {
              handleCardEffectByWidth(swiper);
            },
            breakpoint(swiper) {
              handleCardEffectByWidth(swiper);
            },
          },
        });
      }

      fixAriaRoles();

      window.addEventListener(
        "resize",
        debounce(() => {
          swiperInstances.forEach(({ swiper }) => {
            if (swiper.el.classList.contains("swiper-cards")) {
              handleCardEffectByWidth(swiper);
            }
          });
        }, 300)
      );
    };

    document.body.appendChild(script);
  }

  window.Webflow ||= [];
  window.Webflow.push(initAllSwipers);
});
