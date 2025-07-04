document.addEventListener("DOMContentLoaded", () => {
  const visibleCount = 3;
  const allLists = document.querySelectorAll(".hotel-rooms-list");

  function updateReverseClasses(list) {
    const visibleContainers = Array.from(
      list.querySelectorAll(".card-hotel-room-container")
    ).filter((card) => card.style.display !== "none");

    visibleContainers.forEach((container, index) => {
      const card = container.querySelector(".card-big-description");
      if (!card) return;

      card.classList.remove("reverse");
      const arrowsContainer = card.querySelector(
        ".swiper-arrow-wrapper.absolute"
      );
      const hotelRoomImageContainer = card.querySelector(
        ".gallery-image-slider.card-description"
      );
      const hotelRoomVideoLink = card.querySelector(".hotel-room-video-link");

      if (arrowsContainer) arrowsContainer.classList.remove("left");
      if (hotelRoomImageContainer)
        hotelRoomImageContainer.classList.remove("right");
      if (hotelRoomVideoLink) hotelRoomVideoLink.classList.remove("right");

      if (index % 2 === 1) {
        card.classList.add("reverse");
        if (arrowsContainer) arrowsContainer.classList.add("left");
        if (hotelRoomImageContainer)
          hotelRoomImageContainer.classList.add("right");
        if (hotelRoomVideoLink) hotelRoomVideoLink.classList.add("right");
      }
    });
  }

  allLists.forEach((list) => {
    const showMoreBtn = list.querySelector(".cms-list-opener");
    if (!showMoreBtn) return;

    const roomCards = Array.from(
      list.querySelectorAll(".card-hotel-room-container")
    );

    if (roomCards.length <= visibleCount) {
      roomCards.forEach((card) => (card.style.display = "block"));
      showMoreBtn.style.display = "none";
    } else {
      roomCards.forEach((card, index) => {
        card.style.display = index < visibleCount ? "block" : "none";
      });
      showMoreBtn.style.display = "inline-block";
    }

    updateReverseClasses(list);

    showMoreBtn.addEventListener("click", () => {
      roomCards.forEach((card) => (card.style.display = "block"));
      showMoreBtn.style.display = "none";

      updateReverseClasses(list);
    });
  });
});
