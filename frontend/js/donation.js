/**
 * BATU/ZIWAY Hiwot Birhan Church - Building Fund & Multi-Currency Donation System
 * Supports Telebirr, CBE Birr/CBE Direct, Coopbank (CCOP), Awash Bank, Birhan Bank, Stripe.js & PayPal
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('donation-form-container')) {
    initDonationForm();
  }
});

/**
 * Copy Bank Account Number to Clipboard
 */
window.copyAccountNo = function(accountNumber) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(accountNumber).then(() => {
      const msg = (window.getCurrentLanguage && window.getCurrentLanguage() === 'am') 
        ? 'የሂሳብ ቁጥሩ በስኬት ተገልብጧል!' 
        : 'Account number copied to clipboard!';
      Toast.show(msg, 'success');
    });
  } else {
    Toast.show(`Account Number: ${accountNumber}`, 'info');
  }
};

function initDonationForm() {
  // State
  let currentCurrency = 'USD'; // 'USD' or 'ETB'
  let currentFrequency = 'one_time'; // 'one_time' or 'monthly'
  let currentAmount = 100;
  let currentDesignation = 'building_fund';
  let currentPaymentMethod = 'telebirr'; // 'telebirr', 'cbe', 'coop', 'awash', 'birhan', 'stripe', 'paypal'
  let stripeInstance = null;

  // DOM Elements
  const currUsdBtn = document.getElementById('curr-usd');
  const currEtbBtn = document.getElementById('curr-etb');
  const presetsContainer = document.getElementById('amount-presets-container');
  const customAmountInput = document.getElementById('custom-amount-input');
  const currencySymbolAddon = document.getElementById('currency-symbol-addon');

  const freqOneTimeBtn = document.getElementById('freq-one-time');
  const freqMonthlyBtn = document.getElementById('freq-monthly');
  const recurringNotice = document.getElementById('recurring-notice');
  const designationSelect = document.getElementById('designation-select');

  const donorNameInput = document.getElementById('donor-name');
  const donorEmailInput = document.getElementById('donor-email');
  const donorAddressInput = document.getElementById('donor-address');
  const submitBtn = document.getElementById('submit-donation-btn');
  const submitBtnText = document.getElementById('submit-btn-text');

  const donationForm = document.getElementById('donation-form');
  const successState = document.getElementById('donation-success-state');
  const failureState = document.getElementById('donation-failure-state');

  // --- 1. Currency & Presets Handler ---
  window.setCurrency = function(curr) {
    currentCurrency = curr;
    
    if (curr === 'USD') {
      if (currUsdBtn) {
        currUsdBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        currUsdBtn.classList.remove('text-slate-700');
      }
      if (currEtbBtn) {
        currEtbBtn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        currEtbBtn.classList.add('text-slate-700');
      }
      if (currencySymbolAddon) currencySymbolAddon.textContent = '$';
      renderPresets([25, 50, 100, 250, 500], '$');
      currentAmount = 100;
    } else {
      if (currEtbBtn) {
        currEtbBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        currEtbBtn.classList.remove('text-slate-700');
      }
      if (currUsdBtn) {
        currUsdBtn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        currUsdBtn.classList.add('text-slate-700');
      }
      if (currencySymbolAddon) currencySymbolAddon.textContent = 'ብር';
      renderPresets([500, 1000, 2500, 5000, 10000], 'ብር ');
      currentAmount = 1000;
    }
    if (customAmountInput) customAmountInput.value = '';
    updateSubmitButtonLabel();
  };

  function renderPresets(amounts, prefix = '$') {
    if (!presetsContainer) return;
    presetsContainer.innerHTML = '';

    amounts.forEach((amt, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.amount = amt;
      const isDefault = (currentCurrency === 'USD' && amt === 100) || (currentCurrency === 'ETB' && amt === 1000);
      
      btn.className = `amount-preset-btn py-3 px-2 border rounded-xl font-bold text-sm transition-all ${
        isDefault 
          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500' 
          : 'border-slate-200 bg-white text-slate-700 hover:border-gold hover:bg-amber-50/50'
      }`;
      btn.textContent = `${prefix}${amt.toLocaleString('en-US')}`;

      btn.addEventListener('click', (e) => {
        setAmount(amt, e.currentTarget);
      });

      presetsContainer.appendChild(btn);
    });
  }

  function setAmount(amount, activeBtn = null) {
    currentAmount = parseFloat(amount);
    
    const allBtns = presetsContainer.querySelectorAll('.amount-preset-btn');
    allBtns.forEach(btn => {
      btn.classList.remove('border-amber-600', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-500');
      btn.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
    });

    if (activeBtn) {
      activeBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      activeBtn.classList.add('border-amber-600', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-500');
    }

    if (customAmountInput && !activeBtn) {
      customAmountInput.value = amount;
    } else if (customAmountInput) {
      customAmountInput.value = '';
    }

    FormValidation.clearError(customAmountInput);
    updateSubmitButtonLabel();
  }

  if (customAmountInput) {
    customAmountInput.addEventListener('input', (e) => {
      const val = e.target.value;
      currentAmount = (val === '' || isNaN(val)) ? 0 : parseFloat(val);
      const allBtns = presetsContainer.querySelectorAll('.amount-preset-btn');
      allBtns.forEach(b => {
        b.classList.remove('border-amber-600', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-500');
        b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      });
      updateSubmitButtonLabel();
    });
  }

  // --- 2. Frequency Handler ---
  function setFrequency(freq) {
    currentFrequency = freq;
    if (freq === 'one_time') {
      if (freqOneTimeBtn) {
        freqOneTimeBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        freqOneTimeBtn.classList.remove('bg-white', 'text-slate-700');
      }
      if (freqMonthlyBtn) {
        freqMonthlyBtn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        freqMonthlyBtn.classList.add('bg-white', 'text-slate-700');
      }
      if (recurringNotice) recurringNotice.classList.add('hidden');
    } else {
      if (freqMonthlyBtn) {
        freqMonthlyBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        freqMonthlyBtn.classList.remove('bg-white', 'text-slate-700');
      }
      if (freqOneTimeBtn) {
        freqOneTimeBtn.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
        freqOneTimeBtn.classList.add('bg-white', 'text-slate-700');
      }
      if (recurringNotice) recurringNotice.classList.remove('hidden');
    }
    updateSubmitButtonLabel();
  }

  if (freqOneTimeBtn) freqOneTimeBtn.addEventListener('click', () => setFrequency('one_time'));
  if (freqMonthlyBtn) freqMonthlyBtn.addEventListener('click', () => setFrequency('monthly'));

  if (designationSelect) {
    designationSelect.addEventListener('change', (e) => {
      currentDesignation = e.target.value;
      updateSubmitButtonLabel();
    });
  }

  // --- 3. Payment Method Tabs (Ethiopian & International) ---
  const methods = ['telebirr', 'cbe', 'coop', 'awash', 'birhan', 'stripe', 'paypal'];

  function switchPaymentMethod(method) {
    currentPaymentMethod = method;

    methods.forEach(m => {
      const btn = document.getElementById(`tab-method-${m}`);
      const panel = document.getElementById(`panel-${m}`);

      if (btn && panel) {
        if (m === method) {
          btn.classList.add('border-amber-600', 'bg-amber-50', 'text-slate-900');
          btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-600');
          panel.classList.remove('hidden');
        } else {
          btn.classList.remove('border-amber-600', 'bg-amber-50', 'text-slate-900');
          btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
          panel.classList.add('hidden');
        }
      }
    });

    updateSubmitButtonLabel();
  }

  methods.forEach(m => {
    const btn = document.getElementById(`tab-method-${m}`);
    if (btn) btn.addEventListener('click', () => switchPaymentMethod(m));
  });

  // --- 4. Submit Button Label Update ---
  function updateSubmitButtonLabel() {
    if (!submitBtnText) return;
    const lang = (window.getCurrentLanguage && window.getCurrentLanguage()) || 'en';
    const sym = currentCurrency === 'USD' ? '$' : 'ብር ';
    const formatted = `${sym}${currentAmount > 0 ? currentAmount.toLocaleString('en-US') : '0'}`;
    
    let methodText = 'Telebirr';
    if (currentPaymentMethod === 'cbe') methodText = 'CBE';
    if (currentPaymentMethod === 'coop') methodText = 'Coopbank';
    if (currentPaymentMethod === 'awash') methodText = 'Awash Bank';
    if (currentPaymentMethod === 'birhan') methodText = 'Birhan Bank';
    if (currentPaymentMethod === 'stripe') methodText = 'Card';
    if (currentPaymentMethod === 'paypal') methodText = 'PayPal';

    if (lang === 'am') {
      const freqText = currentFrequency === 'monthly' ? ' በየወሩ' : '';
      submitBtnText.textContent = `${formatted}${freqText} በ${methodText} ይለግሱ`;
    } else {
      const freqText = currentFrequency === 'monthly' ? ' Monthly' : '';
      submitBtnText.textContent = `Donate ${formatted}${freqText} via ${methodText}`;
    }
  }

  document.addEventListener('languageChanged', updateSubmitButtonLabel);

  // --- 5. Stripe Elements Setup ---
  function initStripeElements() {
    const cardContainer = document.getElementById('card-element-container');
    if (!cardContainer) return;

    if (typeof Stripe !== 'undefined' && window.CHURCH_CONFIG && window.CHURCH_CONFIG.stripe.publishableKey) {
      try {
        stripeInstance = Stripe(window.CHURCH_CONFIG.stripe.publishableKey);
        cardContainer.innerHTML = `
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-700 uppercase tracking-wider">Credit or Debit Card</label>
              <div class="flex space-x-1">
                <span class="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">VISA</span>
                <span class="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 rounded">MC</span>
              </div>
            </div>
            <input type="text" placeholder="4242 •••• •••• 4242" class="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-mono" value="4242 4242 4242 4242" />
            <div class="grid grid-cols-2 gap-3">
              <input type="text" placeholder="MM / YY" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono" value="12/28" />
              <input type="text" placeholder="CVC" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono" value="123" />
            </div>
          </div>
        `;
      } catch (err) {
        console.warn('Stripe notice:', err);
      }
    }
  }

  initStripeElements();

  // --- 6. Form Submission Engine ---
  if (donationForm) {
    donationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isValid = true;
      if (!donorNameInput.value.trim()) {
        FormValidation.showError(donorNameInput, 'Please enter your full name.');
        isValid = false;
      } else {
        FormValidation.clearError(donorNameInput);
      }

      if (!FormValidation.isValidEmail(donorEmailInput.value.trim())) {
        FormValidation.showError(donorEmailInput, 'Please enter a valid email address.');
        isValid = false;
      } else {
        FormValidation.clearError(donorEmailInput);
      }

      if (!FormValidation.isValidAmount(currentAmount)) {
        Toast.show('Please enter a valid donation amount.', 'error');
        isValid = false;
      }

      if (!isValid) return;

      // Extract transaction reference if bank/telebirr/paypal selected
      let txRefInput = document.getElementById(`tx-ref-${currentPaymentMethod}`);
      let txRefValue = txRefInput ? txRefInput.value.trim() : '';

      const apiBase = (window.getApiBaseUrl && window.getApiBaseUrl()) || '';

      // 1. Direct Bank Deposit & PayPal Validation
      if (['cbe', 'coop', 'awash', 'birhan', 'paypal'].includes(currentPaymentMethod)) {
        if (!txRefValue) {
          const label = currentPaymentMethod === 'paypal' ? 'PayPal Transaction ID or Payer Email' : 'Bank Transaction Reference Number';
          Toast.show(`Please enter your ${label}.`, 'error');
          if (txRefInput) txRefInput.focus();
          return;
        }
      }

      submitBtn.disabled = true;
      const origBtnText = submitBtnText.textContent;
      submitBtnText.innerHTML = `Processing Donation via ${currentPaymentMethod.toUpperCase()}...`;

      try {
        // 2. Chapa Local Online Checkout (when Telebirr selected without manual reference)
        if (currentPaymentMethod === 'telebirr' && !txRefValue) {
          const chapaRes = await fetch(`${apiBase}/api/donations/chapa/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donor_name: donorNameInput.value.trim(),
              donor_email: donorEmailInput.value.trim(),
              amount: currentAmount,
              designation: currentDesignation
            })
          });
          const chapaData = await chapaRes.json();
          if (chapaData.success && chapaData.checkout_url) {
            window.location.href = chapaData.checkout_url;
            return;
          } else {
            throw new Error(chapaData.error || chapaData.message || 'Unable to connect to Chapa gateway.');
          }
        }

        // 3. Stripe International Online Checkout
        if (currentPaymentMethod === 'stripe') {
          const stripeRes = await fetch(`${apiBase}/api/donations/stripe/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              donor_name: donorNameInput.value.trim(),
              donor_email: donorEmailInput.value.trim(),
              amount: currentAmount,
              designation: currentDesignation
            })
          });
          const stripeData = await stripeRes.json();
          if (stripeData.success && stripeData.checkout_url) {
            window.location.href = stripeData.checkout_url;
            return;
          } else {
            throw new Error(stripeData.error || 'Failed to initialize Stripe checkout.');
          }
        }

        // 4. Direct Bank Transfer & PayPal (Pending Treasury Audit)
        const donationPayload = {
          amount: currentAmount,
          currency: currentCurrency,
          frequency: currentFrequency,
          designation: currentDesignation,
          payment_provider: currentPaymentMethod === 'paypal' ? 'paypal' : `bank_transfer_${currentPaymentMethod}`,
          transaction_ref: txRefValue,
          status: 'pending',
          donor_name: donorNameInput.value.trim(),
          donor_email: donorEmailInput.value.trim(),
          donor_address: donorAddressInput ? donorAddressInput.value.trim() : ""
        };

        const response = await fetch(`${apiBase}/api/donations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(donationPayload)
        });

        const result = await response.json();

        submitBtn.disabled = false;
        submitBtnText.textContent = origBtnText;

        if (!response.ok) {
          throw new Error(result.error || 'Failed to process donation. Please try again.');
        }

        showDonationSuccess({
          amount: currentAmount,
          currency: currentCurrency,
          frequency: currentFrequency,
          designation: currentDesignation,
          paymentProvider: currentPaymentMethod.toUpperCase(),
          txRef: result.txRef || txRefValue || ('HB-' + Math.floor(100000 + Math.random() * 900000)),
          donorEmail: donorEmailInput.value.trim(),
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        });
      } catch (err) {
        submitBtn.disabled = false;
        submitBtnText.textContent = origBtnText;
        console.error('Donation submission error:', err);
        Toast.show(err.message || 'Error processing donation. Please try again.', 'error');
      }
    });
  }

  function showDonationSuccess(data) {
    if (donationForm) donationForm.classList.add('hidden');
    if (failureState) failureState.classList.add('hidden');
    if (successState) {
      successState.classList.remove('hidden');
      
      const resAmount = document.getElementById('res-amount');
      const resDesignation = document.getElementById('res-designation');
      const resRef = document.getElementById('res-tx-ref');
      const resEmail = document.getElementById('res-email');
      const resDate = document.getElementById('res-date');

      const sym = data.currency === 'USD' ? '$' : 'ብር ';
      if (resAmount) resAmount.textContent = `${sym}${data.amount.toLocaleString('en-US')} (${data.paymentProvider})`;
      if (resDesignation) resDesignation.textContent = data.designation.replace('_', ' ').toUpperCase();
      if (resRef) resRef.textContent = data.txRef;
      if (resEmail) resEmail.textContent = data.donorEmail;
      if (resDate) resDate.textContent = data.date;

      successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
      Toast.show('Thank you! Your donation reference has been received.', 'success');
    }
  }

  window.resetDonationForm = function() {
    if (successState) successState.classList.add('hidden');
    if (failureState) failureState.classList.add('hidden');
    if (donationForm) donationForm.classList.remove('hidden');
  };
}
