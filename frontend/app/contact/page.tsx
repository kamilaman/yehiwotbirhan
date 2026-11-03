'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { ChurchMap } from '@/components/ChurchMap';
import { api } from '@/lib/api';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'general' | 'prayer'>('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const formattedMessage =
      tab === 'prayer' ? `[PASTORAL PRAYER REQUEST]: ${message}` : message;

    const res = await api.sendContactMessage({
      name,
      email,
      phone,
      message: formattedMessage,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.message || 'Error sending message. Please try again.');
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-navy-dark text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/20 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-gold/40">
            {t('contact_tag')}
          </span>
          <h1 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-tight max-w-3xl mx-auto">
            {t('contact_title')}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            {t('contact_sub')}
          </p>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-navy">
                    Church Office & Sanctuary
                  </h3>
                  <p className="text-xs text-slate-muted mt-1">
                    Located centrally in Batu (Ziway)
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-navy font-bold">Address</strong>
                      <span>{t('footer_address')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-navy font-bold">Telephone</strong>
                      <span>{t('footer_phone')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-navy font-bold">Email</strong>
                      <span>{t('footer_email')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-navy font-bold">Office Hours</strong>
                      <span>Tuesday – Saturday: 8:30 AM – 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pastoral Care Note */}
              <div className="bg-navy p-8 rounded-3xl text-white border border-gold/30 space-y-3">
                <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Confidential Pastoral Care</span>
                </div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Need Prayer or Counsel?
                </h4>
                <p className="text-white/80 text-xs leading-relaxed">
                  {t('contact_confidential_note')} Pastor Zerfu and our elders are honored to stand with you in faith.
                </p>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl">
                {/* Form Mode Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTab('general')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      tab === 'general'
                        ? 'bg-navy text-white shadow-sm'
                        : 'text-slate hover:text-navy'
                    }`}
                  >
                    {t('contact_general_tab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('prayer')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      tab === 'prayer'
                        ? 'bg-gold text-navy shadow-sm'
                        : 'text-slate hover:text-navy'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{t('contact_prayer_tab')}</span>
                  </button>
                </div>

                {success ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-navy mb-2">
                      Message Received!
                    </h3>
                    <p className="text-slate text-xs leading-relaxed max-w-md mx-auto mb-6">
                      Thank you for contacting BATU YEHIYWOT BERHAN CHURCH. Your note has been securely forwarded to our pastoral office.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccess(false);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setMessage('');
                      }}
                      className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-xl"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-slate mb-1">
                        {t('contact_name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Yohannes Mengistu"
                        className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate mb-1">
                          {t('contact_email')}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. yohannes@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate mb-1">
                          {t('contact_phone')}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +251 9..."
                          className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate mb-1">
                        {tab === 'prayer' ? 'Your Prayer Needs *' : t('contact_message')}
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          tab === 'prayer'
                            ? 'Share your prayer request with Pastor Zerfu and the prayer team...'
                            : 'How can we help you?'
                        }
                        className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-muted flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Confidential & Protected
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-7 py-3 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Sending...' : t('contact_submit')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Church Location & Interactive Map (Directly above Bottom Nav) */}
      <ChurchMap />
    </div>
  );
}
