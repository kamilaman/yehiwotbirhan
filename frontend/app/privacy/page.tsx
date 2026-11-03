import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="py-16 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate leading-relaxed">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Shield className="w-8 h-8 text-gold" />
            <div>
              <h1 className="font-serif font-bold text-2xl text-navy">
                Privacy Policy
              </h1>
              <p className="text-slate-muted text-[11px]">
                BATU YEHIYWOT BERHAN CHURCH • Effective Date: January 2026
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">1. Information We Collect</h2>
            <p>
              When you visit our website, register for church events, submit a prayer request, or contribute to the church Building Fund, we may collect personal details including your name, email address, phone number, and transaction confirmation details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">2. How We Use Your Information</h2>
            <p>
              Your information is strictly used for official church purposes: issuing donation receipts, confirming event attendance, responding to inquiries, and providing spiritual pastoral care.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">3. Confidentiality of Prayer Requests</h2>
            <p>
              All prayer requests submitted through our contact portal are treated with the highest pastoral confidentiality and are only accessible to Pastor Zerfu and designated church prayer intercessors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">4. Security of Financial Records</h2>
            <p>
              We do not store your credit card or mobile banking PINs on our servers. All transactions through Telebirr, CBE Birr, Coopbank, Stripe, and PayPal are processed through secured, encrypted channels.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100">
            <Link href="/" className="text-navy font-bold hover:text-gold transition-colors">
              ← Return to Church Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
