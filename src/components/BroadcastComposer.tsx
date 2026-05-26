import { useState } from 'react';
import { Send, ImagePlus, X, CheckCircle2, Clock, AlertCircle, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

interface BroadcastPost {
  id: string;
  content: string;
  image_url: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sent_at: string | null;
  created_at: string;
}

const platformConfig: Record<string, { label: string; bg: string; icon: string; color: string }> = {
  instagram: { label: 'Instagram', bg: 'from-pink-500 to-rose-500', icon: 'IG', color: 'text-pink-600' },
  facebook: { label: 'Facebook', bg: 'from-blue-600 to-blue-700', icon: 'FB', color: 'text-blue-600' },
  tiktok: { label: 'TikTok', bg: 'from-slate-700 to-slate-900', icon: 'TK', color: 'text-slate-800' },
  google: { label: 'Google', bg: 'from-amber-400 to-orange-500', icon: 'G', color: 'text-amber-600' },
  linkedin: { label: 'LinkedIn', bg: 'from-sky-500 to-sky-700', icon: 'IN', color: 'text-sky-600' },
  twitter: { label: 'Twitter/X', bg: 'from-cyan-400 to-sky-500', icon: 'TW', color: 'text-cyan-600' },
  youtube: { label: 'YouTube', bg: 'from-red-500 to-red-700', icon: 'YT', color: 'text-red-600' },
};

const ALL_PLATFORMS = Object.keys(platformConfig);

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  connectedPlatforms: Set<string>;
  onPostSent: () => void;
}

export default function BroadcastComposer({ connectedPlatforms, onPostSent }: Props) {
  const { requireActive } = useSubscription();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(connectedPlatforms));
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [history, setHistory] = useState<BroadcastPost[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const charLimit = 280;
  const remaining = charLimit - content.length;

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const selectAll = () => setSelectedPlatforms(new Set(ALL_PLATFORMS));
  const clearAll = () => setSelectedPlatforms(new Set());

  const sendBroadcast = async () => {
    if (!content.trim() || selectedPlatforms.size === 0) return;
    requireActive('Broadcast Posting', async () => {
    setSending(true);

    const userId = await getCurrentUserId();

    const { data } = await supabase.from('broadcast_posts').insert({
      content: content.trim(),
      image_url: imageUrl.trim(),
      platforms: Array.from(selectedPlatforms),
      status: 'scheduled',
      sent_at: new Date().toISOString(),
      user_id: userId,
    }).select().single();

    if (data) {
      setHistory(prev => [data as BroadcastPost, ...prev]);
    }

    setSending(false);
    setSentSuccess(true);
    setContent('');
    setImageUrl('');
    setShowImageInput(false);
    onPostSent();

    setTimeout(() => setSentSuccess(false), 3000);
    });
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('broadcast_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory((data || []) as BroadcastPost[]);
    setLoadingHistory(false);
    setShowHistory(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Megaphone size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#fff' }}>Broadcast Message</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Write once, post everywhere</p>
          </div>
          <button
            onClick={showHistory ? () => setShowHistory(false) : loadHistory}
            className="ml-auto text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            {showHistory ? 'Compose' : 'History'}
          </button>
        </div>

        {!showHistory ? (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Post to platforms</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {ALL_PLATFORMS.map(p => {
                  const cfg = platformConfig[p];
                  const isSelected = selectedPlatforms.has(p);
                  const isConnected = connectedPlatforms.has(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'border-transparent text-white shadow-sm'
                          : 'hover:border-white/20'
                      }`}
                      style={isSelected ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)' }}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isSelected ? 'bg-white/20' : `bg-gradient-to-br ${cfg.bg} text-white`}`}
                      >
                        {cfg.icon}
                      </span>
                      <span className={isSelected ? 'text-white' : ''} style={isSelected ? { color: platformConfig[p] ? undefined : undefined } : {}}>
                        {cfg.label}
                      </span>
                      {!isConnected && <span className="text-[9px] opacity-70 ml-0.5">(not connected)</span>}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs font-medium" style={{ color: '#39e639' }}>Select all</button>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                <button onClick={clearAll} className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Clear</button>
                <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>{selectedPlatforms.size} selected</span>
              </div>
            </div>

            <div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What do you want to share? Write your message here and it will be posted to all selected platforms..."
                rows={5}
                maxLength={charLimit}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(57,230,57,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <div className="flex items-center justify-between mt-1.5">
                <button
                  onClick={() => setShowImageInput(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                >
                  <ImagePlus size={14} />
                  {showImageInput ? 'Remove image' : 'Add image URL'}
                </button>
                <span className={`text-xs font-medium ${remaining < 30 ? 'text-red-400' : ''}`} style={remaining >= 30 ? { color: 'rgba(255,255,255,0.3)' } : {}}>
                  {remaining} left
                </span>
              </div>
            </div>

            {showImageInput && (
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all pr-10"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                />
                {imageUrl && (
                  <button onClick={() => setImageUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {imageUrl && (
              <div className="rounded-xl overflow-hidden h-32" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            <button
              onClick={sendBroadcast}
              disabled={!content.trim() || selectedPlatforms.size === 0 || sending || sentSuccess}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={
                sentSuccess
                  ? { background: '#22c55e', color: '#fff' }
                  : content.trim() && selectedPlatforms.size > 0 && !sending
                  ? { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {sentSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  Queued for {selectedPlatforms.size} platform{selectedPlatforms.size !== 1 ? 's' : ''}!
                </>
              ) : sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Post to {selectedPlatforms.size > 0 ? `${selectedPlatforms.size} platform${selectedPlatforms.size !== 1 ? 's' : ''}` : 'platforms'}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="max-h-[480px] overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {loadingHistory ? (
              <div className="p-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-10 text-center">
                <Megaphone size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>No posts yet</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Your broadcast history will appear here</p>
              </div>
            ) : history.map(post => (
              <div key={post.id} className="p-4 transition-colors" style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    post.status === 'sent' ? 'bg-emerald-100' : post.status === 'failed' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {post.status === 'sent' ? (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    ) : post.status === 'failed' ? (
                      <AlertCircle size={14} className="text-red-500" />
                    ) : (
                      <Clock size={14} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold capitalize ${
                        post.status === 'sent' ? 'text-emerald-600' : post.status === 'failed' ? 'text-red-500' : 'text-amber-600'
                      }`}>{post.status}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{timeAgo(post.sent_at || post.created_at)}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{post.content}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.platforms.map(p => {
                        const cfg = platformConfig[p];
                        if (!cfg) return null;
                        return (
                          <span key={p} className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gradient-to-br ${cfg.bg} text-white`}>
                            {cfg.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
