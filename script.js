// window.addEventListener("DOMContentLoaded", () => {
//   const intro = document.getElementById("intro");
//   const introVideo = document.getElementById("introVideo");
//   const hero = document.querySelector(".hero");

//   // Показать интро-оверлей после задержки
//   setTimeout(() => {
//     document.querySelector(".intro-overlay").classList.add("visible");
//   }, 600);

//   // Обработка конца интро-видео
//   introVideo.addEventListener("ended", () => {
//     intro.classList.add("fade-out");
    
//     setTimeout(() => {
//       intro.style.display = "none";
//       hero.classList.remove("hidden");
//       hero.style.opacity = 1;
//       hero.style.pointerEvents = "auto";

//       // Добавим появление текста в .hero-overlay
//       const heroOverlay = document.querySelector(".hero-overlay");
//       heroOverlay.classList.add("fade-element", "visible");
//     }, 1200);
//   });
// });
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }
  });
},{threshold: 0.12});

document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.addEventListener('click',e=>{
  if(e.target.closest('.contact-chip.copy')){
    const btn=e.target.closest('.contact-chip.copy');
    const text=btn.dataset.copy;
    navigator.clipboard.writeText(text).then(()=>{
      const old=btn.querySelector('em').textContent;
      btn.querySelector('em').textContent='Скопировано';
      setTimeout(()=>btn.querySelector('em').textContent=old,1200);
    });
  }
});
// (function(){
//   const html = document.documentElement;
//   const intro = document.getElementById('intro');
//   const introVideo = document.getElementById('introVideo');
//   const hero = document.querySelector('header.hero');
//   const heroReveal = document.querySelector('.hero-reveal');

//   html.classList.add('is-intro-lock');
//   let done = false;

//   function go(){
//     if (done) return; done = true;
//     intro.classList.add('is-fading-out');
//     hero.classList.add('is-visible');
//     requestAnimationFrame(()=> requestAnimationFrame(()=>{
//       heroReveal?.classList.add('is-open');
//     }));
//     setTimeout(()=>{ intro.style.display='none'; html.classList.remove('is-intro-lock'); }, 1100);
//   }

//   introVideo?.addEventListener('canplaythrough', ()=>{
//     intro.querySelector('.intro-overlay')?.classList.add('visible');
//     setTimeout(go, 5500); // авто-переход, если видео длинное/пауза
//   }, { once:true });

//   introVideo?.addEventListener('ended', go, { once:true });
//   setTimeout(()=>{ if(!done && (introVideo?.paused || introVideo?.readyState < 2)) go(); }, 3000); // фолбэк
// })();
(function(){
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    const topnav = document.querySelector('.topnav');

    // burger toggle
    if(burger && menu){
      burger.addEventListener('click', () => {
        const open = menu.classList.toggle('show');
        burger.setAttribute('aria-expanded', String(open));
      });
      // закрывать меню по клику на ссылку
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('show'); burger.setAttribute('aria-expanded','false');
      }));
    }

    // прилипаем при скролле после интро
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || window.pageYOffset;
      if(y > 80 && !topnav.classList.contains('is-sticky')) topnav.classList.add('is-sticky');
      if(y <= 80 && topnav.classList.contains('is-sticky')) topnav.classList.remove('is-sticky');
      last = y;
    });

    // плавный скролл для якорей
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const id = a.getAttribute('href');
        if(id.length>1){
          const el = document.querySelector(id);
          if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
        }
      });
    });
  })();
  // Счётчики при появлении
  (function(){
    const counters = document.querySelectorAll('.adv-num [data-count]');
    if(!counters.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el = e.target; const target = +el.dataset.count; let cur = 0;
          const step = Math.ceil(target/48);
          const tick = () => { cur = Math.min(target, cur+step); el.textContent = cur; if(cur<target) requestAnimationFrame(tick); };
          tick(); io.unobserve(el);
        }
      });
    }, {threshold:.4});
    counters.forEach(el=>io.observe(el));
  })();

  // Ненавязчивый tilt
  (function(){
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      let rAF; const damp=40;
      const onMove = (e)=>{
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left)/rect.width - .5;
        const y = (e.clientY - rect.top)/rect.height - .5;
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(()=>{ card.style.transform = `translateY(-4px) rotateX(${(-y*damp)/10}deg) rotateY(${(x*damp)/10}deg)`; });
      };
      const reset = ()=> card.style.transform = '';
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', reset);
    });
  })();
