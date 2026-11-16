/* SP GROWX — contact form (contact.html only).

   The form only sends when every field is genuinely filled in and valid:
   - Full name: real letters only (no digits / symbols).
   - Email: a properly formed address; Gmail addresses are checked as Gmail
     (must end in @gmail.com, 6-30 letters/numbers/dots) and common typos such as
     "gmial.com" or "gmail.con" are rejected with a "Did you mean ...?" message.
   - Phone: a country code plus digits only, capped at the maximum length for that country.
   - Message: at least 10 characters.

   Delivery: messages are forwarded to the inbox below by FormSubmit (free, no backend needed).
   The first live submission sends an activation email to that address: confirm it once.
   The "Thank you" screen is shown ONLY when delivery is confirmed. If sending fails (or the form
   still needs activation) the visitor gets WhatsApp / email buttons with their details pre-filled.
   Append #demo to the page address to preview the success animation without sending anything. */
(() => {
  'use strict';
  const form = document.getElementById('ctform');
  if (!form) return;

  const ENDPOINT = 'https://formsubmit.co/ajax/spgrowx@gmail.com';
  const WA_NUMBER = '916354814102', MAIL = 'spgrowx@gmail.com';

  const $ = id => document.getElementById(id);
  const btn = $('ctsubmit'), label = btn.querySelector('em');
  const status = $('ctstatus'), ok = $('ctok');
  const nameEl = $('f-name'), emailEl = $('f-email'), phoneEl = $('f-phone'), ccEl = $('f-cc');
  const bizEl = $('f-biz'), msgEl = $('f-msg');
  const hint = $('ph-hint'), ccIso = $('cc-iso'), ccDial = $('cc-dial'), msgCnt = $('msg-cnt');

  /* ---------- shared helpers ---------- */
  const setErr = (el, text) => {
    const f = el.closest('.fld'), m = f.querySelector('.msg');
    if (text) {
      if (m) m.textContent = text;
      f.classList.add('err');
      el.setAttribute('aria-invalid', 'true');
    } else {
      f.classList.remove('err');
      el.removeAttribute('aria-invalid');
    }
  };
  const same = s => /^(.)\1+$/u.test(s);               // "aaaa", "0000000000"

  /* ---------- name ---------- */
  const cleanName = v => v.replace(/[^\p{L}\p{M}\s.'\u2019\-]/gu, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
  const checkName = () => {
    const v = nameEl.value.trim();
    const letters = (v.match(/\p{L}/gu) || []).length;
    if (letters < 2) return 'Please enter your full name (letters only).';
    if (same(v.replace(/[\s.'\u2019\-]/g, '').toLowerCase())) return 'Please enter your real name.';
    return '';
  };

  /* ---------- email ---------- */
  const MAJOR = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  const REAL = new Set(['gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
    'ymail.com', 'rocketmail.com', 'outlook.com', 'outlook.in', 'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.it', 'hotmail.de',
    'hotmail.es', 'live.com', 'live.in', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me', 'protonmail.com',
    'rediffmail.com', 'mail.com', 'email.com', 'zoho.com', 'gmx.com', 'gmx.net', 'fastmail.com', 'yandex.com', 'qq.com']);
  const FAKE = new Set(['example.com', 'example.org', 'example.net', 'test.com', 'domain.com', 'sample.com', 'yourmail.com', 'abc.com', 'xyz.com', 'mail.test']);
  const lev = (a, b) => {
    const d = Array.from({length: a.length + 1}, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  const checkEmail = () => {
    const v = emailEl.value.trim();
    if (!v) return 'Please enter your email address.';
    const m = /^([A-Za-z0-9._%+\-]+)@([A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)+)$/.exec(v);
    if (!m) return 'Please enter a valid email address, like name@gmail.com.';
    const local = m[1], domain = m[2].toLowerCase(), labels = domain.split('.');
    if (local.length > 64 || local[0] === '.' || local.endsWith('.') || local.includes('..'))
      return 'This email address doesn\u2019t look right. Please check it.';
    if (labels.some(l => !l || l.length > 63 || l[0] === '-' || l.endsWith('-')))
      return 'This email address doesn\u2019t look right. Please check it.';
    if (!/^[a-z]{2,24}$/.test(labels[labels.length - 1]))
      return 'Please check the ending of your email (for example .com).';
    if (FAKE.has(domain)) return 'Please use your real email address.';
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      const user = local.split('+')[0].toLowerCase();
      if (!/^[a-z0-9.]{6,30}$/.test(user) || user[0] === '.' || user.endsWith('.') || user.includes('..'))
        return 'That Gmail address isn\u2019t valid. Gmail usernames have 6\u201330 letters, numbers or dots.';
      return '';
    }
    if (labels[0] === 'gmail' || labels[0].startsWith('gmai') || labels[0].startsWith('gamil') || labels[0].startsWith('gmial'))
      return 'Gmail addresses end with @gmail.com. Did you mean ' + local + '@gmail.com?';
    if (!REAL.has(domain)) {
      const near = MAJOR.find(d => lev(domain, d) <= 2);
      if (near) return 'Did you mean ' + local + '@' + near + '?';
    }
    return '';
  };

  /* ---------- phone (country code + digits only, max length per country) ---------- */
  const spec = () => {
    const o = ccEl.options[ccEl.selectedIndex];
    return {iso: ccEl.value, name: o.text.replace(/\s*\(\+\d+\)$/, ''), dial: o.dataset.dial,
      min: +o.dataset.min, max: +o.dataset.max, ph: o.dataset.ph};
  };
  const normalizePhone = raw => {
    const s = spec();
    let d = raw.replace(/\D/g, '');
    if (d.length > s.max && d.startsWith(s.dial) && d.length - s.dial.length >= s.min) d = d.slice(s.dial.length); // pasted +91...
    if (d.length > s.max && d[0] === '0') d = d.slice(1);                                                      // pasted 0...
    return d.slice(0, s.max);
  };
  const checkPhone = () => {
    const s = spec(), d = phoneEl.value;
    const range = s.min === s.max ? s.max + '-digit' : s.min + '\u2013' + s.max + ' digit';
    if (!d) return 'Please enter your phone number.';
    if (d.length < s.min || d.length > s.max) return 'Please enter a valid ' + range + ' phone number for ' + s.name + '.';
    if (same(d)) return 'Please enter a real phone number.';
    if (s.iso === 'IN' && !/^[6-9]\d{9}$/.test(d)) return 'Indian mobile numbers have 10 digits and start with 6, 7, 8 or 9.';
    return '';
  };
  const applyCountry = () => {
    const s = spec();
    ccIso.textContent = s.iso;
    ccDial.textContent = '+' + s.dial;
    phoneEl.maxLength = s.max;
    phoneEl.placeholder = s.ph;
    hint.textContent = s.min === s.max ? '(' + s.max + ' digits)' : '(' + s.min + '\u2013' + s.max + ' digits)';
    phoneEl.value = normalizePhone(phoneEl.value);
    if (phoneEl.closest('.fld').classList.contains('err')) setErr(phoneEl, checkPhone());
  };

  /* ---------- business (optional) and message ---------- */
  const checkBiz = () => {
    const v = bizEl.value.trim();
    return v && v.length < 2 ? 'Business name looks too short.' : '';
  };
  const checkMsg = () => {
    const v = msgEl.value.trim();
    if (v.length < 10) return 'Please write at least 10 characters about your project.';
    if (same(v.replace(/\s/g, ''))) return 'Please write a real message.';
    return '';
  };
  const updateCount = () => {
    const n = msgEl.value.trim().length;
    msgCnt.textContent = n >= 10 ? n + ' / 1000' : n + ' / 10 min';
  };

  /* ---------- wiring: sanitise while typing, validate on blur and live once touched ---------- */
  const fields = [
    {el: nameEl,  check: checkName,  clean: () => { const c = cleanName(nameEl.value); if (c !== nameEl.value) nameEl.value = c; }},
    {el: emailEl, check: checkEmail, clean: () => { const c = emailEl.value.replace(/[^A-Za-z0-9._%+\-@]/g, ''); if (c !== emailEl.value) emailEl.value = c; }},
    {el: phoneEl, check: checkPhone, clean: () => { const c = normalizePhone(phoneEl.value); if (c !== phoneEl.value) phoneEl.value = c; }},
    {el: bizEl,   check: checkBiz,   clean: () => { const c = bizEl.value.replace(/[\u0000-\u001f<>]/g, ''); if (c !== bizEl.value) bizEl.value = c; }},
    {el: msgEl,   check: checkMsg,   clean: () => {}}
  ];
  fields.forEach(f => {
    f.el.addEventListener('input', () => {
      f.clean();
      if (f.el === msgEl) updateCount();
      if (f.el.closest('.fld').classList.contains('err')) setErr(f.el, f.check());
    });
    f.el.addEventListener('blur', () => { if (f.el.value.trim()) setErr(f.el, f.check()); });
  });
  phoneEl.addEventListener('paste', () => setTimeout(() => { phoneEl.value = normalizePhone(phoneEl.value); }, 0));
  ccEl.addEventListener('change', applyCountry);
  applyCountry();
  updateCount();

  /* ---------- result states ---------- */
  const fullPhone = () => '+' + spec().dial + ' ' + phoneEl.value;
  const fallback = activation => {
    const text = 'Hi, I\'m ' + nameEl.value.trim() + '.\nPhone: ' + fullPhone() + '\nEmail: ' + emailEl.value.trim() +
      '\nBusiness: ' + (bizEl.value.trim() || '-') + '\n\n' + msgEl.value.trim();
    status.className = 'ct-status bad';
    status.hidden = false;
    status.innerHTML = (activation
        ? 'Your message couldn\u2019t be delivered yet because this form still needs a one-time activation. '
        : 'We couldn\u2019t send your message from here. ') +
      'Please reach out directly and your details will be pre-filled:' +
      '<div class="ct-alt"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text) + '">Send on WhatsApp</a>' +
      '<a href="mailto:' + MAIL + '?subject=' + encodeURIComponent('Enquiry from ' + nameEl.value.trim()) + '&body=' + encodeURIComponent(text) + '">Send by email</a></div>';
  };
  const succeed = () => {
    form.classList.add('done');
    status.hidden = true;
    const t = ok.querySelector('h3');
    if (t) { t.setAttribute('tabindex', '-1'); t.focus({preventScroll: true}); }
  };

  /* ---------- submit ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (btn.classList.contains('busy')) return;
    fields.forEach(f => f.clean());
    const bad = fields.filter(f => { const m = f.check(); setErr(f.el, m); return !!m; });
    if (bad.length) { status.hidden = true; bad[0].el.focus(); return; }
    if (form.elements._honey && form.elements._honey.value) { succeed(); return; }   // bots: pretend, send nothing

    status.hidden = true;
    btn.classList.add('busy');
    label.textContent = 'Sending\u2026';
    try {
      if (location.hash === '#demo') {
        await new Promise(r => setTimeout(r, 900));
      } else {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(ENDPOINT, {
          method: 'POST', signal: ctrl.signal,
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: JSON.stringify({
            name: nameEl.value.trim(), email: emailEl.value.trim(), phone: fullPhone(), country: spec().name,
            business: bizEl.value.trim() || '-', message: msgEl.value.trim(),
            _subject: 'New enquiry from ' + nameEl.value.trim() + ' | SP GROWX', _template: 'table', _captcha: 'false', _replyto: emailEl.value.trim()
          })
        });
        clearTimeout(timer);
        const j = await res.json().catch(() => ({}));
        if (/activat/i.test(String(j.message || ''))) throw new Error('activation');
        if (!res.ok || !(j.success === true || j.success === 'true')) throw new Error('not sent');
      }
      succeed();
    } catch (err) {
      fallback(err && err.message === 'activation');
    } finally {
      btn.classList.remove('busy');
      label.textContent = 'Let\u2019s Talk';
    }
  });

  $('ctreset').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.err').forEach(f => f.classList.remove('err'));
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    applyCountry();
    updateCount();
    form.classList.remove('done');
    status.hidden = true;
  });
})();
