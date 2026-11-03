'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { api } from '@/lib/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface ChurchEvent {
  id: string;
  title: string;
  category: 'worship' | 'youth' | 'outreach' | 'conference';
  date: string;
  time: string;
  location: string;
  description: string;
  speaker?: string;
  capacity?: string;
}

export default function EventsPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  // Registration Modal Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const churchEvents: ChurchEvent[] = [
    {
      id: 'e1',
      title: 'Annual Spiritual Renewal & Revival Conference',
      category: 'conference',
      date: 'October 24 – 26, 2026',
      time: '9:00 AM – 4:00 PM Daily',
      location: 'Main Sanctuary, Batu (Ziway)',
      description:
        'Three days of powerful prayer, worship, and biblical exposition featuring guest keynote pastors and gospel ministers from across Ethiopia.',
      speaker: 'Pastor Zerfu & Guest Speakers',
      capacity: '2,500 Attendees',
    },
    {
      id: 'e2',
      title: 'Youth & Campus Encounter Weekend 2026',
      category: 'youth',
      date: 'November 7, 2026',
      time: '2:00 PM – 7:30 PM',
      location: 'Youth Center, Batu',
      description:
        'A dedicated gathering for high school and university youth focused on living with bold faith, biblical purity, and kingdom purpose.',
      speaker: 'Pastor Zerfu & Youth Leaders',
      capacity: '400 Youth',
    },
    {
      id: 'e3',
      title: 'Ziway Community Mercy & Compassion Outreach',
      category: 'outreach',
      date: 'November 21, 2026',
      time: '8:30 AM – 1:00 PM',
      location: 'Batu Community Center',
      description:
        'Hands-on outreach providing food parcels, free medical triage consultations, and gospel hope to vulnerable families in Batu.',
      speaker: 'Mercy Ministry Team',
      capacity: 'Open to All Volunteers',
    },
    {
      id: 'e4',
      title: 'Christmas Candlelight & Carol Celebration',
      category: 'worship',
      date: 'January 6, 2027 (Genna)',
      time: '5:30 PM – 8:30 PM',
      location: 'Main Sanctuary',
      description:
        'Joyous Christmas celebration celebrating the birth of our Savior Jesus Christ with choir performances, orchestral praise, and communion.',
      speaker: 'Full Pastoral Team',
      capacity: 'All Families Welcome',
    },
  ];

  const filtered =
    activeFilter === 'all'
      ? churchEvents
      : churchEvents.filter((e) => e.category === activeFilter);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!name.trim() || !email.trim()) {
      setRegError('Please provide your name and email address.');
      return;
    }

    setIsSubmitting(true);
    setRegError(null);

    const res = await api.registerEvent({
      event_title: selectedEvent.title,
      participant_name: name,
      participant_email: email,
      participant_phone: phone,
      notes: notes,
    });

    setIsSubmitting(false);

    if (res.success) {
      setRegSuccess(true);
    } else {
      setRegError(res.message || 'Registration failed. Please try again.');
    }
  };

  const closeRegistration = () => {
    setSelectedEvent(null);
    setRegSuccess(false);
    setRegError(null);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-navy-dark text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/20 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-gold/40">
            Church Calendar
          </span>
          <h1 className="font-serif font-bold text-3xl md:text-5xl text-white tracking-tight max-w-3xl mx-auto">
            Upcoming Events & Gatherings
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Join us for life-transforming conferences, youth rallies, community service days, and seasonal celebrations in Batu.
          </p>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'conference', label: 'Conferences' },
              { id: 'youth', label: 'Youth & Campus' },
              { id: 'worship', label: 'Worship & Celebrations' },
              { id: 'outreach', label: 'Outreach & Mercy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-slate border border-slate-200 hover:border-gold/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      {event.category}
                    </span>
                    <span className="text-xs text-slate-muted font-medium">
                      {event.capacity}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-navy mb-3">
                    {event.title}
                  </h3>

                  <p className="text-slate text-xs leading-relaxed mb-6">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-muted border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-gold shrink-0" />
                      <strong className="text-navy">{event.date}</strong>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-gold shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-muted">Free Admission</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="px-5 py-2.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-sm"
                  >
                    Register to Attend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Modal Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={closeRegistration}
              className="absolute top-5 right-5 p-2 rounded-full text-slate hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {regSuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-navy mb-2">
                  Registration Confirmed!
                </h3>
                <p className="text-slate text-xs leading-relaxed mb-6">
                  You are registered for <strong>{selectedEvent.title}</strong>. A confirmation email has been logged. We look forward to worshipping with you in Batu!
                </p>
                <button
                  type="button"
                  onClick={closeRegistration}
                  className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="mb-5">
                  <span className="text-[11px] font-bold text-gold uppercase tracking-wider">
                    Event Registration
                  </span>
                  <h3 className="font-serif font-bold text-xl text-navy mt-1">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-slate-muted mt-1">
                    {selectedEvent.date} • {selectedEvent.location}
                  </p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Martha Haile"
                      className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. martha@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +251 9..."
                      className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate mb-1">
                      Notes or Special Needs (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any questions or prayer needs..."
                      className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-gold"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="px-4 py-2 text-xs font-semibold text-slate hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Confirm My Attendance'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
