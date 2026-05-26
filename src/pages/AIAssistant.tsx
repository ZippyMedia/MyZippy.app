import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Plus, Trash2, Sparkles, User, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AIConversation, AIMessage } from '../types';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

const FREE_MESSAGE_LIMIT = 3;
const FREE_MSG_KEY = 'zippy_ai_free_msgs';

const suggestedPrompts = [
  "How can I grow my Instagram followers?",
  "Give me tips to reduce appointment no-shows",
  "What's my best revenue opportunity this week?",
  "Help me write a promotional post",
  "How to respond to negative reviews?",
  "Create a follow-up message for new leads",
];

async function callAIChat(
  messages: { role: string; content: string }[],
  conversationId: string,
  businessContext?: string
): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? supabaseKey;

  const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      conversation_id: conversationId,
      business_context: businessContext,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'AI service error');
  }

  return data.content;
}

export default function AIAssistant() {
  const { isActive, requireActive } = useSubscription();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessContext, setBusinessContext] = useState<string | undefined>(undefined);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState<number>(() => {
    return parseInt(localStorage.getItem(FREE_MSG_KEY) || '0', 10);
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const freeMessagesLeft = Math.max(0, FREE_MESSAGE_LIMIT - freeMessagesUsed);
  const isLocked = !isActive && freeMessagesLeft === 0;

  useEffect(() => {
    loadConversations();
    loadBusinessContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const loadBusinessContext = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const { data } = await supabase.from('business_settings').select('business_name, industry, bio').eq('user_id', userId).maybeSingle();
    if (data && (data.business_name || data.industry)) {
      const parts = [];
      if (data.business_name) parts.push(`Business: ${data.business_name}`);
      if (data.industry) parts.push(`Industry: ${data.industry}`);
      if (data.bio) parts.push(`Description: ${data.bio}`);
      setBusinessContext(parts.join('. '));
    }
  };

  const loadConversations = async () => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    setConversations(data || []);
    if (data && data.length > 0 && !activeId) {
      selectConversation(data[0].id);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveId(id);
    setError(null);
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const newConversation = async () => {
    const userId = await getCurrentUserId();
    const { data } = await supabase
      .from('ai_conversations')
      .insert({ title: 'New Conversation', user_id: userId })
      .select()
      .single();
    if (data) {
      setConversations(prev => [data, ...prev]);
      setActiveId(data.id);
      setMessages([]);
      setError(null);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('ai_conversations').delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    if (!isActive && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      requireActive('AI Assistant');
      return;
    }

    setInput('');
    setLoading(true);
    setError(null);

    let convId = activeId;
    if (!convId) {
      const userId = await getCurrentUserId();
      const { data } = await supabase
        .from('ai_conversations')
        .insert({ title: content.slice(0, 50), user_id: userId })
        .select()
        .single();
      if (data) {
        convId = data.id;
        setActiveId(data.id);
        setConversations(prev => [data, ...prev]);
      }
    }
    if (!convId) { setLoading(false); return; }

    const { data: userMsg } = await supabase
      .from('ai_messages')
      .insert({ conversation_id: convId, role: 'user', content })
      .select()
      .single();

    if (userMsg) setMessages(prev => [...prev, userMsg]);

    if (!isActive) {
      const next = freeMessagesUsed + 1;
      setFreeMessagesUsed(next);
      localStorage.setItem(FREE_MSG_KEY, String(next));
    }

    setThinking(true);

    try {
      const history = [...messages, userMsg].filter(Boolean).map(m => ({
        role: m!.role,
        content: m!.content,
      }));

      const aiContent = await callAIChat(history, convId, businessContext);

      const { data: aiMsg } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', convId)
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg]);
      } else {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          conversation_id: convId!,
          role: 'assistant' as const,
          content: aiContent,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(msg);
    }

    setThinking(false);
    setLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <aside
        className="w-64 flex-shrink-0 flex flex-col hidden md:flex"
        style={{ background: '#0a0f1a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className="w-full flex items-center gap-2 p-3 rounded-xl text-left group transition-all"
              style={activeId === conv.id
                ? { background: 'rgba(57,230,57,0.1)', border: '1px solid rgba(57,230,57,0.2)' }
                : { border: '1px solid transparent' }
              }
              onMouseEnter={e => { if (activeId !== conv.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (activeId !== conv.id) (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center overflow-hidden" style={{ background: '#000', boxShadow: '0 0 6px rgba(57,230,57,0.5)' }}>
                <img src="/zippy-mascot-transparent.png" alt="Zippy" className="w-5 h-5 object-contain" style={{}} />
              </span>
              <span className="text-sm truncate flex-1" style={{ color: activeId === conv.id ? '#39e639' : 'rgba(255,255,255,0.7)' }}>{conv.title}</span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-all"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}
              >
                <Trash2 size={13} />
              </button>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>No conversations yet</p>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {messages.length === 0 && !activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div
              className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center"
              style={{ background: '#000' }}
            >
              <img
                src="/zippy-mascot-transparent.png"
                alt="Zippy"
                className="w-24 h-24 object-contain"
                style={{ filter: 'drop-shadow(0 0 8px rgba(57,230,57,0.4)) drop-shadow(0 0 18px rgba(57,230,57,0.2))' }}
              />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Zippy — Your AI Business Assistant</h2>
            <p className="text-sm max-w-md mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Your intelligent business advisor. Ask me anything about your customers, marketing, appointments, and growth strategy.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="flex items-start gap-2 rounded-xl p-3 text-left text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(57,230,57,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(57,230,57,0.25)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <Sparkles size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#39e639' }} />
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={msg.role === 'assistant' ? { background: '#000' } : { background: '#1e293b' }}
                >
                  {msg.role === 'user'
                    ? <User size={16} className="text-white" />
                    : <img src="/zippy-mascot-transparent.png" alt="Zippy" className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(57,230,57,0.5))' }} />}
                </div>
                <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'rounded-tl-sm'}`} style={msg.role === 'assistant' ? { background: '#0d1420', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)' } : {}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: '#000' }}
                >
                  <img src="/zippy-mascot-transparent.png" alt="Zippy" className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(57,230,57,0.4)) drop-shadow(0 0 10px rgba(57,230,57,0.2))' }} />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <div>
                  <p className="font-medium" style={{ color: '#fff' }}>AI unavailable</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{error.includes('OpenAI API key') ? 'An OpenAI API key is required. Add OPENAI_API_KEY to your Supabase edge function secrets to enable real AI responses.' : error}</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0f1a' }}>
          {isLocked ? (
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => requireActive('AI Assistant')}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg, #0a0f6e, #188bf6)' }}
              >
                <Lock size={16} />
                Activate to continue chatting with Zippy
              </button>
              <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>You've used your {FREE_MESSAGE_LIMIT} free messages — activate to unlock unlimited AI conversations</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {!isActive && freeMessagesLeft <= FREE_MESSAGE_LIMIT && (
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {freeMessagesLeft === FREE_MESSAGE_LIMIT
                      ? `${FREE_MESSAGE_LIMIT} free messages to try Zippy`
                      : freeMessagesLeft === 1
                        ? '1 free message remaining'
                        : `${freeMessagesLeft} free messages remaining`}
                  </span>
                  <button
                    onClick={() => requireActive('AI Assistant')}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#39e639' }}
                  >
                    Activate for unlimited
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask your AI business assistant anything..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-11 h-11 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
                >
                  {loading ? (
                    <Bot size={18} className="animate-pulse" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Powered by GPT-4o mini via My Zippy App</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
