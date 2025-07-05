document.addEventListener("DOMContentLoaded", () => {
  const swiperInstances = [];

  function initCustomSwiper(selector, options = {}) {
    document.querySelectorAll(selector).forEach((swiperEl, index) => {
      const slides = swiperEl.querySelectorAll(".swiper-slide");
      if (slides.length === 0) return;

      const parent = swiperEl.closest(".swiper-slider");
      const nextBtn = parent?.querySelector(".slider-button-right");
      const prevBtn = parent?.querySelector(".slider-button-left");
      if (!parent || !nextBtn || !prevBtn) return;

      const uniqueClass = `${selector
        .replace(".", "")
        .replace(/[^a-zA-Z0-9_-]/g, "")}-instance-${index}`;
      swiperEl.classList.add(uniqueClass);

      const shouldLoop = swiperEl.classList.contains("swiper-loop");
      const isThreePerSlide = swiperEl.classList.contains("swiper-3-per-slide");

      const swiper = new Swiper(`.${uniqueClass}`, {
        navigation: { nextEl: nextBtn, prevEl: prevBtn },
        loop: shouldLoop,
        slidesPerView: isThreePerSlide ? 3 : "auto",
        slidesPerGroup: isThreePerSlide ? 3 : 1,
        ...options,
      });

      swiperInstances.push({ swiper, swiperEl, nextBtn, prevBtn });

      swiper.on("init", () => updateNavState(swiper, nextBtn, prevBtn));
      swiper.on("slideChange", () => updateNavState(swiper, nextBtn, prevBtn));
      updateNavState(swiper, nextBtn, prevBtn);
    });
  }

  function updateNavState(swiper, nextBtn, prevBtn) {
    swiper.isBeginning
      ? prevBtn.classList.add("disabled")
      : prevBtn.classList.remove("disabled");

    swiper.isEnd
      ? nextBtn.classList.add("disabled")
      : nextBtn.classList.remove("disabled");
  }

  function applyCardStackEffect(swiper) {
    if (!swiper.el.classList.contains("swiper-cards")) return;

    const totalSlides = swiper.slides.length;
    const activeIndex = swiper.activeIndex;
    const maxOffset = 2;
    const isMobile = window.innerWidth <= 767;

    swiper.slides.forEach((slide, i) => {
      const rawOffset = i - activeIndex;
      let offset = rawOffset;

      if (swiper.params.loop) {
        if (offset < -totalSlides / 2) offset += totalSlides;
        if (offset > totalSlides / 2) offset -= totalSlides;
      }

      const hideSlide = isMobile
        ? offset > maxOffset
        : offset < 0 || offset > maxOffset;

      if (hideSlide) {
        slide.style.opacity = "0";
        slide.style.transform = "scale(0.8)";
        slide.style.zIndex = "0";
        slide.style.pointerEvents = "none";
        return;
      }

      slide.style.pointerEvents = "auto";
      const absOffset = offset >= 0 ? offset : 0;

      const scale = 1 - absOffset * 0.2;
      const zIndex = 10 - absOffset;
      const translateX = offset * 50;

      slide.style.opacity = "1";
      slide.style.zIndex = zIndex;
      slide.style.transform = `translateX(${translateX}px) scale(${scale})`;
      slide.style.transition =
        "transform 0.5s ease, opacity 0.5s ease, z-index 0.5s ease";
    });
  }

  window.Webflow ||= [];
  window.Webflow.push(() => {
    const needsBasic = document.querySelector(".basic-swiper");
    const needsGallery = document.querySelector(".gallery-image-slider");
    const needsCard = document.querySelector(".swiper-cards");

    if (!needsBasic && !needsGallery && !needsCard) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js";
    script.onload = () => {
      if (needsBasic) {
        initCustomSwiper(".basic-swiper", {
          centeredSlides: false,
          allowTouchMove: false,
          spaceBetween: 20,
          breakpoints: {
            0: { spaceBetween: 8 },
            480: { spaceBetween: 12 },
            767: { spaceBetween: 20 },
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
        let slideWidth = sampleSlide?.offsetWidth || 300;
        const spaceBetween = -0.5 * slideWidth;

        initCustomSwiper(".swiper-cards", {
          slidesPerView: "auto",
          centeredSlides: true,
          loop: false,
          spaceBetween: spaceBetween,
          breakpoints: {
            0: {},
            480: {},
            768: {},
          },
          on: {
            init(swiper) {
              applyCardStackEffect(swiper);
            },
            slideChange(swiper) {
              applyCardStackEffect(swiper);
            },
            breakpoint(swiper) {
              console.log("it works");
              applyCardStackEffect(swiper);
            },
          },
        });
      }
    };
    document.body.appendChild(script);
  });
});
