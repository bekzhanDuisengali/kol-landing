window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const introVideo = document.getElementById("introVideo");
  const hero = document.querySelector(".hero");

  // Показать интро-оверлей после задержки
  setTimeout(() => {
    document.querySelector(".intro-overlay").classList.add("visible");
  }, 600);

  // Обработка конца интро-видео
  introVideo.addEventListener("ended", () => {
    intro.classList.add("fade-out");
    
    setTimeout(() => {
      intro.style.display = "none";
      hero.classList.remove("hidden");
      hero.style.opacity = 1;
      hero.style.pointerEvents = "auto";

      // Добавим появление текста в .hero-overlay
      const heroOverlay = document.querySelector(".hero-overlay");
      heroOverlay.classList.add("fade-element", "visible");
    }, 1200);
  });
});