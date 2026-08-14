# Green Turtle Kava — Design Tokens

Source: the brand's original theme stylesheet (ground truth)
+ computed-style inspection of the live homepage at 1920px.
Framework underneath: **Bootstrap 4.6** grid (`.container` = 1140px, 15px gutters) with a custom theme layer on top.
No Tailwind/Elementor classes are to be copied — values only.

## Colors

| Token | Hex | Usage |
|---|---|---|
| `navy` | `#2B495F` | Top utility bar bg, submit-button bg, dark accents |
| `gold` | `#C5A771` | Nav bar bg, primary accent, borders, icon hovers |
| `brown` | `#614B34` | H2 headings, footer bg, view-button text/border |
| `brown-dark` | `#604A34` | Button bg (customer/sign), link hover states |
| `tan` | `#AF976C` | Button borders, hover backgrounds |
| `tan-light` | `#B39D76` | Secondary tan accent |
| `cream` | `#E6D8BE` | Body/page background |
| `muted-blue` | `#73848E` | Muted secondary text |
| `muted-gray` | `#869195` | Paragraph text color |
| `heading-blue` | `#445E71` | Card titles (team cards) |
| `link` | `#614B34` | Default link color |
| `link-hover` | `#2B1E10` | Link hover (very dark brown) |
| `white` | `#FFFFFF` | Header text, footer text, button text |
| `black` | `#000000` / `#0B0907` | Rare, dark overlays |
| `alert-red` | `#E11738` | Sale/alert accent (rare, 1 use) |
| body text | `#212529` | Bootstrap default body text color |

## Typography

Self-hosted in `public/fonts/` (from the brand's original theme):

| Font family (CSS name) | File | Weight/style | Usage |
|---|---|---|---|
| `the_foregen_rough_oneregular` ("The Foregen Rough One") | `fontsfree-net-theforegenroughone-webfont.woff2/.woff` | normal/normal | **Body default + all headings** (h1/h2) — hand-drawn display font. This is the site's signature look. |
| `Futura PT Medium` | `Futura PT Medium.woff2/.woff/.ttf` | — | Nav links, buttons, footer links, small headings (h4) |
| `futura-pt-book` | `futura-pt-book.woff2/.woff/.ttf` | — | `.btn-click` button text |
| `futura-pt-light` | `futura-pt-light.woff2/.woff/.ttf` | — | Light-weight body variants |
| `Nagietha Regular` | `NagiethaRegular-eZjel.woff` | normal/normal | Script/accent font (used sparingly — confirm placement per page during Phase 4) |
| `Merriweather` (Google Font, 300/400) | loaded via Google Fonts | serif | Blog post article body (`article { font-family: "Merriweather", serif }`) |

Computed values (1920px viewport, homepage):
- Body: 16px / 24px line-height, weight 400, color `#212529`, font `the_foregen_rough_oneregular`
- H1 (hero): 70px / 84px, weight 500, color `#fff` (on image overlay)
- H2: 32px / 32px, weight 500, color `#614B34`
- H4: 17px / 20.4px, weight 400, font `Futura PT Medium`, color `#fff`
- Paragraph: 17px / 25.5px, weight 400, font `Futura PT Medium`, color `#869195`
- Link: 16px / 24px, font `the_foregen_rough_oneregular`, color `#2A495E`(nav)/`#614B34`(body)

⚠️ Roboto + Roboto Slab are loaded via an Elementor local-Google-Fonts stylesheet but are **not** used on the templates inspected so far — likely leftover/unused or reserved for specific Elementor widgets. Do not treat as primary fonts; verify per-page in Phase 4 before excluding entirely.

## Layout

- Container: Bootstrap `.container`, **max-width 1140px**, 15px horizontal padding each side (standard Bootstrap breakpoints: 576/768/992/1200px → container 540/720/960/1140px)
- Mobile nav collapse breakpoint: **991px** (Bootstrap `lg`), the dominant breakpoint in the theme's media queries (75 occurrences); secondary tweaks at 767px and 1024px
- Header: top utility bar `#top-bar` height **41px** (bg `#2B495F`), nav bar `.header-background` height **145px** (bg `#C5A771`), logo image overlaps both, extending below the nav bar into the hero
- Footer: `#footer-content` bg `#614B34`, full width, ~645px tall on homepage (content-dependent), white text throughout, circular "back to top" button (50% radius, white bg, brown icon)

## Borders & Radius

- **Radius is 0 (sharp corners) everywhere** except perfect circles (`border-radius: 50%` — back-to-top button, icon badges). This is a deliberate flat/sharp aesthetic — do not round buttons or cards.
- One exception found: `border-radius: 25px` (single rule, confirm context in Phase 3)

## Buttons (from theme CSS, verbatim)

| Class | Style |
|---|---|
| `.btn-customer` | `border: 2px solid #AF976C; background: #604A34; color: #fff; font: 20px "Futura PT Medium"; padding: 6px 20px; radius: 0; transition: 0.3s` → hover bg `#AF976C` |
| `.btn-view` | `background: transparent; border: 2px solid #614B34; color: #614B34; font: 20px "Futura PT Medium"; radius: 0` → hover bg `#614B34` |
| `.btn-click` | `background: transparent; border: 1px solid #C5A771; color: #fff; font: 18px "futura-pt-book"; radius: 0` → hover bg `#C5A771` |
| `.btn-submit` | `background: #2B495F; border: 3px solid #C5A771; color: #fff; font: 19px; radius: 0` → hover bg transparent |
| `.btn-sign` | `border: 2px solid #AF976C; color: #fff; font: 20px "Futura PT Medium"; radius: 0` → hover bg `#AF976C` |

All button hover transitions: **0.3s** (ease, default timing function — confirm easing curve in Phase 3 devtools pass if non-default).

## Shadows

No meaningful `box-shadow` usage found in the theme stylesheet (flat design, relies on borders not shadows). Re-verify per-component in Phase 3 (cards, dropdowns) since some Elementor per-page CSS (`post-89.css`, `post-27.css`) is not yet audited.

## Open items for Phase 3 verification (not yet measured)
- Exact easing/timing-function for hover transitions (assumed `ease`, confirm)
- Dropdown menu shadow/positioning
- Mobile menu open/close animation
- Elementor per-page CSS (`post-89-css`, `post-27-css`) — page-builder overrides on specific pages not covered by the shared theme stylesheet
- OwlCarousel2 configuration (autoplay, dots/arrows styling) — used for at least one slider (team/testimonials section)
