/**
 * BATU YEHIYWOT BERHAN CHURCH - Configuration File
 * 
 * Production Note: Replace placeholder keys and API endpoints before deploying live.
 */

window.CHURCH_CONFIG = {
  churchName: "BATU YEHIYWOT BERHAN CHURCH",
  shortName: "BATU YEHIYWOT BERHAN CHURCH",
  city: "Ziway / Batu",
  country: "Ethiopia",
  address: "Central Avenue, Batu (Ziway), Oromia, Ethiopia",
  phone: "+251 46 441 2345",
  email: "info@hiwotbirhanchurch.org",
  pastorName: "Pastor Zerfu",
  pastorTitle: "Lead Pastor",

  // Service Schedule
  serviceTimes: {
    sunday: "3:00 – 6:00 (9:00 AM – 12:00 PM) — Ye Amliko Gize (የአምልኮ ጊዜ)",
    wednesday: "11:00 – 1:00 (5:00 PM – 7:00 PM) — Yetselot Ena Yetimihirt Gize (የጸሎት እና የትምህርት ጊዜ)",
    friday: "11:00 – 1:00 (5:00 PM – 7:00 PM) — Ye Amliko Ena Yefewus Gize (የአምልኮ እና የፈውስ ጊዜ)",
    // Compatibility aliases
    sundayFirst: "3:00 – 6:00 (9:00 AM – 12:00 PM)",
    sundaySecond: "3:00 – 6:00 (9:00 AM – 12:00 PM)",
    wednesdayStudy: "11:00 – 1:00 (5:00 PM – 7:00 PM)",
    fridayPrayer: "11:00 – 1:00 (5:00 PM – 7:00 PM)"
  },

  // Building Campaign Goals
  buildingFund: {
    goalAmount: 500000, // in USD
    raisedAmount: 315000,
    currency: "USD",
    currencySymbol: "$",
    etbGoalAmount: 60000000, // in ETB
    etbRaisedAmount: 37800000,
    nonProfitTaxNotice: "BATU YEHIYWOT BERHAN CHURCH is a registered non-profit organization. Gifts may be tax-deductible where applicable under regional law."
  },

  // Ethiopian Local Payment Provider Configurations
  ethiopianPayments: {
    telebirr: {
      merchantName: "BATU YEHIYWOT BERHAN CHURCH",
      merchantCode: "HB-784920",
      shortCode: "8842",
      apiEndpoint: "/api/donations/telebirr/web-pay"
    },
    cbe: {
      accountName: "BATU YEHIYWOT BERHAN CHURCH",
      accountNumber: "1000 4829 3019 4",
      cbeBirrCode: "948201",
      bankBranch: "Ziway / Batu Branch"
    },
    coopbank: {
      accountName: "BATU YEHIYWOT BERHAN CHURCH",
      accountNumber: "1000 1948 2930 1",
      coopPayShortCode: "10948",
      bankBranch: "Batu Branch (CCOP)"
    },
    awashBank: {
      accountName: "BATU YEHIYWOT BERHAN CHURCH",
      accountNumber: "0132 0948 2910 00",
      bankBranch: "Ziway Main Branch"
    },
    birhanBank: {
      accountName: "BATU YEHIYWOT BERHAN CHURCH",
      accountNumber: "2600 1948 2019 3",
      bankBranch: "Batu Branch"
    }
  },

  // International Payment Integration Configuration
  stripe: {
    publishableKey: "pk_test_TYq2gNmA58xDUtbFD5225NDA", // Demo test key
    apiEndpoint: "/api/donations/create-payment-intent"
  },
  
  paypal: {
    clientId: "sb", // PayPal Sandbox Client ID
    apiEndpoint: "/api/donations/paypal-order"
  }
};

/**
 * Universal Dynamic API Base URL Resolver
 * Automatically resolves between production Docker/Nginx reverse proxy and local dev environments
 */
window.getApiBaseUrl = function() {
  if (typeof window === 'undefined' || !window.location) return 'http://localhost:5000';
  const port = window.location.port;
  // If running through Nginx (port 80/443), or served directly by Express (port 5000), use current origin
  if (!port || port === '80' || port === '443' || port === '5000') {
    return window.location.origin;
  }
  // If running via Live Server, Vite, or another dev port (e.g. 5500, 3000, 8000, 8080)
  return 'http://localhost:5000';
};
