const defaults = {
  enabled: true, seenMode: 'tag', keywords: [],
  hiddenItems: {}, hiddenSellers: {}, itemSeller: {}, seenItems: {}, marked: {}, messaged: {}
};
let S = { ...defaults };

const $ = id => document.getElementById(id);
const count = o => Object.keys(o || {}).length;

function get() {
  return new Promise(r => chrome.storage.local.get(null, d => { S = { ...defaults, ...(d || {}) }; r(); }));
}
function set(patch) { Object.assign(S, patch); chrome.storage.local.set(patch); }

function render() {
  $('enabled').checked = S.enabled;
  document.querySelectorAll('#seen button').forEach(b => b.classList.toggle('on', b.dataset.v === S.seenMode));
  $('keywords').value = (S.keywords || []).join('\n');

  $('cMarked').textContent = count(S.marked);
  $('cMsg').textContent    = count(S.messaged);
  $('cItems').textContent  = count(S.hiddenItems);
  $('cSeen').textContent   = count(S.seenItems);

  const box = $('sellers');
  box.innerHTML = '';
  const ids = Object.keys(S.hiddenSellers);
  if (!ids.length) box.innerHTML = '<div class="empty">None yet. Open a listing and use the red button to block its seller.</div>';
  ids.forEach(id => {
    const row = document.createElement('div');
    row.className = 'seller';
    const name = document.createElement('span');
    name.textContent = S.hiddenSellers[id] || id;
    const x = document.createElement('button');
    x.textContent = '✕'; x.title = 'Unblock';
    x.onclick = () => { const m = { ...S.hiddenSellers }; delete m[id]; set({ hiddenSellers: m }); render(); };
    row.appendChild(name); row.appendChild(x);
    box.appendChild(row);
  });
}

$('enabled').onchange = e => set({ enabled: e.target.checked });
document.querySelectorAll('#seen button').forEach(b => {
  b.onclick = () => { set({ seenMode: b.dataset.v }); render(); };
});
$('keywords').oninput = e => {
  const list = e.target.value.split('\n').map(s => s.trim().toLowerCase()).filter(Boolean);
  set({ keywords: list });
};
$('clearMarks').onclick = () => { set({ marked: {}, messaged: {} }); render(); };
$('unhide').onclick     = () => { set({ hiddenItems: {} }); render(); };
$('clearSeen').onclick  = () => { set({ seenItems: {} }); render(); };
$('reset').onclick      = () => { if (confirm('Reset all Marketplace Tidy data?')) chrome.storage.local.clear(() => { S = { ...defaults }; render(); }); };

get().then(render);
