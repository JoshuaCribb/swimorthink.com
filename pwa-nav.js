(function () {

  function loadPage(href) {
    fetch(href)
      .then(r => {
        if (!r.ok) throw new Error('Page not found: ' + href);
        return r.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Swap main content
        document.querySelector('main').innerHTML =
          doc.querySelector('main').innerHTML;

        // Swap page title
        document.title = doc.title;

        // Scroll to top on navigation
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

  // Intercept all internal link clicks
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    if (!link.href) return;                                         // no href
    if (link.target === '_blank') return;                          // new tab links
    if (link.href.startsWith('mailto:')) return;                   // email links
    if (link.href.startsWith('tel:')) return;                      // phone links

    // GitHub Pages: compare pathnames only, allow relative and absolute
    const currentPath = location.pathname;
    const linkPath = new URL(link.href, location.href).pathname;

    if (new URL(link.href, location.href).hostname !== location.hostname) return; // external
    if (linkPath === currentPath) return;                          // same page

    e.preventDefault();
    const resolvedHref = new URL(link.href, location.href).href;
    history.pushState({}, '', resolvedHref);
    loadPage(resolvedHref);
  });

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    loadPage(location.href);
  });

})();