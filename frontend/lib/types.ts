export interface Donation {
  id?: number;
  public_id?: string;
  donor_name: string;
  donor_email: string;
  donor_address?: string;
  amount: number;
  currency: 'ETB' | 'USD';
  frequency: 'one_time' | 'monthly';
  designation: string;
  payment_provider: string;
  transaction_ref?: string;
  status?: string;
  is_archived?: number;
  paid_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface CampaignStats {
  id?: number;
  goal_usd: number;
  raised_usd: number;
  goal_etb: number;
  raised_etb: number;
  percent_usd?: number;
  percent_etb?: number;
  updated_at?: string;
}

export interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  content: string;
  image_url: string;
  is_featured: number;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  notes?: string;
  created_at: string;
}

export interface EventRegistration {
  id: number;
  event_title: string;
  participant_name: string;
  participant_email: string;
  participant_phone?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface AdminStats {
  total_donations: number;
  total_usd: number;
  total_etb: number;
  total_messages: number;
  unread_messages: number;
  total_events: number;
  total_posts: number;
}

export interface SystemHealth {
  status: string;
  uptime_seconds: number;
  memory_usage_mb: number;
  node_version: string;
  database_status: string;
  timestamp: string;
}
