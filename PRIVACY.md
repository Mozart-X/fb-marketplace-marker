# Privacy Policy — Marketplace Tidy

_Last updated: 2026-11-01_

Marketplace Tidy is built to collect nothing. It has no servers, no analytics, and no account.

## What it stores

The extension keeps a small amount of data **only in your own browser**, via Chrome's
`chrome.storage.local` API:

- Numeric listing IDs you hide, mark, or have viewed
- Numeric seller IDs (and names) you choose to block
- A learned `listing → seller` map, built only from listing pages you open
- Your keyword block list and settings (enabled, seen-mode)

## What it does NOT do

- It makes **no network requests** of its own. Nothing is ever sent anywhere.
- It does **not** read your messages, profile, friends, payment info, or browsing history.
- It does **not** use cookies, tracking pixels, or third-party scripts.
- It does **not** sync to any cloud. Data lives on the device where you created it.

## Permissions

| Permission | Why |
|------------|-----|
| `storage` | Save your hides/marks/settings locally. |
| host access to `*.facebook.com` | Run the content script on Marketplace pages so it can hide and tag listings. |

## Your control

Everything can be wiped at any time from the popup — **Clear marks**, **Unhide all**,
**Clear seen**, or **Reset everything** — or by removing the extension, which deletes all
of its local storage.

## Contact

Open an issue on the GitHub repository.
