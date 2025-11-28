  // ========= KOL CORE INTERACTIONS (single init) =========
  (function(){
    if (window._kolInitRanOnce) return; // guard against duplicate injection
    window._kolInitRanOnce = true;

    // Burger menu
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    burger?.addEventListener('click',()=>{
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });

    // Copy email
    const copyBtn = document.getElementById('copyEmail');
    copyBtn?.addEventListener('click', ()=>{
      const email = copyBtn.dataset.copy;
      navigator.clipboard.writeText(email||'info@kol.com');
      copyBtn.querySelector('.btn').textContent = 'Скопировано!';
      setTimeout(()=>copyBtn.querySelector('.btn').textContent='Копировать',1500);
    });

    // Video lightbox
    const dlg = document.getElementById('lightbox');
    const v = document.getElementById('lightboxVideo');
    document.querySelectorAll('[data-play]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const video = e.currentTarget.closest('.video').querySelector('video');
        v.src = video.currentSrc || video.src;
        dlg.showModal();
      })
    });
    dlg?.addEventListener('click', (e)=>{ if(e.target===dlg) { v.pause(); dlg.close(); }});

    // Maritime animations — motion path ship
    (function(){
      const ship = document.querySelector('.ship');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(ship && !reduce){
        let d = 0; const speed = .0009; // percentage per frame
        function loop(){ d = (d + speed) % 1; ship.style.offsetDistance = (d*100)+'%'; requestAnimationFrame(loop); }
        requestAnimationFrame(loop);
      }
    })();

    // Foam particles on canvas (subtle, professional)
    (function(){
      const cvs = document.getElementById('foamCanvas'); if(!cvs) return; const ctx = cvs.getContext('2d');
      let w,h,px; const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function resize(){ w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; px = Math.round(w*h/45000); }
      window.addEventListener('resize', resize); resize();
      const dots = new Array(px).fill(0).map(()=>({x:Math.random()*w, y:h*0.65+Math.random()*h*0.3, a:.2+Math.random()*.4, s:.4+Math.random()*1.2}));
      function draw(){ ctx.clearRect(0,0,w,h); ctx.globalCompositeOperation='lighter';
        for(const p of dots){ ctx.globalAlpha=p.a; ctx.fillStyle='#cfe7ff'; ctx.beginPath(); ctx.arc(p.x,p.y,1.1,0,6.28); ctx.fill(); p.x+=p.s*0.25; p.y-=0.08; if(p.x>w+10){p.x=-10} if(p.y< h*0.55){p.y=h*0.75+Math.random()*h*0.25} }
      }
      function tick(){ draw(); raf = requestAnimationFrame(tick); }
      let raf; if(!reduce){ tick(); }
    })();

    // Subtle waterline jitter on eyebrow
    (function(){ const el = document.querySelector('.waterline'); if(!el) return; let t=0; function j(){ t+=.015; el.style.transform = `translateY(${Math.sin(t)*1.2}px)`; requestAnimationFrame(j);} requestAnimationFrame(j); })();

    // WOW interactions for REORG
    (function(){
      // Tilt effect
      const tilts = document.querySelectorAll('.fx-tilt');
      window.addEventListener('mousemove', (e)=>{
        tilts.forEach(el=>{
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width/2; const cy = r.top + r.height/2;
          const dx = (e.clientX - cx) / r.width; const dy = (e.clientY - cy) / r.height;
          el.style.transform = `rotateX(${(-dy*6).toFixed(2)}deg) rotateY(${(dx*8).toFixed(2)}deg)`;
        })
      });
      // Parallax for stickers (declare ONCE)
      const depthEls = document.querySelectorAll('.fx-parallax');
      window.addEventListener('pointermove', (e)=>{
        const {innerWidth:w, innerHeight:h} = window; const x=(e.clientX-w/2)/w; const y=(e.clientY-h/2)/h;
        depthEls.forEach(el=>{const d=parseFloat(el.dataset.depth||8); el.style.transform = `translate(${x*d*10}px, ${y*d*10}px) rotate(${d*.6}deg)`;})
      });
      // Shock highlight on primary CTA (first view)
      const shock = document.querySelector('.fx-shock');
      setTimeout(()=>shock?.classList.add('in'), 600);
      // Stagger reveal inside REORG
      const reorg = document.getElementById('reorg');
      const items = reorg?.querySelectorAll('.r-step');
      if(items){
        const obs = new IntersectionObserver((ents)=>{
          ents.forEach((en)=>{
            if(en.isIntersecting){ items.forEach((it,i)=>setTimeout(()=>it.classList.add('show'), i*120)); obs.disconnect(); }
          })
        },{threshold:.25});
        obs.observe(reorg);
      }
    })();

    // Intersection fade-in (optional)
    (function(){
      const observer = new IntersectionObserver((entries)=>{
        entries.forEach(el=>{ if(el.isIntersecting){ el.target.classList.add('show') } })
      },{threshold:.08});
      document.querySelectorAll('section .card, section .head').forEach(el=>{ el.classList.add('pre'); observer.observe(el) });
      const style = document.createElement('style');
      style.textContent = `.pre{transform:translateY(12px);opacity:0;transition:.5s ease} .show{transform:none;opacity:1}`;
      document.head.appendChild(style);
    })();
  })();
  
    // Test 1: depthEls is NOT a global (prevents duplicate global const)
    console.assert(!('depthEls' in window), 'Test1 failed: depthEls should not be a global');
    // Test 2: initializer ran once
    console.assert(window._kolInitRanOnce === true, 'Test2 failed: init guard did not set flag');
    // Test 3: ship element + motion path style present
    (function(){
      const ship = document.querySelector('.ship');
      console.assert(!!ship, 'Test3 failed: ship SVG missing');
      if (ship) {
        const hasOffsetPath = ship.style.offsetPath || ship.style['offsetPath'];
        console.assert(hasOffsetPath !== undefined, 'Test3 note: offset-path style not set');
      }
    })();
  
  
  (function(){
    const story = document.querySelector('.kol-route-story');
    if (!story) return;

    const svg   = story.querySelector('.krs-svg');
    const route = story.querySelector('#krs-route-path');
    const ship  = story.querySelector('#krs-ship');
    const cards = [...story.querySelectorAll('.krs-card')];

    if (!svg || !route) return;

    const isMobile = window.matchMedia('(max-width:1024px)').matches;
    const reduce   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let len = 0, rafId = null, running = false;

    function computeLen(){
      try { len = route.getTotalLength() || 1000; }
      catch(e){ len = 1000; }
    }

    function startAnim(){
      if (running || !ship || reduce) return;
      running = true;
      let t = 0;
      const speed = 0.0032;

      const frame = () => {
        if (!running) return;
        t = (t + speed) % 1;
        const d  = t * len;
        const pt = route.getPointAtLength(d);
        ship.setAttribute('transform', `translate(${pt.x},${pt.y})`);
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    }

    function stopAnim(){
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    // Мобильный режим: статичный маршрут без scrollytelling
    function enableMobile(){
      computeLen();
      route.style.transition = 'none';
      route.style.strokeDasharray = 'none';
      route.style.strokeDashoffset = '0';
      stopAnim();
    }

    // Десктоп: рисуем линию, подсветка карточек и пауза анимации вне вьюпорта
    function enableDesktop(){
      computeLen();

      // Первый показ — анимируем прорисовку и запускаем кораблик
      const once = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if (en.isIntersecting){
            route.style.transition = 'stroke-dashoffset 1.8s ease';
            route.style.strokeDashoffset = '0';
            startAnim();
            once.disconnect();
          }
        });
      }, { threshold: .35 });
      once.observe(svg);

      // Подсветка активной части маршрута
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if (!en.isIntersecting) return;
          const el = en.target;
          cards.forEach(c=>c.classList.remove('is-active'));
          el.classList.add('is-active');

          const from = Math.max(0, Math.min(1, parseFloat(el.dataset.from || '0')));
          const to   = Math.max(0, Math.min(1, parseFloat(el.dataset.to   || '1')));
          computeLen();
          route.style.strokeDasharray = `${from*len} ${(to-from)*len} ${(1-to)*len}`;
          route.style.strokeDashoffset = `${-from*len}`;
        });
      }, { rootMargin: '-40% 0% -50% 0%', threshold: .6 });
      cards.forEach(c=>io.observe(c));

      // Старт/стоп анимации по видимости всей секции
      const vis = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
          if (en.isIntersecting) startAnim();
          else stopAnim();
        });
      }, { threshold: .15 });
      vis.observe(story);

      // Пересчёт длины при ресайзе/смене ориентации
      new ResizeObserver(()=>computeLen()).observe(svg);
      window.addEventListener('orientationchange', computeLen);
    }

    if (isMobile || reduce) enableMobile();
    else enableDesktop();
  })();

  
(function(){
  const mq = window.matchMedia('(min-width:1025px)');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  function closeMenu(){
    menu?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
  }
  mq.addEventListener?.('change', e => { if (e.matches) closeMenu(); });

  // Закрывать по клику на ссылку
  menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMenu));
})();
