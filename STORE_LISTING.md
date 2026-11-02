# Chrome Web Store — submission kit

Everything you need to publish **Marketplace Tidy**. The packaged upload is
`dist/marketplace-tidy-v1.1.0.zip` (runtime files only — no git, docs, or dev files).

---

## 0. One-time setup

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with the Google account you want to own the listing.
3. Pay the **one-time US$5 registration fee** (required before your first publish).
4. Verify your developer email/contact when prompted.

## 1. Upload

- Click **Add new item** → upload `dist/marketplace-tidy-v1.1.0.zip`.
- The dashboard reads `manifest.json` automatically (name, version, icons).

---

## 2. Store listing fields (copy-paste)

**Item name**
```
Marketplace Tidy
```

**Summary** (max 132 chars)
```
Hide junk, tag listings, and track seen/messaged items on Facebook Marketplace. 100% local — no accounts, no tracking.
```

**Category:** Shopping
**Language:** English

**Description**
```
Marketplace Tidy cleans up Facebook Marketplace without getting in your way. Everything it stores stays on your device — no account, no servers, no tracking.

WHAT YOU CAN DO
• Mark a listing — tag it with a red badge so it stands out (it stays visible).
• Seen / unseen — listings are auto-marked when you open them; on the feed you can tag, dim, hide, or ignore seen ones.
• Messaged — listings whose seller you've already contacted get an amber badge automatically.
• Hide a listing — remove clutter with one click, with an Undo.
• Hide a seller — block every listing from a seller straight from their listing page.
• Block keywords — hide listings that mention words you don't want (e.g. "for parts").
• Backup — export and import all your settings as a file.

PRIVACY
Marketplace Tidy makes no network requests of its own. It never reads your messages, profile, friends, or payment info. All data lives in your browser's local storage and you can wipe it anytime from the popup.

Open source: https://github.com/Mozart-X/fb-marketplace-marker
```

**Privacy policy URL**
```
https://github.com/Mozart-X/fb-marketplace-marker/blob/main/PRIVACY.md
```

---

## 3. Privacy practices tab (review questions)

**Single purpose**
```
Marketplace Tidy helps users declutter Facebook Marketplace by hiding, tagging, and tracking listings. It runs only on Facebook Marketplace pages.
```

**Permission justifications**

| Permission | Justification to paste |
|------------|------------------------|
| `storage` | Stores the user's hidden/marked/seen listings, blocked sellers, keywords, and settings locally in the browser. Nothing is sent anywhere. |
| Host access to `*.facebook.com` | The content script runs on Facebook Marketplace pages to add hide/tag controls and apply the user's filters. No data leaves the page. |

**Data usage** — check these honestly:
- [x] I do **not** collect or use user data.
- Does your item collect ... (personal info, financial, authentication, location, web history, etc.)? → **No** to all.
- Certify: you do not sell data, do not use it for unrelated purposes, do not use it for creditworthiness. → **Yes, certified.**

---

## 4. Graphics you must supply

The store **requires** at least one screenshot. These can't be mocked — capture the real extension:

| Asset | Size | Required | How |
|-------|------|----------|-----|
| Screenshot(s) | 1280×800 or 640×400 PNG/JPG | **Yes (1–5)** | Load the extension, open Marketplace, mark/hide a few listings, screenshot the feed (badges visible) and the popup. |
| Small promo tile | 440×280 PNG | Optional | A simple title card. |
| Icon | 128×128 | Auto (from the zip) | Already included. |

Quick screenshot tip: in Chrome press `F12` → device toolbar → set a custom 1280×800 viewport, or just crop a normal screenshot to 1280×800.

---

## 5. Submit

- Set **Visibility** (Public, Unlisted, or Private).
- Set **Distribution** regions (default: all).
- Click **Submit for review**. First-time reviews typically take a few days.

## 6. Updating later

Bump `version` in `manifest.json`, rebuild the zip, and upload it as a new package
on the same item. The store requires the version number to increase each time.
