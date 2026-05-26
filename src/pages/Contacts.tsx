import { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, Trash2, Pencil, X, Save, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Contact, Platform } from '../types';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-900/40 text-pink-300',
  facebook: 'bg-blue-900/40 text-blue-300',
  tiktok: 'bg-slate-700/60 text-slate-300',
  google: 'bg-amber-900/40 text-amber-300',
  linkedin: 'bg-sky-900/40 text-sky-300',
  twitter: 'bg-cyan-900/40 text-cyan-300',
  manual: 'bg-slate-700/40 text-slate-400',
};

const tagColors = [
  'bg-violet-900/40 text-violet-300',
  'bg-emerald-900/40 text-emerald-300',
  'bg-amber-900/40 text-amber-300',
  'bg-rose-900/40 text-rose-300',
  'bg-cyan-900/40 text-cyan-300',
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  source: Platform;
  notes: string;
  tags: string;
}

const emptyForm: FormState = { name: '', email: '', phone: '', source: 'manual', notes: '', tags: '' };
const sources: Platform[] = ['manual', 'instagram', 'facebook', 'tiktok', 'google', 'linkedin', 'twitter'];

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['from-cyan-500 to-blue-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-500', 'from-violet-500 to-purple-600'];

export default function Contacts() {
  const { requireActive } = useSubscription();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from('contacts').select('*').order('name');
    setContacts(data || []);
    setLoading(false);
  };

  const openCreate = () => requireActive('Contacts', () => { setForm(emptyForm); setEditId(null); setShowForm(true); });
  const openEdit = (c: Contact) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, source: c.source, notes: c.notes, tags: c.tags.join(', ') });
    setEditId(c.id);
    setShowForm(true);
    setSelected(null);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const userId = await getCurrentUserId();
    const payload = { name: form.name, email: form.email, phone: form.phone, source: form.source, notes: form.notes, tags, user_id: userId };
    if (editId) {
      const { data } = await supabase.from('contacts').update(payload).eq('id', editId).select().single();
      if (data) { setContacts(prev => prev.map(c => c.id === editId ? data as Contact : c)); }
    } else {
      const { data } = await supabase.from('contacts').insert(payload).select().single();
      if (data) setContacts(prev => [...prev, data as Contact].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const remove = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchSource = filterSource === 'all' || c.source === filterSource;
    return matchSearch && matchSource;
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-2xl font-bold text-white">{contacts.length}</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Contacts</p>
        </div>
        {['instagram', 'facebook', 'google'].map(s => (
          <div
            key={s}
            className="rounded-2xl p-4 text-center"
            style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-2xl font-bold text-white">{contacts.filter(c => c.source === s).length}</p>
            <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{s}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Search size={16} style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...sources].map(s => (
            <button
              key={s}
              onClick={() => setFilterSource(s)}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors"
              style={
                filterSource === s
                  ? {
                      background: 'rgba(57,230,57,0.15)',
                      border: '1px solid rgba(57,230,57,0.3)',
                      color: '#39e639',
                    }
                  : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.5)',
                    }
              }
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <User size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>No contacts found</p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {filtered.map((contact, idx) => (
                <div
                  key={contact.id}
                  onClick={() => setSelected(selected?.id === contact.id ? null : contact)}
                  className="flex items-center gap-3 p-4 cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: selected?.id === contact.id ? 'rgba(57,230,57,0.06)' : undefined,
                  }}
                  onMouseEnter={e => {
                    if (selected?.id !== contact.id)
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (selected?.id !== contact.id)
                      (e.currentTarget as HTMLDivElement).style.background = '';
                  }}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {initials(contact.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{contact.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{contact.email || contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${platformColors[contact.source] || platformColors.manual}`}>
                      {contact.source}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(contact); }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
                          (e.currentTarget as HTMLButtonElement).style.background = '';
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); remove(contact.id); }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
                          (e.currentTarget as HTMLButtonElement).style.background = '';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div
              className="rounded-2xl p-5 sticky top-20"
              style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="text-center mb-5">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColors[contacts.indexOf(selected) % avatarColors.length]} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}>
                  {initials(selected.name)}
                </div>
                <h3 className="font-bold text-white text-lg">{selected.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${platformColors[selected.source] || platformColors.manual}`}>
                  via {selected.source}
                </span>
              </div>
              <div className="space-y-3">
                {selected.email && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Mail size={16} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <span className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{selected.email}</span>
                  </div>
                )}
                {selected.phone && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Phone size={16} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{selected.phone}</span>
                  </div>
                )}
                {selected.tags.length > 0 && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Tag size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map((tag, i) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[i % tagColors.length]}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.notes && (
                  <div
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Notes</p>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{selected.notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-white text-sm font-medium py-2.5 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={() => remove(selected.id)}
                  className="p-2.5 rounded-xl transition-colors"
                  style={{ border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: '#0d1420', border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <User size={28} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-2xl w-full max-w-md shadow-2xl"
            style={{ background: '#0d1420', border: '1px solid rgba(57,230,57,0.15)' }}
          >
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h3 className="font-bold text-white">{editId ? 'Edit Contact' : 'New Contact'}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
                  (e.currentTarget as HTMLButtonElement).style.background = '';
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 555-0100"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Source</label>
                <div className="flex flex-wrap gap-2">
                  {sources.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, source: s }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
                      style={
                        form.source === s
                          ? {
                              background: 'rgba(57,230,57,0.15)',
                              border: '1px solid rgba(57,230,57,0.3)',
                              color: '#39e639',
                            }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: 'rgba(255,255,255,0.5)',
                            }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="vip, new, inquiry (comma separated)"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
            </div>
            <div
              className="flex justify-end gap-3 p-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-xl transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex items-center gap-2 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
              >
                <Save size={15} />
                {editId ? 'Update' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
