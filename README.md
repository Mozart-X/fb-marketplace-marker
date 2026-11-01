# Marketplace Tidy

A minimal, local-only Chrome extension for Facebook Marketplace. Hide junk, tag what matters, and stop seeing the same listings twice — with **zero** network calls, accounts, or tracking.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Local only](https://img.shields.io/badge/data-100%25%20local-brightgreen)

## Features

- **🏷 Mark** — tag any listing with a red **Marked** badge (it stays visible, just stands out).
- **👁 Seen / unseen** — opening a listing auto-marks it; toggle manually too. On the feed, seen listings are **tagged** (gray badge), **dimmed**, **hidden**, or left alone — your choice.
- **Messaged** — listings whose seller you've already messaged get an amber **Messaged** badge, detected automatically.
- **✕ Hide** — remove a listing entirely, with a 5-second **Undo**.
- **🚫 Hide by seller** — one click on a listing page blocks every listing from that seller.
- **Keyword blocking** — hide listings whose text matches your words (e.g. `broken`, `for parts`).
- **Popup dashboard** — live counts, blocked-seller list, and one-click Clear / Unhide / Reset.

Everything is stored locally in `chrome.storage.local`. See [PRIVACY.md](PRIVACY.md).

## Install (unpacked)

1. [Download / clone](https://github.com/Mozart-X/fb-marketplace-marker) this repo.
2. Open `chrome://extensions`.
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder.
5. Open [facebook.com/marketplace](https://www.facebook.com/marketplace) and hover a listing.

Edited the code? Click the ↻ **reload** icon on the extension card at `chrome://extensions`, then refresh the Marketplace tab.

## How it works (and its one honest limitation)

Facebook's DOM uses randomized class names, so the extension keys off the one stable thing every card exposes — the numeric id in `/marketplace/item/<id>`. Cards are located by climbing the DOM until a parent holds more than one distinct listing (that's a grid cell). A `MutationObserver` re-applies on infinite scroll, and the logic self-heals when React swaps nodes. Item-hide, marking, seen-tracking, and keyword blocking are therefore rock-solid.

**Seller hiding is learned, not psychic.** Feed cards don't contain the seller's name — you only see it on the listing page. So the extension records `listing → seller` the first time you open any listing, and blocking a seller instantly hides every listing you've already opened from them, plus any you open later. It can't retroactively hide a seller's listings you've never clicked, because Facebook never told the page who they belong to. In practice: block a spammy seller once from their listing and they stay gone.

## Project layout

| File | Role |
|------|------|
| `manifest.json` | MV3 manifest |
| `content.js` | the engine (runs on Marketplace pages) |
| `content.css` | injected UI, all `.fbm-*` scoped |
| `popup.html` / `popup.js` | settings dashboard |
| `PRIVACY.md` | privacy policy |
| `CHANGELOG.md` | version history |

## Roadmap ideas

See the issues tab. Candidates: toolbar icons, export/import of settings, keyword *highlighting*, per-listing notes, and a Firefox port.

## License

[MIT](LICENSE) © Avishek Chaulagain
