import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-16 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate leading-relaxed">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <FileText className="w-8 h-8 text-gold" />
            <div>
              <h1 className="font-serif font-bold text-2xl text-navy">
                Terms of Service
              </h1>
              <p className="text-slate-muted text-[11px]">
                BATU YEHIYWOT BERHAN CHURCH • Effective Date: January 2026
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the BATU YEHIYWOT BERHAN CHURCH website and online services, you acknowledge and agree to abide by these terms, as well as all applicable laws of Ethiopia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">2. Church Content & Intellectual Property</h2>
            <p>
              All sermon recordings, posters, photographs, articles, and church logos published on this website are the property of BATU YEHIYWOT BERHAN CHURCH and may not be reproduced for commercial purposes without prior written authorization.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-sm text-navy">3. Online Community Conduct</h2>
            <p>
              Users are expected to interact respectfully with all church forms, event registration systems, and prayer request submissions. Abuse or malicious use will result in IP barring.
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
