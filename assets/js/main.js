// psolimine.net — navbar toggle + progressive "endless scroll" research feed.
(function () {
  'use strict';

  // --- Mobile nav toggle ---------------------------------------------------
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); }
    });
  }

  // --- Endless-scroll research feeds (progressive enhancement) -------------
  // All cards render server-side (good for SEO). With JS we hide overflow past
  // an initial batch per feed and reveal more on scroll. Without JS every card
  // is visible. Supports multiple independent feeds on one page.
  var feeds = document.querySelectorAll('.research-feed');
  if (!feeds.length) { return; }

  Array.prototype.forEach.call(feeds, function (feed) {
    var items = Array.prototype.slice.call(feed.querySelectorAll('.feed-item'));
    var initial = parseInt(feed.getAttribute('data-initial'), 10) || 6;
    var batch = parseInt(feed.getAttribute('data-batch'), 10) || 4;
    if (items.length <= initial) { return; }

    var shown = initial;
    for (var i = initial; i < items.length; i++) { items[i].classList.add('feed-hidden'); }

    var more = document.createElement('div');
    more.className = 'feed-more';
    var btn = document.createElement('button');
    btn.type = 'button';
    more.appendChild(btn);
    var sentinel = document.createElement('div');
    sentinel.className = 'feed-sentinel';
    feed.parentNode.insertBefore(sentinel, feed.nextSibling);
    feed.parentNode.insertBefore(more, sentinel.nextSibling);

    function remaining() { return items.length - shown; }

    function updateBtn() {
      if (remaining() <= 0) { more.style.display = 'none'; }
      else { btn.textContent = 'Show more (' + remaining() + ' more)'; }
    }

    function reveal() {
      var end = Math.min(shown + batch, items.length);
      for (var i = shown; i < end; i++) { items[i].classList.remove('feed-hidden'); }
      shown = end;
      updateBtn();
    }

    btn.addEventListener('click', reveal);
    updateBtn();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            if (remaining() <= 0) { io.disconnect(); }
          }
        });
      }, { rootMargin: '300px 0px' });
      io.observe(sentinel);
    }
  });
})();
