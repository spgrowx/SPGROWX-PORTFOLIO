# SP GROWX website

A plain multi-page static website. No build step, no framework, no server code.

```
index.html      Home
services.html   Services
about.html      About
contact.html    Contact (form + contact cards)
assets/
  css/style.css   All styles (shared by every page)
  js/main.js      Shared behaviour: navbar, reveal animations, timeline, parallax, buttons
  js/contact.js   Contact form logic (contact.html only)
  images/         Logo, favicon, statue layers, grain texture
```

## Preview
Open `index.html` in a browser. Pages link to each other with normal relative links, so it
works from a folder on your computer, from GitHub Pages, or any static host.

## Deploy to GitHub Pages
Upload the contents of this folder to the root of your repository (keep the `assets/` folder
next to the HTML files) and enable Pages for the branch.

## Contact form
The form only sends when every field is genuinely filled in:

* **Full name**: letters only, at least 2 letters.
* **Email**: must be a properly formed address. `@gmail.com` addresses are checked as Gmail
  (6-30 letters/numbers/dots) and typos like `gmial.com` / `gmail.con` show "Did you mean ...?".
* **Phone**: pick a country code, then type digits only. The box stops at the maximum number of
  digits for that country (India = 10 digits, starting 6-9). Pasting `+91 98765 43210` is cleaned automatically.
* **Message**: at least 10 characters. **Business name** is optional.

Messages are forwarded to spgrowx@gmail.com by FormSubmit (`https://formsubmit.co/ajax/spgrowx@gmail.com`).
**The first live submission sends an activation email to spgrowx@gmail.com. Confirm it once.**
The "Thank you" screen appears only when delivery is confirmed; otherwise the visitor gets WhatsApp /
email buttons with their details pre-filled. To preview the success animation without sending,
open `contact.html#demo`. To use another inbox or service, edit `ENDPOINT` in `assets/js/contact.js`.

## Sizing
All sizes are `rem`-based. On screens 993px and wider the root font size scales with the screen
(`html` rule near the top of `assets/css/style.css`), so the pages fit common laptop screens at 100% zoom.
Make everything a little bigger or smaller by changing the three numbers in that `clamp()`.

## Editing content
* Navbar and footer are repeated in each HTML file: change them in all four pages.
* Colours are CSS variables at the top of `assets/css/style.css` (`--orange`, `--bg`, `--ink`).
* The homepage hero cards (4.2x ROAS, +218% organic clicks, etc.), the "100+ Marketing Ideas"
  stat and the descriptive copy on the Services and About pages are draft content: review and
  edit them so they only state what you can stand behind.
