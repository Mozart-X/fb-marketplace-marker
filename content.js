/* Marketplace Tidy — content script
 * Stable hook: every listing exposes <a href=".../marketplace/item/<id>">.
 * Everything keys off that numeric item id, so it survives FB's obfuscated class names.
 */
(() => {
  if (window.__fbmTidy) return;
  window.__fbmTidy = true;

  const ITEM_RE   = /\/marketplace\/item\/(\d+)/;
  const SELLER_RE = /\/marketplace\/profile\/(\d+)/;
  const SEEN_CAP  = 6000;

  const defaults = {
    enabled: true,
    seenMode: 'tag',       // 'tag' | 'dim' | 'hide' | 'off'
    keywords: [],          // lowercased words/phrases
    hiddenItems: {},       // itemId -> 1
    hiddenSellers: {},     // sellerId -> name
    itemSeller: {},        // itemId -> sellerId  (learned from item pages)
    seenItems: {},         // itemId -> timestamp
    marked: {},            // itemId -> 1  (manual red flag)
    messaged: {}           // itemId -> 1  (auto + stays)
  };
  let S = { ...defaults };
  const api = (typeof chrome !== 'undefined' && chrome.storage) ? chrome : null;

  // ---------- storage ----------
  function load() {
    return new Promise(res => {
      if (!api) return res();
      api.storage.local.get(null, d => { S = { ...defaults, ...(d || {}) }; res(); });
    });
  }
  function save(patch) {
    Object.assign(S, patch);
    if (api) api.storage.local.set(patch);
  }
  function prune(map) {
    const keys = Object.keys(map);
    if (keys.length <= SEEN_CAP) return map;
    keys.sort((a, b) => map[a] - map[b]);               // oldest first
    for (let i = 0; i < keys.length - SEEN_CAP; i++) delete map[keys[i]];
    return map;
  }

  // ---------- card discovery ----------
  const idFromHref = href => { const m = href && href.match(ITEM_RE); return m ? m[1] : null; };

  function distinctIds(scope) {
    const s = new Set();
    scope.querySelectorAll('a[href*="/marketplace/item/"]').forEach(a => {
      const id = idFromHref(a.getAttribute('href'));
      if (id) s.add(id);
    });
    return s;
  }

  // Climb until the parent holds >1 distinct listing — that makes `el` one grid cell.
  function findCard(anchor) {
    let el = anchor, hops = 0;
    while (el && el.parentElement && el.parentElement !== document.body && hops < 14) {
      if (distinctIds(el.parentElement).size > 1) return el;
      el = el.parentElement; hops++;
    }
    return anchor;
  }

  // ---------- classification ----------
  function keywordHit(text) {
    if (!S.keywords.length) return false;
    const t = text.toLowerCase();
    return S.keywords.some(k => k && t.includes(k));
  }

  // returns { hide?, dim?, badge? }
  function stateFor(id, text) {
    if (S.hiddenItems[id]) return { hide: true };
    const sid = S.itemSeller[id];
    if (sid && S.hiddenSellers[sid]) return { hide: true };
    if (keywordHit(text)) return { hide: true };
    if (S.marked[id])   return { badge: 'marked' };
    if (S.messaged[id]) return { badge: 'messaged' };
    if (S.seenItems[id]) {
      if (S.seenMode === 'hide') return { hide: true };
      if (S.seenMode === 'dim')  return { dim: true, badge: 'seen' };
      if (S.seenMode === 'tag')  return { badge: 'seen' };
    }
    return {};
  }

  const LABEL = { marked: 'Marked', messaged: 'Messaged', seen: 'Seen' };

  function setBadge(card, kind) {
    let b = card.querySelector(':scope > .fbm-badge');
    if (!kind) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.className = 'fbm-badge'; card.appendChild(b); }
    b.className = 'fbm-badge fbm-' + kind;
    b.textContent = LABEL[kind];
  }

  // ---------- per-card controls ----------
  function injectControls(card, id) {
    if (card.dataset.fbmCtrl) return;
    card.dataset.fbmCtrl = '1';

    const bar = document.createElement('div');
    bar.className = 'fbm-ctrl';

    const mk = (cls, txt, title) => {
      const b = document.createElement('button');
      b.className = 'fbm-btn ' + cls; b.type = 'button'; b.textContent = txt; b.title = title;
      return b;
    };
    const flag = mk('fbm-flag', '🏷', 'Mark (red tag)');
    const seen = mk('fbm-eye', '👁', 'Mark seen / unseen');
    const hide = mk('', '✕', 'Hide this listing');

    // One handler per button: swallow the event (capture, before FB's delegated
    // listeners) AND run the action in the same listener, so nothing cancels it.
    const on = (btn, fn) => {
      btn.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); }, true);
      btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fn(); }, true);
    };

    on(flag, () => {
      const m = { ...S.marked };
      if (m[id]) delete m[id]; else m[id] = 1;
      save({ marked: m }); apply();
    });

    on(seen, () => {
      const m = { ...S.seenItems };
      if (m[id]) delete m[id]; else m[id] = Date.now();
      save({ seenItems: prune(m) }); apply();
    });

    on(hide, () => {
      save({ hiddenItems: { ...S.hiddenItems, [id]: 1 } });
      apply();
      toast('Listing hidden', () => {
        const h = { ...S.hiddenItems }; delete h[id];
        save({ hiddenItems: h }); apply();
      });
    });

    bar.appendChild(flag); bar.appendChild(seen); bar.appendChild(hide);
    card.appendChild(bar);
  }

  // ---------- apply to all cards ----------
  function apply() {
    document.querySelectorAll('a[href*="/marketplace/item/"]').forEach(a => {
      if (a.closest('.fbm-card[data-fbm-id]')) return;
      const id = idFromHref(a.getAttribute('href'));
      if (!id) return;
      const card = findCard(a);
      card.classList.add('fbm-card');
      card.dataset.fbmId = id;
    });

    document.querySelectorAll('.fbm-card[data-fbm-id]').forEach(card => {
      const id = card.dataset.fbmId;

      if (!S.enabled) {
        card.classList.remove('fbm-hidden', 'fbm-dim');
        setBadge(card, null);
        return;
      }
      injectControls(card, id);

      // Match against visible text plus each listing link's aria-label — some cards
      // render the title only inside the image's accessible name, not as page text.
      let text = card.innerText || '';
      card.querySelectorAll('a[href*="/marketplace/item/"]').forEach(x => {
        const al = x.getAttribute('aria-label');
        if (al) text += ' ' + al;
      });
      const st = stateFor(id, text);
      card.classList.toggle('fbm-hidden', !!st.hide);
      card.classList.toggle('fbm-dim', !!st.dim);
      setBadge(card, st.badge || null);

      const eye = card.querySelector('.fbm-eye');
      if (eye) eye.classList.toggle('fbm-on', !!S.seenItems[id]);
      const flag = card.querySelector('.fbm-flag');
      if (flag) flag.classList.toggle('fbm-on', !!S.marked[id]);
    });
  }

  // ---------- item page: seen + messaged + seller ----------
  function removePill() {
    const p = document.getElementById('fbm-seller-pill');
    if (p) p.remove();
  }

  function buildPill(sellerId, name) {
    removePill();
    const pill = document.createElement('button');
    pill.id = 'fbm-seller-pill';
    pill.type = 'button';
    const blocked = !!S.hiddenSellers[sellerId];
    pill.textContent = blocked ? `✓ Showing ${name}` : `🚫 Hide ${name}'s listings`;
    pill.classList.toggle('fbm-blocked', blocked);
    pill.addEventListener('click', () => {
      const map = { ...S.hiddenSellers };
      if (map[sellerId]) delete map[sellerId]; else map[sellerId] = name;
      save({ hiddenSellers: map });
      buildPill(sellerId, name);
      apply();
    });
    document.body.appendChild(pill);
  }

  // Several profile links can point at the same seller (e.g. a generic "Seller
  // details" link plus the real name). Prefer the one that looks like a name.
  const GENERIC = /^(seller details|seller information|see details|view( seller)? profile|details|message|about)$/i;
  function detectSeller(id, tries) {
    let best = null;
    for (const a of document.querySelectorAll('a[href*="/marketplace/profile/"]')) {
      const m = (a.getAttribute('href') || '').match(SELLER_RE);
      const name = (a.textContent || '').trim();
      if (!m || !name) continue;
      const cand = { sellerId: m[1], name };
      if (!GENERIC.test(name)) { best = cand; break; }  // a real name wins immediately
      if (!best) best = cand;                           // otherwise keep a fallback
    }
    if (best) {
      if (S.itemSeller[id] !== best.sellerId) save({ itemSeller: { ...S.itemSeller, [id]: best.sellerId } });
      buildPill(best.sellerId, best.name);
      apply();
      return;
    }
    if (tries > 0) setTimeout(detectSeller, 900, id, tries - 1);
  }

  // If the item page shows an existing conversation, you've messaged this seller.
  function detectMessaged(id, tries) {
    if (S.messaged[id]) return;
    const hit = [...document.querySelectorAll('div[dir="auto"], span[dir="auto"]')]
      .some(e => { const t = e.textContent.trim(); return t === 'You sent' || t === 'You sent.'; });
    if (hit) { save({ messaged: { ...S.messaged, [id]: 1 } }); apply(); return; }
    if (tries > 0) setTimeout(detectMessaged, 1200, id, tries - 1);
  }

  function handleItemPage() {
    const m = location.pathname.match(ITEM_RE);
    if (!m) { removePill(); return; }
    const id = m[1];
    if (!S.seenItems[id]) save({ seenItems: prune({ ...S.seenItems, [id]: Date.now() }) });
    setTimeout(detectSeller, 1000, id, 6);
    setTimeout(detectMessaged, 1500, id, 6);
  }

  // ---------- toast ----------
  let toastTimer = null;
  function toast(msg, undo) {
    let el = document.getElementById('fbm-toast');
    if (!el) { el = document.createElement('div'); el.id = 'fbm-toast'; document.body.appendChild(el); }
    el.innerHTML = '';
    const span = document.createElement('span'); span.textContent = msg;
    const btn = document.createElement('button'); btn.textContent = 'Undo';
    btn.addEventListener('click', () => { undo(); el.classList.remove('fbm-show'); });
    el.appendChild(span); el.appendChild(btn);
    el.classList.add('fbm-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('fbm-show'), 5000);
  }

  // ---------- scheduling ----------
  let raf = null;
  function schedule() { if (raf) return; raf = requestAnimationFrame(() => { raf = null; apply(); }); }
  const mo = new MutationObserver(schedule);

  function start() {
    apply();
    handleItemPage();
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // SPA navigation (FB uses pushState).
  let lastPath = location.pathname;
  function onNav() {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    removePill();
    handleItemPage();
    schedule();
  }
  ['pushState', 'replaceState'].forEach(fn => {
    const orig = history[fn];
    history[fn] = function () { const r = orig.apply(this, arguments); onNav(); return r; };
  });
  window.addEventListener('popstate', onNav);
  setInterval(onNav, 1000);

  if (api) api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const k in changes) S[k] = changes[k].newValue;
    apply();
    const m = location.pathname.match(ITEM_RE);
    if (m) setTimeout(detectSeller, 0, m[1], 0);
  });

  load().then(start);
})();
