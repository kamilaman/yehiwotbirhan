'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from './LanguageContext';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Lock,
  Printer,
  Loader2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  X,
} from 'lucide-react';

export type ChapaChannelId =
  | 'telebirr'
  | 'cbebirr'
  | 'abyssinia'
  | 'awash'
  | 'coop'
  | 'dashen'
  | 'berhan'
  | 'wegagen'
  | 'card';

export const PaymentSelector: React.FC<{ initialDesignation?: string }> = ({
  initialDesignation = 'building_fund',
}) => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Region & Currency: 'local' (ETB) vs 'international' (USD)
  const [region, setRegion] = useState<'local' | 'international'>('local');
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [amount, setAmount] = useState<number>(3000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [designation, setDesignation] = useState<string>(initialDesignation);

  // Donor Details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');

  // Payment Methods
  // For Local (ETB): 'chapa' (online instant) vs 'manual_bank' (offline bank slip)
  const [localMethod, setLocalMethod] = useState<'chapa' | 'manual_bank'>('chapa');
  const [chapaChannel, setChapaChannel] = useState<ChapaChannelId>('telebirr');
  const [manualBank, setManualBank] = useState<string>('cbe');
  const [manualRef, setManualRef] = useState<string>('');

  // For International (USD): 'stripe' (card/apple/google pay) vs 'paypal'
  const [intlMethod, setIntlMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [paypalRef, setPaypalRef] = useState<string>('');

  // Status & Simulation Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [confirmedData, setConfirmedData] = useState<{
    txRef: string;
    amount: number;
    currency: string;
    provider: string;
    name: string;
    isPendingVerification?: boolean;
    verificationNote?: string;
  } | null>(null);

  const [simulationModal, setSimulationModal] = useState<{
    isOpen: boolean;
    txRef: string;
    amount: number;
    donorName: string;
    donorPhone: string;
    selectedChannel: ChapaChannelId;
    isProcessing: boolean;
  } | null>(null);

  const etbPresets = [500, 1000, 3000, 5000, 10000];
  const usdPresets = [25, 50, 100, 250, 500];

  // Auto-verify URL returns from Chapa or Stripe redirect
  useEffect(() => {
    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    const sessionId = searchParams.get('session_id');
    const provider = searchParams.get('provider');

    if ((status === 'success' || status === 'verifying') && (txRef || sessionId)) {
      if (provider === 'chapa' && txRef) {
        setIsVerifying(true);
        setVerificationError(null);
        api
          .verifyChapa(txRef)
          .then((res) => {
            setIsVerifying(false);
            if (res.verified) {
              setSubmitSuccess(true);
              const donation = res.donation || res.data;
              setConfirmedData({
                txRef,
                amount: Number(res.amount || donation?.amount || 3000),
                currency: res.currency || donation?.currency || 'ETB',
                provider: 'Chapa (Telebirr / CBE Birr / Mobile Banking)',
                name: donation?.donor_name || 'Faithful Supporter',
                isPendingVerification: false,
              });
            } else {
              setVerificationError(
                res.message || 'Payment has not been confirmed yet. Please wait a moment for bank processing.'
              );
            }
          })
          .catch(() => {
            setIsVerifying(false);
            setVerificationError(`Unable to verify transaction. Reference: ${txRef}`);
          });
      } else if (provider === 'stripe') {
        const idToVerify = sessionId || txRef || '';
        setIsVerifying(true);
        setVerificationError(null);
        api
          .verifyStripe(idToVerify, txRef || undefined)
          .then((res) => {
            setIsVerifying(false);
            if (res.verified) {
              setSubmitSuccess(true);
              const donation = res.donation;
              setConfirmedData({
                txRef: txRef || sessionId || `HB-STRIPE-${Date.now()}`,
                amount: donation?.amount || 100,
                currency: 'USD',
                provider: 'Stripe International (Credit / Debit Card)',
                name: donation?.donor_name || 'Faithful International Supporter',
                isPendingVerification: false,
              });
            } else {
              setVerificationError(res.error || 'Stripe payment was not confirmed.');
            }
          })
          .catch(() => {
            setIsVerifying(false);
            setVerificationError('Unable to verify Stripe transaction.');
          });
      }
    }
  }, [searchParams]);

  const handleRegionChange = (newRegion: 'local' | 'international') => {
    setRegion(newRegion);
    setErrorMessage(null);
    if (newRegion === 'local') {
      setAmount(3000);
      setCustomAmount('');
    } else {
      setAmount(100);
      setCustomAmount('');
    }
  };

  const currentCurrency = region === 'local' ? 'ETB' : 'USD';
  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Authentic Bank / Channel Logo Component
  const BankLogo: React.FC<{ id: string; size?: number; className?: string }> = ({
    id,
    size = 28,
    className = '',
  }) => {
    const s = size;
    if (id === 'telebirr') {
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none" className={`rounded-md shrink-0 ${className}`}>
          <rect width="36" height="36" rx="6" fill="#009A44" />
          <rect x="0" y="24" width="36" height="12" fill="#E30613" />
          <path d="M14 10h8v2.5h-2.5v8h-3v-8H14V10z" fill="white" />
          <text x="18" y="33" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" fontFamily="Arial">telebirr</text>
        </svg>
      );
    }
    if (id === 'cbebirr' || id === 'cbe') {
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none" className={`rounded-md shrink-0 ${className}`}>
          <rect width="36" height="36" rx="6" fill="#003D8F" />
          <circle cx="18" cy="14" r="6" fill="none" stroke="#FFD700" strokeWidth="2" />
          <path d="M15 14c0-1.66 1.34-3 3-3 .97 0 1.83.46 2.38 1.18l1.54-1.54A4.97 4.97 0 0018 9c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.38 0 2.63-.56 3.54-1.46l-1.54-1.54A3 3 0 0118 17c-1.66 0-3-1.34-3-3z" fill="#FFD700" />
          <text x="18" y="29" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" fontFamily="Arial">CBE</text>
        </svg>
      );
    }
    if (id === 'card') {
      return (
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none" className={`rounded-md shrink-0 ${className}`}>
          <rect width="36" height="36" rx="6" fill="#1565C0" />
          <rect x="6" y="11" width="24" height="15" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="6" y="15" width="24" height="3" fill="white" opacity="0.4" />
          <text x="18" y="32" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="white" fontFamily="Arial">EthSwitch</text>
        </svg>
      );
    }

    const fileKey = id === 'birhan' ? 'berhan' : id;
    return (
      <div
        className={`relative inline-flex items-center justify-center bg-white rounded-md p-0.5 border border-slate-200/90 shadow-2xs overflow-hidden shrink-0 ${className}`}
        style={{ width: s, height: s }}
      >
        <img
          src={`/images/banks/bank_${fileKey}.png`}
          alt={`${id} bank logo`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = '<span class="text-xs">🏦</span>';
            }
          }}
        />
      </div>
    );
  };

  // Primary payment submission handler
  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim()) {
      setErrorMessage('Please enter your full name and email address.');
      return;
    }
    if (currentAmount <= 0) {
      setErrorMessage('Please specify a valid gift amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. CHAPA LOCAL ONLINE (Telebirr / CBE / Banks / Card)
    if (region === 'local' && localMethod === 'chapa') {
      if ((chapaChannel === 'telebirr' || chapaChannel === 'cbebirr') && !donorPhone.trim()) {
        setIsSubmitting(false);
        setErrorMessage(
          `Please provide your mobile number so ${chapaChannel === 'telebirr' ? 'Telebirr (*127#)' : 'CBE'
          } can send you the instant authorization prompt.`
        );
        return;
      }

      const res = await api.initializeChapa({
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donorPhone || undefined,
        amount: currentAmount,
        designation,
        payment_method: chapaChannel,
      });

      setIsSubmitting(false);

      if (res.success) {
        if (res.mode === 'sandbox_simulation') {
          // Open clean 1-click test simulation modal
          setSimulationModal({
            isOpen: true,
            txRef: res.tx_ref || `HB-SIM-${Date.now()}`,
            amount: currentAmount,
            donorName: donorName.trim(),
            donorPhone: donorPhone.trim() || '0911234567',
            selectedChannel: chapaChannel,
            isProcessing: false,
          });
        } else if (res.checkout_url) {
          window.location.href = res.checkout_url;
        }
      } else {
        setErrorMessage(res.error || res.message || 'Unable to connect to Chapa gateway.');
      }
      return;
    }

    // 2. MANUAL BANK TRANSFER (Offline Deposit Slip)
    if (region === 'local' && localMethod === 'manual_bank') {
      if (!manualRef.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your bank slip reference number or mobile transfer ID.');
        return;
      }

      const bankNames: Record<string, string> = {
        cbe: 'Commercial Bank of Ethiopia (CBE)',
        coop: 'Cooperative Bank of Oromia',
        awash: 'Awash Bank',
        birhan: 'Birhan Bank',
        telebirr: 'Telebirr Direct',
      };

      const res = await api.createDonation({
        donor_name: donorName,
        donor_email: donorEmail,
        donor_address: donorPhone || undefined,
        amount: currentAmount,
        currency: 'ETB',
        frequency,
        designation,
        payment_provider: `bank_transfer_${manualBank}`,
        transaction_ref: manualRef.trim(),
        status: 'pending',
      });

      setIsSubmitting(false);

      if (res.success) {
        setSubmitSuccess(true);
        setConfirmedData({
          txRef: manualRef.trim(),
          amount: currentAmount,
          currency: 'ETB',
          provider: `Direct Bank Deposit (${bankNames[manualBank] || manualBank.toUpperCase()})`,
          name: donorName,
          isPendingVerification: true,
        });
      } else {
        setErrorMessage(res.message || 'Error recording bank transfer details.');
      }
      return;
    }

    // 3. STRIPE INTERNATIONAL (Credit / Debit Card)
    if (region === 'international' && intlMethod === 'stripe') {
      const res = await api.initializeStripe({
        donor_name: donorName,
        donor_email: donorEmail,
        amount: currentAmount,
        designation,
      });

      setIsSubmitting(false);

      if (res.success && res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setErrorMessage(res.error || res.message || 'Unable to connect to Stripe gateway.');
      }
      return;
    }

    // 4. PAYPAL INTERNATIONAL
    if (region === 'international' && intlMethod === 'paypal') {
      if (!paypalRef.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your PayPal transaction ID or payer email.');
        return;
      }

      const res = await api.createDonation({
        donor_name: donorName,
        donor_email: donorEmail,
        donor_address: donorPhone || undefined,
        amount: currentAmount,
        currency: 'USD',
        frequency,
        designation,
        payment_provider: 'paypal',
        transaction_ref: paypalRef.trim(),
        status: 'pending',
      });

      setIsSubmitting(false);

      if (res.success) {
        setSubmitSuccess(true);
        setConfirmedData({
          txRef: paypalRef.trim(),
          amount: currentAmount,
          currency: 'USD',
          provider: 'PayPal Worldwide Giving',
          name: donorName,
          isPendingVerification: true,
        });
      } else {
        setErrorMessage(res.message || 'Error recording PayPal reference.');
      }
      return;
    }
  };

  // Complete Sandbox Simulation Authorization
  const handleAuthorizeSimulation = async () => {
    if (!simulationModal) return;
    setSimulationModal((prev) => (prev ? { ...prev, isProcessing: true } : null));

    try {
      const res = await api.verifyChapa(simulationModal.txRef);
      if (res.verified) {
        setSimulationModal(null);
        setSubmitSuccess(true);
        const channelTitles: Record<string, string> = {
          telebirr: 'Chapa (Telebirr ቴሌብር)',
          cbebirr: 'Chapa (CBE Banking / CBE Birr)',
          abyssinia: 'Chapa (Bank of Abyssinia BoA)',
          awash: 'Chapa (Awash Bank Awash Birr)',
          coop: 'Chapa (CoopPay Cooperative Bank)',
          dashen: 'Chapa (Dashen Bank / Amole)',
          berhan: 'Chapa (Berhan Bank)',
          wegagen: 'Chapa (Wegagen Bank)',
          card: 'Chapa (EthSwitch ATM / Debit Card)',
        };

        setConfirmedData({
          txRef: simulationModal.txRef,
          amount: simulationModal.amount,
          currency: 'ETB',
          provider: channelTitles[simulationModal.selectedChannel] || 'Chapa Online Checkout',
          name: simulationModal.donorName || 'Faithful Supporter',
          isPendingVerification: false,
        });
      } else {
        setSimulationModal((prev) => (prev ? { ...prev, isProcessing: false } : null));
        setErrorMessage(res.message || 'Payment simulation could not be verified.');
      }
    } catch (err: any) {
      setSimulationModal((prev) => (prev ? { ...prev, isProcessing: false } : null));
      setErrorMessage(err.message || 'Network error verifying payment simulation.');
    }
  };

  // --------------------------------------------------------------------------
  // STATE A: VERIFYING REDIRECT
  // --------------------------------------------------------------------------
  if (isVerifying) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 text-center max-w-lg mx-auto space-y-4">
        <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto" />
        <h3 className="font-serif font-bold text-xl text-navy">Verifying Payment Confirmation</h3>
        <p className="text-xs text-slate-500">
          Communicating with bank payment gateway. Please wait...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE B: VERIFICATION ERROR
  // --------------------------------------------------------------------------
  if (verificationError) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-200 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-navy">Payment Verification Notice</h3>
        <p className="text-xs text-slate-600">{verificationError}</p>
        <button
          type="button"
          onClick={() => {
            setVerificationError(null);
            window.history.replaceState({}, '', window.location.pathname);
          }}
          className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-xl shadow-sm hover:bg-gold hover:text-navy transition-all"
        >
          Return to Giving Form
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE C: CLEAN OFFICIAL 1-PAGE CHURCH RECEIPT (SUCCESS)
  // --------------------------------------------------------------------------
  if (submitSuccess && confirmedData) {
    const formattedAmount =
      confirmedData.currency === 'ETB'
        ? `${confirmedData.amount.toLocaleString()} Br (ETB)`
        : `$${confirmedData.amount.toLocaleString()} USD`;

    const receiptDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const receiptTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const receiptNumber = `RCP-${confirmedData.txRef.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

    return (
      <div
        id="official-church-receipt"
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-gold/40 text-left max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 print:max-w-none print:w-full print:border-2 print:border-slate-800 print:rounded-2xl print:p-5 print:shadow-none print:m-0"
      >
        {/* Official Letterhead Header */}
        <div className="flex items-center justify-between border-b-2 border-navy/15 pb-3.5 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full border-2 border-gold overflow-hidden bg-white shrink-0 p-0.5">
              <img
                src="/images/logo.png"
                alt="BATU YEHIYWOT BERHAN CHURCH Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
                ባቱ የሕይወት ብርሃን ቤተክርስቲያን
              </span>
              <h2 className="font-serif font-bold text-base sm:text-lg text-navy leading-tight">
                BATU YEHIYWOT BERHAN CHURCH
              </h2>
              <p className="text-[10px] text-slate-500 italic">
                A Place to Belong. A Faith to Grow.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 py-0.5 bg-navy text-white text-[9px] font-bold uppercase tracking-wider rounded">
              Official Receipt
            </span>
            <span className="block font-mono text-xs font-bold text-navy mt-1">
              {receiptNumber}
            </span>
            <span className="block text-[10px] text-slate-500">
              {receiptDate} • {receiptTime}
            </span>
          </div>
        </div>

        {/* Acknowledgment & Gift Banner */}
        <div className="bg-gradient-to-r from-cream via-amber-50/50 to-cream border border-gold/30 rounded-xl p-3 sm:p-4 mb-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold block mb-0.5">
            {confirmedData.isPendingVerification
              ? 'Official Deposit Slip Registration'
              : 'Verified Donation Acknowledgment'}
          </span>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-navy">
            Thank You, {confirmedData.name}!
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto leading-relaxed">
            {confirmedData.isPendingVerification ? (
              <>
                Your contribution of <strong className="text-navy">{formattedAmount}</strong> with reference <strong className="font-mono text-navy">{confirmedData.txRef}</strong> has been logged in the church registry.
              </>
            ) : (
              <>
                Your gift of <strong className="text-emerald-900 font-bold">{formattedAmount}</strong> has been authoritatively verified and securely registered in the church registry.
              </>
            )}
          </p>
        </div>

        {/* Gift & Transaction Audit Summary Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 text-xs">
          <div className="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200 font-bold text-[10px] uppercase tracking-wider text-slate-600 flex justify-between items-center">
            <span>Gift & Transaction Audit Summary</span>
            <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 normal-case">
              <Check className="w-3 h-3 text-emerald-600" /> Treasury Registered
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between px-3.5 py-1.5">
              <span className="text-slate-500">Beneficiary Organization:</span>
              <strong className="text-navy font-semibold">BATU YEHIYWOT BERHAN CHURCH</strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5 bg-slate-50/40">
              <span className="text-slate-500">Contributor / Donor Name:</span>
              <strong className="text-navy font-bold">{confirmedData.name}</strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5">
              <span className="text-slate-500">Total Gift Amount:</span>
              <strong className="text-emerald-900 font-mono text-sm font-bold">{formattedAmount}</strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5 bg-slate-50/40">
              <span className="text-slate-500">Payment Channel / Bank:</span>
              <strong className="text-navy">{confirmedData.provider}</strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5">
              <span className="text-slate-500">Transaction Reference Code:</span>
              <strong className="text-navy font-mono text-[11px]">{confirmedData.txRef}</strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5 bg-slate-50/40">
              <span className="text-slate-500">Designated Ministry Fund:</span>
              <strong className="text-navy capitalize">
                {designation.replace('_', ' ')} (2,500-Seat Sanctuary Project)
              </strong>
            </div>
            <div className="flex justify-between px-3.5 py-1.5">
              <span className="text-slate-500">Audit Verification Status:</span>
              {confirmedData.isPendingVerification ? (
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Pending Treasury Clearance
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Authoritatively Verified & Receipted
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scripture Verse */}
        <p className="text-[10px] text-center italic text-slate-500 mb-3 px-2">
          "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7
        </p>

        {/* Official Church Address & Contacts Section */}
        <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-600 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            <div>
              <strong className="text-navy text-[10px] uppercase tracking-wider block font-bold mb-0.5">
                Sanctuary & Office Address:
              </strong>
              <span className="block leading-snug">Central Avenue, Kebele 02</span>
              <span className="block leading-snug">Batu (Ziway), East Shewa, Oromia, Ethiopia</span>
              <span className="block text-slate-400">P.O. Box: 142, Batu, Ethiopia</span>
            </div>
            <div>
              <strong className="text-navy text-[10px] uppercase tracking-wider block font-bold mb-0.5">
                Direct Contacts:
              </strong>
              <span className="block leading-snug">Phone: +251 46 441 2345</span>
              <span className="block leading-snug">Mobile: +251 91 123 4567</span>
              <span className="block leading-snug">Email: finance@hiwotbirhan.org</span>
              <span className="block text-slate-400">Web: www.hiwotbirhan.org</span>
            </div>
            <div>
              <strong className="text-navy text-[10px] uppercase tracking-wider block font-bold mb-0.5">
                Non-Profit Registry & Seal:
              </strong>
              <span className="block leading-snug">TIN Number: 0092847192</span>
              <span className="block leading-snug">Fellowship Reg: EECF-HB-4829</span>
              <span className="block text-emerald-800 font-semibold mt-0.5">
                ✓ Official Treasury Record
              </span>
            </div>
          </div>

          {/* Bottom sign-off */}
          <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between text-[9px] text-slate-400">
            <span>Official Electronic Receipt • Batu Yehiywot Berhan Church Treasury</span>
            <span>Authorized Signatory: Treasury & Finance Committee</span>
          </div>
        </div>

        {/* Action Buttons (Screen only) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-5 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-3 bg-navy hover:bg-gold hover:text-navy text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Official Slip / Receipt
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setConfirmedData(null);
              setCustomAmount('');
              setManualRef('');
              setPaypalRef('');
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Make Another Contribution
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE D: MODERN, STREAMLINED PAYMENT COMPONENT
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={handleDonationSubmit}
        className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6"
      >
        {/* 1. CURRENCY / REGION SWITCHER (Top Segmented Bar) */}
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRegionChange('local')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              region === 'local'
                ? 'bg-white text-navy shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <span className="text-base">🇪🇹</span>
            <span>Ethiopian Birr (ETB / Chapa)</span>
          </button>
          <button
            type="button"
            onClick={() => handleRegionChange('international')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              region === 'international'
                ? 'bg-white text-navy shadow-sm'
                : 'text-slate-600 hover:text-navy'
            }`}
          >
            <span className="text-base">🌐</span>
            <span>International (USD / Stripe)</span>
          </button>
        </div>

        {/* 2. FREQUENCY & AMOUNT SELECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Gift Amount ({currentCurrency})
            </label>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setFrequency('one_time')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  frequency === 'one_time' ? 'bg-white text-navy shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                One-Time
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  frequency === 'monthly' ? 'bg-white text-navy shadow-xs font-bold' : 'text-slate-500'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(region === 'local' ? etbPresets : usdPresets).map((preset) => {
              const isSelected = !customAmount && amount === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-navy bg-navy text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {region === 'local' ? `${preset.toLocaleString()} Br` : `$${preset}`}
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
              {currentCurrency}
            </span>
            <input
              type="number"
              min="10"
              max="5000000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Or enter custom amount..."
              className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-navy font-bold focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* 3. PAYMENT METHOD SELECTION */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            2. Select How to Pay
          </label>

          {region === 'local' ? (
            <div className="space-y-3">
              {/* Method Toggle: Chapa Online vs Offline Bank Deposit */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocalMethod('chapa')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    localMethod === 'chapa'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Chapa Online Pay
                    </span>
                    {localMethod === 'chapa' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Telebirr, CBE Birr, Mobile Banking & ATM Cards
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalMethod('manual_bank')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    localMethod === 'manual_bank'
                      ? 'border-navy bg-navy/5 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-navy" />
                      Bank Deposit Slip
                    </span>
                    {localMethod === 'manual_bank' && (
                      <span className="w-2 h-2 rounded-full bg-navy" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Deposit directly into church accounts & log reference
                  </p>
                </button>
              </div>

              {/* Sub-options for Chapa Online (Channels) */}
              {localMethod === 'chapa' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Choose Instant Payment Channel:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'telebirr', name: 'Telebirr (ቴሌብር)', desc: '*127# Push' },
                      { id: 'cbebirr', name: 'CBE Banking', desc: 'CBE Mobile' },
                      { id: 'abyssinia', name: 'BoA Abyssinia', desc: 'BoA & Amole' },
                      { id: 'awash', name: 'Awash Bank', desc: 'Awash Birr' },
                      { id: 'dashen', name: 'Dashen Bank', desc: 'Amole App' },
                      { id: 'coop', name: 'Coopbank', desc: 'CoopPay' },
                      { id: 'berhan', name: 'Berhan Bank', desc: 'Berhan App' },
                      { id: 'card', name: 'ATM Card', desc: 'EthSwitch Card' },
                    ].map((ch) => {
                      const isCur = chapaChannel === ch.id;
                      return (
                        <button
                          type="button"
                          key={ch.id}
                          onClick={() => setChapaChannel(ch.id as ChapaChannelId)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            isCur
                              ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white/70 hover:border-slate-300'
                          }`}
                        >
                          <BankLogo id={ch.id} size={28} />
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-navy truncate leading-tight">
                              {ch.name}
                            </span>
                            <span className="block text-[9px] text-slate-400 truncate">
                              {ch.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-options for Manual Bank Transfer (Account Numbers) */}
              {localMethod === 'manual_bank' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Official Church Bank Accounts (Click to copy account):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'cbe', name: 'CBE (ንግድ ባንክ)', acc: '1000 4829 3019 4', raw: '1000482930194' },
                      { id: 'coop', name: 'Coopbank (ኦሮሚያ)', acc: '1000 1948 2930 1', raw: '1000194829301' },
                      { id: 'awash', name: 'Awash Bank (አዋሽ)', acc: '0132 0948 2910 00', raw: '01320948291000' },
                      { id: 'berhan', name: 'Birhan Bank (ብርሃን)', acc: '2600 1948 2019 3', raw: '2600194820193' },
                    ].map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => {
                          setManualBank(bank.id);
                          handleCopy(bank.raw, bank.id);
                        }}
                        className={`p-3 rounded-xl border bg-white cursor-pointer transition-all flex items-center justify-between ${
                          manualBank === bank.id ? 'border-navy ring-1 ring-navy' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BankLogo id={bank.id} size={24} />
                          <div>
                            <span className="block text-[11px] font-bold text-navy">{bank.name}</span>
                            <span className="block font-mono text-[10px] text-slate-600">{bank.acc}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-gold flex items-center gap-1">
                          {copiedKey === bank.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedKey === bank.id ? 'Copied' : 'Copy'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Bank Transaction / Deposit Slip Reference Code *
                    </label>
                    <input
                      type="text"
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      placeholder="e.g. FT260938104 or Mobile Transaction Ref"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* International Methods (Stripe / PayPal) */
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIntlMethod('stripe')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  intlMethod === 'stripe'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Credit & Debit Card
                  </span>
                  {intlMethod === 'stripe' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Stripe (Visa, MasterCard, Amex, Apple Pay, Google Pay)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIntlMethod('paypal')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  intlMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    PayPal Worldwide
                  </span>
                  {intlMethod === 'paypal' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  finance@hiwotbirhan.org
                </p>
              </button>
            </div>
          )}
        </div>

        {/* 4. DONOR DETAILS (Clean 2-Column Grid) */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            3. Donor Information
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Deacon Abebe Kebede"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Email Address (for receipt) *
              </label>
              <input
                type="email"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Mobile Number {region === 'local' ? '(for Telebirr / CBE push prompt)' : '(optional)'}
              </label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder={region === 'local' ? '0911 234 567' : '+1 (555) 000-0000'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-gold focus:bg-white transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 5. PRIMARY ACTION BUTTON */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-navy hover:bg-gold hover:text-navy text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting to Gateway...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-gold group-hover:text-navy" />
                <span>
                  {region === 'local'
                    ? localMethod === 'chapa'
                      ? `Give ${currentAmount.toLocaleString()} ETB via ${chapaChannel === 'telebirr' ? 'Telebirr' : 'Chapa'}`
                      : `Submit Bank Deposit Slip (${currentAmount.toLocaleString()} ETB)`
                    : intlMethod === 'stripe'
                      ? `Give $${currentAmount.toLocaleString()} USD via Stripe`
                      : `Log PayPal Gift ($${currentAmount.toLocaleString()} USD)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Direct Church Treasury Settlement</span>
          </div>
        </div>
      </form>

      {/* CLEAN SIMULATION MODAL (FOR LOCAL SANDBOX DEVELOPMENT) */}
      {simulationModal && (
        <div className="fixed inset-0 bg-navy-dark/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSimulationModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Chapa Demo Sandbox
              </span>
              <h4 className="font-serif font-bold text-xl text-navy mt-2">
                Authorize Simulated Payment
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                You are running in sandbox mode. Click below to simulate instant gateway verification for donor{' '}
                <strong className="text-navy">{simulationModal.donorName}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <strong className="text-navy uppercase font-mono">{simulationModal.selectedChannel}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <strong className="text-emerald-900 font-bold">{simulationModal.amount.toLocaleString()} ETB</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-700">{simulationModal.donorPhone}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={simulationModal.isProcessing}
              onClick={handleAuthorizeSimulation}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {simulationModal.isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Simulated Chapa Transaction...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm & Issue Official Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
