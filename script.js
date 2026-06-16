/* ═══════════════════════════════════════════
   script.js — Quizmaster site interactions
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Navbar: scroll shadow + active link ── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a:not(.btn-nav), .nav-mobile a:not(.btn-nav)');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    // Scrolled state for shadow
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active nav link
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 90) {
        current = sec.id;
      }
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* ── Mobile hamburger toggle ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('navMobile');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });


  /* ── Smooth scroll for in-page anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 70; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll(
    '.card, .video-feature, .photo-feature, .usecase, .contact-cta, .subsection-label, .section-header, .stats-bar, .trusted'
  );

  // Mark all as reveal targets
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger cards within a grid
    if (el.classList.contains('card') || el.classList.contains('usecase')) {
      el.style.transitionDelay = `${(i % 4) * 0.07}s`;
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => observer.observe(el));


  /* ── Active nav link style (CSS companion) ── */
  const style = document.createElement('style');
  style.textContent = `.nav-links a.active { color: var(--amber) !important; }`;
  document.head.appendChild(style);

})();
