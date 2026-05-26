import { useEffect, useState } from 'react';
import {
  Users, CalendarDays, MessageSquare, Bot, Share2,
  PhoneCall, Globe, LayoutDashboard, Settings,
  TrendingUp, Bell, Zap, ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { NavPage } from '../types';

interface Stats {
  contacts: number;
  appointments: number;
  messages: number;
  autoReplies: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ChatGPT icon SVG
function ChatGPTIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.205-3.371 10.079 10.079 0 0 0-10.44 4.967 9.967 9.967 0 0 0-6.695 4.828 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.205 3.371 10.08 10.08 0 0 0 10.44-4.967 9.967 9.967 0 0 0 6.695-4.828 10.079 10.079 0 0 0-1.24-11.816zm-17.151 23.748c-1.955 0-3.83-.662-5.33-1.87.067-.036.185-.1.261-.147l8.84-5.105a1.44 1.44 0 0 0 .729-1.265v-12.47l3.737 2.158a.133.133 0 0 1 .073.103v10.33c-.005 4.568-3.711 8.272-8.31 8.266zm-17.907-7.595a8.232 8.232 0 0 1-.987-5.52c.065.04.18.11.258.155l8.84 5.106a1.44 1.44 0 0 0 1.456 0l10.786-6.228v4.315a.133.133 0 0 1-.053.114l-8.934 5.157c-3.955 2.284-9.007.926-11.366-2.999zm-2.331-18.233a8.234 8.234 0 0 1 4.294-3.622v10.51a1.44 1.44 0 0 0 .727 1.262l10.784 6.228-3.737 2.158a.133.133 0 0 1-.127.012l-8.934-5.157c-3.952-2.286-5.308-7.338-3.007-11.39zm30.769 7.071-10.786-6.228 3.737-2.158a.133.133 0 0 1 .127-.012l8.934 5.157c3.955 2.285 5.311 7.337 3.009 11.39a8.234 8.234 0 0 1-4.294 3.622v-10.51a1.44 1.44 0 0 0-.727-1.261zm3.72-5.537c-.065-.04-.18-.11-.257-.155l-8.84-5.106a1.44 1.44 0 0 0-1.456 0L15.295 17.29v-4.315a.133.133 0 0 1 .053-.114l8.934-5.157c3.954-2.285 9.007-.926 11.366 2.999a8.232 8.232 0 0 1 .987 5.52zm-23.406 7.693-3.737-2.158a.133.133 0 0 1-.073-.103v-10.33c.002-4.57 3.71-8.274 8.31-8.268 1.955 0 3.83.663 5.33 1.87-.067.037-.185.1-.261.148l-8.84 5.105a1.44 1.44 0 0 0-.729 1.265zm2.03-4.374 4.8-2.772 4.8 2.771v5.542l-4.8 2.772-4.8-2.772z" fill="currentColor"/>
    </svg>
  );
}

const NEON = '#39e639';
const SURFACE = '#0d1420';
const BORDER_DIM = 'rgba(255,255,255,0.06)';
const BORDER_GREEN = 'rgba(57,230,57,0.18)';

const features: {
  icon: React.ElementType;
  label: string;
  desc: string;
  page: NavPage;
  settingsSection?: string;
  accent: string;
  capabilities: string[];
}[] = [
  {
    icon: Bot,
    label: 'AI Assistant',
    desc: 'Conversational AI for your business',
    page: 'assistant',
    accent: '#39e639',
    capabilities: ['Natural language chat', 'Business Q&A', 'Smart suggestions'],
  },
  {
    icon: PhoneCall,
    label: 'AI Text Back',
    desc: 'Automated SMS to missed calls',
    page: 'textback',
    accent: '#00d4ff',
    capabilities: ['Instant text replies', 'Custom rules', 'Call tracking'],
  },
  {
    icon: CalendarDays,
    label: 'Appointments',
    desc: 'Booking and schedule management',
    page: 'appointments',
    accent: '#f59e0b',
    capabilities: ['24/7 online booking', 'Reminders', 'Calendar sync'],
  },
  {
    icon: Share2,
    label: 'Social Hub',
    desc: 'Unified inbox for all platforms',
    page: 'social',
    accent: '#ec4899',
    capabilities: ['ChatGPT, Instagram, FB', 'TikTok, Google, LinkedIn', 'Unified messaging'],
  },
  {
    icon: Users,
    label: 'Contacts',
    desc: 'Customer and lead management',
    page: 'contacts',
    accent: '#a78bfa',
    capabilities: ['Contact profiles', 'Lead tracking', 'Message history'],
  },
  {
    icon: Globe,
    label: 'AI Website',
    desc: 'AI-generated website with hosting',
    page: 'settings',
    settingsSection: 'aiwebsite',
    accent: '#39e639',
    capabilities: ['Auto-generated design', 'Free hosting', 'SEO optimized'],
  },
  {
    icon: MessageSquare,
    label: 'Broadcasts',
    desc: 'Send bulk messages to contacts',
    page: 'social',
    accent: '#f97316',
    capabilities: ['Bulk messaging', 'Scheduled sends', 'Multi-platform'],
  },
  {
    icon: Settings,
    label: 'AI Configuration',
    desc: 'Tune tone, language, and behavior',
    page: 'settings',
    settingsSection: 'ai',
    accent: '#64748b',
    capabilities: ['Response tone', 'Auto-reply settings', 'Language options'],
  },
];

const statCards: { label: string; key: keyof Stats; icon: React.ElementType; accent: string }[] = [
  { label: 'Contacts', key: 'contacts', icon: Users, accent: '#00d4ff' },
  { label: 'Appointments', key: 'appointments', icon: CalendarDays, accent: NEON },
  { label: 'Messages', key: 'messages', icon: MessageSquare, accent: '#f59e0b' },
  { label: 'AI Replies', key: 'autoReplies', icon: Bot, accent: '#ec4899' },
];

const allPlatforms = [
  { key: 'chatgpt', label: 'ChatGPT', abbr: null, color: '#39e639' },
  { key: 'instagram', label: 'Instagram', abbr: 'IG', color: '#e1306c' },
  { key: 'facebook', label: 'Facebook', abbr: 'FB', color: '#1877f2' },
  { key: 'tiktok', label: 'TikTok', abbr: 'TK', color: '#ffffff' },
  { key: 'google', label: 'Google', abbr: 'G', color: '#ea4335' },
  { key: 'linkedin', label: 'LinkedIn', abbr: 'IN', color: '#0a66c2' },
  { key: 'twitter', label: 'Twitter', abbr: 'TW', color: '#1d9bf0' },
  { key: 'youtube', label: 'YouTube', abbr: 'YT', color: '#ff0000' },
];

export default function Dashboard({
  onNavigateToSettings,
  onNavigate,
}: {
  onNavigateToSettings?: (section?: string) => void;
  onNavigate?: (page: NavPage) => void;
}) {
  const [stats, setStats] = useState<Stats>({ contacts: 0, appointments: 0, messages: 0, autoReplies: 0 });
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());
  const [recentActivity, setRecentActivity] = useState<{ id: string; text: string; time: string; icon: React.ElementType; accent: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [contactsRes, apptRes, msgRes, autoRes, socialRes, recentMsgRes, recentApptRes] = await Promise.all([
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('auto_responses').select('match_count').eq('active', true),
        supabase.from('social_accounts').select('platform, status'),
        supabase.from('messages').select('id, platform, direction, created_at, contact:contacts(name)').order('created_at', { ascending: false }).limit(3),
        supabase.from('appointments').select('id, title, status, created_at, contact:contacts(name)').order('created_at', { ascending: false }).limit(2),
      ]);

      const totalReplies = (autoRes.data || []).reduce((s, r) => s + (r.match_count || 0), 0);
      setStats({ contacts: contactsRes.count || 0, appointments: apptRes.count || 0, messages: msgRes.count || 0, autoReplies: totalReplies });
      setConnectedPlatforms(new Set((socialRes.data || []).filter(a => a.status === 'connected').map(a => a.platform)));

      const items: typeof recentActivity = [];
      for (const msg of (recentMsgRes.data || [])) {
        const contact = (msg.contact as { name?: string } | null);
        const name = contact?.name || 'Someone';
        items.push({ id: msg.id, text: msg.direction === 'inbound' ? `Message from ${name} via ${msg.platform}` : `Replied to ${name}`, time: timeAgo(msg.created_at), icon: MessageSquare, accent: '#00d4ff' });
      }
      for (const appt of (recentApptRes.data || [])) {
        const contact = (appt.contact as { name?: string } | null);
        items.push({ id: appt.id, text: `Appointment "${appt.title}" — ${appt.status}`, time: timeAgo(appt.created_at), icon: CalendarDays, accent: NEON });
      }
      setRecentActivity(items.slice(0, 4));
      setLoading(false);
    };
    load();
  }, []);

  const navigate = (page: NavPage, settingsSection?: string) => {
    if (settingsSection && onNavigateToSettings) onNavigateToSettings(settingsSection);
    else if (onNavigate) onNavigate(page);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto" style={{ background: '#050a12', minHeight: '100%' }}>

      {/* Hero banner */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: '#000',
          border: '1px solid rgba(57,230,57,0.2)',
          boxShadow: '0 0 40px rgba(57,230,57,0.08)',
        }}
      >
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(57,230,57,0.12) 0%, transparent 70%)', transform: 'translate(20%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />

        <div className="relative flex items-end gap-0">
          {/* Mascot */}
          <div className="hidden sm:block flex-shrink-0 relative" style={{ width: '160px', marginBottom: '-2px' }}>
            <div
              className="absolute inset-x-4 bottom-0 h-16 rounded-full blur-2xl opacity-40 pointer-events-none"
              style={{ background: '#39e639' }}
            />
            <div
              className="relative rounded-2xl overflow-hidden mx-auto"
              style={{ background: '#000', width: '140px' }}
            >
              <img
                src="/zippy-mascot-transparent.png"
                alt="Zippy"
                className="w-full object-contain"
                style={{
                  height: '200px',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  filter: 'drop-shadow(0 0 8px rgba(57,230,57,0.4)) drop-shadow(0 0 20px rgba(57,230,57,0.2))',
                }}
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 px-5 py-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(57,230,57,0.12)', color: NEON, border: '1px solid rgba(57,230,57,0.3)' }}
              >
                <Zap size={10} />
                LIVE — AI Active
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight mb-1">
              <span style={{ color: '#fff' }}>My</span>
              <span style={{ color: NEON, textShadow: '0 0 20px rgba(57,230,57,0.5)' }}>Zippy</span>
              <span style={{ color: '#fff' }}>.app</span>
            </h2>
            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Run Your Business From the Palm of Your Hand
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Answers', 'Follows Up', 'Books', 'Converts'].map((item, i) => {
                const icons = [PhoneCall, MessageSquare, CalendarDays, TrendingUp];
                const Icon = icons[i];
                return (
                  <div
                    key={item}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(57,230,57,0.08)', border: '1px solid rgba(57,230,57,0.15)' }}
                  >
                    <Icon size={14} style={{ color: NEON }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: NEON, fontSize: '9px' }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div
          className="grid grid-cols-4 mx-4 mb-4 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(57,230,57,0.12)', background: 'rgba(0,0,0,0.2)' }}
        >
          {statCards.map(({ label, key, icon: Icon, accent }, i) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-3"
              style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18` }}>
                <Icon size={13} style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-none" style={{ color: '#fff' }}>
                  {loading ? <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span> : stats[key].toLocaleString()}
                </p>
                <p className="mt-0.5 truncate" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutDashboard size={14} style={{ color: 'rgba(57,230,57,0.6)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Features</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {features.map(({ icon: Icon, label, desc, page, settingsSection, accent, capabilities }) => (
            <button
              key={label}
              onClick={() => navigate(page, settingsSection)}
              className="text-left rounded-2xl p-4 group transition-all duration-200 active:scale-[0.99]"
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER_DIM}`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${accent}30`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${accent}0d`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${BORDER_DIM}`;
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}25` }}
                >
                  <Icon size={19} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm" style={{ color: '#fff' }}>{label}</h3>
                    <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} className="group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </div>
                  <p className="text-xs mt-0.5 mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {capabilities.map(c => (
                      <span
                        key={c}
                        className="text-xs rounded-full px-2 py-0.5"
                        style={{ background: `${accent}0e`, color: `${accent}cc`, border: `1px solid ${accent}20`, fontSize: '10px' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Social Platforms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Share2 size={14} style={{ color: 'rgba(57,230,57,0.6)' }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Social Hub</h2>
          </div>
          <button
            onClick={() => onNavigate?.('social')}
            className="text-xs font-semibold flex items-center gap-1 transition-colors"
            style={{ color: NEON }}
          >
            Open <ChevronRight size={12} />
          </button>
        </div>
        <div
          className="rounded-2xl p-4"
          style={{ background: SURFACE, border: `1px solid ${BORDER_DIM}` }}
        >
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {allPlatforms.map(({ key, label, abbr, color }) => {
              const isConnected = connectedPlatforms.has(key);
              return (
                <button
                  key={key}
                  onClick={() => onNavigate?.('social')}
                  title={label}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold transition-all duration-200 group-hover:scale-110"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      color: color,
                      boxShadow: isConnected ? `0 0 10px ${color}30` : 'none',
                    }}
                  >
                    {key === 'chatgpt' ? <ChatGPTIcon size={18} /> : <span style={{ fontSize: '9px', fontWeight: 800 }}>{abbr}</span>}
                  </div>
                  <span className="truncate w-full text-center" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                    {key === 'twitter' ? 'Twitter' : label}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full transition-opacity"
                    style={{ background: NEON, boxShadow: `0 0 6px ${NEON}`, opacity: isConnected ? 1 : 0 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: 'rgba(57,230,57,0.6)' }} />
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Recent Activity</h2>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER_DIM}` }}>
          {loading ? (
            <div className="py-8 text-center" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Loading...</div>
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Bell size={28} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No recent activity yet</p>
            </div>
          ) : (
            recentActivity.map(({ id, text, time, icon: Icon, accent }) => (
              <div
                key={id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${BORDER_DIM}` }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18` }}
                >
                  <Icon size={14} style={{ color: accent }} />
                </div>
                <p className="flex-1 text-sm min-w-0 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{text}</p>
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{time}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
