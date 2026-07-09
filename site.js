// Menu mobile
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

// Surligne le lien de la page courante dans le menu
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a:not(.btn)').forEach(a => {
  if (a.getAttribute('href') === page) a.classList.add('active');
});

// Carrousel du hero (page d'accueil)
const heroTrack = document.getElementById('heroTrack');
if (heroTrack) {
  const slides = heroTrack.children;
  const dotsWrap = document.getElementById('heroDots');
  const carousel = document.getElementById('heroCarousel');
  let idx = 0, timer;

  for (let i = 0; i < slides.length; i++) {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Diapositive ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  }
  const dots = dotsWrap.children;

  function render() {
    heroTrack.style.transform = 'translateX(-' + (idx * 100) + '%)';
    for (let i = 0; i < dots.length; i++) dots[i].classList.toggle('active', i === idx);
  }
  function go(i) { idx = (i + slides.length) % slides.length; render(); restart(); }
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);
  function restart() { clearInterval(timer); timer = setInterval(next, 7000); }

  document.getElementById('heroNext').addEventListener('click', next);
  document.getElementById('heroPrev').addEventListener('click', prev);
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', restart);

  // glissement tactile (mobile)
  let x0 = null;
  carousel.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    x0 = null;
  });

  render();
  restart();
}

// Envoi des formulaires vers le CRM Odoo via le pont local (IntegrationERP/webhook_server.py).
// Si le pont n'est pas joignable (site consulté hors du poste de démo), repli sur mailto:.
const ODOO_BRIDGE = 'http://localhost:5000/site/preinscription';
document.querySelectorAll('form[data-odoo]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.source = form.dataset.odoo;
    if (data.interet && !data.formation) data.formation = data.interet;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi en cours…';
    try {
      const r = await fetch(ODOO_BRIDGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      form.innerHTML =
        '<div class="form-note" style="background:#e8f5e9;">' +
        '<i class="bi bi-check-circle-fill"></i>' +
        '<span><strong>Demande envoyée !</strong> Votre dossier a bien été enregistré. ' +
        'Notre équipe vous recontacte sous 48&nbsp;h ouvrées pour la suite.</span></div>';
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send"></i> Envoyer';
      const sujet = (data.source === 'contact' ? 'Contact site — ' : 'Préinscription site — ') +
        ((data.prenom || '') + ' ' + (data.nom || '')).trim();
      const corps = Object.entries(data).map(([k, v]) => k + ' : ' + v).join('\n');
      window.location.href = 'mailto:contact@ifpig-lome.tg?subject=' +
        encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
    }
  });
});
