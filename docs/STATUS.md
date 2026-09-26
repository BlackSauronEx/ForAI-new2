# RVN Compare — Project Status

> **Read this file first** in every session. It is the single source of truth for
> current project state, verified milestones, and the next steps.

> **Для пользователя (кратко):** раунд A 0.5.0 готов: каркас настроек собран и
> проверен (уровень 0 и уровень 1 зелёные, приложение открывается в браузере
> без ошибок). Дальше — вкладка «Основное», но только по вашей команде.

---

## Current State

| Attribute | Status |
| --- | --- |
| **Current Stage** | **0.5.0 Round A done** (26.09.2026): settings-app scaffolding verified level 0 + level 1, zero regressions. Next: Round B (General tab) — only on the user's go. |
| **Verified Builds** | `0.1.0` → `0.2.0` → `0.3.0` → `0.3.1` → `0.4.0` → **`0.4.1`** (verified range: WP 6.6.9 – 7.1.2, WC 9.0.4 – 11.1.2, PHP 8.1/8.3). |
| **Platform Baseline** | Decided: **WordPress 6.6+**, **WooCommerce 9.0+**, **PHP 8.1+**. The plugin headers still declare the old minimums (`Requires at least: 6.4`) — the bump ships with 0.5.0, together with the `.mo` removal. |
| **Admin UI Technology** | Decided: PHP-bootstrapped React on **stable** `@wordpress/components`; PHP owns capabilities/nonce/sanitize; core-provided packages via `.asset.php`; shop frontend stays vanilla JS. Details — `docs/DECISIONS.md`. |
| **Delivery Model** | Clean plugin folder `rvn-compare-products-for-woocommerce/`. ZIP generation is disabled in this working area. |
| **Test Environment** | `wp-dev/check.sh` (levels 0/1/2) + `wp-dev/stand.sh` + `wp-dev/docs-check.sh`, all exercised by real runs. |
| **Workspace** | This chat is the primary working area: plugin (57 files, headers 0.4.1, code 0.5.0-dev) + `wp-dev/` (incl. `admin-ui/`) + `docs/` + `CHANGELOG.md`. Preview app is environment, not portable. |

---

## 0.4.1 Verification Summary

Manual 5/5 on the live Storefront 4.6.2 host; automated level 0 (5/5), level 1
`main` (12/12), level 2 `min` (11/11, Plugin Check runs on `main` only), cache
regression (24/24); Plugin Check 0/0. Zero plugin code changes. Details —
`docs/test-reports/0.4.1.md`.

---

## User Host Environment

- Web server: OpenResty, PHP 8.3.33, 256 MB memory limit.
- Theme: **Storefront 4.6.2** (classic PHP template).
- WooCommerce: HPOS enabled, Cart/Checkout blocks supported.
- Caching: **WP Super Cache** active (verified by the 24-point regression).
- Active admin plugins: Query Monitor, Plugin Check, WP Super Cache.
- Test site: `http://h607951395.nichost.ru/` (report unreachability to the user; never file it as a plugin defect).
- Target devices: Android (iOS/Safari "unverified", separate manual device run planned).

---

## Roadmap (user-approved 26.09.2026; single source alongside SPEC §12–13)

### Milestone 0.5.0 (in progress — Round A done, Round B needs a go)
1. **Settings UI on constrained React** (stable `@wordpress/components`;
   PHP sanitization stays authoritative): General tab (limits, rules,
   exclusions with server product search, where-to-show, second-click action,
   accent color, offsets, per-tab reset), Buttons & toasts tab (positions,
   modes, texts, icon set/emoji/none, toast templates), Table tab
   (`image_ratio` / `image_fit`, scrollbar, edge shadow, hybrid columns).
2. **Contextual help:** `add_help_tab()`, inline descriptions, per-shortcode
   help panels, FAQ data model for the Support screen.
3. **Housekeeping:** headers to WP 6.6 / WC 9.0; `.mo` removal;
   `wpml-config.xml`; 44 px tap targets; version 0.5.0 in three places.

### Milestone 0.6.0 (remaining original v1.0)
Group builder UI; ready nav-menu item; limit-lowered shopper notice;
object cache; basic RTL; logout test.

### Milestone 0.7.0 (RVN hub)
`RVN → Support` screen with common line tab + per-plugin tabs via
`Core::add_support_tab()`; full guide + FAQ in the “Compare” tab.

### Milestone 1.0.0 — core complete (NOT catalog submission)
Stabilization, docs, public hook/filter API. A celebration milestone; the
catalog comes only after 1.3+ and hardening.

### Milestone 1.1 (design and convenience)
Style editor with admin live mini-preview; category-tab styling (C3);
menu insertion; export/import; ACF import; shortcode builder (C1);
admin “Add product” search (C2 admin); term-description lists (C4).

### Milestone 1.2 (panels, publishing, print)
Floating panels; manual sticky-header offsets only (C8);
share + print/PDF; **comparison export to CSV** (client-side, from visible
`GET /table` data); product slider; pinned group names; stored-list rewrite
on limit drop.

### Milestone 1.3+ (extensions)
Gutenberg block (C9 classic widget only after it, low priority); concrete
variation comparison; “Recently compared” + “Similar” as two opt-out modules
(C10); second left-column table template; developer SVG filter (C5);
statistics only as a separate opt-in module (C11).

### Final hardening, then catalog
Theme matrix (Storefront, Twenty Twenty-Five, Astra, Kadence, Blocksy, Hello
Elementor — never all on one stand), WebKit/iOS, RTL, performance budgets,
accessibility, docs. Catalog submission only after this phase.

---

## Next Immediate Step

Round A is done and verified (details: `docs/test-reports/0.5.0.md`).

Open items, awaiting the user:

1. **Round B (General tab)?** Requires an explicit go: limits, comparison rule,
   ignored categories, other-label, exclusions with server product search,
   where-to-show, second-click action, accent color, offsets, per-tab reset —
   each slice followed by level 0, level 1 at the end.
2. **Manual smoke of Round A** (3 items in `docs/CHECKLIST.md`): install the
   folder on the test site, open RVN → Compare, confirm the General tab renders
   the app and the old tabs are intact.
3. **Optional WebKit pass** — informative only, does not gate anything.
