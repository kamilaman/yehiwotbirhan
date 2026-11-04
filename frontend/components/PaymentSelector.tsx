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
  Heart,
  ShieldCheck,
  Globe,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Printer,
  Loader2,
  Lock,
  X,
} from 'lucide-react';

export type ChapaChannelId = 'telebirr' | 'cbebirr' | 'abyssinia' | 'awash' | 'coop' | 'dashen' | 'berhan' | 'wegagen' | 'card';

export const PaymentSelector: React.FC<{ initialDesignation?: string }> = ({
  initialDesignation = 'building_fund',
}) => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  // Region Mode: 'local' (Chapa / ETB) vs 'international' (Stripe / USD)
  const [region, setRegion] = useState<'local' | 'international'>('local');
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [amount, setAmount] = useState<number>(3000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [designation, setDesignation] = useState<string>(initialDesignation);

  // Donor Details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorPhone, setDonorPhone] = useState<string>('');

  // Local payment sub-method: 'chapa' (online) vs 'manual_bank' (offline bank slip)
  const [localMethod, setLocalMethod] = useState<'chapa' | 'manual_bank'>('chapa');
  // Chapa specific channel selection (Telebirr, CBE Birr, BoA, Awash, Coop, Card)
  const [chapaChannel, setChapaChannel] = useState<ChapaChannelId>('telebirr');

  // Interactive Chapa checkout simulation modal state
  const [simulationModal, setSimulationModal] = useState<{
    isOpen: boolean;
    txRef: string;
    amount: number;
    donorName: string;
    donorPhone: string;
    selectedChannel: ChapaChannelId;
    isProcessing: boolean;
  } | null>(null);

  // International payment sub-method: 'stripe' (online card) vs 'paypal'
  const [intlMethod, setIntlMethod] = useState<'stripe' | 'paypal'>('stripe');

  // Manual bank reference & PayPal reference
  const [manualRef, setManualRef] = useState<string>('');
  const [manualBank, setManualBank] = useState<string>('cbe');
  const [paypalRef, setPaypalRef] = useState<string>('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmedData, setConfirmedData] = useState<{
    txRef: string;
    amount: number;
    currency: string;
    provider: string;
    name: string;
    isPendingVerification?: boolean;
    verificationNote?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const etbPresets = [500, 1000, 3000, 5000, 10000, 25000];
  const usdPresets = [25, 50, 100, 250, 500, 1000];

  // Authoritatively verify redirected returns from Chapa or Stripe
  useEffect(() => {
    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    const sessionId = searchParams.get('session_id');
    const provider = searchParams.get('provider');

    if ((status === 'success' || status === 'verifying') && (txRef || sessionId)) {
      if (provider === 'chapa' && txRef) {
        setIsVerifying(true);
        setVerificationError(null);
        api.verifyChapa(txRef)
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
                res.message || 'Payment has not been confirmed yet. If you authorized payment, please wait a moment for bank processing.'
              );
            }
          })
          .catch(() => {
            setIsVerifying(false);
            setVerificationError(
              `Unable to connect to verification server. If your account was debited, please retain your reference code: ${txRef}`
            );
          });
      } else if (provider === 'stripe') {
        const idToVerify = sessionId || txRef || '';
        setIsVerifying(true);
        setVerificationError(null);
        api.verifyStripe(idToVerify, txRef || undefined)
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

  // Sync amount preset when region changes
  const handleRegionChange = (newRegion: 'local' | 'international') => {
    setRegion(newRegion);
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

  // Brand-authentic logo component for Ethiopian banks and payment channels
  const BankLogo: React.FC<{ id: ChapaChannelId | string; size?: number; className?: string }> = ({
    id,
    size = 36,
    className = '',
  }) => {
    const s = size;
    switch (id) {
      case 'telebirr':
        // Ethio Telecom Telebirr — official green and red colors with brand mark
        return (
          <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`rounded-lg shrink-0 ${className}`}>
            <rect width="36" height="36" rx="8" fill="#009A44" />
            <rect x="0" y="24" width="36" height="12" rx="0" fill="#E30613" />
            <path d="M14 10h8v2.5h-2.5v8h-3v-8H14V10z" fill="white" />
            <text x="18" y="34" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Arial">telebirr</text>
          </svg>
        );
      case 'cbebirr':
      case 'cbe':
        // Commercial Bank of Ethiopia (CBE) blue & gold emblem
        return (
          <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`rounded-lg shrink-0 ${className}`}>
            <rect width="36" height="36" rx="8" fill="#003D8F" />
            <circle cx="18" cy="14" r="7" fill="none" stroke="#FFD700" strokeWidth="2" />
            <path d="M15 14c0-1.66 1.34-3 3-3 .97 0 1.83.46 2.38 1.18l1.54-1.54A4.97 4.97 0 0018 9c-2.76 0-5 2.24-5 5s2.24 5 5 5c1.38 0 2.63-.56 3.54-1.46l-1.54-1.54A3 3 0 0118 17c-1.66 0-3-1.34-3-3z" fill="#FFD700" />
            <text x="18" y="29" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white" fontFamily="Arial">CBE</text>
          </svg>
        );
      case 'card':
        // EthSwitch / ATM Card — professional debit card icon
        return (
          <svg width={s} height={s} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`rounded-lg shrink-0 ${className}`}>
            <rect width="36" height="36" rx="8" fill="#1565C0" />
            <rect x="6" y="11" width="24" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
            <rect x="6" y="15" width="24" height="4" fill="white" opacity="0.3" />
            <rect x="9" y="21" width="6" height="2" rx="1" fill="white" />
            <rect x="17" y="21" width="4" height="2" rx="1" fill="white" opacity="0.7" />
            <text x="18" y="34" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="white" fontFamily="Arial">EthSwitch</text>
          </svg>
        );
      default: {
        // Map aliases (e.g. birhan -> berhan)
        const fileKey = id === 'birhan' ? 'berhan' : id;
        return (
          <div
            className={`relative inline-flex items-center justify-center bg-white rounded-lg p-0.5 border border-slate-200/90 shadow-2xs overflow-hidden shrink-0 ${className}`}
            style={{ width: s, height: s }}
          >
            <img
              src={`/images/banks/bank_${fileKey}.png`}
              alt={`${id} bank logo`}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<span class="text-xs font-bold text-slate-500">🏦</span>';
                }
              }}
            />
          </div>
        );
      }
    }
  };

  const chapaChannels: Array<{
    id: ChapaChannelId;
    name: string;
    amharic: string;
    type: string;
    badge: string;
    tagColor: string;
    borderColor: string;
    bgColor: string;
    description: string;
  }> = [
      {
        id: 'telebirr',
        name: 'Telebirr',
        amharic: 'ቴሌብር',
        type: 'Ethio Telecom Wallet',
        badge: 'Instant USSD Push',
        tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        borderColor: 'border-emerald-500',
        bgColor: 'bg-emerald-50/50',
        description: 'Instant *127# USSD push confirmation on your Safaricom or Ethio Telecom mobile line',
      },
      {
        id: 'cbebirr',
        name: 'CBE Banking',
        amharic: 'የኢትዮጵያ ንግድ ባንክ',
        type: 'Commercial Bank of Ethiopia',
        badge: 'CBE Mobile App',
        tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
        borderColor: 'border-purple-600',
        bgColor: 'bg-purple-50/50',
        description: 'Authorize using CBE Banking mobile app or Commercial Bank of Ethiopia Mobile Banking',
      },
      {
        id: 'abyssinia',
        name: 'Bank of Abyssinia',
        amharic: 'አቢሲኒያ ባንክ (BoA)',
        type: 'BoA Mobile & Amole',
        badge: 'BoA / Amole',
        tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-50/50',
        description: 'Direct account authorization via Bank of Abyssinia mobile banking & Amole wallet',
      },
      {
        id: 'awash',
        name: 'Awash Bank',
        amharic: 'አዋሽ ባንክ (Awash Birr)',
        type: 'Awash Birr & Web',
        badge: 'Awash App',
        tagColor: 'bg-orange-100 text-orange-800 border-orange-300',
        borderColor: 'border-orange-500',
        bgColor: 'bg-orange-50/50',
        description: 'Authorize transfer through Awash Birr mobile or Awash Online Internet Banking',
      },
      {
        id: 'coop',
        name: 'CoopPay',
        amharic: 'ኦሮሚያ ህብረት ስራ',
        type: 'Cooperative Bank of Oromia',
        badge: 'CoopPay E-Birr',
        tagColor: 'bg-teal-100 text-teal-800 border-teal-300',
        borderColor: 'border-teal-500',
        bgColor: 'bg-teal-50/50',
        description: 'Pay via CoopPay mobile app, E-Birr wallet, or Coopbank online portal',
      },
      {
        id: 'dashen',
        name: 'Dashen Bank',
        amharic: 'ዳሽን ባንክ (Amole)',
        type: 'Dashen SuperApp & Amole',
        badge: 'Dashen / Amole',
        tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        borderColor: 'border-indigo-500',
        bgColor: 'bg-indigo-50/50',
        description: 'Authorize transfer securely via Dashen SuperApp or Amole digital wallet',
      },
      {
        id: 'berhan',
        name: 'Berhan Bank',
        amharic: 'ብርሃን ባንክ',
        type: 'Berhan Mobile Banking',
        badge: 'Berhan Mobile',
        tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-50/50',
        description: 'Instant account debit authorization using Berhan Mobile Banking app',
      },
      {
        id: 'wegagen',
        name: 'Wegagen Bank',
        amharic: 'ወጋገን ባንክ',
        type: 'Wegagen Mobile Banking',
        badge: 'Wegagen App',
        tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
        borderColor: 'border-rose-500',
        bgColor: 'bg-rose-50/50',
        description: 'Authorize transfer securely via Wegagen Mobile Banking or online portal',
      },
      {
        id: 'card',
        name: 'Debit & ATM Cards',
        amharic: 'የባንክ ካርዶች (EthSwitch)',
        type: 'EthSwitch Local & Visa',
        badge: 'ATM Cards',
        tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50/50',
        description: 'Pay with any Ethiopian local bank ATM debit card (EthSwitch) or Visa / Mastercard',
      },
    ];

  const handleAuthorizeSimulation = async (channelToUse?: ChapaChannelId) => {
    if (!simulationModal) return;
    const activeChannel = channelToUse || simulationModal.selectedChannel;
    setSimulationModal((prev) => (prev ? { ...prev, isProcessing: true } : null));

    try {
      const res = await api.verifyChapa(simulationModal.txRef);
      if (res.verified) {
        setSimulationModal(null);
        setSubmitSuccess(true);
        const don = res.donation || res.data;
        const channelTitles: Record<string, string> = {
          telebirr: 'Chapa (Telebirr ቴሌብር Mobile Wallet)',
          cbebirr: 'Chapa (CBE Banking / CBE Mobile App)',
          abyssinia: 'Chapa (Bank of Abyssinia BoA Mobile)',
          awash: 'Chapa (Awash Bank Awash Birr)',
          coop: 'Chapa (CoopPay Cooperative Bank of Oromia)',
          dashen: 'Chapa (Dashen Bank / Amole SuperApp)',
          berhan: 'Chapa (Berhan Bank Mobile)',
          wegagen: 'Chapa (Wegagen Bank Mobile)',
          card: 'Chapa (Debit / ATM Card EthSwitch)',
        };
        setConfirmedData({
          txRef: simulationModal.txRef,
          amount: Number(res.amount || don?.amount || simulationModal.amount),
          currency: res.currency || 'ETB',
          provider: channelTitles[activeChannel] || 'Chapa Online Checkout',
          name: don?.donor_name || simulationModal.donorName || 'Faithful Supporter',
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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

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

    // 1. LOCAL DONATION VIA CHAPA
    if (region === 'local' && localMethod === 'chapa') {
      if ((chapaChannel === 'telebirr' || chapaChannel === 'cbebirr') && !donorPhone.trim()) {
        setIsSubmitting(false);
        setErrorMessage(
          `Please provide your mobile phone number in Step 5 so ${chapaChannel === 'telebirr' ? 'Telebirr' : 'CBE Birr'
          } can send you the authorization prompt.`
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
          // Open interactive simulated Chapa checkout modal!
          setSimulationModal({
            isOpen: true,
            txRef: res.tx_ref || '',
            amount: currentAmount,
            donorName: donorName.trim(),
            donorPhone: donorPhone.trim() || '0911234567',
            selectedChannel: chapaChannel,
            isProcessing: false,
          });
          return;
        } else if (res.checkout_url) {
          window.location.href = res.checkout_url;
          return;
        }
      } else {
        setErrorMessage(
          res.error || res.message || 'Unable to connect to Chapa gateway. Please try again shortly or use direct bank transfer.'
        );
      }
      return;
    }

    // 2. LOCAL DONATION VIA DIRECT BANK DEPOSIT
    if (region === 'local' && localMethod === 'manual_bank') {
      if (!manualRef.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your bank deposit slip or transaction reference number (e.g. CBE FT number or Telebirr Trans ID).');
        return;
      }

      const bankNames: Record<string, string> = {
        cbe: 'Commercial Bank of Ethiopia (CBE)',
        coop: 'Cooperative Bank of Oromia (Coopbank)',
        awash: 'Awash Bank',
        birhan: 'Birhan Bank',
        telebirr: 'Telebirr Direct Transfer',
      };
      const bankTitle = bankNames[manualBank] || manualBank.toUpperCase();

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
          provider: `Direct Bank Deposit (${bankTitle})`,
          name: donorName,
          isPendingVerification: true,
          verificationNote: 'Deposit slip registered. The church treasury will audit this transaction against our bank statement.',
        });
      } else {
        setErrorMessage(res.message || 'Error recording bank transfer details.');
      }
      return;
    }

    // 3. INTERNATIONAL DONATION VIA STRIPE
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
        return;
      } else {
        setErrorMessage(res.error || res.message || 'Unable to connect to Stripe gateway. Please try again.');
      }
      return;
    }

    // 4. INTERNATIONAL DONATION VIA PAYPAL
    if (region === 'international' && intlMethod === 'paypal') {
      if (!paypalRef.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your PayPal transaction ID, receipt reference, or PayPal account email.');
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
          provider: 'PayPal Worldwide',
          name: donorName,
          isPendingVerification: true,
          verificationNote: 'PayPal contribution logged. Church treasury will verify against PayPal statements and send official receipt.',
        });
      } else {
        setErrorMessage(res.message || 'Error recording PayPal donation.');
      }
      return;
    }
  };

  // 1. REAL-TIME VERIFICATION LOADING SCREEN
  if (isVerifying) {
    const isStripe = searchParams.get('provider') === 'stripe';
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-2 border-gold/40 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-navy/5 text-gold rounded-full flex items-center justify-center mx-auto mb-5 animate-spin">
          <Loader2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full inline-block mb-3">
          Secure Payment Verification
        </span>
        <h3 className="font-serif font-bold text-2xl md:text-3xl text-navy mb-2">
          {isStripe ? 'Verifying with Stripe Gateway...' : 'Verifying with Chapa Gateway...'}
        </h3>
        <p className="text-slate text-sm leading-relaxed mb-6 max-w-md mx-auto">
          {isStripe
            ? 'Please wait a moment while we authoritatively verify your international card transaction with Stripe. Do not close or refresh this page.'
            : 'Please wait a moment while we authoritatively verify your transaction details with the Chapa payment network. Do not close or refresh this page.'}
        </p>
      </div>
    );
  }

  // 2. VERIFICATION NOTICE OR TIMEOUT ERROR
  if (verificationError) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-2 border-amber-300 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block mb-3">
          Payment Notice
        </span>
        <h3 className="font-serif font-bold text-2xl text-navy mb-2">
          Transaction Verification Notice
        </h3>
        <p className="text-slate text-sm leading-relaxed mb-6 max-w-md mx-auto">
          {verificationError}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              const provider = searchParams.get('provider');
              const txRef = searchParams.get('tx_ref');
              const sessionId = searchParams.get('session_id');

              if (provider === 'stripe') {
                const idToVerify = sessionId || txRef || '';
                setIsVerifying(true);
                setVerificationError(null);
                api.verifyStripe(idToVerify, txRef || undefined)
                  .then((res) => {
                    setIsVerifying(false);
                    if (res.verified) {
                      setSubmitSuccess(true);
                      const don = res.donation;
                      setConfirmedData({
                        txRef: txRef || sessionId || `HB-STRIPE-${Date.now()}`,
                        amount: don?.amount || 100,
                        currency: 'USD',
                        provider: 'Stripe International (Credit / Debit Card)',
                        name: don?.donor_name || 'Faithful International Supporter',
                        isPendingVerification: false,
                      });
                    } else {
                      setVerificationError(res.error || 'Stripe payment was not confirmed yet.');
                    }
                  })
                  .catch(() => {
                    setIsVerifying(false);
                    setVerificationError('Stripe verification server unreachable.');
                  });
              } else if (txRef) {
                setIsVerifying(true);
                setVerificationError(null);
                api.verifyChapa(txRef)
                  .then((res) => {
                    setIsVerifying(false);
                    if (res.verified) {
                      setSubmitSuccess(true);
                      const don = res.donation || res.data;
                      setConfirmedData({
                        txRef,
                        amount: Number(res.amount || don?.amount || 3000),
                        currency: res.currency || 'ETB',
                        provider: 'Chapa (Telebirr / CBE Birr / Mobile Banking)',
                        name: don?.donor_name || 'Faithful Supporter',
                        isPendingVerification: false,
                      });
                    } else {
                      setVerificationError(res.message || 'Payment has not settled yet.');
                    }
                  })
                  .catch(() => {
                    setIsVerifying(false);
                    setVerificationError('Verification server temporarily unreachable.');
                  });
              }
            }}
            className="px-6 py-2.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Re-check Status
          </button>
          <button
            type="button"
            onClick={() => {
              setVerificationError(null);
              window.history.replaceState({}, '', window.location.pathname);
            }}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Return to Donation Form
          </button>
        </div>
      </div>
    );
  }

  // 3. SUCCESS CONFIRMATION & OFFICIAL RECEIPT
  if (submitSuccess && confirmedData) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-2 border-gold/40 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:border-none">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 print:hidden ${confirmedData.isPendingVerification
              ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
            }`}
        >
          {confirmedData.isPendingVerification ? (
            <AlertCircle className="w-10 h-10" />
          ) : (
            <CheckCircle className="w-10 h-10" />
          )}
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3 print:hidden ${confirmedData.isPendingVerification
              ? 'text-amber-800 bg-amber-100 border border-amber-300'
              : 'text-gold bg-gold/10'
            }`}
        >
          {confirmedData.isPendingVerification
            ? 'Deposit Slip Registered — Pending Treasury Verification'
            : 'God Bless Your Faithful Giving'}
        </span>
        <h3 className="font-serif font-bold text-2xl md:text-3xl text-navy mb-2">
          Thank You, {confirmedData.name}!
        </h3>
        <p className="text-slate text-sm leading-relaxed mb-6">
          {confirmedData.isPendingVerification ? (
            <>
              Your contribution of{' '}
              <strong className="text-navy">
                {confirmedData.currency === 'ETB'
                  ? `${confirmedData.amount.toLocaleString()} Br (ETB)`
                  : `$${confirmedData.amount.toLocaleString()} USD`}
              </strong>{' '}
              with reference <strong className="font-mono text-navy">{confirmedData.txRef}</strong> has been logged in the church registry. Our treasury team will verify the transfer against the church bank statement and email your final receipt.
            </>
          ) : (
            <>
              Your gift of{' '}
              <strong className="text-navy">
                {confirmedData.currency === 'ETB'
                  ? `${confirmedData.amount.toLocaleString()} Br (ETB)`
                  : `$${confirmedData.amount.toLocaleString()} USD`}
              </strong>{' '}
              has been authoritatively verified and securely registered in the BATU Church Building Fund registry.
            </>
          )}
        </p>

        <div className="bg-cream p-5 rounded-2xl text-left border border-slate-200 text-xs space-y-2 mb-6">
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-muted">Organization:</span>
            <strong className="text-navy">BATU YEHIYWOT BERHAN CHURCH</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-muted">Payment Channel:</span>
            <strong className="text-navy">{confirmedData.provider}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-muted">Transaction Reference:</span>
            <strong className="text-navy font-mono">{confirmedData.txRef}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-200/60 pb-2">
            <span className="text-slate-muted">Designation:</span>
            <strong className="text-navy capitalize">{designation.replace('_', ' ')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-muted">Verification Status:</span>
            {confirmedData.isPendingVerification ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Pending Treasury Reconcile
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Authoritatively Verified & Receipted
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-navy font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
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
            className="px-7 py-3 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Make Another Contribution
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleDonationSubmit}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-10 space-y-8"
      >
        {/* 1. LOCAL VS INTERNATIONAL IDENTIFICATION (PRIMARY HIGHLIGHT) */}
        <div>
          <div className="text-center sm:text-left mb-4">
            <span className="text-[11px] font-bold text-gold uppercase tracking-widest">
              Step 1: Choose Giving Region
            </span>
            <h3 className="font-serif font-bold text-xl md:text-2xl text-navy mt-0.5">
              Local (Chapa) or International (Stripe) Donation
            </h3>
            <p className="text-xs text-slate-muted">
              Select your location to access the appropriate gateway and currency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LOCAL OPTION (CHAPA) */}
            <button
              type="button"
              onClick={() => handleRegionChange('local')}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative ${region === 'local'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              {region === 'local' && (
                <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                <span className="text-lg">🇪🇹</span>
                <span>Local Donation (Ethiopia)</span>
              </div>
              <p className="text-navy font-bold text-xs">
                Powered by <span className="text-emerald-700">Chapa</span>
              </p>
              <p className="text-slate-muted text-[11px] mt-1">
                Telebirr, CBE Banking, Awash, BoA, Coopbank & Ethiopian Bank Accounts (ETB Birr)
              </p>
            </button>

            {/* INTERNATIONAL OPTION (STRIPE) */}
            <button
              type="button"
              onClick={() => handleRegionChange('international')}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative ${region === 'international'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              {region === 'international' && (
                <span className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-1">
                <span className="text-lg">🌐</span>
                <span>International / Diaspora</span>
              </div>
              <p className="text-navy font-bold text-xs">
                Powered by <span className="text-indigo-600">Stripe</span>
              </p>
              <p className="text-slate-muted text-[11px] mt-1">
                Credit Cards, Debit Cards, Apple Pay, Google Pay & PayPal (USD)
              </p>
            </button>
          </div>
        </div>

        {/* 2. FREQUENCY & AMOUNT SELECTION */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-gold uppercase tracking-widest">
                Step 2: Amount & Frequency
              </span>
              <h4 className="font-serif font-bold text-base text-navy">
                Select Giving Amount ({currentCurrency})
              </h4>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold self-start">
              <button
                type="button"
                onClick={() => setFrequency('one_time')}
                className={`px-3 py-1.5 rounded-lg transition-all ${frequency === 'one_time' ? 'bg-white text-navy shadow-sm' : 'text-slate'
                  }`}
              >
                {t('fund_freq_one')}
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${frequency === 'monthly' ? 'bg-white text-navy shadow-sm' : 'text-slate'
                  }`}
              >
                {t('fund_freq_monthly')}
              </button>
            </div>
          </div>

          {/* Amount Presets */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-3">
            {(region === 'local' ? etbPresets : usdPresets).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val);
                  setCustomAmount('');
                }}
                className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all text-center ${amount === val && !customAmount
                    ? region === 'local'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate hover:border-gold/50'
                  }`}
              >
                {region === 'international' ? `$${val}` : `${val} Br`}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="number"
              placeholder={t('fund_custom_placeholder')}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount(0);
              }}
              className="w-full px-4 py-2.5 bg-cream rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <span className="absolute right-4 top-2.5 text-xs text-slate-muted font-bold">
              {currentCurrency}
            </span>
          </div>
        </div>

        {/* 3. DESIGNATION */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-gold uppercase tracking-widest mb-2">
            Step 3: Gift Designation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'building_fund', label: 'Building Fund (2,500-Seat Sanctuary)' },
              { id: 'general_offering', label: 'General Church Ministry & Operations' },
              { id: 'mercy_outreach', label: 'Ziway Community Mercy & Compassion' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDesignation(item.id)}
                className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${designation === item.id
                    ? 'bg-navy text-white border-navy shadow-sm'
                    : 'bg-white border-slate-200 text-slate hover:border-slate-300'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. GATEWAY DETAILS / METHOD TABS */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-gold uppercase tracking-widest mb-3">
            Step 4: Payment Gateway Configuration
          </label>

          {/* LOCAL (CHAPA / BANK TRANSFER) */}
          {region === 'local' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLocalMethod('chapa')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${localMethod === 'chapa'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate hover:bg-slate-200'
                    }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Chapa Online Checkout (Telebirr / CBE Banking)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocalMethod('manual_bank')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${localMethod === 'manual_bank'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate hover:bg-slate-200'
                    }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Direct Bank Deposit Slip</span>
                </button>
              </div>

              {localMethod === 'chapa' && (
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-emerald-950 font-bold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        Select Ethiopian Payment Channel (Chapa Gateway)
                      </strong>
                      <p className="text-slate text-xs mt-0.5">
                        Choose your preferred bank or wallet to authorize your gift of{' '}
                        <strong className="text-emerald-800 font-bold">
                          {currentAmount.toLocaleString()} ETB
                        </strong>:
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-950 font-mono font-bold px-2 py-0.5 rounded">
                        Chapa Verified
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-300">
                        Telebirr & Banks Active
                      </span>
                    </div>
                  </div>

                  {/* Interactive Channel Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chapaChannels.map((channel) => {
                      const isSelected = chapaChannel === channel.id;
                      return (
                        <button
                          type="button"
                          key={channel.id}
                          onClick={() => setChapaChannel(channel.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${isSelected
                              ? `${channel.borderColor} ${channel.bgColor} shadow-md ring-2 ring-emerald-500/25`
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <BankLogo id={channel.id} size={36} />
                              <div>
                                <strong className="text-navy text-xs font-bold block leading-tight">
                                  {channel.name}
                                </strong>
                                <span className="text-[10px] text-slate-muted block font-medium">
                                  {channel.amharic}
                                </span>
                              </div>
                            </div>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                            )}
                          </div>

                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mb-1.5 ${channel.tagColor}`}
                            >
                              {channel.badge}
                            </span>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              {channel.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Selected Channel Guidance Notice */}
                  <div className="p-3 bg-white border border-emerald-300/80 rounded-xl flex items-start gap-2.5 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-emerald-900 block font-bold mb-0.5">
                        Selected Channel: {chapaChannels.find((c) => c.id === chapaChannel)?.name} ({chapaChannels.find((c) => c.id === chapaChannel)?.amharic})
                      </strong>
                      {chapaChannel === 'telebirr' && (
                        <span>
                          You will authorize via Ethio Telecom Telebirr USSD prompt (*127#) or Telebirr App with your phone number. Please enter your mobile number in Step 5 below.
                        </span>
                      )}
                      {chapaChannel === 'cbebirr' && (
                        <span>
                          You will authorize via Commercial Bank of Ethiopia (CBE Banking / CBE Mobile App). Please enter your CBE-registered phone number in Step 5 below.
                        </span>
                      )}
                      {chapaChannel === 'abyssinia' && (
                        <span>
                          You will authorize using Bank of Abyssinia BoA Mobile Banking or Amole digital wallet.
                        </span>
                      )}
                      {chapaChannel === 'awash' && (
                        <span>
                          You will authorize using Awash Bank (Awash Birr wallet or Awash Internet Banking).
                        </span>
                      )}
                      {chapaChannel === 'coop' && (
                        <span>
                          You will authorize through Cooperative Bank of Oromia CoopPay mobile wallet or account.
                        </span>
                      )}
                      {chapaChannel === 'dashen' && (
                        <span>
                          You will authorize via Dashen SuperApp or Amole digital wallet. Please enter your mobile number in Step 5 below.
                        </span>
                      )}
                      {chapaChannel === 'berhan' && (
                        <span>
                          You will authorize via Berhan Mobile Banking app or branch deposit. Please enter your mobile number in Step 5 below.
                        </span>
                      )}
                      {chapaChannel === 'wegagen' && (
                        <span>
                          You will authorize securely via Wegagen Mobile Banking app or online portal. Please enter your mobile number in Step 5 below.
                        </span>
                      )}
                      {chapaChannel === 'card' && (
                        <span>
                          You can pay with any Ethiopian local bank ATM debit card (EthSwitch) or Visa / Mastercard.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Supported Ethiopian Bank Partner Network Showcase */}
                  <div className="bg-gradient-to-r from-slate-50 via-white to-amber-50/40 border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h5 className="font-bold text-xs uppercase tracking-wider text-navy">
                            Supported Ethiopian Bank & Switch Network
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Seamlessly pay through all 21 licensed Ethiopian commercial and cooperative banks via Chapa & EthSwitch
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full self-start sm:self-auto">
                        21 Banks Connected
                      </span>
                    </div>

                    {/* Partner Bank Badges Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                      {[
                        { id: 'abyssinia', name: 'Abyssinia' },
                        { id: 'awash', name: 'Awash' },
                        { id: 'dashen', name: 'Dashen' },
                        { id: 'coop', name: 'Coopbank' },
                        { id: 'berhan', name: 'Berhan' },
                        { id: 'wegagen', name: 'Wegagen' },
                        { id: 'hibret', name: 'Hibret' },
                        { id: 'oromia', name: 'Oromia' },
                        { id: 'enat', name: 'Enat' },
                        { id: 'nib', name: 'Nib' },
                        { id: 'lion', name: 'Lion' },
                        { id: 'buna', name: 'Buna' },
                        { id: 'zemen', name: 'Zemen' },
                        { id: 'amhara', name: 'Amhara' },
                        { id: 'global', name: 'Global' },
                        { id: 'tsehay', name: 'Tsehay' },
                        { id: 'tsedey', name: 'Tsedey' },
                        { id: 'zamzam', name: 'ZamZam' },
                        { id: 'ahadu', name: 'Ahadu' },
                        { id: 'addis', name: 'Addis' },
                        { id: 'goh', name: 'Goh' },
                      ].map((bank) => (
                        <div
                          key={bank.id}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all text-center group"
                          title={`${bank.name} Bank`}
                        >
                          <BankLogo id={bank.id} size={32} className="group-hover:scale-105 transition-transform" />
                          <span className="text-[9px] font-semibold text-slate-600 mt-1 truncate max-w-full">
                            {bank.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {localMethod === 'manual_bank' && (
                <div className="bg-cream/80 border border-slate-200 rounded-2xl p-5 text-xs text-slate space-y-4">
                  <p className="text-slate-muted font-medium">
                    Please deposit into any of the official BATU Church bank accounts below, then enter your slip transaction reference code:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* CBE */}
                    <div
                      onClick={() => setManualBank('cbe')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${manualBank === 'cbe' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/40' : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BankLogo id="cbe" size={28} />
                          <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">CBE (ንግድ ባንክ)</span>
                        </div>
                        {manualBank === 'cbe' && <span className="text-[10px] text-gold font-bold uppercase">Selected</span>}
                      </div>
                      <span className="text-[11px] text-slate-muted block">Account:</span>
                      <strong className="font-mono text-navy text-xs block">1000 4829 3019 4</strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">BATU ZIWAY HIWOT BIRHAN CHURCH</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy('1000482930194', 'cbe_man');
                        }}
                        className="text-gold hover:text-navy text-[11px] flex items-center gap-1 mt-2 font-semibold"
                      >
                        {copiedKey === 'cbe_man' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'cbe_man' ? 'Copied!' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Coopbank */}
                    <div
                      onClick={() => setManualBank('coop')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${manualBank === 'coop' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/40' : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BankLogo id="coop" size={28} />
                          <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">Coopbank (ህብረት ስራ)</span>
                        </div>
                        {manualBank === 'coop' && <span className="text-[10px] text-gold font-bold uppercase">Selected</span>}
                      </div>
                      <span className="text-[11px] text-slate-muted block">Account:</span>
                      <strong className="font-mono text-navy text-xs block">1000 1948 2930 1</strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">BATU ZIWAY HIWOT BIRHAN CHURCH</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy('1000194829301', 'coop_man');
                        }}
                        className="text-gold hover:text-navy text-[11px] flex items-center gap-1 mt-2 font-semibold"
                      >
                        {copiedKey === 'coop_man' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'coop_man' ? 'Copied!' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Awash Bank */}
                    <div
                      onClick={() => setManualBank('awash')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${manualBank === 'awash' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/40' : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BankLogo id="awash" size={28} />
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Awash Bank (አዋሽ ባንክ)</span>
                        </div>
                        {manualBank === 'awash' && <span className="text-[10px] text-gold font-bold uppercase">Selected</span>}
                      </div>
                      <span className="text-[11px] text-slate-muted block">Account:</span>
                      <strong className="font-mono text-navy text-xs block">0132 0948 2910 00</strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">BATU ZIWAY HIWOT BIRHAN CHURCH</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy('01320948291000', 'awash_man');
                        }}
                        className="text-gold hover:text-navy text-[11px] flex items-center gap-1 mt-2 font-semibold"
                      >
                        {copiedKey === 'awash_man' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'awash_man' ? 'Copied!' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Birhan Bank */}
                    <div
                      onClick={() => setManualBank('birhan')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${manualBank === 'birhan' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/40' : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BankLogo id="berhan" size={28} />
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">Birhan Bank (ብርሃን ባንክ)</span>
                        </div>
                        {manualBank === 'birhan' && <span className="text-[10px] text-gold font-bold uppercase">Selected</span>}
                      </div>
                      <span className="text-[11px] text-slate-muted block">Account:</span>
                      <strong className="font-mono text-navy text-xs block">2600 1948 2019 3</strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">BATU ZIWAY HIWOT BIRHAN CHURCH</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy('2600194820193', 'birhan_man');
                        }}
                        className="text-gold hover:text-navy text-[11px] flex items-center gap-1 mt-2 font-semibold"
                      >
                        {copiedKey === 'birhan_man' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'birhan_man' ? 'Copied!' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Telebirr Direct */}
                    <div
                      onClick={() => setManualBank('telebirr')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${manualBank === 'telebirr' ? 'border-gold bg-white shadow-sm ring-1 ring-gold/40' : 'border-slate-200 bg-white/70 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BankLogo id="telebirr" size={28} />
                          <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">Telebirr Direct / Short Code</span>
                        </div>
                        {manualBank === 'telebirr' && <span className="text-[10px] text-gold font-bold uppercase">Selected</span>}
                      </div>
                      <span className="text-[11px] text-slate-muted block">Mobile / Code:</span>
                      <strong className="font-mono text-navy text-xs block">+251 91 123 4567 • Code 8842</strong>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">BATU HIWOT BIRHAN</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy('+251911234567', 'tele_man');
                        }}
                        className="text-gold hover:text-navy text-[11px] flex items-center gap-1 mt-2 font-semibold"
                      >
                        {copiedKey === 'tele_man' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'tele_man' ? 'Copied!' : 'Copy Number'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-slate font-semibold mb-1">
                      Bank Transaction / Deposit Slip Reference Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      placeholder="e.g. FT260938104 or Telebirr Trans ID"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <span className="text-[11px] text-slate-muted mt-1 block">
                      Please transfer the funds from your mobile banking app or branch, then copy your confirmation reference code above for our treasury audit.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INTERNATIONAL (STRIPE / PAYPAL) */}
          {region === 'international' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIntlMethod('stripe')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${intlMethod === 'stripe'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate hover:bg-slate-200'
                    }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe Checkout (Cards, Apple Pay, Google Pay)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIntlMethod('paypal')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${intlMethod === 'paypal'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate hover:bg-slate-200'
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>PayPal Worldwide</span>
                </button>
              </div>

              {intlMethod === 'stripe' && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 text-xs text-slate space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-900 font-bold text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Stripe Secure International Checkout
                    </strong>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-indigo-200/80 text-indigo-950 font-mono font-bold px-2 py-0.5 rounded">
                        Stripe Demo & Live Gateway
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
                        USD / Cards / Apple Pay
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-muted leading-relaxed">
                    You will be securely routed through Stripe to complete your donation with any international credit or debit card, Apple Pay, or Google Pay (Test Cards & Demo Sandbox supported).
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg font-semibold text-indigo-950">
                      Visa
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg font-semibold text-indigo-950">
                      MasterCard
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg font-semibold text-indigo-950">
                      American Express
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg font-semibold text-indigo-950">
                      Apple Pay
                    </span>
                    <span className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg font-semibold text-indigo-950">
                      Google Pay
                    </span>
                  </div>
                </div>
              )}

              {intlMethod === 'paypal' && (
                <div className="bg-cream/90 border border-slate-200 rounded-2xl p-5 text-xs text-slate space-y-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-navy font-bold text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      PayPal Worldwide Giving
                    </strong>
                    <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                      PayPal Direct & Venmo
                    </span>
                  </div>
                  <p className="text-slate-muted leading-relaxed">
                    You can send your contribution directly to the official church PayPal account or open PayPal to complete the transaction:
                  </p>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-slate-muted block">Church PayPal Recipient:</span>
                      <strong className="font-mono text-navy text-sm">finance@hiwotbirhan.org</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy('finance@hiwotbirhan.org', 'paypal_email')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        {copiedKey === 'paypal_email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'paypal_email' ? 'Copied' : 'Copy Email'}</span>
                      </button>
                      <a
                        href="https://www.paypal.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open PayPal</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate font-semibold mb-1">
                      PayPal Transaction ID or Payer Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={paypalRef}
                      onChange={(e) => setPaypalRef(e.target.value)}
                      placeholder="e.g. 9XY123456AB78901C or your-paypal@email.com"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <span className="text-[11px] text-slate-muted mt-1 block">
                      After completing your donation on PayPal, paste the transaction reference ID or the email address on your PayPal receipt above.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. DONOR CONTACT DETAILS */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-gold uppercase tracking-widest mb-3">
            Step 5: Donor Information & Tax Receipt
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Abebe Bekele"
                className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">
                Email Address (for Official Digital Receipt) *
              </label>
              <input
                type="email"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="e.g. abebe@gmail.com"
                className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate mb-1">
              Mobile / WhatsApp Phone Number{' '}
              {region === 'local' && localMethod === 'chapa' && (chapaChannel === 'telebirr' || chapaChannel === 'cbebirr') ? (
                <span className="text-emerald-700 font-bold">
                  (Required for {chapaChannel === 'telebirr' ? 'Telebirr' : 'CBE Birr'} USSD Prompt) *
                </span>
              ) : (
                '(Optional)'
              )}
            </label>
            <input
              type="tel"
              required={region === 'local' && localMethod === 'chapa' && (chapaChannel === 'telebirr' || chapaChannel === 'cbebirr')}
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="e.g. 0911234567 or 0712345678"
              className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {region === 'local' && localMethod === 'chapa' && (chapaChannel === 'telebirr' || chapaChannel === 'cbebirr') && (
              <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                Enter the phone number linked to your {chapaChannel === 'telebirr' ? 'Telebirr' : 'CBE Birr'} account to receive the instant authorization request.
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-muted flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Audited by BATU Church Board of Trustees</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            suppressHydrationWarning
            className={`w-full sm:w-auto px-8 py-3.5 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-white ${region === 'local'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            <Heart className="w-4 h-4 fill-current text-white" />
            <span suppressHydrationWarning>
              {isSubmitting
                ? 'Connecting Gateway...'
                : region === 'local'
                  ? localMethod === 'chapa'
                    ? `Proceed to Pay ${currentAmount.toLocaleString()} Br via ${chapaChannels.find((c) => c.id === chapaChannel)?.name || 'Chapa'}`
                    : `Submit ${currentAmount.toLocaleString()} Br Bank Transfer (${manualBank === 'cbe' ? 'CBE' : manualBank === 'coop' ? 'Coopbank' : manualBank === 'awash' ? 'Awash' : manualBank === 'birhan' ? 'Birhan' : 'Telebirr'})`
                  : intlMethod === 'stripe'
                    ? `Donate $${currentAmount.toLocaleString()} USD via Stripe (Card / Apple Pay)`
                    : `Submit $${currentAmount.toLocaleString()} USD via PayPal`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* INTERACTIVE CHAPA CHECKOUT SIMULATION MODAL */}
      {simulationModal && simulationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-emerald-500/50 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base leading-tight">Chapa Secure Checkout</h4>
                    <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded font-semibold">
                      Sandbox Simulation
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80">Authorized Payment Gateway for Ethiopian Banks & Wallets</p>
                </div>
              </div>
              <button
                type="button"
                disabled={simulationModal.isProcessing}
                onClick={() => setSimulationModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Merchant & Order Details */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Recipient</span>
                  <strong className="text-navy text-sm font-bold block">BATU YEHIYWOT BERHAN CHURCH</strong>
                  <span className="text-[11px] text-slate-600">Sanctuary Building Fund</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Due</span>
                  <strong className="text-emerald-700 text-xl font-mono font-bold block">
                    {simulationModal.amount.toLocaleString()} ETB
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: {simulationModal.txRef.slice(0, 16)}...</span>
                </div>
              </div>

              {/* Channel Selector in Checkout */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Authorize Payment Using:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {chapaChannels.map((c) => {
                    const isCur = simulationModal.selectedChannel === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        disabled={simulationModal.isProcessing}
                        onClick={() =>
                          setSimulationModal((prev) =>
                            prev ? { ...prev, selectedChannel: c.id } : null
                          )
                        }
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-bold cursor-pointer ${isCur
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                      >
                        <span className="flex justify-center mb-0.5"><BankLogo id={c.id} size={28} /></span>
                        <span className="block text-[11px] truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulation Interactive Prompt per channel */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-xs space-y-3">
                {simulationModal.selectedChannel === 'telebirr' && (
                  <>
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <span>Telebirr USSD Push (*127#) Prompt</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      A simulated USSD push prompt will be sent to{' '}
                      <strong className="text-emerald-950 font-mono">{simulationModal.donorPhone}</strong> for{' '}
                      <strong className="text-emerald-950">{simulationModal.amount.toLocaleString()} ETB</strong>.
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-emerald-300 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Demo Telebirr PIN:</span>
                      <span className="font-mono text-emerald-900 font-bold tracking-widest text-sm">•••• 1234</span>
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'cbebirr' && (
                  <>
                    <div className="flex items-center gap-2 text-purple-900 font-bold">
                      <Building2 className="w-4 h-4 text-purple-700" />
                      <span>Commercial Bank of Ethiopia (CBE Birr / Mobile)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      CBE authorization request generated for{' '}
                      <strong className="text-purple-950 font-mono">{simulationModal.donorPhone}</strong>.
                    </p>
                    <div className="bg-white p-3 rounded-xl border border-purple-300 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Demo CBE PIN:</span>
                      <span className="font-mono text-purple-900 font-bold tracking-widest text-sm">•••• 1234</span>
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'abyssinia' && (
                  <>
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>Bank of Abyssinia (BoA Mobile & Amole)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Bank of Abyssinia secure session ready for donor <strong className="text-navy">{simulationModal.donorName}</strong>.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-300 text-[11px] text-amber-900 font-medium">
                      Direct account debit of {simulationModal.amount.toLocaleString()} ETB ready to authorize.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'awash' && (
                  <>
                    <div className="flex items-center gap-2 text-orange-900 font-bold">
                      <Building2 className="w-4 h-4 text-orange-700" />
                      <span>Awash Bank (Awash Birr & Online Banking)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Awash Birr instant gateway session ready for payment verification.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-orange-300 text-[11px] text-orange-900 font-medium">
                      Authorization token prepared for {simulationModal.amount.toLocaleString()} ETB.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'coop' && (
                  <>
                    <div className="flex items-center gap-2 text-teal-900 font-bold">
                      <BankLogo id="coop" size={24} />
                      <span>Cooperative Bank of Oromia (CoopPay E-Birr)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      CoopPay gateway connected for mobile wallet authorization.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-teal-300 text-[11px] text-teal-900 font-medium">
                      Authorized debit ready for church building fund.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'dashen' && (
                  <>
                    <div className="flex items-center gap-2 text-indigo-900 font-bold">
                      <BankLogo id="dashen" size={24} />
                      <span>Dashen Bank (Amole & SuperApp)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Dashen Amole authorization requested for{' '}
                      <strong className="text-indigo-950 font-mono">{simulationModal.donorPhone}</strong>.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-300 text-[11px] text-indigo-900 font-medium">
                      Debit authorization ready for {simulationModal.amount.toLocaleString()} ETB.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'berhan' && (
                  <>
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <BankLogo id="berhan" size={24} />
                      <span>Berhan Bank (Mobile Banking)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Berhan Bank secure authorization ready for donor{' '}
                      <strong className="text-navy">{simulationModal.donorName}</strong>.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-300 text-[11px] text-amber-900 font-medium">
                      Account debit ready for {simulationModal.amount.toLocaleString()} ETB.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'wegagen' && (
                  <>
                    <div className="flex items-center gap-2 text-rose-900 font-bold">
                      <BankLogo id="wegagen" size={24} />
                      <span>Wegagen Bank (Mobile Banking)</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Wegagen Bank mobile session connected for{' '}
                      <strong className="text-rose-950 font-mono">{simulationModal.donorPhone}</strong>.
                    </p>
                    <div className="bg-white p-2.5 rounded-xl border border-rose-300 text-[11px] text-rose-900 font-medium">
                      Authorization code prepared for {simulationModal.amount.toLocaleString()} ETB.
                    </div>
                  </>
                )}

                {simulationModal.selectedChannel === 'card' && (
                  <>
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span>EthSwitch Local ATM Card / Visa</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-300 space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-700">
                        <span>Card: •••• •••• •••• 4242</span>
                        <span>Exp: 12/28</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">EthSwitch Local Debit / ATM Switch</span>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={simulationModal.isProcessing}
                  onClick={() => handleAuthorizeSimulation(simulationModal.selectedChannel)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {simulationModal.isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing with Chapa & Bank...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Authorize & Pay {simulationModal.amount.toLocaleString()} ETB via{' '}
                        {chapaChannels.find((c) => c.id === simulationModal.selectedChannel)?.name}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={simulationModal.isProcessing}
                  onClick={() => setSimulationModal(null)}
                  className="w-full py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel & Return to Form
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulated Chapa Payment Environment • No Real Money Debited</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
