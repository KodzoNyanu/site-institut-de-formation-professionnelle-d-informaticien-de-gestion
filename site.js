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
