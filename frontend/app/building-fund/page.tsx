'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { BuildingProgressBar } from '@/components/BuildingProgressBar';
import { PaymentSelector } from '@/components/PaymentSelector';
import {
  CheckCircle2,
  Building,
  Heart,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function BuildingFundPage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-navy-dark text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/20 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-gold/40">
            {t('fund_hero_tag')}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight max-w-4xl mx-auto leading-tight">
            {t('fund_hero_title')}
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            {t('fund_hero_sub')}
          </p>
        </div>
      </section>

      {/* Sanctuary Showcase & Live Progress */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Architectural Poster & Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Vision & Architecture
              </span>
              <h2 className="font-serif font-bold text-2xl md:text-3xl text-navy leading-snug">
                A 2,500-Seat Sanctuary for Praise, Fellowship & Compassion
              </h2>
              <p className="text-slate text-xs sm:text-sm leading-relaxed">
                As the church community in Batu has multiplied, our current facility no longer accommodates our weekend worshippers. The new complex is purposefully designed to equip believers and serve Ziway for the next 50 years.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="font-serif font-bold text-lg text-gold block">2,500+</span>
                  <span className="text-[11px] text-slate-muted">Auditorium Seating</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="font-serif font-bold text-lg text-gold block">12 Rooms</span>
                  <span className="text-[11px] text-slate-muted">Children Sunday School</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="font-serif font-bold text-lg text-gold block">Youth Hall</span>
                  <span className="text-[11px] text-slate-muted">Campus & Teen Center</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <span className="font-serif font-bold text-lg text-gold block">Mercy Wing</span>
                  <span className="text-[11px] text-slate-muted">Community Care Center</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40 group">
                <Image
                  src="/images/church_building.jpg"
                  alt="BATU Church Building — Front View & Facade"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/40 to-transparent p-4 text-left">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider">Church Building</span>
                  <p className="text-white text-xs font-semibold">Front Facade, Grand Entrance Steps & Main Sanctuary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gold/30 shadow-sm group">
                  <Image
                    src="/images/sanctuary_interior.jpg"
                    alt="Sanctuary Interior 2,500 Seat Auditorium"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-navy-dark/80 p-2 text-left">
                    <span className="text-[10px] text-gold font-bold block">Sanctuary Interior</span>
                    <span className="text-[9px] text-white/80">2,500-Seat Worship Hall</span>
                  </div>
                </div>
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gold/30 shadow-sm group">
                  <Image
                    src="/images/church_leadership.jpg"
                    alt="Church Leadership & Elder Board"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-navy-dark/80 p-2 text-left">
                    <span className="text-[10px] text-gold font-bold block">Project Leadership</span>
                    <span className="text-[9px] text-white/80">Elders & Pastoral Council</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Progress Bar */}
          <BuildingProgressBar currency="ETB" />
        </div>
      </section>

      {/* Giving Form & Payment Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Faithful Stewardship
            </span>
            <h2 className="font-serif font-bold text-3xl text-navy">
              Partner With Us in Giving
            </h2>
            <p className="text-slate text-xs sm:text-sm max-w-xl mx-auto">
              Choose your giving channel below. All gifts are receipted and managed with strict financial oversight.
            </p>
          </div>

          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-muted">Loading Giving Portal...</div>}>
            <PaymentSelector initialDesignation="building_fund" />
          </React.Suspense>
        </div>
      </section>

      {/* Construction Phases & Timeline */}
      <section className="py-16 bg-cream border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              Project Milestones
            </span>
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-navy mt-1">
              Building Phases Overview
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border-l-4 border-emerald-500 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Phase 1 — 100% Completed
                </span>
                <h4 className="font-serif font-bold text-base text-navy mt-0.5">
                  Land Acquisition, Foundation & Reinforced Concrete Pillars
                </h4>
                <p className="text-xs text-slate-muted mt-1">
                  Plot secured, structural foundation excavated, and main support columns poured.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full shrink-0">
                Completed
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border-l-4 border-gold shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-gold-600 uppercase tracking-wider block">
                  Phase 2 — In Active Progress (Current)
                </span>
                <h4 className="font-serif font-bold text-base text-navy mt-0.5">
                  Roof Truss Framing, Exterior Walls & Perimeter Enclosure
                </h4>
                <p className="text-xs text-slate-muted mt-1">
                  Fabricating steel roof trusses, brick masonry, and security perimeter fencing.
                </p>
              </div>
              <span className="px-3 py-1 bg-gold/10 text-gold-600 text-xs font-bold rounded-full shrink-0">
                Active Phase
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border-l-4 border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phase 3 — Next Milestone
                </span>
                <h4 className="font-serif font-bold text-base text-navy mt-0.5">
                  Interior Finishing, Acoustics, Seating & Multi-Media Setup
                </h4>
                <p className="text-xs text-slate-muted mt-1">
                  Floor tiling, sanctuary pews/seating, sound engineering, and lighting installation.
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full shrink-0">
                Upcoming
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
