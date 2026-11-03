'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import {
  Sparkles,
  Users,
  Heart,
  Music,
  HeartHandshake,
  Shield,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export default function MinistriesPage() {
  const { t } = useLanguage();

  const ministriesList = [
    {
      id: 'children',
      icon: Sparkles,
      title: t('min_children_title'),
      desc: t('min_children_desc'),
      schedule: 'Sundays at 3:00 – 6:00 (9:00 AM – 12:00 PM)',
      age: 'Ages 3 – 12',
    },
    {
      id: 'youth',
      icon: Users,
      title: t('min_youth_title'),
      desc: t('min_youth_desc'),
      schedule: 'Fridays at 5:00 PM – 7:00 PM',
      age: 'Teens & College Students',
    },
    {
      id: 'women',
      icon: Heart,
      title: t('min_women_title'),
      desc: t('min_women_desc'),
      schedule: 'Saturdays (Bi-Weekly) at 9:00 AM',
      age: 'All Women',
    },
    {
      id: 'men',
      icon: Shield,
      title: t('min_men_title'),
      desc: t('min_men_desc'),
      schedule: 'Saturday Morning Prayer at 6:30 AM',
      age: 'All Men & Fathers',
    },
    {
      id: 'worship',
      icon: Music,
      title: t('min_worship_title'),
      desc: t('min_worship_desc'),
      schedule: 'Thursday Rehearsals at 5:30 PM',
      age: 'Vocalists, Musicians, Media Team',
    },
    {
      id: 'outreach',
      icon: HeartHandshake,
      title: t('min_outreach_title'),
      desc: t('min_outreach_desc'),
      schedule: 'Monthly Community Action Days',
      age: 'All Church Volunteers',
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-navy-dark text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/20 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-gold/40">
            {t('ministries_tag')}
          </span>
          <h1 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-tight max-w-3xl mx-auto">
            {t('ministries_title')}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            {t('ministries_sub')}
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ministriesList.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy transition-colors flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-muted uppercase tracking-wider block mb-1">
                      {m.age}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-navy mb-3">
                      {m.title}
                    </h3>
                    <p className="text-slate text-xs leading-relaxed mb-6">
                      {m.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      {m.schedule}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Volunteer CTA */}
          <div className="mt-16 bg-navy rounded-3xl p-8 md:p-12 text-white text-center max-w-4xl mx-auto border border-gold/30">
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-white mb-3">
              Ready to Get Involved and Serve?
            </h3>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
              Every member has spiritual gifts to build the body of Christ. Let us help you find your ministry home.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gold hover:bg-gold-hover text-navy font-bold text-xs transition-all shadow-md"
            >
              <span>Connect With a Ministry Leader</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
