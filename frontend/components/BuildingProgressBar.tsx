'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CampaignStats } from '@/lib/types';
import { useLanguage } from './LanguageContext';
import { TrendingUp, Award, CheckCircle2 } from 'lucide-react';

export const BuildingProgressBar: React.FC<{ currency?: 'ETB' | 'USD'; compact?: boolean }> = ({
  currency = 'ETB',
  compact = false,
}) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<CampaignStats>({
    goal_usd: 500000,
    raised_usd: 315000,
    goal_etb: 60000000,
    raised_etb: 37800000,
    percent_usd: 63,
    percent_etb: 63,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getCampaign().then((data) => {
      if (mounted) {
        const pUsd = Math.min(100, Math.round((data.raised_usd / data.goal_usd) * 100));
        const pEtb = Math.min(100, Math.round((data.raised_etb / data.goal_etb) * 100));
        setStats({
          ...data,
          percent_usd: pUsd,
          percent_etb: pEtb,
        });
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const percentage = currency === 'ETB' ? stats.percent_etb || 63 : stats.percent_usd || 63;
  const raisedText =
    currency === 'ETB'
      ? `${stats.raised_etb.toLocaleString()} ETB`
      : `$${stats.raised_usd.toLocaleString()} USD`;
  const goalText =
    currency === 'ETB'
      ? `${stats.goal_etb.toLocaleString()} ETB`
      : `$${stats.goal_usd.toLocaleString()} USD`;

  if (compact) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
        <div className="flex justify-between items-center text-xs font-semibold text-white mb-2">
          <span>{t('fund_raised_etb')}: <strong className="text-gold">{raisedText}</strong></span>
          <span className="text-gold font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-navy/60 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
          <div
            className="bg-gradient-to-r from-gold to-yellow-400 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[11px] text-white/70 mt-2">
          <span>Phase 2 Construction</span>
          <span>Goal: {goalText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/10 text-gold-600 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Building Progress
          </span>
          <h3 className="font-serif font-bold text-xl md:text-2xl text-navy">
            BATU Church Sanctuary Expansion
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-muted block">Completion</span>
            <span className="font-serif font-extrabold text-2xl md:text-3xl text-gold">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-4 shadow-inner">
        <div
          className="bg-gradient-to-r from-gold-600 via-gold to-yellow-400 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Key Metric Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div className="bg-cream p-3.5 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-muted block">Raised (ETB)</span>
          <strong className="text-navy font-bold text-sm md:text-base">
            {stats.raised_etb.toLocaleString()} Br
          </strong>
        </div>
        <div className="bg-cream p-3.5 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-muted block">Campaign Goal (ETB)</span>
          <strong className="text-navy font-bold text-sm md:text-base">
            {stats.goal_etb.toLocaleString()} Br
          </strong>
        </div>
        <div className="bg-cream p-3.5 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-muted block">Raised (USD)</span>
          <strong className="text-navy font-bold text-sm md:text-base">
            ${stats.raised_usd.toLocaleString()}
          </strong>
        </div>
        <div className="bg-cream p-3.5 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-muted block">Campaign Goal (USD)</span>
          <strong className="text-navy font-bold text-sm md:text-base">
            ${stats.goal_usd.toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-muted border-t border-slate-100 pt-4">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Audited by Board of Trustees
        </span>
        <span>Ziway / Batu, Ethiopia</span>
      </div>
    </div>
  );
};
