'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Donation,
  CampaignStats,
  ContactMessage,
  EventRegistration,
  Post,
  AdminStats,
  SystemHealth,
} from '@/lib/types';
import {
  Lock,
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  FileText,
  Inbox,
  Users,
  Activity,
  LogOut,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw,
  KeyRound,
  Download,
  ShieldCheck,
  AlertCircle,
  User,
} from 'lucide-react';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'donations' | 'campaign' | 'posts' | 'messages' | 'events' | 'system'
  >('overview');

  // Login form state (empty defaults to prevent credential autofill)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaign, setCampaign] = useState<CampaignStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [events, setEvents] = useState<EventRegistration[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Password change state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passFeedback, setPassFeedback] = useState<string | null>(null);

  // Manual donation form modal
  const [showManualDonation, setShowManualDonation] = useState(false);
  const [mName, setMName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mAmount, setMAmount] = useState<number>(1000);
  const [mCurrency, setMCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [mProvider, setMProvider] = useState('cbe');
  const [mRef, setMRef] = useState('');

  // Donation Table Filters & Actions
  const [donationFilter, setDonationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // New Post form modal
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postAuthor, setPostAuthor] = useState('Pastor Zerfu');
  const [postCategory, setPostCategory] = useState('sermon_poster');
  const [postImage, setPostImage] = useState('/images/sermon_poster.png');
  const [postContent, setPostContent] = useState('');

  // Check saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem('hiwot_admin_token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  // Fetch data when token is set
  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const [st, don, camp, pst, msg, evt, hlt] = await Promise.all([
        api.getAdminStats(token).catch(() => null),
        api.getAdminDonations(token).catch(() => []),
        api.getCampaign().catch(() => null),
        api.getPosts().catch(() => []),
        api.getAdminMessages(token).catch(() => []),
        api.getAdminEvents(token).catch(() => []),
        api.getSystemHealth(token).catch(() => null),
      ]);
      if (st) setStats(st);
      setDonations(don);
      if (camp) setCampaign(camp);
      setPosts(pst);
      setMessages(msg);
      setEvents(evt);
      if (hlt) setHealth(hlt);
    } catch (err) {
      console.error(err);
    }
    setLoadingData(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    const res = await api.adminLogin({ username, password });
    setLoggingIn(false);

    if (res.token) {
      setToken(res.token);
      localStorage.setItem('hiwot_admin_token', res.token);
    } else {
      setLoginError(res.error || 'Invalid administrator username or password.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('hiwot_admin_token');
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-cream">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-navy text-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-navy">
              IT Admin Portal
            </h2>
            <p className="text-xs text-slate-muted mt-1">
              BATU YEHIYWOT BERHAN CHURCH Management Suite
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating...' : 'Sign In to IT Portal'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-muted">
            <span>Default: </span>
            <code className="bg-slate-100 px-1 py-0.5 rounded text-navy font-mono">admin</code> /{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-navy font-mono">admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Admin Navigation Header */}
      <div className="bg-navy text-white px-6 py-4 border-b border-navy-light flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold text-navy flex items-center justify-center font-bold">
            HB
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-white">
              IT Admin Suite
            </h1>
            <span className="text-[10px] text-gold uppercase tracking-wider font-semibold">
              Batu Yehiywot Berhan Church
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAllData}
            className="p-2 text-white/80 hover:text-gold hover:bg-white/10 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'donations', label: 'Donations & Audit', icon: DollarSign },
            { id: 'campaign', label: 'Building Stats', icon: TrendingUp },
            { id: 'posts', label: 'Pastor Media', icon: FileText },
            { id: 'messages', label: `Messages (${messages.length})`, icon: Inbox },
            { id: 'events', label: `Events (${events.length})`, icon: Users },
            { id: 'system', label: 'Health & Security', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-slate hover:text-navy hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-muted block">Total Raised (ETB)</span>
                <strong className="font-serif font-bold text-2xl text-navy mt-1 block">
                  {campaign?.raised_etb.toLocaleString() || '37,800,000'} Br
                </strong>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  {campaign?.percent_etb || 63}% of 60M ETB Goal
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-muted block">Total Raised (USD)</span>
                <strong className="font-serif font-bold text-2xl text-navy mt-1 block">
                  ${campaign?.raised_usd.toLocaleString() || '315,000'}
                </strong>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  {campaign?.percent_usd || 63}% of $500K Goal
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-muted block">Prayer & Contact Messages</span>
                <strong className="font-serif font-bold text-2xl text-navy mt-1 block">
                  {messages.length}
                </strong>
                <span className="text-[11px] text-gold font-semibold mt-1 block">
                  {messages.filter((m) => m.status === 'unread').length} Unread
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-muted block">Event Registrations</span>
                <strong className="font-serif font-bold text-2xl text-navy mt-1 block">
                  {events.length}
                </strong>
                <span className="text-[11px] text-slate-muted font-semibold mt-1 block">
                  Across Upcoming Events
                </span>
              </div>
            </div>

            {/* Recent Donations Mini Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-serif font-bold text-base text-navy mb-4">
                Recent Contributions & Giving
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-muted font-bold">
                      <th className="pb-3">Donor</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Channel</th>
                      <th className="pb-3">Reference</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {donations.slice(0, 5).map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-navy">{d.donor_name}</td>
                        <td className="py-3">
                          {d.amount} {d.currency}
                        </td>
                        <td className="py-3 uppercase font-semibold text-gold">{d.payment_provider}</td>
                        <td className="py-3 font-mono text-[11px] text-slate-muted">
                          {d.transaction_ref || 'N/A'}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DONATIONS & FINANCIAL AUDIT */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy">Financial Audit Registry</h3>
                <p className="text-xs text-slate-muted">All online and offline church giving records (Non-destructive financial ledger)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const filtered = donations.filter((d) => {
                      if (statusFilter !== 'all' && (d.status || 'pending') !== statusFilter) return false;
                      if (currencyFilter !== 'all' && d.currency !== currencyFilter) return false;
                      if (donationFilter.trim()) {
                        const q = donationFilter.toLowerCase();
                        return (
                          d.donor_name?.toLowerCase().includes(q) ||
                          d.donor_email?.toLowerCase().includes(q) ||
                          d.transaction_ref?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    });
                    const headers = ['ID', 'Donor Name', 'Email', 'Amount', 'Currency', 'Channel', 'Reference', 'Status', 'Date'];
                    const rows = filtered.map((d) => [
                      d.id,
                      `"${(d.donor_name || '').replace(/"/g, '""')}"`,
                      `"${(d.donor_email || '').replace(/"/g, '""')}"`,
                      d.amount,
                      d.currency,
                      d.payment_provider,
                      `'${d.transaction_ref || ''}`,
                      d.status || 'pending',
                      d.created_at || ''
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
                    const link = document.createElement('a');
                    link.setAttribute('href', encodeURI(csvContent));
                    link.setAttribute('download', `church_donations_audit_${new Date().toISOString().slice(0, 10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualDonation(true)}
                  className="px-4 py-2 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Offline Bank Giving</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <input
                type="text"
                placeholder="Search donor name, email, or tx_ref..."
                value={donationFilter}
                onChange={(e) => setDonationFilter(e.target.value)}
                className="px-3.5 py-2 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-gold"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-cream rounded-xl border border-slate-200 font-medium"
              >
                <option value="all">All Payment Statuses</option>
                <option value="completed">Completed / Settled</option>
                <option value="pending">Pending Verification</option>
                <option value="verification_required">Verification Required (Mismatch)</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded / Reversal</option>
              </select>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="px-3 py-2 bg-cream rounded-xl border border-slate-200 font-medium"
              >
                <option value="all">All Currencies (ETB & USD)</option>
                <option value="ETB">ETB (Ethiopian Birr)</option>
                <option value="USD">USD (International)</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-muted font-bold">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Donor Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Channel</th>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations
                    .filter((d) => {
                      if (statusFilter !== 'all' && (d.status || 'pending') !== statusFilter) return false;
                      if (currencyFilter !== 'all' && d.currency !== currencyFilter) return false;
                      if (donationFilter.trim()) {
                        const q = donationFilter.toLowerCase();
                        return (
                          d.donor_name?.toLowerCase().includes(q) ||
                          d.donor_email?.toLowerCase().includes(q) ||
                          d.transaction_ref?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 text-slate-muted font-mono">#{d.id}</td>
                        <td className="py-3 font-bold text-navy">{d.donor_name}</td>
                        <td className="py-3 text-slate-muted">{d.donor_email}</td>
                        <td className="py-3 font-semibold">
                          {d.amount} {d.currency}
                        </td>
                        <td className="py-3 uppercase text-gold font-bold">{d.payment_provider}</td>
                        <td className="py-3 font-mono text-[11px]">{d.transaction_ref}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              d.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : d.status === 'verification_required'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : d.status === 'refunded' || d.status === 'refund_initiated'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {d.status || 'pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            {d.status !== 'completed' && d.id && (
                              <button
                                type="button"
                                disabled={verifyingId === d.id}
                                onClick={async () => {
                                  if (!token || !d.id) return;
                                  setVerifyingId(d.id);
                                  try {
                                    const res = await api.adminVerifyDonation(token, d.id);
                                    if (res.verified) {
                                      alert('Payment authoritatively verified and settled with provider!');
                                    } else {
                                      alert(res.message || res.error || 'Provider indicates payment not yet completed.');
                                    }
                                    loadAllData();
                                  } catch (err: any) {
                                    alert('Verification error: ' + err.message);
                                  }
                                  setVerifyingId(null);
                                }}
                                title="Authoritatively verify with payment network"
                                className="px-2 py-1 bg-navy hover:bg-gold text-white hover:text-navy rounded text-[10px] font-bold transition-all disabled:opacity-50"
                              >
                                {verifyingId === d.id ? 'Checking...' : 'Verify'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                if (d.id && confirm('Archive this donation record? (Financial history will be safely preserved)')) {
                                  await api.deleteDonation(token, d.id);
                                  loadAllData();
                                }
                              }}
                              title="Soft archive donation"
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BUILDING CAMPAIGN LIVE STATS */}
        {activeTab === 'campaign' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-2xl space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">Building Campaign Targets</h3>
              <p className="text-xs text-slate-muted">Update live goal and raised amounts</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!campaign) return;
                await api.updateCampaign(token, campaign);
                alert('Campaign progress updated successfully!');
                loadAllData();
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate mb-1">Goal (ETB)</label>
                  <input
                    type="number"
                    value={campaign?.goal_etb || 60000000}
                    onChange={(e) =>
                      setCampaign(
                        (prev) => ({ ...prev!, goal_etb: parseFloat(e.target.value) || 0 } as any)
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate mb-1">Raised (ETB)</label>
                  <input
                    type="number"
                    value={campaign?.raised_etb || 37800000}
                    onChange={(e) =>
                      setCampaign(
                        (prev) => ({ ...prev!, raised_etb: parseFloat(e.target.value) || 0 } as any)
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate mb-1">Goal (USD)</label>
                  <input
                    type="number"
                    value={campaign?.goal_usd || 500000}
                    onChange={(e) =>
                      setCampaign(
                        (prev) => ({ ...prev!, goal_usd: parseFloat(e.target.value) || 0 } as any)
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate mb-1">Raised (USD)</label>
                  <input
                    type="number"
                    value={campaign?.raised_usd || 315000}
                    onChange={(e) =>
                      setCampaign(
                        (prev) => ({ ...prev!, raised_usd: parseFloat(e.target.value) || 0 } as any)
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all"
              >
                Save Live Campaign Numbers
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PASTOR MEDIA & POSTS */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy">Pastor Media & Sermon Posters</h3>
                <p className="text-xs text-slate-muted">Published website news and teaching media</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/posts"
                  className="px-4 py-2 bg-gold hover:bg-navy text-navy hover:text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Image Resizer Studio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowNewPost(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate font-bold text-xs rounded-xl transition-all"
                >
                  Quick Post
                </button>
              </div>
            </div>

            {/* Poster Studio Callout */}
            <div className="bg-gradient-to-r from-navy to-navy-dark text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gold/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gold bg-gold/20 px-2 py-0.5 rounded-full border border-gold/40">
                    New Feature
                  </span>
                  <strong className="text-sm font-serif font-bold text-white">
                    Interactive Image Crop & Custom Resizer Studio
                  </strong>
                </div>
                <p className="text-xs text-white/80 max-w-xl">
                  Select any photo from your computer, choose 16:9 Banner, 4:3 Classic, or 1:1 Square, zoom and pan the subject, set custom dimensions, and publish instantly!
                </p>
              </div>
              <Link
                href="/admin/posts"
                className="px-4 py-2.5 bg-gold text-navy font-bold text-xs rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 self-start shrink-0"
              >
                <span>Launch Studio</span>
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-cream/40 flex gap-4">
                  {p.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-navy-light border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                          {p.category.replace('_', ' ')}
                        </span>
                        {p.is_featured === 1 && (
                          <span className="text-[9px] bg-navy text-white px-1.5 py-0.5 rounded font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-navy mt-1 line-clamp-2">{p.title}</h4>
                      <p className="text-xs text-slate-muted mt-1 line-clamp-2">{p.content}</p>
                      <span className="text-[11px] text-slate block mt-1.5 font-medium">By {p.author}</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Delete post?')) {
                            await api.deletePost(token, p.id);
                            loadAllData();
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MESSAGES & PRAYER REQUESTS */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-navy">Contact & Prayer Inbox</h3>
              <p className="text-xs text-slate-muted">Visitor inquiries and prayer needs</p>
            </div>

            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border text-xs ${
                    m.status === 'unread' ? 'bg-amber-50/50 border-gold/40' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-navy">{m.name}</strong>
                      <span className="text-slate-muted">({m.email})</span>
                      {m.phone && <span className="text-slate-muted">• {m.phone}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await api.updateMessageStatus(
                            token,
                            m.id,
                            m.status === 'unread' ? 'read' : 'unread'
                          );
                          loadAllData();
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate text-[11px] font-semibold"
                      >
                        Mark as {m.status === 'unread' ? 'Read' : 'Unread'}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Delete message?')) {
                            await api.deleteMessage(token, m.id);
                            loadAllData();
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                    {m.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EVENT REGISTRATIONS */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-serif font-bold text-lg text-navy mb-4">Event Attendee Registrations</h3>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-muted font-bold">
                    <th className="pb-3">Event</th>
                    <th className="pb-3">Participant</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-navy">{e.event_title}</td>
                      <td className="py-3">{e.participant_name}</td>
                      <td className="py-3 text-slate-muted">{e.participant_email}</td>
                      <td className="py-3">{e.participant_phone || 'N/A'}</td>
                      <td className="py-3 text-slate-muted">{e.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: SYSTEM HEALTH & SECURITY */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy">System Health Diagnostics</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 bg-cream rounded-xl">
                  <span className="text-slate-muted">System Status:</span>
                  <strong className="text-emerald-600 font-bold uppercase">{health?.status || 'HEALTHY'}</strong>
                </div>
                <div className="flex justify-between p-2.5 bg-cream rounded-xl">
                  <span className="text-slate-muted">Uptime:</span>
                  <strong className="text-navy">{health ? `${Math.round(health.uptime_seconds / 60)} minutes` : 'Active'}</strong>
                </div>
                <div className="flex justify-between p-2.5 bg-cream rounded-xl">
                  <span className="text-slate-muted">RAM Usage:</span>
                  <strong className="text-navy">{health?.memory_usage_mb || 32} MB</strong>
                </div>
                <div className="flex justify-between p-2.5 bg-cream rounded-xl">
                  <span className="text-slate-muted">Node Version:</span>
                  <strong className="text-navy">{health?.node_version || 'v24.15.0'}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-serif font-bold text-lg text-navy">Change Admin Password</h3>
              {passFeedback && (
                <div className="p-2.5 bg-blue-50 text-blue-800 text-xs rounded-lg">
                  {passFeedback}
                </div>
              )}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await api.changePassword(token, currPass, newPass);
                  if (res.success) {
                    setPassFeedback('Password changed successfully.');
                    setCurrPass('');
                    setNewPass('');
                  } else {
                    setPassFeedback(res.error || 'Password update failed.');
                  }
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate font-semibold mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    className="w-full px-3 py-2 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate font-semibold mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 bg-cream rounded-xl border border-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy hover:bg-gold text-white hover:text-navy font-bold rounded-xl transition-all"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Manual Donation Entry Modal */}
      {showManualDonation && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-navy">Log Offline Contribution</h3>
            <div>
              <label className="block font-semibold mb-1">Donor Name *</label>
              <input
                type="text"
                value={mName}
                onChange={(e) => setMName(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Donor Email *</label>
              <input
                type="email"
                value={mEmail}
                onChange={(e) => setMEmail(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Amount</label>
                <input
                  type="number"
                  value={mAmount}
                  onChange={(e) => setMAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Currency</label>
                <select
                  value={mCurrency}
                  onChange={(e) => setMCurrency(e.target.value as any)}
                  className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
                >
                  <option value="ETB">ETB (Birr)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Channel / Bank</label>
              <select
                value={mProvider}
                onChange={(e) => setMProvider(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              >
                <option value="cbe">CBE Direct Account</option>
                <option value="telebirr">Telebirr</option>
                <option value="coop">Coopbank</option>
                <option value="awash">Awash Bank</option>
                <option value="cash">Cash / Sunday Envelope</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Bank Slip Reference</label>
              <input
                type="text"
                value={mRef}
                onChange={(e) => setMRef(e.target.value)}
                placeholder="e.g. CBE-SLIP-10294"
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowManualDonation(false)}
                className="px-4 py-2 text-slate hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!mName || !mEmail) return;
                  await api.createManualDonation(token, {
                    donor_name: mName,
                    donor_email: mEmail,
                    amount: mAmount,
                    currency: mCurrency,
                    payment_provider: mProvider,
                    transaction_ref: mRef,
                  });
                  setShowManualDonation(false);
                  loadAllData();
                }}
                className="px-5 py-2 bg-navy text-white hover:bg-gold hover:text-navy rounded-xl font-bold"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-navy">Publish Sermon Poster / News</h3>
            <div>
              <label className="block font-semibold mb-1">Title</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Author</label>
              <input
                type="text"
                value={postAuthor}
                onChange={(e) => setPostAuthor(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              >
                <option value="sermon_poster">Sermon Poster</option>
                <option value="pastor_message">Pastor's Message</option>
                <option value="building_update">Building Update</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Image URL</label>
              <input
                type="text"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Description / Content</label>
              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-2.5 bg-cream rounded-xl border border-slate-200"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-slate hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!postTitle || !postContent) return;
                  await api.createPost(token, {
                    title: postTitle,
                    author: postAuthor,
                    category: postCategory,
                    image_url: postImage,
                    content: postContent,
                  });
                  setShowNewPost(false);
                  loadAllData();
                }}
                className="px-5 py-2 bg-navy text-white hover:bg-gold hover:text-navy rounded-xl font-bold"
              >
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
