/**
 * BATU/ZIWAY Hiwot Birhan Church - IT Admin Portal Logic
 * 
 * Functions:
 * - Session & Authentication handling (JWT/Bearer Token)
 * - Dashboard Overview Metrics
 * - Financial Audit & Donations Table (Search, Filter, Verify, CSV Export)
 * - Offline Manual Donation Modal
 * - Building Fund Live Campaign Manager
 * - Contact Messages & Prayer Requests Inbox
 * - Event Registrations Manager
 * - System Health Diagnostics & JSON Database Backup
 * - Admin Password Change
 * - English / Amharic UI Language Toggle
 */

(function () {
  'use strict';

  // API Base URL (auto-resolves via universal resolver or fallback)
  const API_BASE = (window.getApiBaseUrl && window.getApiBaseUrl()) || 
    (window.location.port && window.location.port !== '80' && window.location.port !== '443' && window.location.port !== '5000' 
      ? 'http://localhost:5000' 
      : window.location.origin);

  // Local Storage Keys
  const TOKEN_KEY = 'hb_admin_token';
  const USER_KEY = 'hb_admin_user';
  const LANG_KEY = 'hb_admin_lang';

  // State
  let currentToken = localStorage.getItem(TOKEN_KEY) || '';
  let currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';
  let activeTab = 'overview';
  let cachedDonations = [];
  let cachedMessages = [];
  let cachedEvents = [];

  // Safe HTML Escaping (Prevents Stored & Reflected XSS)
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Translations Dictionary for Admin Portal
  const adminDict = {
    en: {
      portalTitle: "Hiwot Birhan Church — IT Admin Portal",
      logout: "Log Out",
      overview: "Dashboard Overview",
      donations: "Financial & Donations Audit",
      campaign: "Building Campaign",
      messages: "Messages & Prayer Requests",
      events: "Event Registrations",
      system: "IT System & Diagnostics",
      totalEtb: "Total ETB Raised",
      totalUsd: "Total USD Raised",
      unreadMsg: "Unread Messages",
      eventAttendees: "Event Attendees",
      recordOffline: "+ Record Offline Donation",
      exportCsv: "Export CSV",
      searchPlaceholder: "Search donor name, email, or tx ref...",
      filterAll: "All Providers",
      statusAll: "All Statuses",
      saveChanges: "Save Changes",
      updateCampaign: "Update Campaign Stats",
      sysHealth: "System Health Status",
      dbSize: "Database Size",
      serverUptime: "Server Uptime",
      backupDb: "Download JSON Backup",
      changePassword: "Change Password"
    },
    am: {
      portalTitle: "የሕይወት ብርሃን ቤተክርስቲያን — IT አስተዳደር መድረክ",
      logout: "ውጣ",
      overview: "የአጠቃላይ መረጃ ሰሌዳ",
      donations: "የፋይናንስ እና የልገሳ ኦዲት",
      campaign: "የህንፃ ግንባታ ዘመቻ",
      messages: "መልእክቶች እና የጸሎት ጥያቄዎች",
      events: "የዝግጅት ምዝገባዎች",
      system: "የሲስተም ጤና እና ዲያግኖስቲክስ",
      totalEtb: "ጠቅላላ የገባ ብር (ETB)",
      totalUsd: "ጠቅላላ የገባ ዶላር (USD)",
      unreadMsg: "ያልተነበቡ መልእክቶች",
      eventAttendees: "የዝግጅት ተሳታፊዎች",
      recordOffline: "+ ከመስመር ውጭ ልገሳ መዝግብ",
      exportCsv: "ወደ CSV ላክ",
      searchPlaceholder: "የለጋሽ ስም፣ ኢሜይል ወይም የግብይት ቁጥር ፈልግ...",
      filterAll: "ሁሉም ክፍያዎች",
      statusAll: "ሁሉም ሁኔታዎች",
      saveChanges: "ለወጣቶችን አስቀምጥ",
      updateCampaign: "የዘመቻ መረጃ አዘምን",
      sysHealth: "የሲስተም ጤንነት ሁኔታ",
      dbSize: "የመረጃ ቋት መጠን",
      serverUptime: "የሰርቨር የሥራ ጊዜ",
      backupDb: "የመረጃ ቋት ኮፒ አውርድ (JSON)",
      changePassword: "የይለፍ ቃል ቀይር"
    }
  };

  // Toast Notification Helper
  window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
      <span class="text-sm font-medium">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Helper for Authenticated API Fetch
  async function apiFetch(endpoint, options = {}) {
    options.headers = options.headers || {};
    if (currentToken) {
      options.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await response.json();

      if (response.status === 401) {
        // Session expired or invalid
        logout();
        throw new Error(data.error || 'Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
      }

      return data;
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      throw err;
    }
  }

  // DOM Elements
  const loginSection = document.getElementById('admin-login-section');
  const appSection = document.getElementById('admin-app-section');
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const adminNameDisplay = document.getElementById('admin-name-display');
  const langToggleBtn = document.getElementById('lang-toggle-btn');

  // Initialize Admin App
  function init() {
    setupEventListeners();
    updateLanguageUI();

    if (currentToken && currentUser) {
      verifySession();
    } else {
      showLoginScreen();
    }
  }

  // Verify Session Token with Backend
  async function verifySession() {
    try {
      const data = await apiFetch('/api/admin/me');
      if (data.success) {
        currentUser = data.admin;
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        showAppScreen();
      } else {
        logout();
      }
    } catch (err) {
      logout();
    }
  }

  function showLoginScreen() {
    loginSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }

  function showAppScreen() {
    loginSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    if (adminNameDisplay && currentUser) {
      adminNameDisplay.textContent = currentUser.fullName || currentUser.username;
    }
    loadTabContent(activeTab);
  }

  function logout() {
    currentToken = '';
    currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    showLoginScreen();
    showToast('Logged out successfully.', 'info');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');

        const username = document.getElementById('username-input').value.trim();
        const password = document.getElementById('password-input').value;

        try {
          const res = await fetch(`${API_BASE}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();

          if (!res.ok) {
            loginError.textContent = data.error || 'Login failed';
            loginError.classList.remove('hidden');
            return;
          }

          currentToken = data.token;
          currentUser = data.admin;
          localStorage.setItem(TOKEN_KEY, currentToken);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

          showToast(`Welcome back, ${currentUser.fullName}!`, 'success');
          showAppScreen();
        } catch (err) {
          loginError.textContent = 'Server connection error. Ensure backend is running on port 5000.';
          loginError.classList.remove('hidden');
        }
      });
    }

    // Logout Click
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }

    // Language Toggle Click
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', () => {
        currentLang = (currentLang === 'en') ? 'am' : 'en';
        localStorage.setItem(LANG_KEY, currentLang);
        updateLanguageUI();
        loadTabContent(activeTab);
      });
    }

    // Nav Tabs Switcher
    const navButtons = document.querySelectorAll('[data-tab-nav]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.getAttribute('data-tab-nav');
        switchTab(targetTab);
      });
    });

    // Offline Donation Form Submit
    const manualDonationForm = document.getElementById('manual-donation-form');
    if (manualDonationForm) {
      manualDonationForm.addEventListener('submit', handleManualDonationSubmit);
    }

    // Campaign Stats Update Form Submit
    const campaignForm = document.getElementById('admin-campaign-form');
    if (campaignForm) {
      campaignForm.addEventListener('submit', handleCampaignUpdateSubmit);
    }

    // Change Password Form Submit
    const passwordForm = document.getElementById('admin-password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', handlePasswordChangeSubmit);
    }

    // Manual Event Participant Form Submit
    const eventParticipantForm = document.getElementById('manual-event-form');
    if (eventParticipantForm) {
      eventParticipantForm.addEventListener('submit', handleManualEventParticipantSubmit);
    }

    // Create Pastor Post Form Submit
    const createPostForm = document.getElementById('create-post-form');
    if (createPostForm) {
      createPostForm.addEventListener('submit', handleCreatePostSubmit);
    }
  }

  // Switch Active Admin Tab
  function switchTab(tabName) {
    activeTab = tabName;
    const navButtons = document.querySelectorAll('[data-tab-nav]');
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab-nav') === tabName) {
        btn.classList.add('bg-navy', 'text-white', 'shadow-md');
        btn.classList.remove('text-slate-muted', 'hover:bg-slate-100');
      } else {
        btn.classList.remove('bg-navy', 'text-white', 'shadow-md');
        btn.classList.add('text-slate-muted', 'hover:bg-slate-100');
      }
    });

    const tabPanels = document.querySelectorAll('[data-tab-panel]');
    tabPanels.forEach(panel => {
      if (panel.getAttribute('data-tab-panel') === tabName) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    loadTabContent(tabName);
  }

  // Load Content for Specific Tab
  async function loadTabContent(tabName) {
    try {
      if (tabName === 'overview') {
        await loadOverviewData();
      } else if (tabName === 'donations') {
        await loadDonationsData();
      } else if (tabName === 'campaign') {
        await loadCampaignData();
      } else if (tabName === 'messages') {
        await loadMessagesData();
      } else if (tabName === 'events') {
        await loadEventsData();
      } else if (tabName === 'posts') {
        await loadPostsData();
      } else if (tabName === 'system') {
        await loadSystemData();
      }
    } catch (err) {
      showToast(`Error loading ${tabName}: ${err.message}`, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 1. DASHBOARD OVERVIEW
  // --------------------------------------------------------------------------
  async function loadOverviewData() {
    const stats = await apiFetch('/api/admin/stats');
    
    // Update KPI Counters
    document.getElementById('kpi-total-etb').textContent = `${(stats.total_etb || 0).toLocaleString()} ETB`;
    document.getElementById('kpi-total-usd').textContent = `$${(stats.total_usd || 0).toLocaleString()}`;
    document.getElementById('kpi-unread-msg').textContent = stats.unread_messages || 0;
    document.getElementById('kpi-event-count').textContent = stats.event_registrations_count || 0;

    // Update Building Progress Bar
    if (stats.campaign) {
      const etbPct = Math.min(100, Math.round((stats.campaign.raised_etb / stats.campaign.goal_etb) * 100));
      const usdPct = Math.min(100, Math.round((stats.campaign.raised_usd / stats.campaign.goal_usd) * 100));

      const barEtb = document.getElementById('overview-bar-etb');
      const textEtb = document.getElementById('overview-text-etb');
      if (barEtb && textEtb) {
        barEtb.style.width = `${etbPct}%`;
        textEtb.textContent = `${etbPct}% (${stats.campaign.raised_etb.toLocaleString()} / ${stats.campaign.goal_etb.toLocaleString()} ETB)`;
      }

      const barUsd = document.getElementById('overview-bar-usd');
      const textUsd = document.getElementById('overview-text-usd');
      if (barUsd && textUsd) {
        barUsd.style.width = `${usdPct}%`;
        textUsd.textContent = `${usdPct}% ($${stats.campaign.raised_usd.toLocaleString()} / $${stats.campaign.goal_usd.toLocaleString()})`;
      }
    }

    // Render Recent Audit Logs
    const logContainer = document.getElementById('recent-audit-logs');
    if (logContainer) {
      if (!stats.recent_audit_logs || stats.recent_audit_logs.length === 0) {
        logContainer.innerHTML = `<p class="text-sm text-slate-muted italic">No recent system activity logs.</p>`;
      } else {
        logContainer.innerHTML = stats.recent_audit_logs.map(log => `
          <div class="flex items-start justify-between py-2 border-b border-slate-100 last:border-0">
            <div>
              <span class="font-semibold text-slate-800 text-sm">${escapeHtml(log.action)}</span>
              <p class="text-xs text-slate-500">${escapeHtml(log.details || '')}</p>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono text-slate-400">${new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span class="block text-xs font-medium text-navy">${escapeHtml(log.admin_username)}</span>
            </div>
          </div>
        `).join('');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // --------------------------------------------------------------------------
  // 2. FINANCIAL & DONATIONS AUDIT
  // --------------------------------------------------------------------------
  async function loadDonationsData() {
    const searchInput = document.getElementById('donation-search-input');
    const providerFilter = document.getElementById('donation-provider-filter');
    const currencyFilter = document.getElementById('donation-currency-filter');

    const q = searchInput ? searchInput.value.trim() : '';
    const provider = providerFilter ? providerFilter.value : '';
    const currency = currencyFilter ? currencyFilter.value : '';

    let queryParams = new URLSearchParams();
    if (q) queryParams.append('q', q);
    if (provider) queryParams.append('provider', provider);
    if (currency) queryParams.append('currency', currency);

    const donations = await apiFetch(`/api/admin/donations?${queryParams.toString()}`);
    cachedDonations = donations;

    renderDonationsTable(donations);
  }

  function renderDonationsTable(donations) {
    const tbody = document.getElementById('donations-tbody');
    if (!tbody) return;

    if (!donations || donations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-slate-400">
            No donation records found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = donations.map(d => {
      const isUsd = d.currency === 'USD';
      const formattedAmount = isUsd ? `$${d.amount.toLocaleString()}` : `${d.amount.toLocaleString()} ETB`;
      
      let providerBadgeClass = 'bg-blue-100 text-blue-800';
      if (d.payment_provider.includes('telebirr')) providerBadgeClass = 'bg-yellow-100 text-yellow-800';
      if (d.payment_provider.includes('cbe')) providerBadgeClass = 'bg-purple-100 text-purple-800';
      if (d.payment_provider.includes('coopbank')) providerBadgeClass = 'bg-green-100 text-green-800';
      if (d.payment_provider.includes('stripe')) providerBadgeClass = 'bg-indigo-100 text-indigo-800';
      if (d.payment_provider.includes('cash')) providerBadgeClass = 'bg-emerald-100 text-emerald-800';

      return `
        <tr class="hover:bg-slate-50 border-b border-slate-100 text-sm">
          <td class="py-3 px-4 font-medium text-slate-900">#${Number(d.id)}</td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800">${escapeHtml(d.donor_name)}</div>
            <div class="text-xs text-slate-500">${escapeHtml(d.donor_email)}</div>
          </td>
          <td class="py-3 px-4 font-bold text-slate-900">${formattedAmount}</td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${providerBadgeClass}">
              ${escapeHtml(d.payment_provider.replace('_', ' '))}
            </span>
          </td>
          <td class="py-3 px-4 font-mono text-xs text-slate-600">${escapeHtml(d.transaction_ref || 'N/A')}</td>
          <td class="py-3 px-4 text-xs text-slate-600 capitalize">${escapeHtml(d.designation.replace('_', ' '))}</td>
          <td class="py-3 px-4 text-xs text-slate-500">${new Date(d.created_at).toLocaleDateString()}</td>
          <td class="py-3 px-4 text-right">
            <button onclick="window.deleteDonationRecord(${Number(d.id)})" class="text-red-600 hover:text-red-800 text-xs font-semibold p-1" title="Delete Record">
              <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // Delete Donation Record
  window.deleteDonationRecord = async function (id) {
    if (!confirm(`Are you sure you want to delete donation record #${id}?`)) return;
    try {
      await apiFetch(`/api/admin/donations/${id}`, { method: 'DELETE' });
      showToast(`Donation #${id} deleted successfully.`, 'success');
      loadDonationsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Submit Offline Manual Donation
  async function handleManualDonationSubmit(e) {
    e.preventDefault();
    const donorName = document.getElementById('manual-donor-name').value.trim();
    const donorEmail = document.getElementById('manual-donor-email').value.trim();
    const amount = document.getElementById('manual-amount').value;
    const currency = document.getElementById('manual-currency').value;
    const paymentProvider = document.getElementById('manual-provider').value;
    const transactionRef = document.getElementById('manual-ref').value.trim();
    const designation = document.getElementById('manual-designation').value;

    try {
      await apiFetch('/api/admin/donations/manual', {
        method: 'POST',
        body: JSON.stringify({
          donorName,
          donorEmail,
          amount,
          currency,
          paymentProvider,
          transactionRef,
          designation
        })
      });

      showToast('Manual offline donation recorded successfully!', 'success');
      document.getElementById('manual-donation-modal').classList.add('hidden');
      document.getElementById('manual-donation-form').reset();
      loadDonationsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // CSV Export for Donations
  window.exportDonationsCSV = function () {
    if (!cachedDonations || cachedDonations.length === 0) {
      showToast('No donation data to export.', 'info');
      return;
    }

    const headers = ['ID', 'Donor Name', 'Donor Email', 'Amount', 'Currency', 'Payment Provider', 'Tx Ref', 'Designation', 'Date'];
    const rows = cachedDonations.map(d => [
      d.id,
      `"${d.donor_name.replace(/"/g, '""')}"`,
      `"${d.donor_email}"`,
      d.amount,
      d.currency,
      d.payment_provider,
      `"${d.transaction_ref || ''}"`,
      d.designation,
      `"${d.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `donations_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('Donations CSV downloaded successfully.', 'success');
  };

  // --------------------------------------------------------------------------
  // 3. BUILDING CAMPAIGN MANAGER
  // --------------------------------------------------------------------------
  async function loadCampaignData() {
    const campaign = await apiFetch('/api/campaign');
    document.getElementById('input-goal-etb').value = campaign.goal_etb || 60000000;
    document.getElementById('input-raised-etb').value = campaign.raised_etb || 37800000;
    document.getElementById('input-goal-usd').value = campaign.goal_usd || 500000;
    document.getElementById('input-raised-usd').value = campaign.raised_usd || 315000;

    calculateCampaignPreview();
  }

  function calculateCampaignPreview() {
    const goalEtb = parseFloat(document.getElementById('input-goal-etb').value) || 1;
    const raisedEtb = parseFloat(document.getElementById('input-raised-etb').value) || 0;
    const goalUsd = parseFloat(document.getElementById('input-goal-usd').value) || 1;
    const raisedUsd = parseFloat(document.getElementById('input-raised-usd').value) || 0;

    const etbPct = Math.min(100, Math.round((raisedEtb / goalEtb) * 100));
    const usdPct = Math.min(100, Math.round((raisedUsd / goalUsd) * 100));

    const previewEtbBar = document.getElementById('preview-etb-bar');
    const previewEtbText = document.getElementById('preview-etb-text');
    if (previewEtbBar && previewEtbText) {
      previewEtbBar.style.width = `${etbPct}%`;
      previewEtbText.textContent = `${etbPct}% (${raisedEtb.toLocaleString()} / ${goalEtb.toLocaleString()} ETB)`;
    }

    const previewUsdBar = document.getElementById('preview-usd-bar');
    const previewUsdText = document.getElementById('preview-usd-text');
    if (previewUsdBar && previewUsdText) {
      previewUsdBar.style.width = `${usdPct}%`;
      previewUsdText.textContent = `${usdPct}% ($${raisedUsd.toLocaleString()} / $${goalUsd.toLocaleString()})`;
    }
  }

  // Live input preview listeners
  ['input-goal-etb', 'input-raised-etb', 'input-goal-usd', 'input-raised-usd'].forEach(id => {
    const elem = document.getElementById(id);
    if (elem) elem.addEventListener('input', calculateCampaignPreview);
  });

  async function handleCampaignUpdateSubmit(e) {
    e.preventDefault();
    const goal_etb = parseFloat(document.getElementById('input-goal-etb').value);
    const raised_etb = parseFloat(document.getElementById('input-raised-etb').value);
    const goal_usd = parseFloat(document.getElementById('input-goal-usd').value);
    const raised_usd = parseFloat(document.getElementById('input-raised-usd').value);

    try {
      await apiFetch('/api/admin/campaign', {
        method: 'PUT',
        body: JSON.stringify({ goal_etb, raised_etb, goal_usd, raised_usd })
      });
      showToast('Building Fund stats updated live!', 'success');
      loadOverviewData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 4. MESSAGES & PRAYER REQUESTS
  // --------------------------------------------------------------------------
  async function loadMessagesData() {
    const filter = document.getElementById('message-status-filter');
    const status = filter ? filter.value : 'all';

    const messages = await apiFetch(`/api/admin/messages?status=${status}`);
    cachedMessages = messages;

    renderMessagesTable(messages);
  }

  function renderMessagesTable(messages) {
    const container = document.getElementById('messages-list-container');
    if (!container) return;

    if (!messages || messages.length === 0) {
      container.innerHTML = `<p class="text-center text-slate-400 py-8">No contact messages or prayer requests found.</p>`;
      return;
    }

    container.innerHTML = messages.map(m => {
      const isUnread = m.status === 'unread';
      const statusBadge = isUnread 
        ? `<span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">UNREAD</span>`
        : `<span class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">READ</span>`;

      return `
        <div class="bg-white border ${isUnread ? 'border-amber-300 shadow-sm' : 'border-slate-200'} rounded-lg p-5 mb-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-3">
              <span class="font-bold text-slate-900">${escapeHtml(m.name)}</span>
              ${statusBadge}
            </div>
            <div class="text-xs text-slate-400 font-mono">${new Date(m.created_at).toLocaleString()}</div>
          </div>
          <div class="text-xs text-slate-500 mb-3 space-x-3">
            <span><strong>Email:</strong> ${escapeHtml(m.email)}</span>
            <span><strong>Phone:</strong> ${escapeHtml(m.phone || 'N/A')}</span>
          </div>
          <div class="bg-slate-50 rounded-md p-4 text-slate-700 text-sm mb-3 whitespace-pre-wrap font-sans border border-slate-100">${escapeHtml(m.message)}</div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <div class="text-xs text-slate-500 italic">${m.notes ? `Staff Note: ${escapeHtml(m.notes)}` : ''}</div>
            <div class="flex items-center gap-2">
              ${isUnread ? `
                <button onclick="window.markMessageRead(${Number(m.id)}, 'read')" class="bg-navy text-white hover:bg-navy-dark text-xs px-3 py-1.5 rounded font-medium">
                  Mark as Read
                </button>
              ` : `
                <button onclick="window.markMessageRead(${Number(m.id)}, 'unread')" class="bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs px-3 py-1.5 rounded font-medium">
                  Mark Unread
                </button>
              `}
              <button onclick="window.deleteMessage(${Number(m.id)})" class="text-red-600 hover:text-red-800 text-xs p-1 font-semibold">
                <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.markMessageRead = async function (id, newStatus) {
    try {
      await apiFetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`Message #${id} updated.`, 'success');
      loadMessagesData();
      loadOverviewData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.deleteMessage = async function (id) {
    if (!confirm(`Delete message #${id}?`)) return;
    try {
      await apiFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      showToast(`Message #${id} deleted.`, 'success');
      loadMessagesData();
      loadOverviewData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --------------------------------------------------------------------------
  // 5. EVENT REGISTRATIONS
  // --------------------------------------------------------------------------
  async function loadEventsData() {
    const events = await apiFetch('/api/admin/events');
    cachedEvents = events;
    renderEventsTable(events);
  }

  function renderEventsTable(events) {
    const tbody = document.getElementById('events-tbody');
    if (!tbody) return;

    if (!events || events.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">No event registrations recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = events.map(e => `
      <tr class="hover:bg-slate-50 border-b border-slate-100 text-sm">
        <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(e.event_title)}</td>
        <td class="py-3 px-4 font-medium text-slate-800">${escapeHtml(e.participant_name)}</td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(e.participant_email)}</td>
        <td class="py-3 px-4 text-slate-600">${escapeHtml(e.participant_phone || 'N/A')}</td>
        <td class="py-3 px-4 text-xs text-slate-400">${new Date(e.created_at).toLocaleDateString()}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="window.deleteEventRegistration(${Number(e.id)})" class="text-red-600 hover:text-red-800 text-xs p-1 font-semibold">
            <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  window.deleteEventRegistration = async function (id) {
    if (!confirm(`Delete registration #${id}?`)) return;
    try {
      await apiFetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      showToast(`Event registration #${id} removed.`, 'success');
      loadEventsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  async function handleManualEventParticipantSubmit(e) {
    e.preventDefault();
    const eventTitle = document.getElementById('event-title-input').value;
    const participantName = document.getElementById('event-name-input').value.trim();
    const participantEmail = document.getElementById('event-email-input').value.trim();
    const participantPhone = document.getElementById('event-phone-input').value.trim();

    try {
      await apiFetch('/api/admin/events', {
        method: 'POST',
        body: JSON.stringify({
          eventTitle,
          participantName,
          participantEmail,
          participantPhone
        })
      });

      showToast('Participant registered successfully!', 'success');
      document.getElementById('manual-event-modal').classList.add('hidden');
      document.getElementById('manual-event-form').reset();
      loadEventsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  window.exportEventsCSV = function () {
    if (!cachedEvents || cachedEvents.length === 0) {
      showToast('No event attendee data to export.', 'info');
      return;
    }

    const headers = ['Event Title', 'Participant Name', 'Email', 'Phone', 'Registered At'];
    const rows = cachedEvents.map(e => [
      `"${e.event_title.replace(/"/g, '""')}"`,
      `"${e.participant_name.replace(/"/g, '""')}"`,
      `"${e.participant_email}"`,
      `"${e.participant_phone || ''}"`,
      `"${e.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_attendees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('Event attendees CSV downloaded successfully.', 'success');
  };

  // --------------------------------------------------------------------------
  // 6. IT SYSTEM & DIAGNOSTICS
  // --------------------------------------------------------------------------
  async function loadSystemData() {
    const health = await apiFetch('/api/admin/system/health');

    document.getElementById('sys-status-badge').textContent = health.status;
    document.getElementById('sys-uptime').textContent = `${Math.floor(health.uptimeSeconds / 60)} mins (${health.uptimeSeconds}s)`;
    document.getElementById('sys-node-ver').textContent = health.nodeVersion;
    document.getElementById('sys-memory').textContent = `${health.memoryUsageMB} MB`;
    document.getElementById('sys-db-size').textContent = `${health.database.fileSizeMB} MB (${health.database.fileSizeBytes.toLocaleString()} bytes)`;
    document.getElementById('sys-count-donations').textContent = health.database.tables.donations;
    document.getElementById('sys-count-messages').textContent = health.database.tables.messages;
    document.getElementById('sys-count-events').textContent = health.database.tables.event_registrations;
    document.getElementById('sys-count-logs').textContent = health.database.tables.audit_logs;
  }

  // Backup DB Download
  window.downloadDatabaseBackup = function () {
    const downloadUrl = `${API_BASE}/api/admin/system/backup`;
    fetch(downloadUrl, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hiwot_birhan_db_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Database JSON backup downloaded.', 'success');
    })
    .catch(err => showToast('Failed to download backup: ' + err.message, 'error'));
  };

  // Change Admin Password Submit
  async function handlePasswordChangeSubmit(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('curr-pass-input').value;
    const newPassword = document.getElementById('new-pass-input').value;
    const confirmPassword = document.getElementById('confirm-pass-input').value;

    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }

    try {
      await apiFetch('/api/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      showToast('Password updated successfully!', 'success');
      document.getElementById('admin-password-form').reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // --------------------------------------------------------------------------
  // PASTOR POSTS & MEDIA MANAGEMENT
  // --------------------------------------------------------------------------
  async function loadPostsData() {
    const posts = await apiFetch('/api/admin/posts');
    renderPostsGrid(posts);
  }

  function renderPostsGrid(posts) {
    const grid = document.getElementById('admin-posts-grid');
    if (!grid) return;

    if (!posts || posts.length === 0) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-400 py-12">No Pastor posters or announcements published yet.</p>`;
      return;
    }

    grid.innerHTML = posts.map(p => `
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div class="h-48 bg-slate-100 relative overflow-hidden">
            <img src="${escapeHtml(p.image_url)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80'">
            <span class="absolute top-3 right-3 bg-navy/80 backdrop-blur-md text-gold text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ${escapeHtml(p.category.replace('_', ' '))}
            </span>
          </div>
          <div class="p-5">
            <h4 class="font-serif font-bold text-slate-900 text-base mb-1 line-clamp-2">${escapeHtml(p.title)}</h4>
            <div class="text-xs text-slate-400 mb-3">${escapeHtml(p.author)} • ${new Date(p.created_at).toLocaleDateString()}</div>
            <p class="text-xs text-slate-600 line-clamp-3 leading-relaxed">${escapeHtml(p.content)}</p>
          </div>
        </div>
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Live on Website
          </span>
          <button onclick="window.deletePastorPost(${Number(p.id)})" class="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async function handleCreatePostSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('post-title-input').value.trim();
    const category = document.getElementById('post-category-select').value;
    const author = document.getElementById('post-author-input').value.trim();
    const image_url = document.getElementById('post-image-url-input').value.trim();
    const content = document.getElementById('post-content-input').value.trim();

    try {
      await apiFetch('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          author,
          image_url,
          content,
          is_featured: 1
        })
      });

      showToast('Pastor poster published live to website!', 'success');
      document.getElementById('create-post-modal').classList.add('hidden');
      document.getElementById('create-post-form').reset();
      loadPostsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  window.deletePastorPost = async function (id) {
    if (!confirm(`Delete poster #${id}?`)) return;
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      showToast(`Poster #${id} deleted.`, 'success');
      loadPostsData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Language UI Update
  function updateLanguageUI() {
    if (langToggleBtn) {
      langToggleBtn.textContent = currentLang === 'en' ? 'አማርኛ' : 'English';
    }

    const dict = adminDict[currentLang] || adminDict.en;
    document.querySelectorAll('[data-i18n-key]').forEach(elem => {
      const key = elem.getAttribute('data-i18n-key');
      if (dict[key]) {
        elem.textContent = dict[key];
      }
    });
  }

  // Search & Filter Listeners for Donations
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('donation-search-input');
    const providerFilter = document.getElementById('donation-provider-filter');
    const currencyFilter = document.getElementById('donation-currency-filter');

    if (searchInput) searchInput.addEventListener('input', () => loadDonationsData());
    if (providerFilter) providerFilter.addEventListener('change', () => loadDonationsData());
    if (currencyFilter) currencyFilter.addEventListener('change', () => loadDonationsData());

    const messageFilter = document.getElementById('message-status-filter');
    if (messageFilter) messageFilter.addEventListener('change', () => loadMessagesData());
  });

  // Run Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
