/* Builds the page from data/content.js. You shouldn't need to edit this file. */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px;background:#ff7a66;color:#0e221b">data/content.js did not load. Check it for a missing comma or quote.</p>'); return; }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = function (path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S); };
  var has = function (v) { return Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== ''; };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z"/></svg>';
  var TOUCH = window.matchMedia('(hover: none)').matches;

  /* ---------- text slots ---------- */
  $$('[data-text]').forEach(function (el) { var v = get(el.getAttribute('data-text')); if (has(v)) el.textContent = v; });
  document.title = S.name + ' | ' + S.course;

  var stops = (S.stops || []).slice();
  var byId = {};
  stops.forEach(function (s) { byId[s.id] = s; s.files = s.files || []; });
  $('#stop-count').textContent = stops.length;
  $('#pass-stops').textContent = stops.length;

  /* ---------- picture helper: every picture on the site goes through this ---------- */
  function pic(s, extra) {
    extra = extra || '';
    if (s.image) return '<span class="pic ' + extra + '" data-full="' + esc(s.image) + '" data-cap="' + esc(s.title) + '"><img src="' + esc(s.image) + '" alt="' + esc(s.imageAlt || '') + '" loading="lazy" decoding="async"></span>';
    if (s.excerpt) return '<span class="pic ' + extra + '"><span class="code">' + (s.excerptFile ? '<span class="code__file"># ' + esc(s.excerptFile) + '</span>' : '') + esc(s.excerpt) + '</span></span>';
    return '';
  }
  function filePic(f) {
    return '<span class="pic" data-full="' + esc(f.src) + '" data-cap="' + esc(f.label) + '" tabindex="0" role="button" aria-label="View larger: ' + esc(f.label) + '"><img src="' + esc(f.src) + '" alt="' + esc(f.label) + '" loading="lazy" decoding="async"></span>';
  }

  /* reveal pictures as they scroll in */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 }) : null;
  function reveal(root) { $$('.pic:not(.is-in)', root).forEach(function (p) { if (io) io.observe(p); else p.classList.add('is-in'); }); }

  /* ---------- hero ---------- */
  (function () {
    var g = $('#sky-stars'); if (!g) return;
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var html = '';
    for (var i = 0; i < 110; i++) {
      html += '<circle cx="' + (rnd() * 1440).toFixed(1) + '" cy="' + (rnd() * 380).toFixed(1) + '" r="' + (rnd() * 1.3 + .3).toFixed(2) + '" fill="#fff" opacity="' + (.35 + rnd() * .6).toFixed(2) + '" style="animation-delay:' + (rnd() * 4).toFixed(2) + 's"/>';
    }
    g.innerHTML = html;
  })();
  var featured = byId[S.hero.featuredStop];
  if (featured && (featured.image || featured.excerpt)) $('#feature-pic').outerHTML = pic(featured);
  else $('#feature-pic').remove();

  /* ---------- boarding pass ---------- */
  $('#pass-about').innerHTML = (S.pass.about || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  (function () {
    var bars = '', x = 0, seed = 3;
    while (x < 140) { seed = (seed * 48271) % 2147483647; var w = 1 + (seed % 4); bars += '<rect x="0" y="' + x + '" width="60" height="' + w + '" fill="currentColor"/>'; x += w + 1 + (seed % 3); }
    $('#barcode').innerHTML = bars;
  })();

  /* ---------- route timeline ---------- */
  var key = function (s) { return s.sortDate || '9999'; };
  var main = stops.filter(function (s) { return s.route !== 'side'; }).sort(function (a, b) { return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0; });
  var shortDate = function (s) {
    if (!has(s.sortDate)) return has(s.date) ? s.date : 'Anytime';
    return new Date(s.sortDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };
  $('#timeline').innerHTML = main.map(function (s, i) {
    return '<li class="leg">' +
      '<div class="leg__when"><div class="leg__dot">' + (i + 1) + '</div><span class="leg__date">' + esc(shortDate(s)) + '</span></div>' +
      '<button class="card" type="button" data-stop="' + esc(s.id) + '" aria-haspopup="dialog">' + pic(s) +
        '<span class="card__body">' +
          '<span class="card__type">' + esc(s.type) + '<span class="card__date">, ' + esc(shortDate(s)) + '</span></span>' +
          '<span class="card__title">' + esc(s.title) + '</span>' +
          '<span class="card__blurb">' + esc(s.blurb) + '</span>' +
          '<span class="card__go">Open this stop</span>' +
        '</span></button></li>';
  }).join('');

  /* ---------- out of the box ---------- */
  var side = stops.filter(function (s) { return s.route === 'side'; });   // keeps the order in content.js
  $('#boxes').innerHTML = side.map(function (s, i) {
    return '<button class="box' + (i === 0 ? ' box--lead' : '') + '" type="button" data-stop="' + esc(s.id) + '" aria-haspopup="dialog">' + pic(s) +
      '<span class="box__body">' +
        '<span class="box__type">' + esc(s.type) + '</span>' +
        '<span class="box__title">' + esc(s.title) + '</span>' +
        '<span class="box__blurb">' + esc(s.blurb) + '</span>' +
        (has(s.badge) ? '<span class="box__badge">✓ ' + esc(s.badge) + '</span>' : '') +
      '</span></button>';
  }).join('');

  /* ---------- library ---------- */
  var KIND = { image: 'Picture', video: 'Video', audio: 'Audio', slides: 'Slides', text: 'Text', pdf: 'PDF', doc: 'Document', code: 'Source code' };
  var FILTERS = [['all', 'Everything'], ['image', 'Pictures'], ['doc', 'Documents'], ['code', 'Code'], ['video', 'Video'], ['audio', 'Audio']];
  var group = function (k) { return k === 'image' || k === 'video' || k === 'audio' || k === 'code' ? k : 'doc'; };
  var shelved = stops.filter(function (s) { return s.files.length; });
  var total = shelved.reduce(function (n, s) { return n + s.files.length; }, 0);
  $('#library-total').textContent = total + ' files from ' + shelved.length + ' projects';
  $('#lib-count').textContent = total + ' files';
  var COLORS = [['#1f463a', '#f4f1ea'], ['#b9a8f2', '#0e221b'], ['#ff7a66', '#1b0f0c'], ['#e8e2d4', '#0e221b'], ['#2f5d4c', '#f4f1ea'], ['#8f7fd8', '#f4f1ea'], ['#ffb3a4', '#0e221b']];
  $('#shelf').innerHTML = shelved.map(function (s, i) {
    var c = COLORS[i % COLORS.length], h = 250 + ((i * 37) % 90);
    return '<button class="spine" type="button" data-open-library="' + esc(s.id) + '" style="--i:' + i + ';--c:' + c[0] + ';--ink:' + c[1] + ';--h:' + h + 'px" aria-label="Open ' + esc(s.title) + ' in the library">' +
      '<span class="spine__title">' + esc(s.title) + '</span><span class="spine__count">' + s.files.length + '</span></button>';
  }).join('');

  var libBuilt = false;
  function buildLibrary() {
    if (libBuilt) return; libBuilt = true;
    var present = {}; shelved.forEach(function (s) { s.files.forEach(function (f) { present[group(f.kind)] = true; }); });
    $('#lib-filters').innerHTML = FILTERS.filter(function (f) { return f[0] === 'all' || present[f[0]]; }).map(function (f, i) { return '<button class="chip" type="button" data-filter="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + '</button>'; }).join('');
    $('#lib-body').innerHTML = shelved.map(function (s) {
      return '<section class="lib__group" id="lib-' + esc(s.id) + '"><h3>' + esc(s.title) + '</h3><p>' + esc(s.type) + (has(s.date) ? ', ' + esc(s.date) : '') + '</p><div class="lib__grid">' +
        s.files.map(function (f) {
          var media;
          if (f.kind === 'image') media = filePic(f);
          else if (f.kind === 'video') media = '<span class="item__media"><video controls preload="none" src="' + esc(f.src) + '"></video></span>';
          else if (f.kind === 'audio') media = '<span class="item__media"><audio controls preload="none" src="' + esc(f.src) + '"></audio></span>';
          else if (f.kind === 'code') media = '<button type="button" class="item__media" data-code="' + esc(f.src) + '" aria-label="Read ' + esc(f.src) + '"><span class="item__glyph item__glyph--code">' + esc(((window.SOURCE || {})[f.src] || '').split('\n').slice(0, 9).join('\n')) + '</span></button>';
          else media = '<span class="item__media"><span class="item__glyph">' + esc((f.src.split('.').pop() || '').toUpperCase()) + '</span></span>';
          return '<div class="item" data-group="' + group(f.kind) + '">' + media +
            '<div class="item__body"><span class="item__label">' + esc(f.label) + '<span class="item__kind">' + esc(KIND[f.kind] || 'File') + '</span></span>' +
            (f.kind === 'code'
              ? '<span class="item__actions"><a href="#" data-code="' + esc(f.src) + '">Read</a></span></div></div>'
              : '<span class="item__actions"><a href="' + esc(f.src) + '" target="_blank" rel="noopener">Open</a><a href="' + esc(f.src) + '" download>Download</a></span></div></div>');
        }).join('') + '</div></section>';
    }).join('');
  }
  var libDialog = $('#library-dialog');
  function openLibrary(id) {
    buildLibrary();
    if (!libDialog.open) libDialog.showModal();
    reveal(libDialog);
    var target = id && $('#lib-' + id);
    if (target) target.scrollIntoView({ block: 'start' }); else $('#lib-body').scrollTop = 0;
  }
  $('#lib-filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]'); if (!b) return;
    var f = b.getAttribute('data-filter');
    $$('.chip', this).forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
    $$('.item', libDialog).forEach(function (it) { it.hidden = f !== 'all' && it.getAttribute('data-group') !== f; });
    $$('.lib__group', libDialog).forEach(function (g) { g.hidden = !$$('.item:not([hidden])', g).length; });
    reveal(libDialog);
  });
  $('[data-close-library]').addEventListener('click', function () { libDialog.close(); });

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox');
  function openLightbox(src, cap) { $('#lightbox-img').src = src; $('#lightbox-img').alt = cap || ''; $('#lightbox-cap').textContent = cap || ''; lb.showModal(); }
  lb.addEventListener('click', function () { lb.close(); });

  /* ---------- stop dialog ---------- */
  var dialog = $('#stop-dialog'), body = $('#stop-body');
  function openStop(id) {
    var s = byId[id]; if (!s) return;
    var images = s.files.filter(function (f) { return f.kind === 'image'; });
    var others = s.files.filter(function (f) { return f.kind !== 'image'; });
    var section = function (title, inner) { return inner ? '<h3>' + esc(title) + '</h3>' + inner : ''; };
    var buttons = (s.links || []).filter(function (l) { return has(l.url); }).map(function (l) { return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>'; });
    if (s.files.length) buttons.push('<button type="button" class="is-ghost" data-open-library="' + esc(s.id) + '">See it in the library</button>');
    body.innerHTML = pic(s, 'stop__visual') +
      '<div class="stop__content">' +
        '<p class="stop__meta">' + [s.category, s.type, s.date].filter(has).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</p>' +
        '<h2 class="stop__title" id="stop-title">' + esc(s.title) + '</h2>' +
        (has(s.blurb) ? '<p class="stop__blurb">' + esc(s.blurb) + '</p>' : '') +
        section('The story', has(s.story) ? '<div class="stop__story">' + s.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' : '') +
        section('How it went', has(s.milestones) ? '<ul class="milestones">' + s.milestones.map(function (m) { return '<li><b>' + esc(m.when) + '</b><span>' + esc(m.text) + '</span></li>'; }).join('') + '</ul>' : '') +
        section('Highlights', has(s.highlights) ? '<ul class="stop__highlights">' + s.highlights.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
        section('Pictures', images.length ? '<div class="stop__gallery">' + images.map(filePic).join('') + '</div>' : '') +
        section('Files', others.length ? '<ul class="stop__files">' + others.map(function (f) { return '<li><span>' + esc(f.label) + ' <span style="color:var(--muted)">(' + esc(KIND[f.kind] || 'File') + ')</span></span>' + (f.kind === 'code' ? '<a href="#" data-code="' + esc(f.src) + '">Read</a>' : '<a href="' + esc(f.src) + '" target="_blank" rel="noopener">Open</a>') + '</li>'; }).join('') + '</ul>' : '') +
        section('Concepts and tools', has(s.tags) ? '<ul class="stop__tags">' + s.tags.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' : '') +
        (buttons.length ? '<div class="stop__links">' + buttons.join('') + '</div>' : '') +
      '</div>';
    dialog.showModal();
    dialog.scrollTop = 0;
    $('.stop__close', dialog).focus();
    reveal(dialog);
  }
  $('[data-close]', dialog).addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

  /* ---------- one click handler for everything ---------- */
  document.addEventListener('click', function (e) {
    var p = e.target.closest('.pic');
    if (p) {
      var zoomable = p.hasAttribute('data-full') && (p.closest('.lib__grid') || p.closest('.stop__gallery'));
      if (TOUCH && !p.classList.contains('is-expanded')) {           // touch: first tap expands (toggle)
        $$('.pic.is-expanded').forEach(function (o) { o.classList.remove('is-expanded'); });
        p.classList.add('is-expanded'); e.preventDefault(); e.stopPropagation(); return;
      }
      if (TOUCH) p.classList.remove('is-expanded');
      if (zoomable) { openLightbox(p.getAttribute('data-full'), p.getAttribute('data-cap')); return; }
    } else if (TOUCH) {
      $$('.pic.is-expanded').forEach(function (o) { o.classList.remove('is-expanded'); });
    }
    var code = e.target.closest('[data-code]');
    if (code) { e.preventDefault(); openReader(code.getAttribute('data-code')); return; }
    var lib = e.target.closest('[data-open-library]');
    if (lib) { if (dialog.open) dialog.close(); openLibrary(lib.getAttribute('data-open-library')); return; }
    var t = e.target.closest('[data-stop]');
    if (t) { openStop(t.getAttribute('data-stop')); return; }
    var o = e.target.closest('[data-open-stop]');
    if (o) openStop(get(o.getAttribute('data-open-stop')));
  });
  document.addEventListener('keydown', function (e) {
    var p = e.target.closest && e.target.closest('.pic[role="button"]');
    if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLightbox(p.getAttribute('data-full'), p.getAttribute('data-cap')); }
  });

  /* ---------- tribute: light the stars ---------- */
  var tributeApi = (function () {
    var T = S.tribute, stars = T.stars || [];
    var sky = $('#sky'), lines = $('#sky-lines'), cv = $('#sky-fx'), ctx = cv.getContext('2d');
    $('#tribute-intro').innerHTML = (T.intro || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var spots = [[16, 70], [24, 52], [20, 33], [33, 22], [38, 42], [50, 58], [58, 38], [52, 18], [70, 26], [80, 44], [76, 66], [62, 80]];
    var lit = stars.map(function () { return false; }), done = false;
    stars.forEach(function (st, i) {
      var p = spots[i % spots.length], b = document.createElement('button');
      b.type = 'button'; b.className = 'star'; b.style.setProperty('--i', i);
      b.style.left = p[0] + '%'; b.style.top = p[1] + '%';
      b.setAttribute('aria-label', 'Star ' + (i + 1) + ': ' + st.title);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = STAR + '<span class="star__label">' + esc(st.title) + '</span>';
      b.addEventListener('click', function () { light(i); });
      sky.appendChild(b);
    });
    var buttons = $$('.star', sky), count = $('#memory-count'), title = $('#memory-title'), text = $('#memory-text'), memory = $('#memory');

    /* canvas: sparkles, shooting stars, and the finale */
    var W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [], shooters = [], letters = [], visible = false, running = false;
    function size() { W = cv.width = Math.round(sky.offsetWidth * dpr); H = cv.height = Math.round(sky.offsetHeight * dpr); }
    size(); window.addEventListener('resize', function () { size(); if (done) buildLetters(false); });
    function burst(i) {
      var p = spots[i % spots.length], x = p[0] / 100 * W, y = p[1] / 100 * H;
      for (var k = 0; k < 46; k++) { var a = Math.random() * 6.283, s = (1 + Math.random() * 4.5) * dpr; parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, r: (0.8 + Math.random() * 2) * dpr, ring: false }); }
      parts.push({ x: x, y: y, life: 1, ring: true, r: 6 * dpr });
      kick();
    }
    function shoot() {
      var x = (0.15 + Math.random() * 0.6) * W, y = (0.1 + Math.random() * 0.3) * H;
      shooters.push({ x: x, y: y, vx: (6 + Math.random() * 4) * dpr, vy: (3 + Math.random() * 2) * dpr, life: 1 });
      kick();
    }
    function buildLetters(fromStars) {
      var off = document.createElement('canvas'), o = off.getContext('2d'); off.width = W; off.height = H;
      var fs = Math.round(W * 0.165);
      o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle'; try { o.letterSpacing = Math.round(fs * 0.12) + 'px'; } catch (e) {}
      o.font = fs + 'px Anton, Impact, sans-serif';
      o.fillText('THANK YOU', W / 2, H * 0.4);
      o.font = Math.round(fs * 0.82) + 'px Anton, Impact, sans-serif';
      o.fillText("MA'AM", W / 2, H * 0.4 + fs * 1.1);
      var data = o.getImageData(0, 0, W, H).data, gap = Math.max(3, Math.round(W / 175)), pts = [];
      for (var y = 0; y < H; y += gap) for (var x = 0; x < W; x += gap) if (data[(y * W + x) * 4 + 3] > 200) pts.push([x, y]);
      var litSpots = spots.slice(0, stars.length);
      letters = pts.map(function (t, i) {
        var s = litSpots[i % litSpots.length];
        return { x: fromStars ? s[0] / 100 * W : t[0], y: fromStars ? s[1] / 100 * H : t[1], tx: t[0], ty: t[1], d: Math.random() * 0.9, tw: Math.random() * 6.28, t: fromStars ? 0 : 1 };
      });
      kick();
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }
    var last = 0;
    function loop(now) {
      ctx.clearRect(0, 0, W, H);
      var dt = Math.min(50, now - (last || now)) / 16.7; last = now;
      // shooting stars
      shooters = shooters.filter(function (s) {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= 0.012 * dt;
        var g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
        g.addColorStop(0, 'rgba(255,240,210,' + s.life + ')'); g.addColorStop(1, 'rgba(255,204,112,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2 * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); ctx.stroke();
        return s.life > 0 && s.x < W + 50;
      });
      // sparkles and rings
      parts = parts.filter(function (p) {
        p.life -= (p.ring ? 0.025 : 0.018) * dt;
        if (p.ring) { p.r += 3.2 * dpr * dt; ctx.strokeStyle = 'rgba(255,204,112,' + Math.max(0, p.life) * 0.8 + ')'; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.stroke(); }
        else { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.05 * dpr; ctx.fillStyle = 'rgba(255,' + (200 + Math.round(p.life * 40)) + ',140,' + Math.max(0, p.life) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life + 0.3, 0, 6.283); ctx.fill(); }
        return p.life > 0;
      });
      // finale: stars gather into THANK YOU MA'AM
      for (var i = 0; i < letters.length; i++) {
        var L = letters[i];
        if (L.t < 1) { L.t = Math.min(1, L.t + 0.016 * dt * (L.t > 0 || Math.random() < 0.1 ? 1 : 0)); }
        var e = L.t < 0 ? 0 : 1 - Math.pow(1 - Math.max(0, L.t - L.d * 0.3) / (1 - L.d * 0.3), 3);
        if (!(e >= 0)) e = 0;
        var x = L.x + (L.tx - L.x) * e, y = L.y + (L.ty - L.y) * e;
        var a = 0.55 + 0.45 * Math.sin(now / 420 + L.tw);
        ctx.fillStyle = 'rgba(255,' + (205 + Math.round(a * 40)) + ',150,' + (0.7 + a * 0.3) + ')';
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, W / 620) * (0.85 + a * 0.4), 0, 6.283); ctx.fill();
      }
      var busy = shooters.length || parts.length || (letters.length && visible);
      if (busy) requestAnimationFrame(loop); else { running = false; ctx.clearRect(0, 0, W, H); }
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }).observe(sky);
    setInterval(function () { if (visible && !document.hidden) shoot(); }, 3800);

    function drawLines() {
      var out = '';
      for (var i = 0; i < stars.length - 1; i++) if (lit[i] && lit[i + 1]) {
        var a = spots[i % spots.length], b = spots[(i + 1) % spots.length];
        out += '<line pathLength="1" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>';
      }
      lines.innerHTML = out;
    }
    function markNext() {
      var next = lit.indexOf(false);
      buttons.forEach(function (b, j) { b.classList.toggle('is-next', j === next); });
    }
    function light(i) {
      if (done) return;
      var fresh = !lit[i];
      lit[i] = true;
      buttons.forEach(function (b, j) { b.classList.toggle('is-current', j === i); });
      buttons[i].classList.add('is-lit'); buttons[i].setAttribute('aria-pressed', 'true');
      if (fresh) { burst(i); drawLines(); }
      markNext();
      var n = lit.filter(Boolean).length;
      memory.classList.remove('is-final');
      if (n === stars.length) { finish(); return; }
      count.textContent = 'Star ' + (i + 1) + ' of ' + stars.length + '  (' + n + ' lit)';
      title.textContent = stars[i].title; text.textContent = stars[i].text;
    }
    function finish() {
      done = true;
      setTimeout(function () {
        sky.classList.add('is-complete'); memory.classList.add('is-final');
        count.textContent = stars.length + ' of ' + stars.length + '. Collected, finally.';
        title.textContent = T.finalHeading;
        text.innerHTML = esc(T.finalText) + '<span class="memory__sign" style="display:block">' + esc(T.signature) + '</span>';
        buildLetters(true); shoot(); setTimeout(shoot, 500);
        $('#light-all').hidden = true; $('#relight').hidden = false;
      }, 700);
    }
    function reset() {
      done = false; letters = []; lit = lit.map(function () { return false; });
      buttons.forEach(function (b) { b.classList.remove('is-lit', 'is-current'); b.setAttribute('aria-pressed', 'false'); });
      sky.classList.remove('is-complete'); memory.classList.remove('is-final'); lines.innerHTML = '';
      $('#light-all').hidden = false; $('#relight').hidden = true; idle(); markNext();
    }
    function lightAll() {
      var order = lit.map(function (v, i) { return v ? -1 : i; }).filter(function (i) { return i >= 0; }), k = 0;
      (function step() { if (k < order.length && !done) { light(order[k++]); setTimeout(step, 520); } })();
    }
    function idle() { count.textContent = '0 of ' + stars.length + ' stars lit'; title.textContent = 'Every star is still waiting.'; text.textContent = 'Just like the ones I never went to collect.'; }
    $('#light-all').addEventListener('click', lightAll);
    $('#relight').addEventListener('click', function () { reset(); setTimeout(lightAll, 300); });
    idle(); markNext();
    return { light: light, lightAll: lightAll };
  })();

  /* ---------- contact ---------- */
  $('#contact-links').innerHTML = (S.contact.links || []).filter(function (l) { return has(l.url); }).map(function (l) {
    var ext = /^https?:/.test(l.url);
    return '<li><a href="' + esc(l.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + '</a></li>';
  }).join('');

  /* ---------- code reader (LifeAdmin source) ---------- */
  var reader = $('#reader'), SRC = window.SOURCE || {};
  var KWS = 'def class return if elif else for while in import from as with try except finally raise lambda None True False and or not is pass break continue yield global self async await'.split(' ');
  // a tiny Python tokenizer: strings (incl. multi-line docstrings), comments, numbers, keywords
  function highlightFile(lines, lang) {
    if (lang !== 'py') return lines.map(esc);
    var inDoc = null, out = [];
    var TOK = /("""|''')|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#.*$)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;
    lines.forEach(function (line) {
      var html = '', i = 0;
      if (inDoc) {
        var close = line.indexOf(inDoc);
        if (close < 0) { out.push('<span class="tk-str">' + esc(line) + '</span>'); return; }
        html += '<span class="tk-str">' + esc(line.slice(0, close + 3)) + '</span>'; i = close + 3; inDoc = null;
      }
      TOK.lastIndex = i; var m, prevDef = false;
      while ((m = TOK.exec(line))) {
        html += esc(line.slice(i, m.index)); i = TOK.lastIndex;
        if (m[1]) {
          var rest = line.indexOf(m[1], i);
          if (rest >= 0) { html += '<span class="tk-str">' + esc(line.slice(m.index, rest + 3)) + '</span>'; i = TOK.lastIndex = rest + 3; }
          else { html += '<span class="tk-str">' + esc(line.slice(m.index)) + '</span>'; i = line.length; inDoc = m[1]; break; }
        } else if (m[2]) html += '<span class="tk-str">' + esc(m[2]) + '</span>';
        else if (m[3]) html += '<span class="tk-com">' + esc(m[3]) + '</span>';
        else if (m[4]) html += '<span class="tk-num">' + m[4] + '</span>';
        else if (m[5]) {
          if (prevDef) { html += '<span class="tk-def">' + m[5] + '</span>'; prevDef = false; }
          else if (KWS.indexOf(m[5]) >= 0) { html += '<span class="tk-kw">' + m[5] + '</span>'; prevDef = m[5] === 'def' || m[5] === 'class'; }
          else html += m[5];
        }
      }
      html += esc(line.slice(i));
      out.push(html);
    });
    return out;
  }
  function showFile(name) {
    var text = SRC[name]; if (text == null) return;
    var lang = /\.py$/.test(name) ? 'py' : 'txt';
    var lines = text.replace(/\n$/, '').split('\n');
    $('#reader-title').textContent = name;
    $('#reader-meta').textContent = lines.length + ' lines';
    $('#reader-code').innerHTML = highlightFile(lines, lang).map(function (l) { return '<span class="ln">' + (l || ' ') + '</span>'; }).join('');
    $('#reader-code').scrollTop = 0;
    $$('#reader-files button').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-file') === name)); });
  }
  function openReader(name) {
    if (!$('#reader-files').children.length) $('#reader-files').innerHTML = Object.keys(SRC).map(function (n) { return '<button type="button" data-file="' + esc(n) + '">' + esc(n) + '</button>'; }).join('');
    showFile(name);
    if (!reader.open) reader.showModal();
  }
  $('#reader-files').addEventListener('click', function (e) { var b = e.target.closest('[data-file]'); if (b) showFile(b.getAttribute('data-file')); });
  $('[data-close-reader]').addEventListener('click', function () { reader.close(); });

  /* ---------- scroll reveals ---------- */
  var RV = '.section-head p, .card, .box, .contact__row, .memory, .tribute__hint, #tribute-intro, #pass-about, .library__open, .sky, .feature, .hero__count, .repl, .experience__card, .tribute__actions';
  $$(RV).forEach(function (el, i) { el.classList.add('rv'); });
  $$('.boxes .box').forEach(function (el, i) { el.style.setProperty('--d', (i % 2) * 0.12 + 's'); });
  $('#shelf').classList.add('rv-shelf');
  var rvio = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rvio.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('.rv, .rv-shelf').forEach(function (el) { if (rvio) rvio.observe(el); else el.classList.add('is-in'); });
  // the hero bits are on screen already
  $$('.hero .rv').forEach(function (el) { setTimeout(function () { el.classList.add('is-in'); }, 900); });

  /* ---------- pointer sheen on glass ---------- */
  document.addEventListener('pointermove', function (e) {
    var g = e.target.closest && e.target.closest('.card, .box, .item, .feature, .pass'); if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- the scroll engine ---------- */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement, bar = $('#bar'), rail = $('.rail'), hero = $('.hero');
  var layers = $$('.scene .px'), words = $$('.headline__word'), comet = $('.comet');
  var wrap = $('#timeline-wrap'), legs = $$('.leg'), heads = $$('.section-head .display, .tribute .display, .pass-copy .display');
  var spyLinks = $$('[data-spy]'), sections = spyLinks.map(function (a) { return $('#' + a.getAttribute('data-spy')); });
  var lastY = window.scrollY, velocity = 0, ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight, max = Math.max(1, root.scrollHeight - vh), p = Math.min(1, y / max);
    velocity = velocity * 0.8 + (y - lastY) * 0.2; lastY = y;
    root.style.setProperty('--sy', y.toFixed(1));
    root.style.setProperty('--sp', p.toFixed(4));
    var past = y > vh * 0.75;
    bar.classList.toggle('is-on', past); rail.classList.toggle('is-on', past);
    if (REDUCED) return;
    // hero parallax: layers sink at their own speeds, words split apart
    if (y < vh * 1.2) {
      layers.forEach(function (l) { var dp = parseFloat(l.getAttribute('data-depth')); l.style.transform = 'translate3d(' + ((window.__mx || 0) * (dp + 0.06) * -90).toFixed(1) + 'px,' + (y * dp + (window.__my || 0) * (dp + 0.06) * -40).toFixed(1) + 'px,0)'; });
      var t = Math.min(1, y / vh);
      if (words[0]) words[0].style.transform = 'translate3d(' + (-t * 18).toFixed(2) + 'vw,' + (t * 10).toFixed(1) + 'vh,0)';
      if (words[1]) words[1].style.transform = 'translate3d(' + (t * 18).toFixed(2) + 'vw,' + (t * 10).toFixed(1) + 'vh,0)';
      if (comet) comet.style.transform = 'translate3d(' + (t * 12).toFixed(2) + 'vw,' + (-t * 40).toFixed(1) + 'vh,0) rotate(' + (-t * 14).toFixed(1) + 'deg)';
      $('#headline').style.opacity = (1 - t * 0.9).toFixed(3);
    }
    // route line draws itself; the comet rides the tip and lights each stop it passes
    if (wrap) {
      var r = wrap.getBoundingClientRect();
      var fill = Math.max(0, Math.min(1, (vh * 0.55 - r.top) / r.height));
      wrap.style.setProperty('--fill', fill.toFixed(4));
      var tip = r.top + fill * r.height;
      legs.forEach(function (l) { var d = $('.leg__dot', l).getBoundingClientRect(); l.classList.toggle('is-passed', d.top + d.height / 2 <= tip + 2); });
    }
    // headings drift sideways
    heads.forEach(function (h, i) {
      var hr = h.parentElement.getBoundingClientRect(), c = (hr.top + hr.height / 2 - vh / 2) / vh;
      if (Math.abs(c) < 1.5) {
        var cur = parseFloat(h.style.getPropertyValue('--dx')) || 0, br = h.getBoundingClientRect(), base = br.left - cur;
        var want = c * (i % 2 ? -1 : 1) * Math.min(90, window.innerWidth * 0.06);
        var lo = -(base - 6), hi = window.innerWidth - (base + br.width) - 6;
        want = Math.max(Math.min(want, Math.max(0, hi)), Math.min(0, lo));
        h.style.setProperty('--dx', want.toFixed(1) + 'px');
      }
    });
    // nav highlights the section you're in
    var cur = -1; sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < vh * 0.4) cur = i; });
    spyLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---------- starfield: stars stretch into streaks while you scroll ---------- */
  (function () {
    var cv = $('#starfield'); if (!cv || REDUCED) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, stars = [];
    var COLORS = ['255,255,255', '221,212,251', '255,179,164', '185,168,242'];
    function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
    size(); window.addEventListener('resize', size);
    for (var i = 0, N = innerWidth < 820 ? 80 : 170; i < N; i++) stars.push({ x: Math.random(), y: Math.random(), z: Math.random() * 0.9 + 0.1, c: COLORS[i % 4], tw: Math.random() * 6.28 });
    var smooth = 0, last = window.scrollY, t0 = 0;
    function draw(t) {
      var y = window.scrollY, dy = y - last; last = y;
      smooth = smooth * 0.86 + Math.max(-60, Math.min(60, dy)) * 0.14;
      ctx.clearRect(0, 0, W, H);
      var heroGone = Math.min(1, y / innerHeight);
      ctx.globalAlpha = heroGone;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var py = ((s.y * H - y * dpr * s.z * 0.35) % H + H) % H, px = s.x * W;
        var len = Math.min(60, Math.abs(smooth) * s.z * 1.4) * dpr, r = (0.5 + s.z * 1.4) * dpr;
        var a = 0.35 + 0.45 * Math.sin(t / 900 + s.tw) * 0.5 + s.z * 0.3;
        if (len > 2) {
          var g = ctx.createLinearGradient(px, py, px, py + (smooth > 0 ? len : -len));
          g.addColorStop(0, 'rgba(' + s.c + ',' + a + ')'); g.addColorStop(1, 'rgba(' + s.c + ',0)');
          ctx.strokeStyle = g; ctx.lineWidth = r; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + (smooth > 0 ? len : -len)); ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(' + s.c + ',' + a + ')'; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ---------- cover: letters, cursor parallax, spotlight, shooting stars, REPL ---------- */
  (function () {
    var heroEl = $('.hero'), idx = 0;
    // split EXPLORE / PYTHON into letters that drop in, then react to the cursor
    $$('.headline__word').forEach(function (w) {
      var t = w.textContent; w.textContent = '';
      t.split('').forEach(function (ch) {
        var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', idx++); w.appendChild(s);
        s.addEventListener('animationend', function () { s.style.animation = 'none'; }, { once: true });
      });
    });
    var chars = $$('.ch'), spot = $('#spotlight');
    window.__mx = 0; window.__my = 0;
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      window.__mx = (e.clientX - r.left) / r.width * 2 - 1; window.__my = (e.clientY - r.top) / r.height * 2 - 1;
      spot.style.setProperty('--hx', (e.clientX - r.left) + 'px'); spot.style.setProperty('--hy', (e.clientY - r.top) + 'px');
      if (!REDUCED) chars.forEach(function (c) {
        var cr = c.getBoundingClientRect(), dx = e.clientX - (cr.left + cr.width / 2), dy = e.clientY - (cr.top + cr.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy), k = Math.max(0, 1 - d / 240);
        c.style.transform = k ? 'translateY(' + (-k * 28).toFixed(1) + 'px) scale(' + (1 + k * 0.14).toFixed(3) + ') rotate(' + (dx / 240 * k * -10).toFixed(1) + 'deg)' : '';
        c.classList.toggle('is-hot', k > 0.55);
      });
      onScroll();
    }, { passive: true });
    heroEl.addEventListener('pointerleave', function () { window.__mx = 0; window.__my = 0; chars.forEach(function (c) { c.style.transform = ''; c.classList.remove('is-hot'); }); onScroll(); });

    // shooting stars: a few on their own, plus one wherever you click the sky
    var cv = $('#hero-fx'), ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W, H, list = [], sparks = [], on = false;
    function size() { W = cv.width = Math.round(heroEl.clientWidth * dpr); H = cv.height = Math.round(heroEl.clientHeight * dpr); }
    size(); window.addEventListener('resize', size);
    function shoot(x, y, big) {
      var ang = (200 + Math.random() * 25) * Math.PI / 180, sp = (big ? 15 : 10 + Math.random() * 5) * dpr;
      list.push({ x: x, y: y, vx: Math.cos(ang) * sp * -1, vy: Math.abs(Math.sin(ang)) * sp, life: 1, w: big ? 3 : 2 });
      if (big) for (var k = 0; k < 26; k++) { var a = Math.random() * 6.283, s = (1 + Math.random() * 4) * dpr; sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 }); }
      if (!on) { on = true; requestAnimationFrame(draw); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      list = list.filter(function (s) {
        s.x += s.vx; s.y += s.vy; s.life -= 0.014;
        var tx = s.x - s.vx * 12, ty = s.y - s.vy * 12, g = ctx.createLinearGradient(s.x, s.y, tx, ty);
        g.addColorStop(0, 'rgba(255,246,240,' + s.life + ')'); g.addColorStop(0.3, 'rgba(255,179,164,' + s.life * 0.7 + ')'); g.addColorStop(1, 'rgba(185,168,242,0)');
        ctx.strokeStyle = g; ctx.lineWidth = s.w * dpr; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,' + s.life + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.w * dpr, 0, 6.283); ctx.fill();
        return s.life > 0;
      });
      sparks = sparks.filter(function (p) { p.x += p.vx; p.y += p.vy; p.vx *= .94; p.vy *= .94; p.life -= .025; ctx.fillStyle = 'rgba(255,214,190,' + p.life + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6 * dpr * p.life + .3, 0, 6.283); ctx.fill(); return p.life > 0; });
      if (list.length || sparks.length) requestAnimationFrame(draw); else { on = false; ctx.clearRect(0, 0, W, H); }
    }
    heroEl.addEventListener('click', function (e) {
      if (e.target.closest('a, button, .feature, .repl')) return;
      var r = heroEl.getBoundingClientRect(); shoot((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr, true);
    });
    if (!REDUCED) setInterval(function () { if (!document.hidden && window.scrollY < innerHeight) shoot((0.3 + Math.random() * 0.7) * W, Math.random() * H * 0.25, false); }, 4200);

    // a tiny Python console that types itself
    var repl = $('#repl'), lines = (S.hero.repl || []), shown = [], li = 0;
    if (!repl || !lines.length) return;
    function render(typing) { repl.innerHTML = shown.slice(-6).join('\n') + (typing != null ? (shown.length ? '\n' : '') + esc(typing) + '<span class="caret"></span>' : '<span class="caret"></span>'); }
    function next() {
      var pair = lines[li % lines.length], cmd = pair[0], out = pair[1], k = 0; li++;
      if (li > lines.length && li % lines.length === 1) shown = [];
      (function type() {
        if (k <= cmd.length) { render(cmd.slice(0, k)); k++; setTimeout(type, REDUCED ? 0 : 38 + Math.random() * 40); return; }
        shown.push(esc(cmd)); if (out) shown.push('<span class="out">' + esc(out) + '</span>');
        render(null); setTimeout(next, out ? 1500 : 650);
      })();
    }
    setTimeout(next, 1400);
  })();

  /* ---------- Python quote bands that speed up when you scroll ---------- */
  (function () {
    var bands = $$('.quotes'); if (!bands.length || !S.quotes) return;
    var state = bands.map(function (b) {
      var items = S.quotes[b.getAttribute('data-band')] || [], html = items.map(function (q) { return '<span>' + esc(q) + '</span><i>✦</i>'; }).join('');
      var tr = $('.quotes__track', b); tr.innerHTML = html + html;
      return { el: tr, dir: +b.getAttribute('data-dir'), x: 0, half: 0 };
    });
    function measure() { state.forEach(function (s) { s.half = s.el.scrollWidth / 2 || 1; }); }
    measure(); window.addEventListener('resize', measure); if (document.fonts) document.fonts.ready.then(measure);
    var lastY2 = window.scrollY;
    (function tick() {
      var dy = window.scrollY - lastY2; lastY2 = window.scrollY;
      state.forEach(function (s) {
        var half = s.half || 1;
        s.x -= s.dir * (REDUCED ? 0 : 0.6 + Math.min(18, Math.abs(dy) * 0.35)) * (dy < 0 ? -1 : 1);
        s.x = ((s.x % half) - half) % half;
        s.el.style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,0,0)';
      });
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- Looking back: words light up as you read down ---------- */
  (function () {
    var E = S.experience; if (!E) return;
    $('#exp-body').innerHTML = (E.paragraphs || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var groups = $$('.words').map(function (el) {
      $$('p', el).concat(el.tagName === 'P' ? [el] : []).forEach(function (p) {
        p.innerHTML = p.textContent.split(/(\s+)/).map(function (w) { return /\S/.test(w) ? '<span class="w">' + esc(w) + '</span>' : w; }).join('');
      });
      return { el: el, words: $$('.w', el) };
    });
    function update() {
      var vh = innerHeight;
      groups.forEach(function (g) {
        var r = g.el.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.3)));
        var n = Math.round(p * g.words.length);
        g.words.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); });
      });
    }
    window.addEventListener('scroll', function () { requestAnimationFrame(update); }, { passive: true });
    update();
  })();

  reveal(document);
})();
