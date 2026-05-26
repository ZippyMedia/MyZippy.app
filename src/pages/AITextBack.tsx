import { useState, useEffect } from 'react';
import { Plus, Zap, Pencil, Trash2, ToggleLeft, ToggleRight, MessageSquareText, TrendingUp, X, Save, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AutoResponse } from '../types';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

const platforms = ['all', 'instagram', 'facebook', 'tiktok', 'google', 'linkedin', 'twitter'];

const platformBadgeStyle: Record<string, React.CSSProperties> = {
  all:       { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' },
  instagram: { background: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  facebook:  { background: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  tiktok:    { background: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.8)' },
  google:    { background: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  linkedin:  { background: 'rgba(14,165,233,0.15)',  color: '#38bdf8' },
  twitter:   { background: 'rgba(34,211,238,0.15)',  color: '#22d3ee' },
};

interface FormState {
  trigger_keyword: string;
  response_template: string;
  platform: string;
}

const emptyForm: FormState = { trigger_keyword: '', response_template: '', platform: 'all' };

export default function AITextBack() {
  const { requireActive } = useSubscription();
  const [rules, setRules] = useState<AutoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => { loadRules(); }, []);

  const loadRules = async () => {
    const { data } = await supabase.from('auto_responses').select('*').order('created_at', { ascending: false });
    setRules(data || []);
    setLoading(false);
  };

  const openCreate = () => requireActive('AI Text Back Rules', () => { setForm(emptyForm); setEditId(null); setShowForm(true); });
  const openEdit = (rule: AutoResponse) => {
    setForm({ trigger_keyword: rule.trigger_keyword, response_template: rule.response_template, platform: rule.platform });
    setEditId(rule.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.trigger_keyword.trim() || !form.response_template.trim()) return;
    const userId = await getCurrentUserId();
    if (editId) {
      const { data } = await supabase.from('auto_responses').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editId).select().single();
      if (data) setRules(prev => prev.map(r => r.id === editId ? data : r));
    } else {
      const { data } = await supabase.from('auto_responses').insert({ ...form, user_id: userId }).select().single();
      if (data) setRules(prev => [data, ...prev]);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const toggle = async (rule: AutoResponse) => {
    requireActive('AI Text Back', async () => {
      const { data } = await supabase.from('auto_responses').update({ active: !rule.active }).eq('id', rule.id).select().single();
      if (data) setRules(prev => prev.map(r => r.id === rule.id ? data : r));
    });
  };

  const remove = async (id: string) => {
    await supabase.from('auto_responses').delete().eq('id', id);
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const totalReplies = rules.reduce((s, r) => s + (r.match_count || 0), 0);
  const activeCount = rules.filter(r => r.active).length;

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{rules.length}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Rules</p>
        </div>
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: '#0d1420', border: '1px solid rgba(57,230,57,0.12)' }}
        >
          <p className="text-2xl font-bold" style={{ color: '#39e639' }}>{activeCount}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Active</p>
        </div>
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{totalReplies}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Auto-Replies Sent</p>
        </div>
      </div>

      {/* Hero banner — already dark, keep as-is */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageSquareText size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Ai Text Back Engine</h3>
          <p className="text-slate-400 text-sm">Automatically reply to incoming messages that match your trigger keywords — across all connected platforms.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-1.5">
          <Lock size={13} className="text-amber-400" />
          <span className="text-amber-400 text-sm font-medium">Preview</span>
        </div>
      </div>

      {/* Heading row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Response Rules</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`rounded-2xl transition-all${rule.active ? '' : ' opacity-60'}`}
              style={
                rule.active
                  ? { background: '#0d1420', border: '1px solid rgba(57,230,57,0.12)' }
                  : { background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Trigger keyword badge */}
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex-shrink-0"
                    style={
                      rule.active
                        ? { background: 'rgba(57,230,57,0.15)', border: '1px solid rgba(57,230,57,0.3)', color: '#39e639' }
                        : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                    }
                  >
                    <Zap size={11} className="inline mr-1" />
                    {rule.trigger_keyword}
                  </div>

                  {/* Platform badge */}
                  <span
                    className="px-2 py-0.5 rounded-md text-xs font-medium capitalize"
                    style={platformBadgeStyle[rule.platform] || platformBadgeStyle.all}
                  >
                    {rule.platform === 'all' ? 'All Platforms' : rule.platform}
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <TrendingUp size={12} />
                      <span>{rule.match_count} replies</span>
                    </div>
                    <button
                      onClick={() => openEdit(rule)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(rule.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => toggle(rule)}
                      className="transition-colors"
                      style={{ color: rule.active ? '#39e639' : 'rgba(255,255,255,0.3)' }}
                    >
                      {rule.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>
                </div>

                {/* Response template */}
                <div
                  className="mt-3 rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>"{rule.response_template}"</p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {rules.length === 0 && (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <MessageSquareText size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No rules yet</p>
              <p className="text-sm mt-1">Create your first auto-response rule to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg shadow-2xl rounded-2xl"
            style={{ background: '#0d1420', border: '1px solid rgba(57,230,57,0.15)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white">{editId ? 'Edit Rule' : 'New Auto-Response Rule'}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Trigger Keyword</label>
                <input
                  type="text"
                  value={form.trigger_keyword}
                  onChange={e => setForm(f => ({ ...f, trigger_keyword: e.target.value }))}
                  placeholder="e.g., price, hours, location"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-white/30"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>When a message contains this word, the auto-reply fires.</p>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Response Message</label>
                <textarea
                  value={form.response_template}
                  onChange={e => setForm(f => ({ ...f, response_template: e.target.value }))}
                  placeholder="Type your automated response..."
                  rows={4}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none placeholder-white/30"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Platform</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, platform: p }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
                      style={
                        form.platform === p
                          ? { background: 'rgba(57,230,57,0.15)', border: '1px solid rgba(57,230,57,0.3)', color: '#39e639' }
                          : { background: 'rgba(255,255,255,0.06)', border: '1px solid transparent', color: 'rgba(255,255,255,0.7)' }
                      }
                    >
                      {p === 'all' ? 'All Platforms' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 p-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-xl transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!form.trigger_keyword.trim() || !form.response_template.trim()}
                className="flex items-center gap-2 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
              >
                <Save size={15} />
                {editId ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
