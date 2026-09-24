/* SP GROWX — shared behaviour for every page.
   Plain multi-page site: no routing, no framework. Every block is guarded, so a page only
   runs what it contains. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- navbar: glass strengthens on scroll ---------- */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    addEventListener('scroll', onScroll, {passive: true});
  }

  /* ---------- navbar: sliding indicator (rests on the active page) ---------- */
  const list = $('#navlinks'), ind = $('#navind');
  if (list && ind) {
    const links = $$('a', list);
    const active = links.find(a => a.getAttribute('aria-current') === 'page') || null;
    const place = a => {
      const r = a.getBoundingClientRect(), p = list.getBoundingClientRect();
      ind.style.width = r.width + 'px';
      ind.style.transform = 'translateX(' + (r.left - p.left) + 'px)';
      ind.style.opacity = 1;
    };
    const rest = () => { if (active) place(active); else ind.style.opacity = 0; };
    links.forEach(a => {
      a.addEventListener('pointerenter', () => place(a));
      a.addEventListener('focus', () => place(a));
    });
    list.addEventListener('pointerleave', rest);
    list.addEventListener('focusout', rest);
    rest();
    addEventListener('resize', rest);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
    addEventListener('load', rest);
  }

  /* ---------- mobile menu ---------- */
  const tgl = $('#navtoggle'), menu = $('#mobilemenu');
  if (tgl && menu) {
    let lockY = 0;
    const lockScroll = lock => {
      if (lock) {
        lockY = window.scrollY;
        document.body.style.top = -lockY + 'px';
        document.body.classList.add('menu-lock');
      } else {
        document.body.classList.remove('menu-lock');
        document.body.style.top = '';
        window.scrollTo(0, lockY);
      }
    };
    const setMenu = open => {
      tgl.setAttribute('aria-expanded', open);
      tgl.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
      lockScroll(open);
    };
    tgl.addEventListener('click', () => setMenu(tgl.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && tgl.getAttribute('aria-expanded') === 'true') setMenu(false); });
    addEventListener('pageshow', () => setMenu(false)); // back/forward cache
    // menu should never stay locked-open if the viewport grows past the hamburger breakpoint
    addEventListener('resize', () => { if (innerWidth > 992 && tgl.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* ---------- scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), {threshold: .12, rootMargin: '0px 0px -6% 0px'});
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ---------- performance: pause off-screen blurred decorative blobs ----------
     .hb / .blob / .ct-blob are continuously-animating, filter:blur() elements used as
     background glow across many sections. Blurred layers are costly to keep animating
     when nobody can see them, so only the ones near the viewport actually run. */
  if ('IntersectionObserver' in window) {
    const blobIo = new IntersectionObserver(es => es.forEach(e => {
      e.target.classList.toggle('run', e.isIntersecting);
    }), {rootMargin: '250px 0px'});
    $$('.hb,.blob,.ct-blob').forEach(el => blobIo.observe(el));
  } else {
    $$('.hb,.blob,.ct-blob').forEach(el => el.classList.add('run'));
  }

  /* ---------- button ripple ---------- */
  $$('.ripple-host').forEach(b => {
    b.addEventListener('pointerdown', e => {
      const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement('span');
      s.className = 'ripple';
      s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      b.appendChild(s);
      setTimeout(() => s.remove(), 750);
    });
  });

  /* ---------- process timeline: progress line, step counter, node state ---------- */
  const tlItems = $$('.tl-item');
  if (tlItems.length) {
    const ctrN = $('#ctrn'), ctrM = $('#ctrm');
    const ctrBars = $$('.ctr-bars i');
    let tk = 0, curIdx = -1;
    const updTl = () => {
      tk = 0;
      const ty = innerHeight * .62;
      let cur = 0;
      tlItems.forEach((it, i) => {
        const cs = getComputedStyle(it);
        const nc = parseFloat(cs.getPropertyValue('--nc')) || 48, gap = parseFloat(cs.marginBottom) || 32;
        const r = it.getBoundingClientRect(), c = r.top + nc;
        const f = reduce ? 1 : Math.min(1, Math.max(0, (ty - c) / (r.height + gap)));
        const on = reduce || ty >= c;
        it.style.setProperty('--f', f.toFixed(3));
        it.classList.toggle('on', on);
        if (on) cur = i;
      });
      tlItems.forEach((it, i) => it.classList.toggle('cur', i === cur && it.classList.contains('on')));
      ctrBars.forEach((b, i) => b.classList.toggle('on', !!tlItems[i] && tlItems[i].classList.contains('on')));
      if (cur !== curIdx && ctrN && ctrM) {
        curIdx = cur;
        ctrN.style.setProperty('--n', cur);
        ctrM.style.setProperty('--n', cur);
      }
    };
    const reqTl = () => { if (!tk) tk = requestAnimationFrame(updTl); };
    addEventListener('scroll', reqTl, {passive: true});
    addEventListener('resize', reqTl);
    updTl();
  }

  /* everything below is pointer-only polish */
  if (reduce || !fine) return;

  /* ---------- magnetic buttons ---------- */
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--tx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px');
      b.style.setProperty('--ty', ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px');
    });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--tx', '0px'); b.style.setProperty('--ty', '0px'); });
  });

  /* ---------- hero statue / arch stage parallax ---------- */
  const hero = $('#top'), stage = $('#stage');
  if (hero && stage) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      stage.style.setProperty('--px', cx.toFixed(4));
      stage.style.setProperty('--py', cy.toFixed(4));
      stage.style.setProperty('--mx', cx.toFixed(4));
      raf = (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) ? requestAnimationFrame(tick) : 0;
    };
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 2;
      ty = ((e.clientY - r.top) / r.height - .5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    }, {passive: true});
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });
  }

  /* ---------- glass cards: spotlight follows the pointer ---------- */
  $$('.hw-card,.tl-card,.cp-card,.ab-card,.pc-card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- timeline: node is gently pulled toward the pointer ---------- */
  tlItems.forEach(it => {
    const card = $('.tl-card', it);
    if (!card) return;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      it.style.setProperty('--nx', (((e.clientX - r.left) / r.width - .5) * 8).toFixed(1) + 'px');
      it.style.setProperty('--ny', (((e.clientY - r.top) / r.height - .5) * 14).toFixed(1) + 'px');
    });
    card.addEventListener('pointerleave', () => { it.style.setProperty('--nx', '0px'); it.style.setProperty('--ny', '0px'); });
  });

  /* ---------- section blob parallax (eased) ---------- */
  $$('[data-parallax]').forEach(sec => {
    let tx = 0, ty = 0, cx = 0, cy = 0, rf = 0;
    const step = () => {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      sec.style.setProperty('--sx', cx.toFixed(4));
      sec.style.setProperty('--sy', cy.toFixed(4));
      rf = (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) ? requestAnimationFrame(step) : 0;
    };
    sec.addEventListener('pointermove', e => {
      const r = sec.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 2;
      ty = ((e.clientY - r.top) / r.height - .5) * 2;
      if (!rf) rf = requestAnimationFrame(step);
    }, {passive: true});
    sec.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!rf) rf = requestAnimationFrame(step); });
  });
})();
