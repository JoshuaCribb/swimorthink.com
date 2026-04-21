(function () {

  // Detect if running as installed PWA
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  function loadPage(href) {
    fetch(href)
      .then(r => {
        if (!r.ok) throw new Error('Page not found: ' + href);
        return r.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        document.querySelector('main').innerHTML =
          doc.querySelector('main').innerHTML;

        document.title = doc.title;
        window.scrollTo(0, 0);

        // Re-run scripts inside <main>
        document.querySelectorAll('main script').forEach(oldScript => {
          const newScript = document.createElement('script');
          newScript.textContent = oldScript.textContent;
          document.body.appendChild(newScript);
        });
      })
      .catch(err => console.error('PWA nav error:', err));
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    if (!link.href) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('mailto:')) return;
    if (link.href.startsWith('tel:')) return;

    const resolved = new URL(link.href, location.href);

    if (resolved.hostname !== location.hostname) return; // external

    // In standalone PWA mode, ALWAYS intercept internal links
    // In regular Safari, only intercept if same pathname
    if (!isStandalone && resolved.pathname === location.pathname) return;

    e.preventDefault();
    history.pushState({}, '', resolved.href);
    loadPage(resolved.href);
  });

  window.addEventListener('popstate', function () {
    loadPage(location.href);
  });

})();