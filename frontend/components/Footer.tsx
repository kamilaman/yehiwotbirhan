'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-navy-dark text-white pt-16 pb-8 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Church Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full border-2 border-gold overflow-hidden bg-white">
                <Image
                  src="/images/logo.png"
                  alt="BATU YEHIYWOT BERHAN CHURCH Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base tracking-tight text-white">
                  {t('church_name')}
                </h3>
                <p className="text-[11px] text-gold tracking-wider uppercase font-semibold">
                  {t('church_sub')}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-xs leading-relaxed">
              Dedicated to walking in biblical truth, Christ-centered worship, and serving the community with love and compassion in Batu (Ziway), Ethiopia.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-gold mb-4">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  {t('nav_about')}
                </Link>
              </li>
              <li>
                <Link href="/about#beliefs" className="hover:text-gold transition-colors">
                  {t('nav_beliefs')}
                </Link>
              </li>
              <li>
                <Link href="/ministries" className="hover:text-gold transition-colors">
                  {t('nav_ministries')}
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-gold transition-colors">
                  {t('nav_events')}
                </Link>
              </li>
              <li>
                <Link href="/building-fund" className="hover:text-gold transition-colors">
                  {t('nav_building_fund')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  {t('nav_contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Worship Gatherings */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-gold mb-4">
              {t('services_title')}
            </h4>
            <div className="space-y-3 text-xs text-white/80">
              <div className="border-l-2 border-gold pl-3">
                <p className="font-semibold text-white">Sunday (እሁድ) — Worship Service (የአምልኮ ጊዜ)</p>
                <p className="text-white/60">3:00 – 6:00 (9:00 AM – 12:00 PM)</p>
              </div>
              <div className="border-l-2 border-white/20 pl-3">
                <p className="font-semibold text-white">Wednesday (ረቡዕ) — Prayer & Teaching (የጸሎት እና የትምህርት ጊዜ)</p>
                <p className="text-white/60">11:00 – 1:00 (5:00 PM – 7:00 PM)</p>
              </div>
              <div className="border-l-2 border-white/20 pl-3">
                <p className="font-semibold text-white">Friday (ዓርብ) — Worship & Healing (የአምልኮ እና የፈውስ ጊዜ)</p>
                <p className="text-white/60">11:00 – 1:00 (5:00 PM – 7:00 PM)</p>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Giving Accounts */}
          <div>
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-gold mb-4">
              {t('footer_contact_info')}
            </h4>
            <div className="space-y-2.5 text-xs text-white/80 mb-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <span>{t('footer_address')}</span>
                  <a
                    href="https://maps.app.goo.gl/zCr9rBJcNysoLEwR6?g_st=atm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-gold hover:text-white transition-colors text-[11px] font-semibold mt-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold shrink-0" />
                <span>{t('footer_phone')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>{t('footer_email')}</span>
              </div>
            </div>

            <h5 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
              Direct Bank Giving Accounts
            </h5>
            <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-[11px] space-y-1 text-white/90">
              <p><span className="text-gold font-semibold">CBE:</span> 1000 4829 3019 4</p>
              <p><span className="text-gold font-semibold">Coopbank:</span> 1000 1948 2930 1</p>
              <p><span className="text-gold font-semibold">Telebirr:</span> *127# (Batu Hiwot)</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>{t('footer_copyright')}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              {t('footer_privacy')}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gold transition-colors">
              {t('footer_terms')}
            </Link>
            <span>•</span>
            <Link href="/donation-policy" className="hover:text-gold transition-colors">
              {t('footer_donation_policy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
