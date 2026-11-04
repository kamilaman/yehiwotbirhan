'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { Menu, X, Heart, Globe, Church } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/about', label: t('nav_about') },
    { href: '/ministries', label: t('nav_ministries') },
    { href: '/#services', label: t('nav_services') },
    { href: '/events', label: t('nav_events') },
    { href: '/building-fund', label: t('nav_building_fund'), highlight: true },
    { href: '/contact', label: t('nav_contact') },
  ];

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-navy-dark text-white text-xs py-2 px-4 border-b border-navy-light/30 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse"></span>
            <span>{t('announcement_text')}</span>
          </div>
          <Link
            href="/contact"
            className="text-gold hover:text-white transition-colors font-medium flex items-center gap-1"
          >
            {t('announcement_cta')}
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 print:hidden ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2.5' : 'bg-white py-4'
        } border-b border-slate-100`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
              <div className="relative w-11 h-11 rounded-full border-2 border-gold shadow-sm overflow-hidden bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png"
                  alt="BATU YEHIYWOT BERHAN CHURCH Logo"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base md:text-lg text-navy tracking-tight group-hover:text-gold transition-colors">
                  {t('church_name')}
                </span>
                <span className="text-[10px] md:text-xs tracking-widest text-gold uppercase font-semibold -mt-0.5">
                  {t('church_sub')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors py-1 relative ${
                      link.highlight
                        ? 'text-navy font-bold hover:text-gold'
                        : isActive
                        ? 'text-gold font-semibold'
                        : 'text-slate hover:text-gold'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Action & Language Switcher */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Switcher EN | አማርኛ */}
              <div
                className="flex items-center bg-slate-100 p-1 rounded-lg text-xs border border-slate-200"
                role="region"
                aria-label="Language selection"
              >
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-2.5 py-1 rounded transition-all font-semibold ${
                    locale === 'en'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('am')}
                  className={`px-2.5 py-1 rounded transition-all font-semibold ${
                    locale === 'am'
                      ? 'bg-white text-navy shadow-sm'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  አማርኛ
                </button>
              </div>

              {/* Giving CTA Button */}
              <Link
                href="/building-fund"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-gold text-white hover:text-navy font-semibold text-sm transition-all duration-200 shadow-sm"
              >
                <Heart className="w-4 h-4 text-gold group-hover:text-navy fill-current" />
                <span>{t('fund_btn_give')}</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-navy hover:text-gold hover:bg-slate-50 focus:outline-none transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-out Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[108px] z-50 bg-navy/95 backdrop-blur-xl text-white flex flex-col justify-between p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <Church className="w-6 h-6 text-gold" />
                  <span className="font-serif font-bold text-white text-base">
                    {t('church_name')}
                  </span>
                </div>
                {/* Language Switcher in Mobile Drawer */}
                <div className="flex items-center bg-white/10 p-1 rounded-lg text-xs border border-white/20">
                  <button
                    type="button"
                    onClick={() => setLocale('en')}
                    className={`px-3 py-1 rounded transition-colors font-semibold ${
                      locale === 'en' ? 'bg-gold text-navy' : 'text-white/80'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale('am')}
                    className={`px-3 py-1 rounded transition-colors font-semibold ${
                      locale === 'am' ? 'bg-gold text-navy' : 'text-white/80'
                    }`}
                  >
                    አማርኛ
                  </button>
                </div>
              </div>

              <nav className="flex flex-col space-y-2 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      link.highlight
                        ? 'bg-gold text-navy font-bold'
                        : 'text-white/90 hover:bg-white/10 hover:text-gold'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-white/60 text-center">
              <p>Batu (Ziway), Ethiopia</p>
              <p className="mt-1">Sunday Worship: 3:00 – 6:00 (9:00 AM – 12:00 PM)</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
