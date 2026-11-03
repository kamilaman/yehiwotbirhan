/**
 * BATU/ZIWAY Hiwot Birhan Church - Core Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initAnnouncementBar();
  initMobileMenu();
  initStickyHeader();
  initBuildingCampaignTracker();
  initContactForm();
  initNewsletterForm();
  initScrollAnimations();
  initPastorPostsLoader();
});

/**
 * 8. Dynamic Pastor Posts & Sermon Posters Loader
 */
function initPastorPostsLoader() {
  const container = document.getElementById('homepage-pastor-posts');
  if (!container) return;

  const apiBase = (window.getApiBaseUrl && window.getApiBaseUrl()) || '';

  fetch(`${apiBase}/api/posts`)
    .then(res => res.json())
    .then(posts => {
      if (!posts || posts.length === 0) return;

      container.innerHTML = posts.slice(0, 6).map(p => `
        <div class="bg-navy-dark rounded-2xl border border-gold/30 overflow-hidden shadow-xl hover:border-gold transition-all duration-300 group flex flex-col justify-between">
          <div>
            <div class="h-64 overflow-hidden relative">
              <img src="${p.image_url}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='images/pastor_zerfu.png'">
              <span class="absolute top-3 right-3 bg-gold text-navy text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                ${p.category.replace('_', ' ')}
              </span>
            </div>
            <div class="p-6">
              <h3 class="font-serif font-bold text-lg text-white mb-2 line-clamp-2">${p.title}</h3>
              <p class="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">${p.content}</p>
            </div>
          </div>
          <div class="px-6 pb-6 pt-0">
            <div class="text-[11px] text-gold font-medium flex items-center justify-between border-t border-white/10 pt-3">
              <span>${p.author}</span>
              <span class="text-slate-400 font-mono text-[10px]">${new Date(p.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `).join('');

      if (window.lucide) window.lucide.createIcons();
    })
    .catch(err => console.log('Using static pastor posters fallback'));
}


/**
 * 1. Announcement Bar Handler
 */
function initAnnouncementBar() {
  const annBar = document.getElementById('announcement-bar');
  const annDismissBtn = document.getElementById('dismiss-announcement');
  
  if (annBar && annDismissBtn) {
    // Check if dismissed in current session
    if (sessionStorage.getItem('announcement_dismissed') === 'true') {
      annBar.style.display = 'none';
    }

    annDismissBtn.addEventListener('click', () => {
      annBar.style.transform = 'translateY(-100%)';
      annBar.style.transition = 'transform 0.3s ease';
      setTimeout(() => {
        annBar.style.display = 'none';
        sessionStorage.setItem('announcement_dismissed', 'true');
      }, 300);
    });
  }
}

/**
 * 2. Responsive Mobile Drawer Navigation
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = document.getElementById('close-mobile-menu');

  if (!menuToggle || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('flex');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (closeMenu) closeMenu.focus();
  }

  function closeMenuHandler() {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', openMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMenuHandler);

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      closeMenuHandler();
    }
  });

  // Close when clicking nav links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenuHandler);
  });
}

/**
 * 3. Sticky Navigation Header Effect
 */
function initStickyHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-md', 'bg-white/95', 'backdrop-blur-md');
      header.classList.remove('bg-white');
    } else {
      header.classList.remove('shadow-md', 'bg-white/95', 'backdrop-blur-md');
      header.classList.add('bg-white');
    }
  });
}

/**
 * 4. Animated Building Campaign Progress Bar & Dynamic Calculation
 */
function initBuildingCampaignTracker() {
  const campaignSection = document.getElementById('building-campaign-section');
  if (!campaignSection) return;

  const progressBar = document.getElementById('campaign-progress-bar');
  const percentageEl = document.getElementById('campaign-percentage');
  const raisedEl = document.getElementById('campaign-raised');
  const goalEl = document.getElementById('campaign-goal');
  const remainingEl = document.getElementById('campaign-remaining');
  const activeCurrEl = document.getElementById('campaign-active-curr');

  // Dual Cards Elements
  const dualEtbRaised = document.getElementById('dual-etb-raised');
  const dualEtbGoal = document.getElementById('dual-etb-goal');
  const dualEtbPct = document.getElementById('dual-etb-pct');
  const dualCardEtb = document.getElementById('dual-card-etb');

  const dualUsdRaised = document.getElementById('dual-usd-raised');
  const dualUsdGoal = document.getElementById('dual-usd-goal');
  const dualUsdPct = document.getElementById('dual-usd-pct');
  const dualCardUsd = document.getElementById('dual-card-usd');

  const btnUsd = document.getElementById('tracker-curr-usd');
  const btnEtb = document.getElementById('tracker-curr-etb');

  // Default state: check current site language
  let currentCurr = (window.getCurrentLanguage && window.getCurrentLanguage() === 'am') ? 'ETB' : 'USD';

  const campaignData = {
    USD: {
      goal: (window.CHURCH_CONFIG && window.CHURCH_CONFIG.buildingFund.goalAmount) || 500000,
      raised: (window.CHURCH_CONFIG && window.CHURCH_CONFIG.buildingFund.raisedAmount) || 315000
    },
    ETB: {
      goal: (window.CHURCH_CONFIG && window.CHURCH_CONFIG.buildingFund.etbGoalAmount) || 60000000,
      raised: (window.CHURCH_CONFIG && window.CHURCH_CONFIG.buildingFund.etbRaisedAmount) || 37800000
    }
  };

  function formatMoney(amount, curr) {
    const sym = curr === 'USD' ? '$' : 'ብር ';
    return `${sym}${Number(amount).toLocaleString('en-US')}`;
  }

  function renderTracker() {
    // 1. Calculate metrics for both currencies
    const usdGoal = campaignData.USD.goal || 500000;
    const usdRaised = campaignData.USD.raised || 315000;
    const usdPct = Math.min(100, Math.round((usdRaised / usdGoal) * 100));

    const etbGoal = campaignData.ETB.goal || 60000000;
    const etbRaised = campaignData.ETB.raised || 37800000;
    const etbPct = Math.min(100, Math.round((etbRaised / etbGoal) * 100));

    // 2. Update Dual Open Overview Cards (Simultaneously visible to all viewers)
    if (dualEtbRaised) dualEtbRaised.textContent = formatMoney(etbRaised, 'ETB');
    if (dualEtbGoal) dualEtbGoal.textContent = formatMoney(etbGoal, 'ETB');
    if (dualEtbPct) dualEtbPct.textContent = `${etbPct}%`;

    if (dualUsdRaised) dualUsdRaised.textContent = formatMoney(usdRaised, 'USD');
    if (dualUsdGoal) dualUsdGoal.textContent = formatMoney(usdGoal, 'USD');
    if (dualUsdPct) dualUsdPct.textContent = `${usdPct}%`;

    // 3. Update Hero Main Display according to current active currency
    const activeData = campaignData[currentCurr];
    const activeGoal = activeData.goal;
    const activeRaised = activeData.raised;
    const activePct = Math.min(100, Math.round((activeRaised / activeGoal) * 100));
    const activeRemaining = Math.max(0, activeGoal - activeRaised);

    if (raisedEl) raisedEl.textContent = formatMoney(activeRaised, currentCurr);
    if (goalEl) goalEl.textContent = formatMoney(activeGoal, currentCurr);
    if (remainingEl) remainingEl.textContent = formatMoney(activeRemaining, currentCurr);
    if (percentageEl) percentageEl.textContent = `${activePct}%`;
    if (activeCurrEl) activeCurrEl.textContent = currentCurr;

    if (progressBar) {
      progressBar.style.width = `${activePct}%`;
    }

    // 4. Update Toggle Buttons & Card Focus States
    if (btnUsd && btnEtb) {
      if (currentCurr === 'USD') {
        btnUsd.className = 'px-3.5 py-1.5 rounded-lg transition-all bg-gold text-navy font-bold shadow-sm focus:outline-none';
        btnEtb.className = 'px-3.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white focus:outline-none';
      } else {
        btnEtb.className = 'px-3.5 py-1.5 rounded-lg transition-all bg-gold text-navy font-bold shadow-sm focus:outline-none';
        btnUsd.className = 'px-3.5 py-1.5 rounded-lg transition-all text-slate-300 hover:text-white focus:outline-none';
      }
    }

    if (dualCardUsd && dualCardEtb) {
      if (currentCurr === 'USD') {
        dualCardUsd.classList.add('border-gold/50', 'bg-white/10');
        dualCardUsd.classList.remove('border-white/10', 'bg-white/5');
        dualCardEtb.classList.remove('border-gold/50', 'bg-white/10');
        dualCardEtb.classList.add('border-white/10', 'bg-white/5');
      } else {
        dualCardEtb.classList.add('border-gold/50', 'bg-white/10');
        dualCardEtb.classList.remove('border-white/10', 'bg-white/5');
        dualCardUsd.classList.remove('border-gold/50', 'bg-white/10');
        dualCardUsd.classList.add('border-white/10', 'bg-white/5');
      }
    }
  }

  // Global switch function for button & card clicks
  window.setTrackerCurrency = function(curr) {
    if (curr !== 'USD' && curr !== 'ETB') return;
    currentCurr = curr;
    renderTracker();
  };

  // Initial render
  renderTracker();

  // Scroll reveal observer for initial animation
  if (progressBar) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activePct = Math.min(100, Math.round((campaignData[currentCurr].raised / campaignData[currentCurr].goal) * 100));
          progressBar.style.width = `${activePct}%`;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(campaignSection);
  }

  // Fetch live stats from API
  const apiBase = (window.getApiBaseUrl && window.getApiBaseUrl()) || '';
  fetch(`${apiBase}/api/campaign`)
    .then(res => res.json())
    .then(data => {
      if (data) {
        if (data.goal_usd && data.raised_usd !== undefined) {
          campaignData.USD.goal = Number(data.goal_usd);
          campaignData.USD.raised = Number(data.raised_usd);
        }
        if (data.goal_etb && data.raised_etb !== undefined) {
          campaignData.ETB.goal = Number(data.goal_etb);
          campaignData.ETB.raised = Number(data.raised_etb);
        }
        renderTracker();
      }
    })
    .catch(() => {/* fallback is already rendered */});

  // Sync with language changes
  document.addEventListener('languageChanged', (e) => {
    const lang = e.detail && e.detail.lang;
    if (lang === 'am') {
      currentCurr = 'ETB';
    } else if (lang === 'en') {
      currentCurr = 'USD';
    }
    renderTracker();
  });
}

/**
 * 5. Contact Form Handler (Wired to Live API)
 */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const phoneInput = document.getElementById('contact-phone');
    const messageInput = document.getElementById('contact-message');

    let isValid = true;

    if (!nameInput.value.trim()) {
      FormValidation.showError(nameInput, 'Please enter your full name.');
      isValid = false;
    } else {
      FormValidation.clearError(nameInput);
    }

    if (!FormValidation.isValidEmail(emailInput.value.trim())) {
      FormValidation.showError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    } else {
      FormValidation.clearError(emailInput);
    }

    if (!messageInput.value.trim()) {
      FormValidation.showError(messageInput, 'Please enter your message.');
      isValid = false;
    } else {
      FormValidation.clearError(messageInput);
    }

    if (!isValid) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Sending...
    `;

    const apiBase = (window.getApiBaseUrl && window.getApiBaseUrl()) || '';
    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput ? phoneInput.value.trim() : '',
          message: messageInput.value.trim()
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send message.');

      Toast.show('Thank you! Your message or prayer request has been sent to church leadership.', 'success');
      contactForm.reset();
    } catch (err) {
      console.error('Contact form error:', err);
      Toast.show(err.message || 'Error submitting message. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * 6. Newsletter Signup Handler (Wired to Live API)
 */
function initNewsletterForm() {
  const newsletterForm = document.getElementById('newsletter-form');
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('newsletter-email');
    if (!emailInput) return;

    if (!FormValidation.isValidEmail(emailInput.value.trim())) {
      FormValidation.showError(emailInput, 'Please enter a valid email address.');
      return;
    }

    FormValidation.clearError(emailInput);
    
    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Subscribing...';

    const apiBase = (window.getApiBaseUrl && window.getApiBaseUrl()) || '';
    try {
      const response = await fetch(`${apiBase}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value.trim() })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Subscription failed.');

      Toast.show('Welcome to our community newsletter! You are now subscribed.', 'success');
      newsletterForm.reset();
    } catch (err) {
      console.error('Newsletter error:', err);
      Toast.show(err.message || 'Subscription failed. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * 7. Intersection Observer Scroll Reveal Animations
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.fade-in-up');
  
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-8');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
    observer.observe(el);
  });
}
