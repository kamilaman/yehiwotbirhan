'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { BuildingProgressBar } from '@/components/BuildingProgressBar';
import { ChurchMap } from '@/components/ChurchMap';
import { api } from '@/lib/api';
import { Post } from '@/lib/types';
import {
  MapPin,
  Clock,
  BookOpen,
  Users,
  HeartHandshake,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Church,
  Flame,
  Sun,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api.getPosts().then((res) => {
      setPosts(res);
    });
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-navy-dark via-navy to-navy-light text-white pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('hero_location_badge')}</span>
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-white">
                {t('hero_title')}
              </h1>

              <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {t('hero_subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/events"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-navy font-bold text-sm transition-all shadow-lg hover:shadow-gold/20 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('hero_plan_visit')}</span>
                </Link>

                <Link
                  href="/about"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('nav_about')} Church</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </Link>
              </div>

              {/* Service Badges */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs text-white font-bold">
                      {t('hero_service_times')}
                    </strong>
                    <span className="text-[11px] text-white/70">
                      {t('service_sun_title')}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs text-white font-bold">
                      Central Avenue, Batu
                    </strong>
                    <span className="text-[11px] text-white/70">
                      Near Ziway Lake & Grand Highway
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5 space-y-6">
              {/* Church building and front view showcase */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gold/40 aspect-[4/3] bg-navy-light group">
                <Image
                  src="/images/church_building.jpg"
                  alt="BATU YEHIYWOT BERHAN CHURCH Building Front View"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/30 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                    {t('fund_badge')}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-white mt-1">
                    BATU Church Building — Front Facade
                  </h3>
                  <p className="text-white/80 text-xs mt-1">
                    Front entrance view & modern sanctuary complex in Batu (Ziway)
                  </p>
                </div>
              </div>

              {/* Compact Live Progress Bar in Hero */}
              <BuildingProgressBar currency="ETB" compact={true} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PASTOR'S WELCOME SHOWCASE */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cream rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Pastor Portrait */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/images/pastor_zerfu.png"
                  alt="Pastor Zerfu"
                  fill
                  sizes="(max-width: 768px) 280px, 320px"
                  className="object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/50 to-transparent p-4 text-center">
                  <h4 className="font-serif font-bold text-white text-base">
                    {t('pastor_name')}
                  </h4>
                  <p className="text-gold text-xs font-medium uppercase tracking-wider">
                    {t('pastor_role')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pastor Message */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/10 text-gold-600">
                <Sparkles className="w-3.5 h-3.5" />
                {t('pastor_tag')}
              </span>

              <h2 className="font-serif font-bold text-2xl md:text-3xl text-navy leading-snug">
                {t('pastor_headline')}
              </h2>

              <blockquote className="text-slate text-sm sm:text-base leading-relaxed italic border-l-4 border-gold pl-4 py-1">
                {t('pastor_quote')}
              </blockquote>

              <p className="text-xs text-slate-muted leading-relaxed">
                Whether you have grown up in church or this is your very first time seeking God, we invite you to experience unconditional grace, vibrant worship, and heartfelt brotherhood at BATU YEHIYWOT BERHAN CHURCH.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/about"
                  className="px-5 py-2.5 rounded-xl bg-navy hover:bg-gold text-white hover:text-navy font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>{t('pastor_btn_team')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/contact"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-navy font-semibold text-xs border border-slate-300 transition-all"
                >
                  {t('pastor_btn_prayer')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE MISSION PILLARS */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              {t('welcome_tag')}
            </span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-navy">
              {t('welcome_title')}
            </h2>
            <p className="text-slate text-sm leading-relaxed">
              {t('welcome_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy group-hover:bg-gold group-hover:text-white transition-colors flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">
                {t('welcome_biblical_title')}
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('welcome_biblical_desc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy group-hover:bg-gold group-hover:text-white transition-colors flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">
                {t('welcome_fellowship_title')}
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('welcome_fellowship_desc')}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy group-hover:bg-gold group-hover:text-white transition-colors flex items-center justify-center mb-6">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-xl text-navy mb-3">
                {t('welcome_outreach_title')}
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('welcome_outreach_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HERITAGE SPOTLIGHT BANNER */}
      <section className="py-12 bg-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-navy-dark/80 rounded-3xl p-8 sm:p-12 border border-gold/30 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider border border-gold/40">
                <Flame className="w-3.5 h-3.5" />
                <span>{t('history_tag')}</span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-white">
                {t('history_title')}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                {t('history_subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-gold">
                <span>• 1960 Swedish Missionaries</span>
                <span>• 1962 Chapa Night Chapel</span>
                <span>• 17 Yrs Underground During Derg</span>
                <span>• 1M+ Members Today</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/about"
                className="px-7 py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-navy font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2"
              >
                <span>{t('history_read_more_btn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SERMON & MEDIA POSTS SHOWCASE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                Word & Inspiration
              </span>
              <h2 className="font-serif font-bold text-3xl text-navy mt-1">
                Latest Sermons & Announcements
              </h2>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-gold hover:text-navy transition-colors flex items-center gap-1"
            >
              <span>View All Church Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-cream rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative h-64 w-full bg-navy-light overflow-hidden">
                  <Image
                    src={post.image_url || '/images/sermon_poster.png'}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-navy/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold uppercase tracking-wider">
                    {post.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-slate-muted block mb-1">
                      By {post.author}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-navy mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-slate text-xs leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <Link
                      href="/events"
                      className="font-bold text-gold hover:text-navy transition-colors inline-flex items-center gap-1"
                    >
                      <span>Learn More</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-slate-muted text-[11px]">Batu Sanctuary</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SERVICES & TIMES SCHEDULE SECTION */}
      <section id="services" className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              {t('services_tag')}
            </span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white">
              {t('services_title')}
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('services_sub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sunday Service */}
            <div className="bg-white/5 border border-white/15 hover:border-gold/60 rounded-3xl p-8 transition-all hover:bg-white/[0.08] shadow-lg flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                    Sunday • እሁድ
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <Sun className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-2xl text-white mb-2 leading-snug">
                  {t('service_sun_title')}
                </h3>
                <div className="inline-block bg-gold/20 border border-gold/40 text-gold font-black text-sm px-3.5 py-1.5 rounded-xl mb-4">
                  {t('service_sun_time')}
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {t('service_sun_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Sanctuary & Main Hall</span>
                <span className="text-gold font-semibold">Amharic & Afaan Oromo</span>
              </div>
            </div>

            {/* Wednesday Service */}
            <div className="bg-white/5 border border-white/15 hover:border-gold/60 rounded-3xl p-8 transition-all hover:bg-white/[0.08] shadow-lg flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                    Wednesday • ረቡዕ
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-2xl text-white mb-2 leading-snug">
                  {t('service_wed_title')}
                </h3>
                <div className="inline-block bg-gold/20 border border-gold/40 text-gold font-black text-sm px-3.5 py-1.5 rounded-xl mb-4">
                  {t('service_wed_time')}
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {t('service_wed_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Prayer & Bible Study</span>
                <span className="text-gold font-semibold">All Believers Welcome</span>
              </div>
            </div>

            {/* Friday Service */}
            <div className="bg-white/5 border border-white/15 hover:border-gold/60 rounded-3xl p-8 transition-all hover:bg-white/[0.08] shadow-lg flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-widest bg-gold/15 px-3 py-1 rounded-full border border-gold/30">
                    Friday • ዓርብ
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-2xl text-white mb-2 leading-snug">
                  {t('service_fri_title')}
                </h3>
                <div className="inline-block bg-gold/20 border border-gold/40 text-gold font-black text-sm px-3.5 py-1.5 rounded-xl mb-4">
                  {t('service_fri_time')}
                </div>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  {t('service_fri_desc')}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Worship, Deliverance & Healing</span>
                <span className="text-gold font-semibold">Spirit-Led Gathering</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BUILDING FUND CALLOUT SECTION */}
      <section className="py-20 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <BuildingProgressBar currency="ETB" />
          <div className="mt-8 text-center">
            <Link
              href="/building-fund"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-sm rounded-xl transition-all shadow-lg"
            >
              <span>{t('fund_btn_give')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CHURCH LOCATION & INTERACTIVE MAP (Directly above Bottom Nav) */}
      <ChurchMap />
    </div>
  );
}
