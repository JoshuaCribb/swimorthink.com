(function () {

  function loadPage(href) {
    fetch(href)
      .then(r => r.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Swap main content
        document.querySelector('main').innerHTML =
          doc.querySelector('main').innerHTML;

        // Swap page title
        document.title = doc.title;

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
    if (link.hostname !== location.hostname) return; // external, allow
    if (link.pathname === location.pathname) return;  // same page, skip

    e.preventDefault();
    history.pushState({}, '', link.href);
    loadPage(link.href);
  });

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    loadPage(location.href);
  });

})();