import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function DonationPolicyPage() {
  return (
    <div className="py-16 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate leading-relaxed">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Heart className="w-8 h-8 text-gold fill-current" />
            <div>
              <h1 className="font-serif font-bold text-2xl text-navy">
                Donation & Stewardship Policy
              </h1>
              <p className="text-slate-muted text-[11px]">
                BATU YEHIYWOT BERHAN CHURCH • Effective Date: January 2026
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">1. Voluntary Giving & Biblical Tithing</h2>
            <p>
              Contributions to BATU YEHIYWOT BERHAN CHURCH, including tithes, offerings, and Building Fund gifts, are voluntary expressions of worship and Christian stewardship.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">2. Fund Designation & Accountability</h2>
            <p>
              Gifts designated for the Building Fund are dedicated exclusively to land development, sanctuary architecture, construction materials, and sanctuary expansion. All church funds are overseen by the Board of Trustees and subject to annual external financial auditing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">3. Receipts & Tax Acknowledgement</h2>
            <p>
              Digital receipts with unique transaction reference numbers are generated for all online and registered bank donations (Telebirr, CBE, Coopbank, Stripe, PayPal).
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100">
            <Link href="/building-fund" className="text-navy font-bold hover:text-gold transition-colors">
              ← Return to Building Fund
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
