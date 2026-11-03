'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageContext';
import {
  Church,
  BookOpen,
  Heart,
  Users,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Calendar,
  Building,
  HeartHandshake,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Sun,
  Eye,
  Scroll,
} from 'lucide-react';

interface TimelineEvent {
  year: string;
  badge: string;
  badgeAm: string;
  title: string;
  titleAm: string;
  desc: string;
  descAm: string;
  highlight?: string;
  highlightAm?: string;
  icon: React.ReactNode;
  tagColor: string;
}

export default function AboutPage() {
  const { t, locale } = useLanguage();
  const [activeStoryTab, setActiveStoryTab] = useState<'timeline' | 'narrative' | 'pillars'>('timeline');
  const [expandedEventIndex, setExpandedEventIndex] = useState<number | null>(null);

  const isAmharic = locale === 'am';

  const timelineEvents: TimelineEvent[] = [
    {
      year: '1960',
      badge: 'Arrival & Foundations',
      badgeAm: 'የመጀመሪያው መሠረት',
      title: 'Swedish Pentecostal Missionaries Arrive in Ethiopia',
      titleAm: 'የስዊድን ጴንጤቆስጤ ሚስዮናውያን ወደ ኢትዮጵያ መድረስ',
      desc: 'The miraculous journey began in 1960 when Swedish Pentecostal missionaries arrived in Ethiopia with deep humility and a burning passion for the Gospel of Jesus Christ. They gave their lives to preach salvation, serve local communities, and sow the spiritual seeds of Pentecostal faith.',
      descAm: 'ታሪኩ የተጀመረው በ1960 (እ.ኤ.አ) የስዊድን ጴንጤቆስጤ ሚስዮናውያን ለወንጌል ባላቸው ጥልቅ ፍቅርና ሸክም ወደ ኢትዮጵያ በገቡበት ጊዜ ነበር። ሕይወታቸውን ለእግዚአብሔር መንግሥት በመስጠት የወንጌልን ዘር መዝራት እና የአካባቢውን ማህበረሰብ ማገልገል ጀመሩ።',
      highlight: 'Sowing the first seeds of Pentecostal revival in Ethiopia',
      highlightAm: 'በኢትዮጵያ ለመንፈሳዊ መነቃቃት የመጀመሪያውን ዘር መዝራት',
      icon: <Sparkles className="w-5 h-5 text-gold" />,
      tagColor: 'bg-gold/10 text-gold-700 border-gold/30',
    },
    {
      year: '1962',
      badge: 'First Church & Night Sanctuary',
      badgeAm: 'የመጀመሪያው ቤተ ክርስቲያን በሌሊት',
      title: 'Chapa: Built by Night Under Cover of Faith',
      titleAm: 'ጫፓ፡ በሌሊት የተሠራው የመጀመሪያው የጸሎት ቤት',
      desc: 'In 1962, an Ethiopian evangelist and missionary named Ababa Dukemo established the very first Hiwot Birhan church at a place called Chapa. Because local authorities strongly opposed the missionary work, the believers could not build during the daylight. In holy secrecy and courage, they gathered under the night sky to construct the sanctuary out of traditional wood and grass.',
      descAm: 'በ1962 (እ.ኤ.አ) አባባ ዱከሞ የተባሉ ወንጌላዊ ሚስዮናዊ በጫፓ የመጀመሪያዋን የሕይወት ብርሃን ቤተ ክርስቲያን መሠረቱ። የአካባቢው ባለስልጣናት አገልግሎቱን አጥብቀው ይቃወሙ ስለነበር፣ ቅዱሳኑ በቀን መገንባት አልቻሉም ነበር። በእምነትና በድፍረት በሌሊት ጨለማ ተሰብስበው የመጀመሪያዋን ባህላዊ የጸሎት ቤት ከእንጨትና ከሳር ሠሩ።',
      highlight: 'Built at night with wood and grass due to severe local opposition',
      highlightAm: 'በባለስልጣናት ተቃውሞ ምክንያት በሌሊት ከእንጨትና ከሳር የተሠራ ታሪካዊ መቅደስ',
      icon: <Building className="w-5 h-5 text-amber-600" />,
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      year: '1964',
      badge: 'Compassion & Medical Healing',
      badgeAm: 'የሕክምና እና የምሕረት አገልግሎት',
      title: 'Wondo Genet: Brite Bergfelt Opens Clinic',
      titleAm: 'ወንዶ ገነት፡ ነርስ ብሪት በርግፌልት የከፈቱት ክሊኒክ',
      desc: 'In 1964, a Swedish missionary and nurse named Brite Bergfelt opened a medical clinic in Wondo Genet. Treating patients with deep compassion while lovingly sharing the Gospel, her selfless care touched hearts across the region. A committed nucleus of new believers formed around her clinic, demonstrating that Gospel compassion heals both body and soul.',
      descAm: 'በ1964 (እ.ኤ.አ) ብሪት በርግፌልት የተባለች የስዊድን ሚስዮናዊትና ነርስ በወንዶ ገነት ክሊኒክ በመክፈት ሕዝቡን በሕክምና ማገልገል እና የክርስቶስን ወንጌል ማካፈል ጀመረች። በርካታ አማኞች በዚህ አገልግሎት ዙሪያ ተሰባሰቡ፤ ይህም ክርስቲያናዊ ምሕረት አካልንና ነፍስን በአንድነት እንደሚፈውስ አረጋገጠ።',
      highlight: 'Healing bodies while proclaiming eternal life in Christ',
      highlightAm: 'አካልን በሕክምና እየፈወሱ የዘላለም ሕይወት ወንጌልን መስበክ',
      icon: <HeartHandshake className="w-5 h-5 text-rose-600" />,
      tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      year: '1974 – 1991',
      badge: 'The Underground Church',
      badgeAm: 'የስደትና የምስጢር አምልኮ ዘመን',
      title: 'The Derg Crucible: 17 Years Underground',
      titleAm: 'የደርግ ዘመን፡ ለ17 ዓመታት በስውር የተደረገ ጸሎትና ጽናት',
      desc: 'In 1974, the Marxist Derg regime seized power and launched savage, state-sponsored persecution against churches. Missionaries were expelled, church buildings were sealed and confiscated, Bibles and Christian literature were burned in public, and pastors and evangelists were arrested, tortured, and some martyred. The church went underground, meeting secretly in homes by candlelight. Rather than dying, faith went deeper, prayers became stronger, and numbers multiplied in secret.',
      descAm: 'በ1974 (እ.ኤ.አ) ደርግ ወደ ስልጣን ሲመጣ በክርስትና ላይ ታላቅ ስደት ተነሳ። አብያተ ክርስቲያናት ታሸጉ፣ ሚስዮናውያን ተባረሩ፣ መጽሐፍ ቅዱሶች ተቃጠሉ፣ መጋቢያንና ወንጌላውያን ታሰሩ፣ ተገረፉ፣ አንዳንዶቹም በሰማዕትነት ወደቁ። ቤተ ክርስቲያን በድብቅ በየቤቱ በሻማ ብርሃን መጸለይ ጀመረች። ስደቱ እምነታቸውን አላጠፋውም፤ ይልቁንም ጸሎትና የእምነት ጥልቀት አበበ።',
      highlight: 'Churches closed, Bibles burned, pastors imprisoned — but the Church thrived underground',
      highlightAm: 'መቅደሶች ቢታሸጉ፣ መጻሕፍት ቢቃጠሉ፣ መጋቢያን ቢታሰሩም — ቤተ ክርስቲያን በስውር አደገች',
      icon: <Flame className="w-5 h-5 text-red-600" />,
      tagColor: 'bg-red-50 text-red-800 border-red-200',
    },
    {
      year: '1975',
      badge: 'Unified Denomination',
      badgeAm: 'የውህደት እና የአንድነት ውሳኔ',
      title: 'Awasa Mission Conference: Unified as One Body',
      titleAm: 'የሐዋሳ ሚሽን ኮንፈረንስ፡ የሕይወት ብርሃን ቤተ ክርስቲያን ውህደት',
      desc: 'In 1975, even as the storm of political persecution was beginning to rage, representatives gathered at an annual mission conference in Awasa. In prayerful solidarity, they made the historic decision to officially establish the Hiwot Berhan Church of Ethiopia as a unified national denomination, binding their hearts together under one banner of faith.',
      descAm: 'በ1975 (እ.ኤ.አ) በሀገሪቱ ውጥረት በነበረበት ወቅት፣ ተወካዮች በሐዋሳ ዓመታዊ የሚሽን ኮንፈረንስ ላይ ተሰበሰቡ። በሙሉ ልብና ጸሎት ተስማምተው "የሕይወት ብርሃን ቤተ ክርስቲያን" በሚል ስያሜ በአንድነትና በህብረት የተዋቀረች ይፋዊ ቤተ ክርስቲያን እንድትሆን ወሰኑ።',
      highlight: 'Historic unification of congregations into the official Hiwot Berhan Church',
      highlightAm: 'አብያተ ክርስቲያናት በአንድነት ተጣምረው የሕይወት ብርሃን ቤተ ክርስቲያንን ያጸኑበት ታሪካዊ ቀን',
      icon: <Award className="w-5 h-5 text-indigo-600" />,
      tagColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      year: '1991',
      badge: 'Freedom & Revival',
      badgeAm: 'የነጻነት እና የታላቅ መነቃቃት ዘመን',
      title: 'The Fall of the Derg: Emerging into the Light',
      titleAm: 'የደርግ መውደቅ፡ ከስውር ወደ ብርሃን የወጣችው ቤተ ክርስቲያን',
      desc: 'When the Derg regime collapsed in 1991, the underground church burst into the open with triumphant worship and unshakable joy. The seed sown in tears, prayer, and secret fellowship during 17 years of persecution sprouted into explosive, nationwide revival, establishing sanctuaries in cities, towns, and university campuses across Ethiopia.',
      descAm: 'በ1991 (እ.ኤ.አ) የደርግ መንግሥት ሲወድቅ፣ በስውር ስትጸልይ የነበረችው ቤተ ክርስቲያን በታላቅ የምስጋና ዝማሬ ወደ አደባባይ ወጣች። ለ17 ዓመታት በእንባና በጸሎት የተዘራው ዘር በመላው ሀገሪቱ በታላቅ መንፈሳዊ መነቃቃት፣ አዳዲስ አብያተ ክርስቲያናትን በመትከልና በሺዎች የሚቆጠሩ ነፍሳትን በማዳን ፈነዳ።',
      highlight: 'From secret home cells to public nationwide revival',
      highlightAm: 'ከቤት ለቤት ስውር ጸሎት ወደ ሀገር አቀፍ ታላቅ መነቃቃት የተደረገ ሽግግር',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    },
    {
      year: 'Present Day',
      badge: '1 Million Believers Strong',
      badgeAm: 'ከ1 ሚሊዮን በላይ አማኞች ዛሬ',
      title: 'One Million Members & Batu Zeway’s Living Torch',
      titleAm: 'ከአንድ ሚሊዮን በላይ አባላት እና የባቱ (ዝዋይ) ሕያው አደራ',
      desc: 'Today, the Hiwot Berhan Church has grown into one of the largest Pentecostal denominations in Ethiopia, numbering over one million believers. Batu Hiwot Birhan Church in Batu (Ziway) stands proudly in this sacred stream—carrying the exact same legacy of unyielding faith, sacrificial prayer, and biblical hope to our beloved community in the Great Rift Valley.',
      descAm: 'ዛሬ የሕይወት ብርሃን ቤተ ክርስቲያን በኢትዮጵያ ውስጥ ከ1 ሚሊዮን በላይ አባላት ያሏት ትልቋ የጴንጤቆስጤ ቤተ እምነት ሆናለች። በባቱ (ዝዋይ) የምትገኘው የባቱ ሕይወት ብርሃን ቤተ ክርስቲያን የዚህ ታላቅ ታሪክ አካል በመሆን ያንኑ የእምነት፣ የጽናት እና የጸሎት አደራ በታላቁ ስምጥ ሸለቆ ውስጥ በኩራት ተሸክማ ታገለግላለች።',
      highlight: 'Over 1,000,000 members nationwide — Batu carrying the torch forward',
      highlightAm: 'በመላው ኢትዮጵያ ከ1 ሚሊዮን በላይ አማኞች — ባቱ ችቦውን ወደ ፊት ታስቀጥላለች',
      icon: <Church className="w-5 h-5 text-emerald-600" />,
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
  ];

  return (
    <div className="bg-cream/40 min-h-screen">
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-b from-navy-dark via-navy to-navy-light text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold uppercase tracking-widest mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>{t('history_tag')}</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight max-w-4xl mx-auto leading-tight">
            {t('history_title')}
          </h1>

          <p className="text-white/85 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
            {t('history_subtitle')}
          </p>

          {/* Quick anchor pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <a
              href="#timeline-story"
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-hover text-navy font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>{isAmharic ? 'የታሪክ ጉዞውን ይመልከቱ' : 'Explore Church History'}</span>
            </a>
            <a
              href="#batu-legacy"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Building className="w-4 h-4 text-gold" />
              <span>{isAmharic ? 'የባቱ ቤተ ክርስቲያን አደራ' : 'Batu Zeway Church Connection'}</span>
            </a>
            <a
              href="#leadership"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-gold" />
              <span>{isAmharic ? 'የአመራር ቡድን' : 'Pastoral Leadership'}</span>
            </a>
            <a
              href="#beliefs"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-gold" />
              <span>{t('nav_beliefs')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATS & KEY HISTORICAL METRICS BAR */}
      <section className="bg-white border-b border-slate-200 py-8 relative -mt-4 shadow-sm z-20 mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-2xl">
        <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-navy block">1960</span>
            <span className="text-[11px] text-slate-muted font-medium mt-1 block">
              {t('history_stat_1960')}
            </span>
          </div>

          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-gold block">1962</span>
            <span className="text-[11px] text-slate-muted font-medium mt-1 block">
              {t('history_stat_1962')}
            </span>
          </div>

          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-navy block">1964</span>
            <span className="text-[11px] text-slate-muted font-medium mt-1 block">
              {t('history_stat_1964')}
            </span>
          </div>

          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-amber-600 block">1975</span>
            <span className="text-[11px] text-slate-muted font-medium mt-1 block">
              {t('history_stat_1975')}
            </span>
          </div>

          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-red-600 block">17+ Yrs</span>
            <span className="text-[11px] text-slate-muted font-medium mt-1 block">
              {t('history_stat_underground')}
            </span>
          </div>

          <div className="pt-2 md:pt-0">
            <span className="font-serif font-black text-2xl lg:text-3xl text-emerald-600 block">1,000,000+</span>
            <span className="text-[11px] text-slate-muted font-bold mt-1 block text-navy">
              {t('history_stat_members')}
            </span>
          </div>
        </div>
      </section>

      {/* 3. CORE STORY INTERACTIVE SECTION */}
      <section id="timeline-story" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              {isAmharic ? 'የማይጠፋው ብርሃን' : 'An Unstoppable Light'}
            </span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-navy">
              {isAmharic
                ? 'ከጫፓ የሌሊት ጸሎት ቤት እስከ አንድ ሚሊዮን አማኞች'
                : 'From a Midnight Chapel in Chapa to Over 1 Million Believers'}
            </h2>
            <p className="text-slate text-sm leading-relaxed">
              {isAmharic
                ? 'የኢትዮጵያ የሕይወት ብርሃን ቤተ ክርስቲያን በከባድ ፈተናና ስደት ውስጥ በእግዚአብሔር ጸጋ የተሻገረችበት፣ ዛሬም በባቱ (ዝዋይ) የምናከብረው ታላቅ የእምነት ታሪክ ነው።'
                : 'The Hiwot Birhan Church of Ethiopia has a deep history of faith and survival. Explore each milestone of how God turned persecution into miraculous national growth.'}
            </p>

            {/* Perspective View Switcher Tabs */}
            <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl shadow-inner mt-4 border border-slate-300">
              <button
                type="button"
                onClick={() => setActiveStoryTab('timeline')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeStoryTab === 'timeline'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-700 hover:text-navy hover:bg-white/50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gold" />
                <span>{t('history_tab_timeline')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStoryTab('narrative')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeStoryTab === 'narrative'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-700 hover:text-navy hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-gold" />
                <span>{t('history_tab_narrative')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStoryTab('pillars')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeStoryTab === 'pillars'
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate-700 hover:text-navy hover:bg-white/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span>{t('history_tab_pillars')}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: VISUAL TIMELINE */}
          {activeStoryTab === 'timeline' && (
            <div className="relative mt-12 max-w-4xl mx-auto">
              {/* Vertical center track line */}
              <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-gold via-navy to-gold -translate-x-1/2 hidden sm:block"></div>

              <div className="space-y-10 sm:space-y-12">
                {timelineEvents.map((event, idx) => {
                  const isLeft = idx % 2 === 0;
                  const isExpanded = expandedEventIndex === idx;

                  return (
                    <div
                      key={event.year}
                      className={`relative flex flex-col sm:flex-row items-start ${
                        isLeft ? 'sm:flex-row-reverse' : ''
                      } gap-6 group`}
                    >
                      {/* Timeline center marker pin */}
                      <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white border-4 border-navy shadow-lg flex items-center justify-center z-10 group-hover:scale-110 group-hover:border-gold transition-all">
                        {event.icon}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`w-full sm:w-[calc(50%-2.5rem)] ml-14 sm:ml-0 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all ${
                          isLeft ? 'sm:text-right' : 'sm:text-left'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-2 flex-wrap ${
                            isLeft ? 'sm:justify-end' : 'sm:justify-start'
                          }`}
                        >
                          <span className="font-serif font-black text-xl text-navy">
                            {event.year}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${event.tagColor}`}
                          >
                            {isAmharic ? event.badgeAm : event.badge}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-navy leading-snug">
                          {isAmharic ? event.titleAm : event.title}
                        </h3>

                        {/* Highlight callout box */}
                        <div
                          className={`my-3 p-3 rounded-xl bg-cream/70 border border-slate-200/80 text-xs text-navy-light font-semibold ${
                            isLeft ? 'sm:text-right' : 'sm:text-left'
                          }`}
                        >
                          {isAmharic ? event.highlightAm : event.highlight}
                        </div>

                        <p className="text-slate text-xs sm:text-sm leading-relaxed mt-2">
                          {isAmharic ? event.descAm : event.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FULL EDITORIAL NARRATIVE */}
          {activeStoryTab === 'narrative' && (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
              <div className="border-b border-slate-100 pb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">
                  {isAmharic ? 'ታሪካዊ ማስታወሻ' : 'Historical Chronicle'}
                </span>
                <h3 className="font-serif font-bold text-3xl text-navy">
                  {isAmharic
                    ? 'የእምነት እና የጽናት ጉዞ፡ የሕይወት ብርሃን ቤተ ክርስቲያን ታሪክ'
                    : 'A Testament of Faith & Survival: The Hiwot Birhan Story'}
                </h3>
                <p className="text-xs text-slate-muted mt-2 italic">
                  {isAmharic
                    ? 'ከስዊድን ሚስዮናውያን የመጀመሪያ አደራ ጀምሮ እስከ ዛሬዋ የባቱ ሕይወት ብርሃን ድረስ'
                    : 'From the early Swedish Pentecostal pioneers in 1960 to Batu Hiwot Birhan today'}
                </p>
              </div>

              {/* Story Narrative Text */}
              <div className="prose prose-slate max-w-none text-slate text-sm sm:text-base leading-relaxed space-y-6">
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-navy first-letter:float-left first-letter:mr-3 first-letter:pr-1">
                  {isAmharic
                    ? 'የኢትዮጵያ የሕይወት ብርሃን ቤተ ክርስቲያን ጥልቅ የእምነት፣ የጽናት እና ከተጋረጠባት ታላቅ ስደት በድል የመትረፍ አስደናቂ ታሪክ አላት። ይህ ታሪክ የተጀመረው በ1960 (እ.ኤ.አ) ወደ ኢትዮጵያ በገቡት የስዊድን ጴንጤቆስጤ ሚስዮናውያን አማካይነት ነው። ከእነዚህም መካከል አንዷ ነርስና ሚስዮናዊት የነበረችው ብሪት በርግፌልት በ1964 (እ.ኤ.አ) በወንዶ ገነት ክሊኒክ በመክፈት ሕዝቡን በሕክምና እያገለገለች የክርስቶስን ወንጌል ማካፈል ጀመረች። በእርሷ አገልግሎት ዙሪያ አነስተኛ የአማኞች ቡድን ተመሠረተ።'
                    : 'The Hiwot Birhan Church of Ethiopia has a deep history of faith and survival. It began with Swedish Pentecostal missionaries who arrived in Ethiopia in 1960. One of them, a missionary and nurse named Brite Bergfelt, opened a clinic in Wondo Genet in 1964 and began sharing the gospel. A small group of believers formed around her work.'}
                </p>

                {/* Pull Quote Box */}
                <div className="bg-cream border-l-4 border-gold p-6 rounded-r-2xl my-6">
                  <p className="font-serif italic text-navy text-base sm:text-lg">
                    {isAmharic
                      ? '«በ1962 ወንጌላዊው አባባ ዱከሞ በጫፓ የመጀመሪያዋን ቤተ ክርስቲያን መሠረተ። የአካባቢው ባለስልጣናት አገልግሎቱን ይቃወሙ ስለነበር፣ የመጀመሪያው የጸሎት ቤት ከእንጨትና ከሳር በሌሊት ተሠራ።»'
                      : '"In 1962, a missionary named Ababa Dukemo established the first Hiwot Birhan church at a place called Chapa. The very first church building was constructed in a traditional style using wood and grass. It had to be built at night because local authorities opposed the work."'}
                  </p>
                  <span className="text-xs text-gold font-bold uppercase tracking-wider block mt-2">
                    — Historical Archives, Chapa (1962)
                  </span>
                </div>

                <p>
                  {isAmharic
                    ? 'በ1975 (እ.ኤ.አ) በሐዋሳ በተካሄደው ዓመታዊ የሚሽን ኮንፈረንስ ላይ፣ ተወካዮች የሕይወት ብርሃን ቤተ ክርስቲያንን እንደ አንድ ወጥና የተዋሃደ አካል አድርገው በይፋ ለማቋቋም ተስማሙ። በዚህም ቤተ ክርስቲያን አንድነቷን አጠናከረች።'
                    : 'The church was officially formed in 1975 at an annual mission conference in Awasa, where representatives agreed to establish the Hiwot Berhan Church as a unified body.'}
                </p>

                {/* Derg Era Alert */}
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                    <h4 className="font-serif font-bold text-base text-red-900">
                      {isAmharic ? 'የደርግ ዘመን ጭካኔ የተሞላበት ስደት (1974 – 1991)' : 'The 17-Year Crucible Under the Derg (1974–1991)'}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-red-900/90 leading-relaxed">
                    {isAmharic
                      ? 'ነገር ግን በ1974 (እ.ኤ.አ) የደርግ መንግሥት ወደ ሥልጣን ሲመጣ ሁሉም ነገር ተለወጠ። መንግሥት በሁሉም ሃይማኖታዊ ቡድኖች ላይ ከባድ ስደት አወጀ። አብያተ ክርስቲያናት ተዘጉ። ሚስዮናውያን ከአገር ተባረሩ። መጋቢያንና ወንጌላውያን ታሰሩ፣ ተገረፉ፣ አንዳንዶቹም ተገደሉ። መጽሐፍ ቅዱሶችና ክርስቲያናዊ መጻሕፍት ተቃጠሉ። ቤተ ክርስቲያን በድብቅ እንድትሰራ ተገደደች፤ አማኞችም ለዓመታት በስውር ተሰብስበው ጸለዩ።'
                      : 'Everything changed in 1974 when the Derg regime came to power. The government launched a severe persecution against all religious groups. Churches were closed. Missionaries were expelled. Pastors and evangelists were imprisoned, tortured, and some were killed. Bibles and Christian books were burned. The church was forced underground, and believers met in secret for years.'}
                  </p>
                </div>

                <p>
                  {isAmharic
                    ? 'በ1991 (እ.ኤ.አ) የደርግ አገዛዝ ከወደቀ በኋላ፣ ቤተ ክርስቲያን ከተደበቀችበት ወጥታ በይፋ ማደግ ጀመረች። ዛሬ የሕይወት ብርሃን ቤተ ክርስቲያን ከ1 ሚሊዮን በላይ አባላት ያሏት በኢትዮጵያ ካሉ ትልልቅ የጴንጤቆስጤ ቤተ እምነቶች አንዷ ናት።'
                    : 'After the Derg regime fell in 1991, the church emerged from hiding and began to grow publicly again. Today, the Hiwot Berhan Church is one of the largest Pentecostal denominations in Ethiopia, with over one million members.'}
                </p>

                {/* Batu Connection Final Anchor */}
                <div className="bg-navy text-white rounded-2xl p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-2 text-gold">
                    <Church className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isAmharic ? 'የባቱ ከተማ እና የሕይወት ብርሃን' : 'Batu Zeway Church Movement'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-xl text-white">
                    {isAmharic
                      ? 'የባቱ ሕይወት ብርሃን ቤተ ክርስቲያን የዚህ ታላቅ እንቅስቃሴ ህያው አካል ናት'
                      : 'Batu Hiwot Birhan Church in Batu Zeway is Part of This Movement'}
                  </h4>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                    {isAmharic
                      ? 'በባቱ (ዝዋይ) የምትገኘው የባቱ ሕይወት ብርሃን ቤተ ክርስቲያን የዚሁ ታላቅ መንፈሳዊ እንቅስቃሴ አካል ናት። ከመጀመሪያዎቹ ሚስዮናውያን የተጀመረውንና በብዙ ዓመታት ስደት ውስጥ በጽናት ያለፈውን ያንኑ የእምነት፣ የጽናት እና የተስፋ ቅርስ ዛሬም በክብር ይዛ ትገኛለች።'
                      : 'Batu Hiwot Birhan Church in Batu Zeway is part of this movement. It carries the same legacy of faith, perseverance, and hope that started with those early missionaries and survived through years of persecution.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERITAGE PILLARS */}
          {activeStoryTab === 'pillars' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Building className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold block">
                  {isAmharic ? 'መሠረት 1' : 'Pillar 1'}
                </span>
                <h3 className="font-serif font-bold text-xl text-navy">
                  {isAmharic ? 'በጨለማ ውስጥ የተሠራ እምነት (ድፍረት)' : 'Courage in the Dark (Sacrificial Faith)'}
                </h3>
                <p className="text-slate text-xs sm:text-sm leading-relaxed">
                  {isAmharic
                    ? 'ልክ እንደ አባባ ዱከሞ በጫፓ በሌሊት ጨለማ ከእንጨትና ከሳር ቤተ መቅደስ እንደሠራው፣ እውነተኛ እምነት ተቃውሞ ሲገጥመው አይፈራም፤ ይልቁንም በእግዚአብሔር ታምኖ ይገነባል።'
                    : 'Like missionary Ababa Dukemo constructing the first chapel at Chapa under the night sky, true biblical faith does not retreat in the face of hostility. We dare to build for Christ regardless of obstacles.'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold block">
                  {isAmharic ? 'መሠረት 2' : 'Pillar 2'}
                </span>
                <h3 className="font-serif font-bold text-xl text-navy">
                  {isAmharic ? 'ምሕረት እና ፈውስ እንደ ወንጌል ምስክርነት' : 'Compassion & Healing Witness'}
                </h3>
                <p className="text-slate text-xs sm:text-sm leading-relaxed">
                  {isAmharic
                    ? 'በነርስ ብሪት በርግፌልት የወንዶ ገነት ክሊኒክ እንደተጀመረው፣ ወንጌል በቃል ብቻ ሳይሆን የታመሙትን በማከም፣ ችግረኞችን በመርዳት እና የክርስቶስን አዳኝ ፍቅር በተግባር በማሳየት ይገለጣል።'
                    : 'Rooted in nurse Brite Bergfelt’s clinic in Wondo Genet, our church unites medical compassion and physical care with the eternal Gospel of Jesus Christ to heal whole persons.'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold block">
                  {isAmharic ? 'መሠረት 3' : 'Pillar 3'}
                </span>
                <h3 className="font-serif font-bold text-xl text-navy">
                  {isAmharic ? 'በስደት የማይጠፋ ጽናት' : 'Unconquerable Perseverance'}
                </h3>
                <p className="text-slate text-xs sm:text-sm leading-relaxed">
                  {isAmharic
                    ? 'ለ17 ዓመታት በደርግ እስራት፣ ግርፋትና መጽሐፍ ቅዱስ ማቃጠል ውስጥ ያለፈችው ቤተ ክርስቲያን ሰንሰለት እና ስደት የእግዚአብሔርን ቃል እንደማያስረው አረጋግጣለች።'
                    : '17 years of underground life proved that prison cells, book burnings, and persecution cannot extinguish God’s Word. What seemed dead in the dark sprang forth as nationwide revival.'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold block">
                  {isAmharic ? 'መሠረት 4' : 'Pillar 4'}
                </span>
                <h3 className="font-serif font-bold text-xl text-navy">
                  {isAmharic ? 'በክርስቶስ ያለ አንድነት እና ራዕይ' : 'Unified Covenant in Christ'}
                </h3>
                <p className="text-slate text-xs sm:text-sm leading-relaxed">
                  {isAmharic
                    ? 'በ1975 በሐዋሳ እንደተደረገው ውህደት፣ ዛሬም በአማርኛ፣ በአፋን ኦሮሞ እና በእንግሊዝኛ በአንድ ልብ የምናመልክ፣ ልዩነታችን በክርስቶስ ፍቅር የታረቀ አንድ ቤተሰብ ነን።'
                    : 'Unified at the 1975 Awasa conference, we stand as one multi-lingual, multi-generational family glorifying Jesus in Amharic, Afaan Oromo, and English across Ethiopia.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. BATU ZEWAY CHURCH SPOTLIGHT */}
      <section id="batu-legacy" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cream rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Story Connection */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/15 text-gold-700 border border-gold/30">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'ባቱ (ዝዋይ)፣ ኦሮሚያ' : 'Batu (Ziway), Ethiopia'}</span>
                </div>

                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-navy leading-tight">
                  {t('history_batu_connection_title')}
                </h2>

                <p className="text-slate text-sm sm:text-base leading-relaxed">
                  {t('history_batu_connection_desc')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-navy">
                        {isAmharic ? 'ባለብዙ ቋንቋ አምልኮ' : 'Multilingual Fellowship'}
                      </strong>
                      <span className="text-[11px] text-slate-muted">
                        {isAmharic ? 'በአማርኛ እና በአፋን ኦሮሞ ሳምንታዊ አገልግሎቶች' : 'Weekly services in Amharic & Afaan Oromo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-navy">
                        {isAmharic ? 'የስምጥ ሸለቆ ወንጌል አደራ' : 'Rift Valley Evangelism'}
                      </strong>
                      <span className="text-[11px] text-slate-muted">
                        {isAmharic ? 'በዝዋይ ሀይቅ ዙሪያ ያሉትን ሁሉ በወንጌል መድረስ' : 'Reaching the lakeside cities & rural towns'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-navy">
                        {isAmharic ? 'የምሕረትና የሕፃናት ድጋፍ' : 'Mercy & Compassion'}
                      </strong>
                      <span className="text-[11px] text-slate-muted">
                        {isAmharic ? 'ጧሪ የሌላቸውንና ወላጅ አልባ ሕፃናትን መንከባከብ' : 'Caring for widows, youth & local families'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-navy">
                        {isAmharic ? 'አዲሱ የ2,500 ምዕመናን መቅደስ' : '2,500+ Seat Sanctuary'}
                      </strong>
                      <span className="text-[11px] text-slate-muted">
                        {isAmharic ? 'ለቀጣዩ ትውልድ ቋሚ ቤተ መቅደስ መገንባት' : 'Expanding for thousands of future worshippers'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/building-fund"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-hover text-navy font-bold text-xs transition-all shadow-md"
                  >
                    <span>{t('fund_badge')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Church Photo Showcase */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-2 border-gold/40 group bg-navy">
                  <Image
                    src="/images/church_building.jpg"
                    alt="BATU YEHIYWOT BERHAN CHURCH Front View"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/40 to-transparent flex flex-col justify-end p-6 text-left">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                      {isAmharic ? 'የባቱ ከተማ መቅደስ' : 'Sanctuary in Batu (Ziway)'}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-white mt-1">
                      BATU YEHIYWOT BERHAN CHURCH
                    </h3>
                    <p className="text-white/80 text-xs mt-1">
                      {isAmharic
                        ? 'በዋናው ጎዳና ላይ የሚገኝ፣ ለዝዋይ ሀይቅ ቅርብ የሆነ ዘመናዊ መቅደስ'
                        : 'Central Avenue, Batu (Ziway) — Carrying the 1960 legacy into tomorrow'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PASTORAL LEADERSHIP SHOWCASE */}
      <section id="leadership" className="py-20 bg-cream/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              {isAmharic ? 'የመንጋው እረኞች' : 'Spiritual Shepherds'}
            </span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-navy">
              {isAmharic ? 'የመጋቢያንና የአመራር ቡድን' : 'Meet Our Pastoral Leadership'}
            </h2>
            <p className="text-slate text-sm leading-relaxed">
              {isAmharic
                ? 'በጸሎት፣ በቃሉ ትምህርት እና በፍቅር ቤተ ክርስቲያንን የሚያገለግሉ ታማኝ አገልጋዮች።'
                : 'Servant leaders dedicated to prayer, pastoral care, and sound biblical teaching in Batu.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lead Pastor */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="relative h-72 w-full bg-navy">
                <Image
                  src="/images/pastor_zerfu.png"
                  alt="Pastor Zerfu"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-lg text-navy">
                  {isAmharic ? 'ፓስተር ዘርፉ' : 'Pastor Zerfu'}
                </h3>
                <p className="text-gold text-xs font-semibold uppercase tracking-wider mt-0.5">
                  {isAmharic ? 'ዋና መጋቢ' : 'Lead Pastor'}
                </p>
                <p className="text-slate text-xs mt-3 leading-relaxed">
                  {isAmharic
                    ? 'ስብከትን፣ ራዕይንና የመንጋውን ክብካቤ በጸጋና በእግዚአብሔር ቃል እውነት የሚመሩ።'
                    : 'Leading preaching, vision, and pastoral care with a passion for transformative gospel grace and biblical exposition.'}
                </p>
              </div>
            </div>

            {/* Associate Pastor */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="relative h-72 w-full bg-navy-light flex items-center justify-center text-white">
                <Church className="w-16 h-16 text-gold/60" />
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-lg text-navy">
                  {isAmharic ? 'ረዳት መጋቢ' : 'Associate Pastor'}
                </h3>
                <p className="text-gold text-xs font-semibold uppercase tracking-wider mt-0.5">
                  {isAmharic ? 'ደቀ መዛሙርትና ወንጌል ስርጭት' : 'Discipleship & Outreach'}
                </p>
                <p className="text-slate text-xs mt-3 leading-relaxed">
                  {isAmharic
                    ? 'የአነስተኛ ቡድኖችን፣ የቤተሰብ ህብረቶችን እና የወንጌል ስርጭት ተልእኮዎችን በከተማችን የሚያስተባብሩ።'
                    : 'Overseeing small group ministries, family mentorship, and evangelism across the surrounding towns.'}
                </p>
              </div>
            </div>

            {/* Youth & Campus Pastor */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="relative h-72 w-full bg-navy-light flex items-center justify-center text-white">
                <Users className="w-16 h-16 text-gold/60" />
              </div>
              <div className="p-6">
                <h3 className="font-serif font-bold text-lg text-navy">
                  {isAmharic ? 'የወጣቶችና ዩኒቨርሲቲ መጋቢ' : 'Youth & Campus Pastor'}
                </h3>
                <p className="text-gold text-xs font-semibold uppercase tracking-wider mt-0.5">
                  {isAmharic ? 'ቀጣዩ ትውልድ አገልግሎት' : 'Next Generation Ministry'}
                </p>
                <p className="text-slate text-xs mt-3 leading-relaxed">
                  {isAmharic
                    ? 'ወጣቶችንና የዩኒቨርሲቲ ተማሪዎችን በእምነትና በክርስቲያናዊ ጥበብ የሚያነጹ።'
                    : 'Engaging youth and college students with apologetics, mentorship, and creative arts in Batu.'}
                </p>
              </div>
            </div>
          </div>

          {/* Church Council & Elder Board */}
          <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border-2 border-gold/30 group">
                  <Image
                    src="/images/church_leadership.jpg"
                    alt="BATU YEHIYWOT BERHAN CHURCH Leadership & Board of Elders"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  {isAmharic ? 'አስተዳደር እና አመራር' : 'Governance & Stewardship'}
                </span>
                <h3 className="font-serif font-bold text-2xl text-navy">
                  {isAmharic ? 'የሽማግሌዎች ጉባኤ እና የስራ አመራር ቦርድ' : 'Board of Elders & Ministry Council'}
                </h3>
                <p className="text-slate text-xs sm:text-sm leading-relaxed">
                  {isAmharic
                    ? 'ቤተ ክርስቲያናችን በእግዚአብሔር ቃል ላይ የጸኑ ሽማግሌዎችና መሪዎች ባሉበት ቦርድ የምትመራ ሲሆን፣ ዶክትሪናዊ ንጽህናን፣ መንፈሳዊ ተጠያቂነትንና ታማኝ አስተዳደርን ያረጋግጣሉ።'
                    : 'Our church is guided by faithful elders and council leaders who seek God in prayer, oversee ministry vision, uphold doctrinal purity, and steward resources with unwavering biblical integrity.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-navy">
                  <Shield className="w-4 h-4 text-gold" />
                  <span>
                    {isAmharic
                      ? 'ባቱን እና አካባቢውን በትህትና እና በታማኝነት ማገልገል'
                      : 'Serving BATU / ZIWAY with humility and biblical devotion'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STATEMENT OF FAITH / CORE DOCTRINE */}
      <section id="beliefs" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">
              {t('beliefs_tag')}
            </span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-navy">
              {t('beliefs_title')}
            </h2>
            <p className="text-slate text-sm leading-relaxed max-w-2xl mx-auto">
              {t('beliefs_subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-cream/50">
              <h3 className="font-serif font-bold text-lg text-navy mb-2 flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-gold" />
                <span>{t('belief_bible_title')}</span>
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('belief_bible_desc')} {isAmharic
                  ? '66ቱን የብሉይና የሐዲስ ኪዳን መጻሕፍት የእግዚአብሔር እስትንፋስ ያለባቸው እና ለመዳንና ለቅድስና ሕይወት በቂ እንደሆኑ እናምናለን።'
                  : 'We hold to the 66 canonical books of the Old and New Testaments as God-breathed, without error in original manuscripts, and fully sufficient for salvation and holy living.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-cream/50">
              <h3 className="font-serif font-bold text-lg text-navy mb-2 flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-gold" />
                <span>{t('belief_god_title')}</span>
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('belief_god_desc')} {isAmharic
                  ? 'በአብ፣ በወልድ እና በመንፈስ ቅዱስ ለዘላለም የሚኖር አንድ አምላክ እንዳለ እናምናለን።'
                  : 'One in essence, co-equal in power and glory, executing distinct but harmonious roles in creation, providence, and redemption.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-cream/50">
              <h3 className="font-serif font-bold text-lg text-navy mb-2 flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-gold" />
                <span>{t('belief_salvation_title')}</span>
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('belief_salvation_desc')} {isAmharic
                  ? 'በኢየሱስ ክርስቶስ የመስቀል ላይ ቤዛነት እና በትንሳኤው በማመን የሚገኝ የጸጋ ስጦታ ነው።'
                  : 'Through Christ\'s substitutionary death on the cross and triumphant bodily resurrection, repentance and faith in Him alone grants complete forgiveness of sins and eternal life.'}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-cream/50">
              <h3 className="font-serif font-bold text-lg text-navy mb-2 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-gold" />
                <span>{t('belief_hope_title')}</span>
              </h3>
              <p className="text-slate text-xs leading-relaxed">
                {t('belief_hope_desc')} {isAmharic
                  ? 'ክርስቶስ በክብርና በስልጣን ዳግም ተመልሶ እንደሚመጣ በሙሉ ተስፋ እንጠባበቃለን።'
                  : 'Christ will return personally, visibly, and bodily to establish His eternal kingdom in justice, peace, and glory.'}
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs transition-all shadow-md"
            >
              <span>{isAmharic ? 'ስለ እምነታችን ጥያቄ አለዎት? ያነጋግሩን' : 'Have Questions About Our Faith? Contact Us'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
