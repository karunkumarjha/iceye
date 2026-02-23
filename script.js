/* ============================================
   ICEYE — Under Eye Roll-On
   Main Script
   ============================================ */

(function () {
  'use strict';

  // ---------- STATE ----------
  const state = {
    cart: JSON.parse(localStorage.getItem('iceye-cart') || '[]'),
    soundEnabled: false,
    heroAnimationDone: false,
  };

  // ---------- DOM REFS ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---------- AUDIO CONTEXT (lazy) ----------
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playClick() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) { /* silent fail */ }
  }

  // ---------- PAGE LOADER ----------
  function initLoader() {
    const loader = $('#page-loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
          loader.remove();
          startHeroAnimation();
        }, 1200);
      }, 600);
    });
  }

  // ---------- CURSOR GLOW ----------
  function initCursor() {
    const glow = $('#cursor-glow');
    if (!glow || window.matchMedia('(max-width: 768px)').matches) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.classList.add('visible');
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('visible');
    });

    // Hover detection for interactive elements
    const hoverTargets = 'a, button, .btn, .shot-card, .testimonial-card, .faq-question, input, textarea';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        glow.classList.add('hovering');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        glow.classList.remove('hovering');
      }
    }, { passive: true });

    function animateCursor() {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // ---------- SCROLL PROGRESS ----------
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------- NAVBAR SCROLL ----------
  function initNavbar() {
    const nav = $('#navbar');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      lastScroll = scrollTop;
    }, { passive: true });
  }

  // ---------- HERO ANIMATION SEQUENCE ----------
  function startHeroAnimation() {
    if (state.heroAnimationDone) return;
    state.heroAnimationDone = true;

    const headline = $('#hero-headline');
    const lastMark = $('#last-mark');
    const morphZone = $('#morph-zone');
    const exclMorph = $('#exclamation-morph');
    const productHero = $('#product-hero');
    const heroFeatures = $('#hero-features');
    const solveText = $('#solve-text');
    const features = $$('.hero-feature');

    // Step 1: Show headline (1s after page load fade)
    setTimeout(() => {
      if (headline) headline.classList.add('visible');
    }, 300);

    // Step 2: Detach last exclamation mark (after 2.5s)
    setTimeout(() => {
      if (lastMark) {
        lastMark.classList.add('detaching');
      }
    }, 2500);

    // Step 3: Show morph zone, show exclamation in center (after 3.1s)
    setTimeout(() => {
      if (morphZone) morphZone.classList.add('active');
      if (exclMorph) exclMorph.classList.add('visible');
    }, 3100);

    // Step 4: Start morph effect (after 3.5s)
    setTimeout(() => {
      if (exclMorph) exclMorph.classList.add('morphing');
    }, 3500);

    // Step 5: Show product (morph complete at ~5.3s)
    setTimeout(() => {
      if (productHero) {
        productHero.classList.add('visible');
      }
    }, 4800);

    // Step 6: Add floating animation
    setTimeout(() => {
      if (productHero) productHero.classList.add('floating');
    }, 6000);

    // Step 7: Show feature labels one by one
    setTimeout(() => {
      if (heroFeatures) heroFeatures.classList.add('visible');
      features.forEach((feat, i) => {
        const delay = parseInt(feat.dataset.delay || 0);
        setTimeout(() => {
          feat.classList.add('visible');
        }, delay);
      });
    }, 6500);

    // Step 8: Show solve text
    setTimeout(() => {
      if (solveText) solveText.classList.add('visible');
    }, 8000);

    // Step 9: Begin rotation after all features
    setTimeout(() => {
      if (productHero) {
        productHero.classList.remove('floating');
        productHero.classList.add('rotating');
      }
    }, 9000);
  }

  // ---------- SCROLL-TRIGGERED ANIMATIONS ----------
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — keep for potential re-entry
        }
      });
    }, observerOptions);

    // Feature items
    $$('.feature-item').forEach((el) => observer.observe(el));

    // Section titles
    $$('.section-title').forEach((el) => {
      el.classList.add('fade-in-up');
      observer.observe(el);
    });

    // CTA elements
    const ctaInner = $('.cta-inner');
    if (ctaInner) {
      ctaInner.classList.add('fade-in-up');
      observer.observe(ctaInner);
    }

    // Email section
    const emailInner = $('.email-inner');
    if (emailInner) {
      emailInner.classList.add('fade-in-up');
      observer.observe(emailInner);
    }
  }

  // ---------- EXPERIENCE SECTION: WORD + IMAGE CYCLING ----------
  function initExperienceWords() {
    const words = $$('.exp-word');
    const images = $$('.exp-img');
    if (words.length === 0) return;

    const section = $('#experience');
    let currentIndex = -1;
    let cycling = false;
    let interval = null;

    function showNext() {
      // Fade out current word and image
      if (currentIndex >= 0 && currentIndex < words.length) {
        words[currentIndex].classList.remove('visible');
        words[currentIndex].classList.add('fading');
      }
      if (currentIndex >= 0 && currentIndex < images.length) {
        images[currentIndex].classList.remove('active');
      }

      currentIndex = (currentIndex + 1) % words.length;

      setTimeout(() => {
        words.forEach((w) => w.classList.remove('fading'));
        words[currentIndex].classList.add('visible');
        if (currentIndex < images.length) {
          images[currentIndex].classList.add('active');
        }
      }, 400);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !cycling) {
          cycling = true;
          showNext();
          interval = setInterval(showNext, 2500);
        } else if (!entry.isIntersecting && cycling) {
          cycling = false;
          clearInterval(interval);
          words.forEach((w) => w.classList.remove('visible', 'fading'));
          images.forEach((img) => img.classList.remove('active'));
          currentIndex = -1;
        }
      });
    }, { threshold: 0.3 });

    if (section) observer.observe(section);
  }

  // ---------- FEATURES SECTION: 3D PRODUCT ROTATION ----------
  function initFeatures3D() {
    const product = $('#features-product');
    if (!product) return;
    const img = product.querySelector('.product-img');
    if (!img) return;

    const section = $('#features');
    let isVisible = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    if (section) observer.observe(section);

    window.addEventListener('scroll', () => {
      if (!isVisible) return;
      const rect = section.getBoundingClientRect();
      const progress = -rect.top / (rect.height - window.innerHeight);
      const clamped = Math.max(0, Math.min(1, progress));
      const rotateY = clamped * 360;
      img.style.transform = `rotateY(${rotateY}deg)`;
    }, { passive: true });
  }

  // ---------- CART LOGIC ----------
  function updateCartBadge() {
    const badge = $('#cart-count');
    if (!badge) return;
    const count = state.cart.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function addToCart() {
    state.cart.push({
      id: 'iceye-roll-on',
      name: 'ICEYE Under Eye Roll-On',
      price: 499,
      qty: 1,
      timestamp: Date.now(),
    });
    localStorage.setItem('iceye-cart', JSON.stringify(state.cart));
    updateCartBadge();
    showCartToast();
    playClick();

    // Decrement stock
    decrementStock();
  }

  function showCartToast() {
    const toast = $('#cart-toast');
    if (!toast) return;
    toast.style.display = 'block';
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.style.display = 'none';
      }, 400);
    }, 2000);
  }

  // ---------- STOCK COUNTER ----------
  function decrementStock() {
    const stockEl = $('#stock-count');
    if (!stockEl) return;
    let count = parseInt(stockEl.textContent);
    if (count > 1) {
      count--;
      stockEl.textContent = count;
    }
  }

  // ---------- PURCHASE PANEL ----------
  function initPurchasePanel() {
    const panel = $('#purchase-panel');
    const buyBtn = $('#buy-now-btn');
    const closeBtn = $('#panel-close');
    const backdrop = panel ? panel.querySelector('.panel-backdrop') : null;
    const form = $('#purchase-form');
    const guestBtn = $('#guest-checkout');
    const successEl = $('#purchase-success');

    function openPanel() {
      if (panel) {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        playClick();
      }
    }

    function closePanel() {
      if (panel) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    function showSuccess() {
      if (form) form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';

      // Track conversion
      trackEvent('purchase_complete');
    }

    if (buyBtn) buyBtn.addEventListener('click', openPanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    if (backdrop) backdrop.addEventListener('click', closePanel);

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
        closePanel();
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        playClick();
        showSuccess();
      });
    }

    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        playClick();
        showSuccess();
      });
    }
  }

  // ---------- FAQ ACCORDION ----------
  function initFAQ() {
    const items = $$('.faq-item');

    items.forEach((item) => {
      const btn = item.querySelector('.faq-question');
      if (!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        items.forEach((other) => {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }

        playClick();
      });
    });
  }

  // ---------- EMAIL CAPTURE ----------
  function initEmailCapture() {
    const form = $('#email-form');
    const successMsg = $('#email-success');
    const input = $('#email-input');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input ? input.value.trim() : '';
      if (!email) return;

      // Store email (MVP — localStorage)
      const emails = JSON.parse(localStorage.getItem('iceye-emails') || '[]');
      emails.push({ email, timestamp: Date.now() });
      localStorage.setItem('iceye-emails', JSON.stringify(emails));

      // Show success
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'block';

      playClick();
      trackEvent('email_captured');
    });
  }

  // ---------- SOUND TOGGLE ----------
  function initSoundToggle() {
    const btn = $('#sound-toggle');
    const waves = $('#sound-waves');
    if (!btn) return;

    btn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      if (waves) {
        waves.style.opacity = state.soundEnabled ? '1' : '0.3';
      }
      if (state.soundEnabled) {
        // Init audio context on user gesture
        getAudioCtx();
        playClick();
      }
    });
  }

  // ---------- CTA BUTTONS ----------
  function initCTAButtons() {
    const addToCartBtn = $('#add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart();
      });
    }
  }

  // ---------- BASIC ANALYTICS ----------
  function trackEvent(eventName, data) {
    // MVP analytics — log to console and store in localStorage
    const events = JSON.parse(localStorage.getItem('iceye-analytics') || '[]');
    events.push({
      event: eventName,
      data: data || {},
      timestamp: Date.now(),
      page: window.location.pathname,
    });
    localStorage.setItem('iceye-analytics', JSON.stringify(events));

    if (typeof console !== 'undefined') {
      console.log(`[ICEYE Analytics] ${eventName}`, data || '');
    }
  }

  function initAnalytics() {
    // Track page view
    trackEvent('page_view', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    // Track scroll depth
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 100];
    const trackedMilestones = new Set();

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

      if (depth > maxScroll) {
        maxScroll = depth;
        scrollMilestones.forEach((m) => {
          if (depth >= m && !trackedMilestones.has(m)) {
            trackedMilestones.add(m);
            trackEvent('scroll_depth', { depth: m });
          }
        });
      }
    }, { passive: true });

    // Track CTA clicks
    const addCartBtn = $('#add-to-cart-btn');
    const buyNowBtn = $('#buy-now-btn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => trackEvent('add_to_cart'));
    }
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => trackEvent('buy_now_click'));
    }
  }

  // ---------- INTERACTIVE SOUND ON BUTTONS ----------
  function initButtonSounds() {
    $$('.btn, .nav-btn, .faq-question, .social-link').forEach((el) => {
      el.addEventListener('click', playClick);
    });
  }

  // ---------- INIT ----------
  function init() {
    initLoader();
    initCursor();
    initScrollProgress();
    initNavbar();
    initScrollAnimations();
    initExperienceWords();
    initFeatures3D();
    initPurchasePanel();
    initFAQ();
    initEmailCapture();
    initSoundToggle();
    initCTAButtons();
    initAnalytics();
    initButtonSounds();
    updateCartBadge();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
