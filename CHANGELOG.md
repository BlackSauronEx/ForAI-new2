# RVN Compare Products for WooCommerce — Changelog

Format: version — date — what changed. The public version of this journal is the
Changelog section of `readme.txt`.

## 0.5.0 (in development) — settings UI on constrained React

> **Status: Round A done (26.09.2026).** Scaffolding verified: level 0 green,
> level 1 green on `main` (12/12, admin browser checks 13/13 with the new React
> mount check, Plugin Check 0/0). Report: `docs/test-reports/0.5.0.md`.
> No version bump yet — headers stay 0.4.1 until Round F housekeeping.

### Added (Round A: scaffolding)
- New “General” tab on the Compare settings page, rendered by a React app on
  stable `@wordpress/components` (`TabPanel`, `Notice`); read-only scaffold,
  no saving yet. Sources in `wp-dev/admin-ui/src/`, built bundle in
  `assets/admin/` (React comes from WordPress core, bundle is ~1.4 KB).
- PHP bootstrap (`Admin\Settings_App`): capability-gated enqueue on the Compare
  page only, nonce + settings + translated strings via inline data, PHP fallback
  notice if the bundle fails to load, `<noscript>` message.
- Build chain `wp-dev/admin-ui/build.sh` (builds in `/tmp`, keeps `node_modules`
  out of the working area); generated `*.asset.php` excluded from PHPCS filename
  rules; 8 new strings translated (POT 186 entries).

## 0.4.1 — 25.09.2026 — fixes from the user's manual check

> **Status: verified.** The fixes were checked by the user on the classic Storefront
> 4.6.2 theme (5/5) and re-verified in this working area on 26.09.2026 by the full
> `wp-dev/check.sh` programme — levels 0, 1 and 2 (main + min stand + WP Super Cache),
> zero code changes. Report: `docs/test-reports/0.4.1.md`.

### Fixed
- **Static shortcode `[rvn-compare-table products="…"]`**: number extraction now uses a regular expression instead of a fragile `explode()`. Any quotes (Russian « », typographic, straight), spaces, commas and semicolons are parsed correctly — every listed product reaches the table.
- **Product thumbnails in the table header**: the image container received a strict height limit (140 px), inner padding and `overflow: hidden`, and the card became a flex column. Large product photos no longer stretch across the cell or slide under the title, price and button.
- **Slider arrows**: replaced with clean round white buttons with neatly centred SVG chevrons and a soft hover effect. The conflict with Storefront's global button styles (stretching into a blue oval) is resolved. At the end of the list the arrows no longer disappear but become inactive (disabled) — this prevents accidental clicks on the products underneath.
- **No more table jump when switching browser tabs**: a `sameIds()` check prevents needless repeated REST requests when the product list has not changed. The "Loading comparison list…" banner is no longer shown during a background refresh of an already rendered table, so the table does not jump down and up.
- **Desktop column calculation**: breakpoints now use the actual screen width (`window.innerWidth`), so boxed themes with a medium content width (Storefront) show the full 5 columns on desktop instead of 3.

## 0.4.0 — 25.09.2026 — iteration 3, comparison page and table

> **Status: verified.** The full `wp-dev/check.sh` cycle passed on 25.09.2026:
> static / tests (main, min) / stand (main, min) / front / table / pcp / cache —
> all green, Plugin Check 2.1.0: 0 errors, 0 warnings.
> Report: `docs/test-reports/0.4.0.md`. (Historical note: the 12 screenshots of that
> run lived in `public/reports/0.4.0/` of the previous workspace and were not
> carried over — this working area is text-only by decision.)

### Added
- Automatic comparison page (`compare` / `compare-products`) with the `[rvn-compare-table]` shortcode, a label in the page list, `noindex` and optional automatic table insertion into `the_content`.
- Page admin actions: create / select / reset (with backup) / restore.
- Shortcode `[rvn-compare-table class="" products=""]`: a live table from the visitor's list or a static table by IDs.
- REST `GET /rvn-compare/v1/table` — tabs/columns/rows without personal data in the page HTML.
- Table fields: price, sku, availability, rating, brand (when present), weight, dimensions, short_description, description; all global WC attributes; explicit meta fields.
- Field groups `basic` / `size` / `specifications`, with order and visibility settings.
- "Only differences", difference highlighting, hiding empty rows, value tooltips, smart-normalize.
- `table.js` + `table.css`: tabs, horizontal scroll arrows, feature caption rows above value strips, empty state, clear tab/all.
- Column settings 5/3/2 and breakpoints 1024/768; admin tabs Page + Table.

### Fixed during the 0.4.0 check
- The static shortcode `[rvn-compare-table products="…"]` no longer splits the
  requested products across category tabs: all listed IDs appear side by side in
  one group ("All products"). REST `GET /table` passes a static-request flag to
  `Table_Data::build()`.
- WPCS formatting: alignment in `class-assets.php` and `class-table-data.php`,
  a Yoda condition in `class-shortcodes.php`, the `Table_View::render()` parameter
  renamed from `$static` to `$is_static` (reserved word).
- New regression autotests for product availability: private product, trashed
  product, filtering unavailable products out of the guest state and out of the
  table columns (core autotests: 36 → 41 checks).

### Closed technical debt
- `check.sh static|tests|stand|table|pcp|cache` — run, all green.
- `readme.txt`: `Stable tag: 0.4.0`, Changelog and description moved to the
  "verified" status (was "draft").
- i18n: no new strings appeared (the "All products" label already existed); the
  `wp-dev/i18n/ru_RU.json` dictionary is complete, the POT is current.
- (Historical note: the original entry also said "E2E/screenshots of the table are
  missing", which contradicts the report — the table check ran 7/7 with
  screenshots. Kept here only as a record of the earlier inconsistency.)

## 0.3.1 — 24.09.2026 — fixes from the user's report

### Fixed
- The compare button did not appear on the product page in classic templates (Storefront, Astra and others): automatic insertion was implemented for block templates only. Standard WooCommerce hooks were added for every position, including the over-image positions.
- The "Compare" button showed two icons at once: the rule hiding the "In comparison" icon lost to the rule showing it on CSS specificity.
- In "icon only" mode the active button gained stray "In comparison" text — the mode rules lost to the state rules.
- "Undo" in the product-added notification did not work: it always called add. The action direction is now passed explicitly.
- Over-image positions were placed relative to the product column; the slot is now moved into the image container — all four corners are exact.

### Improved
- The notification countdown pauses on hover and resumes when the cursor leaves.
- Page caches are flushed on plugin activation (WP Super Cache, W3 Total Cache, WP Rocket, LiteSpeed): pages cached before activation are no longer served without buttons.

## 0.3.0 — 24.09.2026 — iteration 2, buttons, counters and notifications

### Added
- Compare button on product cards and on the product page: the 9 positions from the specification, classic WooCommerce hooks and block templates (`render_block`), exclusions honoured; "on image" positions are neatly placed over the picture, and without an image container the button stays "after Buy".
- Two button states — "Compare" and "In comparison"; pressing again removes the product; the state survives a reload.
- Counter button, a plain counter with a label, "Clear all" and the category limit progress — all update without a page reload.
- Notifications: added, removed, cleared, category limit and total limit. Countdown bar, close button, "Undo" for removal and clearing.
- Shortcodes: `[rvn-compare-button]`, `[rvn-compare-counter]`, `[rvn-compare-counter-button]`, `[rvn-compare-clear]`, `[rvn-compare-progress]`; all accept a `class` argument.
- Tab synchronisation: `storage` and `BroadcastChannel` events, refresh on returning to the tab and when a page is restored from the browser cache.
- Cache compatibility: the list lives in the browser and loads on top of the ready page; the `GET /session` route serves a fresh security key when the markup came from a cache.
- Button and notification settings in storage: positions, desktop and phone modes, button texts (empty value = translation), notification position and duration, accent colour with derived shades, panel offsets.
- Screen safe areas: the script appends `viewport-fit=cover`, and edge elements honour the system strip and notches.

### Changed
- Assets load only on pages with comparison elements (shop, categories, product, cart, search or a page with the shortcode).
- Script data travels via an explicit inline script instead of `wp_localize_script`.

### Fixed
- Card buttons now enqueue the script (previously they could render without a handler).
- Asset enqueue order: enqueueing from block rendering happened before the script queue existed, which lost data and styles.
- `add_filter` instead of `add_action` for the `render_block` filter.

## 0.2.0 — 24.09.2026 — iteration 1, comparison core

### Added
- List storage: guests — a browser list (the server normalises and validates it), signed-in users — JSON `{"v":1,"ids":[…],"ts":…}` in the `rvn_compare_list` user option (separately per network site).
- Comparison service: read, add, remove, clear, merge on login. Duplicates and unavailable products (drafts, private, variations, deleted) are dropped; when the limit is lowered the excess is cut from the end; merging is idempotent.
- Limits of 50 total and 12 per category/group with the iron rule: a full tab blocks adding, and the response carries a clear reason and the full tab.
- Category model: direct categories only; comparison rule (by categories, by top level, no split); ignored categories; category groups (a category belongs to one group); an "Other" group with an editable name.
- Product and category exclusions for automatic buttons (per "card" and "product page" contexts); exclusion wins.
- REST API `rvn-compare/v1`: `GET /list`, `POST /items`, `POST /items/remove`, `POST /clear`, `POST /merge`. Reading is public, changes require the `wp_rest` key; merging is rate-limited (20/min), the client address is stored hashed only.
- "Tools → RVN Diagnostics" page: site environment and a copyable report.
- Core autotests (34 checks) and a REST smoke test (10 checks) on the stands, command `wp-dev/check.sh tests`.

### Fixed after the checks
- Negative IDs no longer turn into valid ones (`absint(-1)` returned 1).
- Merging no longer trims the guest list to the limit before the skip logic runs.
- An implicitly nullable parameter replaced with an explicit `?array` — compatible with PHP 8.4.

## 0.1.0 — 23.09.2026 — iteration 0, plugin skeleton

### Added
- Main file with the catalog header: WordPress 6.4+, PHP 8.1+, WooCommerce 8.2+ (tested up to WordPress 7.1 and WooCommerce 11.1).
- PHP check in the main file without PHP 7.1+ syntax: on an old PHP — a notice instead of a fatal error.
- WordPress and WooCommerce check with a notice and "Install WooCommerce", "Activate WooCommerce" (with a core nonce) and "Go to updates" links; the notice disappears by itself.
- WooCommerce compatibility declarations: HPOS, cart and checkout blocks, block product editor.
- RVN line shared core: an "RVN" menu with an "R" icon right after "Marketing", "Compare" and "Support" subitems, protection against duplicates and conflicts with several line plugins (the newest core copy loads).
- "Compare" page (for now — a system status table) and a "Settings" link on the "Plugins" screen.
- Data version and installation, including lazy installation on network sites after network activation.
- Data removal honouring the `delete_data_on_uninstall` setting (default — delete) and multisite; the comparison page is never deleted.
- Russian translation, POT template, MO and `.l10n.php` files.
- The `rvn_compare_loaded` action for third-party developers.

### Development tools (not part of the plugin package)
- `wp-dev/stand.sh` — WordPress + WooCommerce stands on MariaDB, PHP 8.1–8.4.
- `wp-dev/check.sh` — all checks in one command; `wp-dev/build-zip.sh` — ZIP build (removed later, see `docs/DECISIONS.md`); `wp-dev/i18n.sh` — translations; `wp-dev/seed.php` — demo store; `wp-dev/e2e/` — browser scenarios.
