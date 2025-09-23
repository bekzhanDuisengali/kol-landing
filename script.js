
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
(function(){
  const sb=document.querySelector('.scrollbar');
  if(!sb) return;
  const onScroll=()=> {
    const p=(scrollY)/(document.documentElement.scrollHeight - innerHeight);
    sb.style.width=(Math.max(0,Math.min(1,p))*100)+'%';
  };
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();
(function(){
  const waves = document.querySelector('.waves');
  const layers = document.querySelectorAll('.waves .w');
  if(!waves || !layers.length) return;

  // шов автоматически подкрашиваем под следующую секцию
  const seam = document.querySelector('.seam--hero .seam-fill');
  const next = document.querySelector('header.hero + section'); // advantages
  if(seam && next){
    // если у секции есть «тон» — используем его, иначе белый
    const nextTone =
      getComputedStyle(next).getPropertyValue('--surface-bg').trim() ||
      getComputedStyle(next).getPropertyValue('--sep-color').trim() ||
      '#fff';
    seam.style.fill = nextTone || '#fff';
  }

  // параллакс на rAF (без «рывков»), отключаем если reduce motion
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  let raf = 0, curr = 0, target = 0;
  const io = new IntersectionObserver(([e])=>{
    if(!e.isIntersecting){ cancelAnimationFrame(raf); raf = 0; return; }
    const loop = ()=>{
      target = scrollY * 0.05;
      curr += (target - curr) * 0.12; // сглаживание
      // один translate для контейнера + небольшие для слоёв
      waves.style.transform = `translate3d(0, ${curr}px, 0)`;
      if(layers[0]) layers[0].style.transform = `translate3d(0, ${curr*0.15}px, 0)`;
      if(layers[1]) layers[1].style.transform = `translate3d(0, ${curr*0.25}px, 0)`;
      if(layers[2]) layers[2].style.transform = `translate3d(0, ${curr*0.35}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    if(!raf) raf = requestAnimationFrame(loop);
  }, {threshold: 0});
  io.observe(waves);
})();

(function(){
  const vids=[...document.querySelectorAll('.video-card video')];
  if(!vids.length) return;
  const io=new IntersectionObserver(es=>es.forEach(({target,isIntersecting})=>{
    if(isIntersecting){ target.play().catch(()=>{}); }
    else{ target.pause(); }
  }),{threshold:.6});
  vids.forEach(v=>io.observe(v));
})();
(function(){
    const blocks=[...document.querySelectorAll('header.hero, section, footer')];
    const getSurface=(el)=>getComputedStyle(el).getPropertyValue('--surface-bg').trim()||'#fff';
    blocks.forEach((cur,i)=>{
      const next=blocks[i+1]; if(!next) return;
      const path=cur.querySelector('.sep-wave path');
      if(path){ cur.style.setProperty('--sep-color', getSurface(next)); }
    });
  })();

  (function(){
    const nav=document.querySelector('.topnav');
    const secs=[...document.querySelectorAll('[data-surface]')];
    if(!nav||!secs.length) return;
    const io=new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting) nav.dataset.theme=e.target.dataset.surface; });
    },{rootMargin:'-45% 0px -45% 0px'});
    secs.forEach(s=>io.observe(s));
  })();

(function(){
  const bg = document.querySelector('.hero-bg');
  if(!bg) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  let raf=0, cx=0, cy=0, tx=0, ty=0;
  const onMove = (x, y)=>{
    // x,y в диапазоне [-.5, .5]
    tx = x * 14;  // горизонтальный параллакс
    ty = y * 10;  // вертикальный параллакс
    if(!raf) raf = requestAnimationFrame(loop);
  };
  const loop = ()=>{
    cx += (tx - cx) * .12;
    cy += (ty - cy) * .12;
    bg.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    raf = requestAnimationFrame(()=>{
      if(Math.abs(tx-cx)<0.1 && Math.abs(ty-cy)<0.1){ cancelAnimationFrame(raf); raf=0; }
      else loop();
    });
  };

  // мышь/тач
  addEventListener('pointermove', e=>{
    onMove(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5);
  }, {passive:true});

  // лёгкий параллакс при скролле (фон чуть «плывёт»)
  addEventListener('scroll', ()=>{
    const y = (scrollY / innerHeight);
    onMove(0, Math.min(.5, y*.1));
  }, {passive:true});
})();
