/* ═══════════════════════════════════════════
   script.js — Quizmaster site interactions
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── GA4 helper (no-ops gracefully if gtag not loaded) ── */
  function gtagEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }


  /* ── Navbar: scroll shadow + active link ── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a:not(.btn-nav), .nav-mobile a:not(.btn-nav)');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 90) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ── Mobile hamburger toggle ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('navMobile');

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
  });

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
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ── Scroll reveal (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll(
    '.card, .video-feature, .photo-feature, .usecase, .contact-cta, .subsection-label, .section-header, .stats-bar, .trusted'
  );

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
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


  /* ── Active nav link style ── */
  const style = document.createElement('style');
  style.textContent = `.nav-links a.active { color: var(--amber) !important; }`;
  document.head.appendChild(style);


  /* ════════════════════════════════════════
     ANALYTICS: Custom GA4 Events
  ════════════════════════════════════════ */

  /* ── 1. Nav link clicks ── */
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      gtagEvent('nav_click', {
        link_text: a.textContent.trim(),
        link_href: a.getAttribute('href')
      });
    });
  });

  /* ── 2. Hero CTA button clicks ── */
  document.querySelectorAll('.hero-ctas a').forEach(a => {
    a.addEventListener('click', () => {
      gtagEvent('cta_click', {
        cta_location: 'hero',
        cta_text: a.textContent.trim(),
        cta_href: a.getAttribute('href')
      });
    });
  });

  /* ── 3. Evidence link clicks (cards) ── */
  document.querySelectorAll('.card-evidence').forEach(a => {
    a.addEventListener('click', () => {
      const card = a.closest('.card');
      gtagEvent('evidence_click', {
        link_text: a.textContent.trim(),
        link_url: a.getAttribute('href'),
        card_title: card ? card.querySelector('.card-title')?.textContent.trim() : ''
      });
    });
  });

  /* ── 4. Section visibility (IntersectionObserver) ── */
  const sectionNames = { home: 'Hero', about: 'About', contact: 'Contact' };
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gtagEvent('section_viewed', {
          section_id: entry.target.id,
          section_name: sectionNames[entry.target.id] || entry.target.id
        });
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(sec => sectionObserver.observe(sec));

  /* ── 5. Scroll depth milestones (25 / 50 / 75 / 90 %) ── */
  const scrollMilestones = [25, 50, 75, 90];
  const reachedMilestones = new Set();

  window.addEventListener('scroll', () => {
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    scrollMilestones.forEach(m => {
      if (scrollPct >= m && !reachedMilestones.has(m)) {
        reachedMilestones.add(m);
        gtagEvent('scroll_depth', { depth_percent: m });
      }
    });
  }, { passive: true });

  /* ── 6. Time-on-page milestones (30s / 60s / 120s / 300s) ── */
  [30, 60, 120, 300].forEach(seconds => {
    setTimeout(() => {
      gtagEvent('time_on_page', { seconds_spent: seconds });
    }, seconds * 1000);
  });

  /* ── 7. Google Form iframe engagement ── */
  const formIframe = document.querySelector('.form-embed-container iframe');
  if (formIframe) {
    let formFocused = false;
    window.addEventListener('blur', () => {
      if (document.activeElement === formIframe && !formFocused) {
        formFocused = true;
        gtagEvent('form_engagement', { action: 'iframe_focus' });
      }
    });
  }

  /* ── 8. Exit intent (scroll back near top after deep scroll) ── */
  let maxScroll = 0;
  let exitFired = false;
  window.addEventListener('scroll', () => {
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPct > maxScroll) maxScroll = scrollPct;
    if (!exitFired && maxScroll >= 50 && scrollPct < 10) {
      exitFired = true;
      gtagEvent('exit_scroll', { max_depth_reached: maxScroll });
    }
  }, { passive: true });

})();
