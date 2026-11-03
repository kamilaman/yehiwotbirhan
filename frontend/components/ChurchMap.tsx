'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { MapPin, Clock, Phone, Mail, Navigation, Compass, Car } from 'lucide-react';

export const ChurchMap: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useLanguage();

  // Verified church location: https://maps.app.goo.gl/zCr9rBJcNysoLEwR6?g_st=atm
  const googleMapsUrl = 'https://maps.app.goo.gl/zCr9rBJcNysoLEwR6?g_st=atm';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=WPJ4%2BXVW+Batu%2FZiway+Yehiywot+Birihan+Church,+Ziway';
  const embedUrl = 'https://maps.google.com/maps?q=WPJ4%2BXVW+Batu%2FZiway+Yehiywot+Birihan+Church,+Ziway&t=&z=16&ie=UTF8&iwloc=&output=embed';

  return (
    <section aria-label="Church Location & Map" className={`py-16 bg-cream border-t border-slate-200/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold/15 text-gold-700 border border-gold/30 mb-3">
            <Compass className="w-3.5 h-3.5 text-gold" />
            {t('map_tag')}
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-navy tracking-tight">
            {t('map_title')}
          </h2>
          <div className="w-16 h-1 bg-gold mx-auto my-3 rounded-full"></div>
          <p className="text-slate text-xs sm:text-sm leading-relaxed">
            {t('map_subtitle')}
          </p>
        </div>

        {/* Main Grid: Details + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Details Card */}
          <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-bold text-gold uppercase tracking-wider block mb-1">
                  Batu (Ziway), Ethiopia
                </span>
                <h3 className="font-serif font-bold text-xl text-navy">
                  BATU YEHIYWOT BERHAN CHURCH
                </h3>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold text-xs">Sanctuary Address & Plus Code</strong>
                  <span className="text-slate leading-relaxed block">{t('footer_address')}</span>
                  <span className="text-gold font-mono font-bold text-[11px] block mt-1">
                    Google Plus Code: WPJ4+XVW Batu, Ethiopia
                  </span>
                </div>
              </div>

              {/* Service Times */}
              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <strong className="block text-navy font-bold text-xs">Weekly Gatherings & Service Times</strong>
                  <p className="text-slate">
                    <span className="font-semibold text-navy">Sunday (እሁድ):</span> 3:00 – 6:00 (9:00 AM – 12:00 PM) — የአምልኮ ጊዜ
                  </p>
                  <p className="text-slate">
                    <span className="font-semibold text-navy">Wednesday (ረቡዕ):</span> 11:00 – 1:00 (5:00 PM – 7:00 PM) — የጸሎት እና የትምህርት ጊዜ
                  </p>
                  <p className="text-slate">
                    <span className="font-semibold text-navy">Friday (ዓርብ):</span> 11:00 – 1:00 (5:00 PM – 7:00 PM) — የአምልኮ እና የፈውስ ጊዜ
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3.5 text-xs">
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-navy font-bold text-xs">Telephone & Pastoral Office</strong>
                  <a href="tel:+251464412345" className="text-slate hover:text-gold transition-colors block">
                    {t('footer_phone')}
                  </a>
                </div>
              </div>

              {/* Parking and Facilities */}
              <div className="p-3.5 bg-cream/70 rounded-2xl border border-slate-200/80 text-[11px] text-slate-muted flex items-start gap-2.5">
                <Car className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>{t('map_parking')}</span>
              </div>
            </div>

            {/* CTA Buttons for Google Maps & Directions */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md group text-center"
              >
                <Navigation className="w-4 h-4 text-gold group-hover:text-navy transition-colors" />
                <span>Get Driving Directions</span>
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-slate-100 text-navy font-bold text-xs rounded-xl border border-slate-300 transition-all text-center"
              >
                <MapPin className="w-4 h-4 text-gold" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Right Map Container */}
          <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[440px] relative border-2 border-gold/30 shadow-md flex flex-col">
            <iframe
              title="Map location of BATU YEHIYWOT BERHAN CHURCH in Ziway, Ethiopia"
              src={embedUrl}
              className="w-full h-full min-h-[380px] sm:min-h-[440px] border-0 flex-grow"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};
