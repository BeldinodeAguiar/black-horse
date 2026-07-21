// BLACK HORSE — interações partilhadas

// Menu mobile
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
}

// Filtros (elenco / calendário)
document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
  const buttons = tabGroup.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const targetSelector = tabGroup.dataset.target;
      document.querySelectorAll(targetSelector).forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.display = show ? '' : 'none';
      });
    });
  });
});

// Lightbox da galeria
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const frame = lightbox.querySelector('.lightbox-frame');
  const caption = lightbox.querySelector('.lightbox-caption');
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      frame.innerHTML = item.querySelector('.swatch').outerHTML;
      caption.textContent = item.querySelector('.tag').textContent;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.classList.remove('open'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });
}

// Formulário de contacto (demonstrativo — sem backend)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const note = contactForm.querySelector('.form-note');
    note.textContent = 'Mensagem enviada. A direção responde em breve.';
    note.classList.add('show');
    contactForm.reset();
  });
}

// Login (demonstrativo — sem backend real; num site em produção isto
// teria de validar credenciais no servidor antes de redirecionar)
const loginForm = document.querySelector('.login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = 'comunicacao.html';
  });
}

// RSVP de convocatória (área privada)
document.querySelectorAll('.roster-chip button').forEach(btn => {
  btn.addEventListener('click', () => {
    const confirmed = btn.classList.toggle('confirmed');
    btn.textContent = confirmed ? 'Confirmado' : 'Confirmar';
  });
});
