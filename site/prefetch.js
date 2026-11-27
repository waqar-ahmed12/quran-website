// Instant page changes (2026-10-08, the user: "no wait on loading"). When a link is pointed at, pressed or reached
// with Tab, the page it leads to starts downloading, so it has usually arrived by the time the click lands. This
// site's own pages only, each once, and never on a connection that has asked to save data.
//
// <link rel="prefetch"> rather than the newer Speculation Rules: Firefox only has part of those, and this works in
// every browser. The scripts and styles a page uses are shared, so after the first page only the page itself is new.

(() => {
  const connection = navigator.connection;
  if (connection && (connection.saveData || /2g/.test(connection.effectiveType || ''))) return;

  const fetched = new Set([location.href.split('#')[0]]);
  let hover = 0;

  function prefetch(link) {
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    url.hash = ''; // a link to a place on this same page fetches nothing
    if (fetched.has(url.href)) return;
    fetched.add(url.href);
    const hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.href = url.href;
    document.head.append(hint);
  }

  const linkOf = (event) => (event.target instanceof Element ? event.target.closest('a[href]') : null);

  // A pointer resting on a link for a moment usually means a click is coming; a press or Tab means it surely is.
  document.addEventListener('pointerover', (event) => {
    clearTimeout(hover);
    const link = linkOf(event);
    if (link) hover = setTimeout(() => prefetch(link), 65);
  });
  document.addEventListener('pointerdown', (event) => prefetch(linkOf(event)));
  document.addEventListener('focusin', (event) => prefetch(linkOf(event)));
})();
