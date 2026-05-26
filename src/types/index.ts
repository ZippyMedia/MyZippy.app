export type Platform = 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube' | 'google' | 'manual' | 'all';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: Platform;
  avatar_url: string;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  contact_id: string | null;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  location: string;
  notes: string;
  created_at: string;
  updated_at: string;
  contact?: Contact;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  account_name: string;
  account_id: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  follower_count: number;
  message_count: number;
  connected_at: string;
}

export interface Message {
  id: string;
  contact_id: string | null;
  platform: Platform;
  direction: 'inbound' | 'outbound';
  content: string;
  read: boolean;
  auto_replied: boolean;
  created_at: string;
  contact?: Contact;
}

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: AIMessage[];
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AutoResponse {
  id: string;
  trigger_keyword: string;
  response_template: string;
  platform: string;
  active: boolean;
  match_count: number;
  created_at: string;
  updated_at: string;
}

export type NavPage = 'dashboard' | 'assistant' | 'textback' | 'appointments' | 'social' | 'contacts' | 'settings';
