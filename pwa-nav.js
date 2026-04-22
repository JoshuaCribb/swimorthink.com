(function () {

  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  function loadPage(href) {
    fetch(href)
      .then(function(r) {
        if (!r.ok) throw new Error('Page not found: ' + href);
        return r.text();
      })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');

        document.querySelector('main').innerHTML =
          doc.querySelector('main').innerHTML;

        document.title = doc.title;
        window.scrollTo(0, 0);

        window.initSlipperPage = undefined;
        window.initCartPage = undefined;

        document.querySelectorAll('main script').forEach(function(oldScript) {
          var newScript = document.createElement('script');
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode.removeChild(oldScript);
          document.body.appendChild(newScript);
        });

        setTimeout(function() {
          if (typeof window.initSlipperPage === 'function') {
            window.initSlipperPage();
          }
          if (typeof window.initCartPage === 'function') {
            window.initCartPage();
          }
        }, 50);
      })
      .catch(function(err) {
        console.error('PWA nav error:', err);
      });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    if (!link.href) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('mailto:')) return;
    if (link.href.startsWith('tel:')) return;

    var resolved = new URL(link.href, location.href);

    if (resolved.hostname !== location.hostname) return;
    if (!isStandalone && resolved.pathname === location.pathname) return;

    e.preventDefault();

    window.location.href = resolved.href;
  });

  window.addEventListener('popstate', function () {
    loadPage(location.href);
  });

  // ======================================
  // 📱 STRONG PORTRAIT LOCK (BEST EFFORT)
  // ======================================
  function lockOrientation() {
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!isMobile) return;

    const orient =
      screen.orientation ||
      screen.mozOrientation ||
      screen.msOrientation;

    const lockFn =
      (orient && orient.lock) ||
      screen.lockOrientation ||
      screen.mozLockOrientation ||
      screen.msLockOrientation ||
      screen.webkitLockOrientation;

    if (lockFn) {
      try {
        const result = lockFn.call(orient || screen, "portrait");
        if (result && result.catch) {
          result.catch(() => {
            // some browsers require user gesture, ignore failure
          });
        }
      } catch (e) {
        // ignore unsupported browsers
      }
    }
  }

  // Try immediately
  lockOrientation();

  // Improve success rate after interaction
  document.addEventListener("click", function enableLockOnce() {
    lockOrientation();
  }, { once: true });

})();