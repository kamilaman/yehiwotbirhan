import { Donation, CampaignStats, Post, ContactMessage, EventRegistration, AdminStats, SystemHealth } from './types';

const API_BASE = '/api';

export const api = {
  // Campaign & Stats
  async getCampaign(): Promise<CampaignStats> {
    try {
      const res = await fetch(`${API_BASE}/campaign`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch campaign stats');
      return await res.json();
    } catch (err) {
      console.warn('Using fallback campaign data:', err);
      return {
        goal_usd: 500000,
        raised_usd: 315000,
        goal_etb: 60000000,
        raised_etb: 37800000,
        percent_usd: 63,
        percent_etb: 63,
      };
    }
  },

  // Public Donations
  async createDonation(data: Donation): Promise<{ success: boolean; message: string; donation?: Donation; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit donation');
      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error submitting donation', error: err.message };
    }
  },

  // Chapa Local Gateway (ETB: Telebirr, CBE Birr, Awash, Coopbank)
  async initializeChapa(data: {
    donor_name: string;
    donor_email: string;
    donor_phone?: string;
    amount: number;
    designation: string;
    payment_method?: string;
  }): Promise<{ success: boolean; checkout_url?: string; tx_ref?: string; mode?: string; payment_method?: string; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/donations/chapa/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      let result: any = null;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          res.ok ? 'Invalid response from server' : `Server connection error (${res.status}). Please ensure backend is running.`
        );
      }
      if (!res.ok) throw new Error(result.error || result.message || 'Chapa initialization failed');
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Chapa' };
    }
  },

  async verifyChapa(txRef: string): Promise<{ success: boolean; verified?: boolean; data?: any; donation?: any; amount?: number; currency?: string; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/donations/chapa/verify/${encodeURIComponent(txRef)}`);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, verified: false, error: `Server error (${res.status})` };
      }
    } catch (err: any) {
      return { success: false, verified: false, error: err.message || 'Verification failed' };
    }
  },

  // Stripe International Gateway (USD: Credit Cards, Apple Pay, Google Pay)
  async initializeStripe(data: {
    donor_name: string;
    donor_email: string;
    amount: number;
    designation: string;
  }): Promise<{ success: boolean; checkout_url?: string; session_id?: string; tx_ref?: string; mode?: string; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/donations/stripe/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Stripe initialization failed');
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to Stripe' };
    }
  },

  async verifyStripe(sessionId: string, txRef?: string): Promise<{ success: boolean; verified?: boolean; provider?: string; donation?: any; session?: any; error?: string }> {
    try {
      const query = txRef ? `?tx_ref=${encodeURIComponent(txRef)}` : '';
      const res = await fetch(`${API_BASE}/donations/stripe/verify/${encodeURIComponent(sessionId)}${query}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Stripe verification failed' };
    }
  },

  // Contact & Prayer Requests
  async sendContactMessage(data: { name: string; email: string; phone?: string; message: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send message');
      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  },

  // Newsletter Subscription
  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Subscription failed' };
    }
  },

  // Event Registration
  async registerEvent(data: { event_title: string; participant_name: string; participant_email: string; participant_phone?: string; notes?: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');
      return result;
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  },

  // Posts & Sermons
  async getPosts(): Promise<Post[]> {
    try {
      const res = await fetch(`${API_BASE}/posts`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch posts');
      return await res.json();
    } catch (err) {
      console.warn('Using fallback posts data:', err);
      return [
        {
          id: 1,
          title: 'Sunday Sermon Series: Walking in the Light (የክርስቶስ ብርሃን)',
          author: 'Pastor Zerfu',
          category: 'sermon_poster',
          content: 'Join us this Sunday at 3:00 – 6:00 (9:00 AM – 12:00 PM) for Ye Amliko Gize (የአምልኮ ጊዜ) and our sermon series exploring 1 John 1:7.',
          image_url: '/images/sermon_poster.png',
          is_featured: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Building Fund Phase 2: Expanding God’s Sanctuary in Ziway',
          author: 'Church Leadership',
          category: 'building_update',
          content: 'Praise God! Our new church complex phase 2 construction is progressing well thanks to your faithful giving and prayers.',
          image_url: '/images/building_poster.png',
          is_featured: 1,
          created_at: new Date().toISOString(),
        },
      ];
    }
  },

  // Admin Auth & Calls
  async adminLogin(credentials: { username: string; password: string }): Promise<{ token?: string; user?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  },

  async getAdminStats(token: string): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  },

  async getAdminDonations(token: string): Promise<Donation[]> {
    const res = await fetch(`${API_BASE}/admin/donations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch donations');
    return await res.json();
  },

  async getAdminMessages(token: string): Promise<ContactMessage[]> {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },

  async getAdminEvents(token: string): Promise<EventRegistration[]> {
    const res = await fetch(`${API_BASE}/admin/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch event registrations');
    return await res.json();
  },

  async getSystemHealth(token: string): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/admin/system/health`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch system health');
    return await res.json();
  },

  async updateCampaign(token: string, stats: Partial<CampaignStats>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/campaign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stats),
    });
    return await res.json();
  },

  async createManualDonation(token: string, data: Partial<Donation>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/donations/manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async updateDonationStatus(token: string, id: number, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/donations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  async getDonationStatus(identifier: string): Promise<{ success: boolean; donation?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/donations/status/${encodeURIComponent(identifier)}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Status check failed' };
    }
  },

  async adminVerifyDonation(token: string, id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/donations/${id}/verify-provider`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  async adminRefundDonation(token: string, id: number, data: { reason?: string; amount?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/donations/${id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async deleteDonation(token: string, id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/donations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  async updateMessageStatus(token: string, id: number, status: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, notes }),
    });
    return await res.json();
  },

  async deleteMessage(token: string, id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  async uploadImage(token: string, data: { image: string; filename?: string }): Promise<{ success: boolean; url: string; filename: string; error?: string }> {
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async createPost(token: string, post: Partial<Post>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });
    return await res.json();
  },

  async updatePost(token: string, id: number, post: Partial<Post>): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });
    return await res.json();
  },

  async deletePost(token: string, id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  },

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await res.json();
  },
};
