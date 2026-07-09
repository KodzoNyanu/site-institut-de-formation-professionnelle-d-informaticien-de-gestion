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
