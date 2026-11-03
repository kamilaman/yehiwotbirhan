/**
 * BATU/ZIWAY Hiwot Birhan Church - Form Validation & UI Helpers
 */

const FormValidation = {
  /**
   * Validate Email Address
   */
  isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  /**
   * Validate Numeric Donation Amount ($1 to $100,000)
   */
  isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= 1.00 && num <= 100000.00;
  },

  /**
   * Show Error on Field
   */
  showError(inputElement, errorMessage) {
    if (!inputElement) return;
    inputElement.classList.add('border-red-500', 'bg-red-50');
    inputElement.classList.remove('border-slate-300', 'border-slate-200');
    inputElement.setAttribute('aria-invalid', 'true');
    
    let errorSpan = inputElement.parentElement.querySelector('.error-msg');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-msg text-xs text-red-600 mt-1 block font-medium';
      errorSpan.id = `${inputElement.id || 'field'}-error`;
      inputElement.parentElement.appendChild(errorSpan);
    }
    errorSpan.textContent = errorMessage;
    inputElement.setAttribute('aria-describedby', errorSpan.id);
  },

  /**
   * Clear Error on Field
   */
  clearError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('border-red-500', 'bg-red-50');
    inputElement.classList.add('border-slate-300');
    inputElement.removeAttribute('aria-invalid');
    
    const errorSpan = inputElement.parentElement.querySelector('.error-msg');
    if (errorSpan) {
      errorSpan.remove();
    }
    inputElement.removeAttribute('aria-describedby');
  },

  /**
   * Sanitize String Output
   */
  sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }
};

/**
 * Toast Notification System
 */
const Toast = {
  show(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    } else {
      iconSvg = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="text-sm font-medium flex-1">${FormValidation.sanitize(message)}</span>
      <button type="button" onclick="this.parentElement.remove()" class="text-white/80 hover:text-white focus:outline-none" aria-label="Close notification">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }
};

window.FormValidation = FormValidation;
window.Toast = Toast;
