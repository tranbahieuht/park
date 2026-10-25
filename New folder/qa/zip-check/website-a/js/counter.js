/*
 * Number count-up for [fs-cnumbercount-element="number"].
 * Local replacement for the Finsweet "Number Count" component:
 * counts from 0 to the number written in the element, once,
 * when 25% of it is visible, over 1000ms.
 */
(function () {
  var DURATION = 1000;
  var THRESHOLD = 0.25;

  var elements = document.querySelectorAll('[fs-cnumbercount-element="number"]');
  if (!elements.length) return;

  function format(value, decimals) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function animate(el) {
    var end = el._countEnd;
    var decimals = el._countDecimals;
    var start = null;

    function step(time) {
      if (start === null) start = time;
      var progress = Math.min((time - start) / DURATION, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(end * eased, decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var targets = [];
  elements.forEach(function (el) {
    var raw = el.textContent.trim().replace(/[^\d.-]/g, '');
    var end = parseFloat(raw);
    if (isNaN(end)) return;
    el._countEnd = end;
    el._countDecimals = (raw.split('.')[1] || '').length;
    el.textContent = format(0, el._countDecimals);
    targets.push(el);
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach(animate);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target);
      });
    },
    { threshold: THRESHOLD }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();
