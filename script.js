/* ============================================================
   Século Verde – JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll behaviour ── */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      backToTop.classList.add('visible');
    } else {
      navbar.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
  }, { passive: true });

  /* ── Mobile nav toggle ── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  /* ── Animated counters ── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current);
    }, step);
  }

  const counters = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(animateCounter);
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  /* ── Scroll-reveal animation ── */
  const revealEls = document.querySelectorAll(
    '.produto-card, .step, .stat-card, .sobre-text, .sobre-img, .info-list li'
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity .5s ease ${i * 0.06}s, transform .5s ease ${i * 0.06}s`;
    revealObserver.observe(el);
  });

  document.addEventListener('animationend', (e) => {
    if (e.target.classList.contains('revealed')) {
      e.target.style.opacity = '';
      e.target.style.transform = '';
    }
  });

  // Add .revealed style dynamically
  const style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  /* ── Contact form ── */
  const form        = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nome     = form.querySelector('#nome').value.trim();
      const email    = form.querySelector('#email').value.trim();
      const mensagem = form.querySelector('#mensagem').value.trim();

      if (!nome || !email || !mensagem) {
        // Highlight empty required fields
        [form.querySelector('#nome'), form.querySelector('#email'), form.querySelector('#mensagem')]
          .forEach(field => {
            if (!field.value.trim()) {
              field.style.borderColor = '#e53935';
              field.addEventListener('input', () => {
                field.style.borderColor = '';
              }, { once: true });
            }
          });
        return;
      }

      // Simulate submission
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'A enviar…';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.reset();
        submitBtn.textContent = 'Enviar Mensagem';
        submitBtn.disabled = false;
        formSuccess.classList.add('visible');
        setTimeout(() => formSuccess.classList.remove('visible'), 5000);
      }, 1200);
    });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight : 0;
      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  });

})();
