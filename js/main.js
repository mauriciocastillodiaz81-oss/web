/* Inversiones Casthe SpA · interacciones de la landing (sin dependencias) */
(function () {
  'use strict';

  var d = document;
  var w = window;
  var root = d.documentElement;
  var WA_NUMBER = '56966226325';
  var EMAIL = 'inversionescasthespa@gmail.com';
  var reduceMotion = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  /* ---------- Header, barra de progreso, parallax y botón flotante ---------- */
  var header = d.querySelector('.site-header');
  var progress = d.querySelector('.progress');
  var fab = d.querySelector('.wa-fab');
  var hero = d.querySelector('.hero');
  var heroMedia = d.querySelector('[data-parallax]');
  var band = d.querySelector('.band');
  var bandMedia = d.querySelector('[data-parallax-band]');
  var menuOpen = false;
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = w.scrollY || w.pageYOffset;
    var vh = w.innerHeight;
    var max = root.scrollHeight - vh;

    header.classList.toggle('is-solid', y > 24 || menuOpen);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (fab && hero) fab.classList.toggle('is-visible', y > hero.offsetHeight * 0.55);

    if (reduceMotion) return;
    if (heroMedia && hero && y < hero.offsetHeight) {
      heroMedia.style.transform = 'translate3d(0,' + (y * parseFloat(heroMedia.dataset.parallax || 0.2)).toFixed(1) + 'px,0)';
    }
    if (bandMedia && band) {
      var r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1 aprox.
        bandMedia.style.transform = 'translate3d(0,' + (p * -70).toFixed(1) + 'px,0)';
      }
    }
  }
  function requestScroll() {
    if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); }
  }
  w.addEventListener('scroll', requestScroll, { passive: true });
  w.addEventListener('resize', requestScroll);
  onScroll();

  /* ---------- Menú móvil ---------- */
  var toggle = d.querySelector('.nav__toggle');
  var menu = d.getElementById('menu');

  function setMenu(open, restoreFocus) {
    if (!menu || !toggle) return;
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    d.body.classList.toggle('is-locked', open);
    onScroll();
    if (open) {
      var first = menu.querySelector('a');
      if (first) w.setTimeout(function () { first.focus({ preventScroll: true }); }, 250);
    } else if (restoreFocus) {
      toggle.focus();
    }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!menuOpen); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) setMenu(false, true); });
    var desktop = w.matchMedia('(min-width: 1021px)');
    var onDesktop = function (e) { if (e.matches && menuOpen) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
    else if (desktop.addListener) desktop.addListener(onDesktop);
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var revealables = d.querySelectorAll('[data-reveal], .band');
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Contadores ---------- */
  var counters = d.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in w) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cio.unobserve(el);
        var to = parseInt(el.dataset.count, 10) || 0;
        var t0 = null;
        var dur = 1600;
        var step = function (t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) w.requestAnimationFrame(step);
        };
        w.setTimeout(function () { w.requestAnimationFrame(step); }, 900);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* ---------- Enlace activo en la navegación ---------- */
  var navLinks = d.querySelectorAll('.nav__links a');
  if (navLinks.length && 'IntersectionObserver' in w) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = byId[en.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    d.querySelectorAll('main section[id]').forEach(function (s) { sio.observe(s); });
  }

  /* ---------- Línea de tiempo horizontal con camión ---------- */
  d.querySelectorAll('[data-tl]').forEach(function (tl) {
    var vp = tl.querySelector('.tl__viewport');
    var truck = tl.querySelector('.tl__truck');
    var prev = tl.querySelector('[data-dir="-1"]');
    var next = tl.querySelector('[data-dir="1"]');
    var lastLeft = 0;
    var raf = 0;

    function update() {
      raf = 0;
      var maxLeft = vp.scrollWidth - vp.clientWidth;
      var p = maxLeft > 0 ? vp.scrollLeft / maxLeft : 0;
      if (truck) {
        var travel = tl.clientWidth - truck.offsetWidth - 24;
        truck.style.setProperty('--x', (12 + p * travel).toFixed(1) + 'px');
        if (vp.scrollLeft < lastLeft - 1) truck.classList.add('is-back');
        else if (vp.scrollLeft > lastLeft + 1) truck.classList.remove('is-back');
      }
      lastLeft = vp.scrollLeft;
      if (prev) prev.disabled = vp.scrollLeft <= 4;
      if (next) next.disabled = vp.scrollLeft >= maxLeft - 4;
    }
    function schedule() { if (!raf) raf = w.requestAnimationFrame(update); }
    vp.addEventListener('scroll', schedule, { passive: true });
    w.addEventListener('resize', schedule);
    update();

    [prev, next].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener('click', function () {
        var dir = parseInt(btn.dataset.dir, 10);
        vp.scrollBy({ left: dir * Math.max(300, vp.clientWidth * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    // Arrastrar con el mouse (en táctil el desplazamiento es nativo)
    var down = false, moved = false, startX = 0, startLeft = 0;
    vp.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = vp.scrollLeft;
    });
    vp.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        vp.classList.add('is-dragging');
        try { vp.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      }
      if (moved) vp.scrollLeft = startLeft - dx;
    });
    var endDrag = function () {
      if (!down) return;
      down = false;
      if (moved) {
        vp.classList.remove('is-dragging');
        // Reajusta a la tarjeta más cercana al soltar
        vp.scrollBy({ left: 1, behavior: 'auto' });
        vp.scrollBy({ left: -1, behavior: 'auto' });
      }
    };
    vp.addEventListener('pointerup', endDrag);
    vp.addEventListener('pointercancel', endDrag);
    vp.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });

  /* ---------- Carrusel de clientes: velocidad según ancho ---------- */
  d.querySelectorAll('.marquee__track').forEach(function (track) {
    var setSpeed = function () {
      var half = track.scrollWidth / 2;
      if (half > 0) track.style.setProperty('--speed', Math.max(24, half / 60).toFixed(1) + 's');
    };
    setSpeed();
    w.addEventListener('load', setSpeed);
  });

  /* ---------- Formulario: arma el mensaje y abre WhatsApp o el correo ---------- */
  var form = d.getElementById('cotizar');
  var select = d.getElementById('f-servicio');

  // Las tarjetas de servicio preseleccionan la opción del formulario
  d.querySelectorAll('[data-servicio]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (!select) return;
      var val = el.getAttribute('data-servicio');
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === val) { select.selectedIndex = i; break; }
      }
    });
  });
  d.querySelectorAll('a[href*="arriendo%20de%20maquinaria"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (select) select.value = 'Arriendo de maquinaria';
    });
  });

  function fieldOf(input) { return input.closest('.field'); }
  function setError(input, msg) {
    var f = fieldOf(input);
    var err = f && f.querySelector('.field__err');
    if (f) f.classList.toggle('is-invalid', !!msg);
    if (err) err.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validate() {
    var ok = true;
    var nombre = form.elements.nombre;
    var fono = form.elements.telefono;
    var first = null;
    if (nombre.value.trim().length < 2) { setError(nombre, 'Escribe tu nombre.'); ok = false; first = first || nombre; }
    else setError(nombre, '');
    var digits = fono.value.replace(/\D/g, '');
    if (digits.length < 8) { setError(fono, 'Escribe un teléfono válido (mínimo 8 dígitos).'); ok = false; first = first || fono; }
    else setError(fono, '');
    if (first) first.focus();
    return ok;
  }
  function buildMessage() {
    var v = function (name) { var el = form.elements[name]; return el ? el.value.trim() : ''; };
    var lines = [
      'Hola Inversiones Casthe, quiero solicitar una cotización.',
      '',
      '• Nombre: ' + v('nombre'),
      '• Teléfono: ' + v('telefono'),
      '• Servicio: ' + v('servicio')
    ];
    if (v('comuna')) lines.push('• Ubicación: ' + v('comuna'));
    if (v('mensaje')) lines.push('• Detalle: ' + v('mensaje'));
    return lines.join('\n');
  }

  if (form) {
    ['nombre', 'telefono'].forEach(function (name) {
      var el = form.elements[name];
      if (el) el.addEventListener('input', function () { if (fieldOf(el).classList.contains('is-invalid')) validate(); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(buildMessage());
      var win = w.open(url, '_blank', 'noopener');
      if (!win) w.location.href = url;
    });
    var mailBtn = form.querySelector('[data-mail]');
    if (mailBtn) {
      mailBtn.addEventListener('click', function () {
        if (!validate()) return;
        var subject = 'Solicitud de cotización · ' + form.elements.servicio.value;
        w.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(buildMessage());
      });
    }
  }

  /* ---------- Año en el pie de página ---------- */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
