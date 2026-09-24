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
The form posts to FormSubmit (`https://formsubmit.co/ajax/spgrowx@gmail.com`), which forwards
each message to that inbox. **The first live submission sends an activation email to
spgrowx@gmail.com. Confirm it once, then messages arrive normally.**

* If sending fails, the page never claims success. It shows WhatsApp / email buttons with the
  visitor's details pre-filled.
* To preview the success animation without sending anything, open
  `contact.html#demo`, fill the form and submit.
* To use a different inbox or service, edit `ENDPOINT` at the top of `assets/js/contact.js`.

## Editing content
* Navbar and footer are repeated in each HTML file: change them in all four pages.
* Colours are CSS variables at the top of `assets/css/style.css` (`--orange`, `--bg`, `--ink`).
* The homepage hero cards (4.2x ROAS, +218% organic clicks, etc.), the "100+ Marketing Ideas"
  stat and the descriptive copy on the Services and About pages are draft content: review and
  edit them so they only state what you can stand behind.
