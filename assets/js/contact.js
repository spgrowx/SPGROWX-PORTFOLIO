/* SP GROWX — contact form (contact.html only).
   Messages are forwarded to the inbox below by FormSubmit (free, no backend needed).
   The very first live submission sends an activation email to that address: confirm it once.
   If sending fails, the form never claims success: it offers WhatsApp / email with the details pre-filled.
   Append #demo to the page address to preview the success animation without sending anything. */
(() => {
  'use strict';
  const form = document.getElementById('ctform');
  if (!form) return;

  const ENDPOINT = 'https://formsubmit.co/ajax/spgrowx@gmail.com';
  const WA_NUMBER = '916354814102', MAIL = 'spgrowx@gmail.com';

  const btn = document.getElementById('ctsubmit'), label = btn.querySelector('em');
  const status = document.getElementById('ctstatus'), ok = document.getElementById('ctok');

  const rules = {
    name:    v => v.trim().length >= 2,
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    phone:   v => /^[+\d][\d\s()\-]{6,}$/.test(v.trim()),
    service: v => !!v,
    message: v => v.trim().length >= 5
  };
  const check = el => {
    const r = rules[el.name];
    if (!r) return true;
    const good = r(el.value);
    el.closest('.fld').classList.toggle('err', !good);
    return good;
  };
  form.querySelectorAll('input,select,textarea').forEach(el => {
    el.addEventListener('blur', () => { if (el.value) check(el); });
    el.addEventListener('input', () => { if (el.closest('.fld').classList.contains('err')) check(el); });
  });

  const val = n => form.elements[n].value.trim();

  const fallback = () => {
    const text = 'Hi, I\'m ' + val('name') + '.\nService: ' + val('service') + '\nBusiness: ' + (val('business') || '-') +
      '\nPhone: ' + val('phone') + '\nEmail: ' + val('email') + '\n\n' + val('message');
    status.className = 'ct-status bad';
    status.hidden = false;
    status.innerHTML = 'We couldn\u2019t send your message from here. Please reach out directly and your details will be pre-filled:' +
      '<div class="ct-alt"><a target="_blank" rel="noopener noreferrer" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text) + '">Send on WhatsApp</a>' +
      '<a href="mailto:' + MAIL + '?subject=' + encodeURIComponent('Enquiry from ' + val('name')) + '&body=' + encodeURIComponent(text) + '">Send by email</a></div>';
  };

  const succeed = () => {
    form.classList.add('done');
    status.hidden = true;
    const t = ok.querySelector('h3');
    if (t) { t.setAttribute('tabindex', '-1'); t.focus({preventScroll: true}); }
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const bad = Array.from(form.elements).filter(el => rules[el.name] && !check(el));
    if (bad.length) { bad[0].focus(); return; }
    if (val('_honey')) { succeed(); return; }          // bots: pretend, send nothing
    status.hidden = true;
    btn.classList.add('busy');
    label.textContent = 'Sending\u2026';
    try {
      if (location.hash === '#demo') {
        await new Promise(r => setTimeout(r, 900));
      } else {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch(ENDPOINT, {
          method: 'POST', signal: ctrl.signal,
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: JSON.stringify({
            name: val('name'), email: val('email'), phone: val('phone'), business: val('business') || '-',
            service: val('service'), message: val('message'),
            _subject: 'New enquiry from ' + val('name') + ' | SP GROWX', _template: 'table', _captcha: 'false', _replyto: val('email')
          })
        });
        clearTimeout(timer);
        const j = await res.json().catch(() => ({}));
        if (!res.ok || !(j.success === true || j.success === 'true')) throw new Error('not sent');
      }
      succeed();
    } catch (err) {
      fallback();
    } finally {
      btn.classList.remove('busy');
      label.textContent = 'Let\u2019s Talk';
    }
  });

  document.getElementById('ctreset').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.err').forEach(f => f.classList.remove('err'));
    form.classList.remove('done');
    status.hidden = true;
  });
})();
