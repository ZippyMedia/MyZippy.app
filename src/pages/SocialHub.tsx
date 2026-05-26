import { useState, useEffect } from 'react';
import { RefreshCw, Send, Inbox, CheckCheck } from 'lucide-react';

function ChatGPTIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.205-3.371 10.079 10.079 0 0 0-10.44 4.967 9.967 9.967 0 0 0-6.695 4.828 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.205 3.371 10.08 10.08 0 0 0 10.44-4.967 9.967 9.967 0 0 0 6.695-4.828 10.079 10.079 0 0 0-1.24-11.816zm-17.151 23.748c-1.955 0-3.83-.662-5.33-1.87.067-.036.185-.1.261-.147l8.84-5.105a1.44 1.44 0 0 0 .729-1.265v-12.47l3.737 2.158a.133.133 0 0 1 .073.103v10.33c-.005 4.568-3.711 8.272-8.31 8.266zm-17.907-7.595a8.232 8.232 0 0 1-.987-5.52c.065.04.18.11.258.155l8.84 5.106a1.44 1.44 0 0 0 1.456 0l10.786-6.228v4.315a.133.133 0 0 1-.053.114l-8.934 5.157c-3.955 2.284-9.007.926-11.366-2.999zm-2.331-18.233a8.234 8.234 0 0 1 4.294-3.622v10.51a1.44 1.44 0 0 0 .727 1.262l10.784 6.228-3.737 2.158a.133.133 0 0 1-.127.012l-8.934-5.157c-3.952-2.286-5.308-7.338-3.007-11.39zm30.769 7.071-10.786-6.228 3.737-2.158a.133.133 0 0 1 .127-.012l8.934 5.157c3.955 2.285 5.311 7.337 3.009 11.39a8.234 8.234 0 0 1-4.294 3.622v-10.51a1.44 1.44 0 0 0-.727-1.261zm3.72-5.537c-.065-.04-.18-.11-.257-.155l-8.84-5.106a1.44 1.44 0 0 0-1.456 0L15.295 17.29v-4.315a.133.133 0 0 1 .053-.114l8.934-5.157c3.954-2.285 9.007-.926 11.366 2.999a8.232 8.232 0 0 1 .987 5.52zm-23.406 7.693-3.737-2.158a.133.133 0 0 1-.073-.103v-10.33c.002-4.57 3.71-8.274 8.31-8.268 1.955 0 3.83.663 5.33 1.87-.067.037-.185.1-.261.148l-8.84 5.105a1.44 1.44 0 0 0-.729 1.265zm2.03-4.374 4.8-2.772 4.8 2.771v5.542l-4.8 2.772-4.8-2.772z" fill="currentColor"/>
    </svg>
  );
}
import { supabase } from '../lib/supabase';
import { SocialAccount, Message, Contact, Platform } from '../types';
import BroadcastComposer from '../components/BroadcastComposer';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

const platformConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  chatgpt: { label: 'ChatGPT', color: 'text-emerald-600', bg: 'from-emerald-500 to-teal-600', icon: 'GPT' },
  instagram: { label: 'Instagram', color: 'text-pink-600', bg: 'from-pink-500 to-rose-500', icon: 'IG' },
  facebook: { label: 'Facebook', color: 'text-blue-600', bg: 'from-blue-600 to-blue-700', icon: 'FB' },
  tiktok: { label: 'TikTok', color: 'text-slate-800', bg: 'from-slate-700 to-slate-900', icon: 'TK' },
  google: { label: 'Google', color: 'text-amber-600', bg: 'from-amber-400 to-orange-500', icon: 'G' },
  linkedin: { label: 'LinkedIn', color: 'text-sky-600', bg: 'from-sky-500 to-sky-700', icon: 'IN' },
  twitter: { label: 'Twitter/X', color: 'text-cyan-600', bg: 'from-cyan-400 to-sky-500', icon: 'TW' },
  youtube: { label: 'YouTube', color: 'text-red-600', bg: 'from-red-500 to-red-700', icon: 'YT' },
};


function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function triggerAutoReply(messageId: string, content: string, platform: string, contactId: string | null, userId: string | null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  try {
    await fetch(`${supabaseUrl}/functions/v1/auto-reply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_id: messageId, content, platform, contact_id: contactId, user_id: userId }),
    });
  } catch {
  }
}

export default function SocialHub() {
  const { requireActive } = useSubscription();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [messages, setMessages] = useState<(Message & { contact?: Contact })[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const userId = await getCurrentUserId();
    const [accRes, msgRes] = await Promise.all([
      supabase.from('social_accounts').select('*'),
      supabase.from('messages').select('*, contact:contacts(name, phone, avatar_url)').order('created_at', { ascending: false }).limit(30),
    ]);
    setAccounts(accRes.data || []);

    const dbMessages = (msgRes.data || []) as (Message & { contact?: Contact })[];
    setMessages(dbMessages);
    setLoading(false);

    const unprocessed = dbMessages.filter(m => m.direction === 'inbound' && !m.auto_replied);
    for (const msg of unprocessed) {
      triggerAutoReply(msg.id, msg.content, msg.platform, msg.contact_id, userId);
    }
  };

  const sendReply = async (msgId: string) => {
    if (!replyText.trim()) return;
    requireActive('Social Hub Messaging', async () => {
      const original = messages.find(m => m.id === msgId);
      if (!original) return;
      const userId = await getCurrentUserId();
      const { data } = await supabase.from('messages').insert({
        platform: original.platform,
        direction: 'outbound',
        content: replyText,
        contact_id: original.contact_id,
        read: true,
        user_id: userId,
      }).select().single();
      if (data) setMessages(prev => [data as Message, ...prev]);
      setReplyText('');
      setReplyTo(null);
    });
  };

  const markRead = async (msgId: string) => {
    await supabase.from('messages').update({ read: true }).eq('id', msgId);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, read: true } : m));
  };

  const connect = async (platform: Platform) => {
    requireActive('Social Platform Connection', async () => {
      const userId = await getCurrentUserId();
      const existing = accounts.find(a => a.platform === platform);
      if (existing) return;
      const { data } = await supabase.from('social_accounts').insert({
        platform,
        account_name: `Pending setup`,
        account_id: `${platform}_pending`,
        status: 'pending',
        follower_count: 0,
        message_count: 0,
        user_id: userId,
      }).select().single();
      if (data) setAccounts(prev => [...prev, data as SocialAccount]);
    });
  };

  const connectedPlatforms = new Set<string>(accounts.filter(a => a.status === 'connected' || a.status === 'pending').map(a => a.platform));
  const filteredMessages = selectedPlatform === 'all' ? messages : messages.filter(m => m.platform === selectedPlatform);
  const unreadCount = messages.filter(m => !m.read && m.direction === 'inbound').length;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(platformConfig).map(([platform, cfg]) => {
          const isConnected = connectedPlatforms.has(platform);
          const acct = accounts.find(a => a.platform === platform);
          return (
            <div
              key={platform}
              className="rounded-2xl p-4 relative"
              style={
                isConnected
                  ? { background: '#0d1420', border: '1px solid rgba(57,230,57,0.12)' }
                  : { background: '#0d1420', border: '1px dashed rgba(255,255,255,0.1)' }
              }
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center text-white text-xs font-bold mb-3`}>
                {platform === 'chatgpt' ? <ChatGPTIcon size={20} /> : cfg.icon}
              </div>
              <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{cfg.label}</p>
              {isConnected ? (
                acct?.status === 'pending' ? (
                  <>
                    <p className="text-xs font-medium mt-0.5 text-amber-400">Setup pending</p>
                    <p className="text-xs mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>Our team will connect this platform for you.</p>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full" />
                  </>
                ) : (
                  <>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{acct?.account_name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>{(acct?.follower_count || 0).toLocaleString()}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>followers</p>
                    <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full" />
                  </>
                )
              ) : (
                <>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Not connected</p>
                  <button
                    onClick={() => connect(platform as Platform)}
                    className="mt-2 text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                  >
                    Request Setup
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <BroadcastComposer connectedPlatforms={connectedPlatforms} onPostSent={load} />

      <div className="rounded-2xl" style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="flex items-center justify-between p-5 gap-4 flex-wrap"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <h3 className="font-bold" style={{ color: '#fff' }}>Unified Inbox</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedPlatform === 'all' ? 'bg-slate-900 text-white' : ''}`}
              style={selectedPlatform === 'all' ? undefined : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
              All
            </button>
            {Object.entries(platformConfig).map(([p, cfg]) => (
              connectedPlatforms.has(p) && (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${selectedPlatform === p ? 'bg-slate-900 text-white' : ''}`}
                  style={selectedPlatform === p ? undefined : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {cfg.label}
                </button>
              )
            ))}
            <button
              onClick={load}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No messages</p>
            </div>
          ) : filteredMessages.map(msg => {
            const cfg = platformConfig[msg.platform] || { label: msg.platform, bg: 'from-slate-400 to-slate-600', icon: '?', color: 'text-slate-600' };
            const isInbound = msg.direction === 'inbound';
            return (
              <div
                key={msg.id}
                className="p-4 transition-colors hover:bg-white/5"
                style={!msg.read && isInbound ? { background: 'rgba(57,230,57,0.04)' } : undefined}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.bg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{cfg.label}</span>
                      {msg.contact && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>• {(msg.contact as Contact).name}</span>}
                      <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>{timeAgo(msg.created_at)}</span>
                      {!msg.read && isInbound && <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={isInbound ? { color: 'rgba(255,255,255,0.85)' } : { color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}
                    >
                      {!isInbound && <span className="text-xs mr-1" style={{ color: 'rgba(255,255,255,0.35)' }}>You:</span>}
                      {msg.content}
                    </p>
                    {isInbound && (
                      <div className="flex gap-2 mt-2">
                        {!msg.read && (
                          <button
                            onClick={() => markRead(msg.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }}
                          >
                            <CheckCheck size={12} />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => setReplyTo(replyTo === msg.id ? null : msg.id)}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 px-2 py-1 rounded-lg transition-colors font-medium"
                        >
                          <Send size={12} />
                          Reply
                        </button>
                      </div>
                    )}
                    {replyTo === msg.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendReply(msg.id)}
                          placeholder={`Reply on ${cfg.label}...`}
                          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                        />
                        <button
                          onClick={() => sendReply(msg.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
