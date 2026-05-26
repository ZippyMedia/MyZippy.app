import { useState, useEffect } from 'react';
import { Plus, CalendarDays, Clock, MapPin, User, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Appointment, Contact } from '../types';
import { useSubscription } from '../context/SubscriptionContext';
import { getCurrentUserId } from '../lib/db';

const statusColors = {
  scheduled: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
  confirmed: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40',
  cancelled: 'bg-red-900/40 text-red-300 border-red-800/40',
  completed: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface FormState {
  contact_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: Appointment['status'];
  location: string;
  notes: string;
}

const emptyForm: FormState = {
  contact_id: '', title: '', description: '',
  start_time: '', end_time: '',
  status: 'scheduled', location: '', notes: '',
};

export default function Appointments() {
  const { requireActive } = useSubscription();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [apptRes, contactsRes] = await Promise.all([
      supabase.from('appointments').select('*, contact:contacts(*)').order('start_time', { ascending: true }),
      supabase.from('contacts').select('id, name, phone, email').order('name'),
    ]);
    setAppointments((apptRes.data || []) as Appointment[]);
    setContacts((contactsRes.data || []) as Contact[]);
    setLoading(false);
  };

  const openCreate = (date?: Date) => {
    requireActive('Appointment Booking', () => {
      const d = date || new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      setForm({ ...emptyForm, start_time: `${dateStr}T09:00`, end_time: `${dateStr}T10:00` });
      setEditId(null);
      setShowForm(true);
    });
  };

  const openEdit = (appt: Appointment) => {
    setForm({
      contact_id: appt.contact_id || '',
      title: appt.title,
      description: appt.description,
      start_time: appt.start_time.slice(0, 16),
      end_time: appt.end_time.slice(0, 16),
      status: appt.status,
      location: appt.location,
      notes: appt.notes,
    });
    setEditId(appt.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.start_time || !form.end_time) return;
    const userId = await getCurrentUserId();
    const payload = { ...form, contact_id: form.contact_id || null, user_id: userId };
    if (editId) {
      const { data } = await supabase.from('appointments').update(payload).eq('id', editId).select('*, contact:contacts(*)').single();
      if (data) setAppointments(prev => prev.map(a => a.id === editId ? data as Appointment : a));
    } else {
      const { data } = await supabase.from('appointments').insert(payload).select('*, contact:contacts(*)').single();
      if (data) setAppointments(prev => [...prev, data as Appointment]);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const remove = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const updateStatus = async (id: string, status: Appointment['status']) => {
    const { data } = await supabase.from('appointments').update({ status }).eq('id', id).select('*, contact:contacts(*)').single();
    if (data) setAppointments(prev => prev.map(a => a.id === id ? data as Appointment : a));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const apptsByDate = appointments.reduce((acc, appt) => {
    const d = new Date(appt.start_time);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(appt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const selectedAppts = selectedDate
    ? apptsByDate[`${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`] || []
    : appointments;

  const today = new Date();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['scheduled', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
          <div
            key={s}
            className="rounded-2xl p-4 text-center"
            style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-2xl font-bold text-white">{appointments.filter(a => a.status === s).length}</p>
            <p className="text-sm capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{s}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">{MONTHS[month]} {year}</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setViewDate(new Date(year, month - 1))}
                className="p-1.5 rounded-lg transition-colors"
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
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setViewDate(new Date(year, month + 1))}
                className="p-1.5 rounded-lg transition-colors"
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
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(year, month, day);
              const key = `${year}-${month}-${day}`;
              const hasAppts = !!apptsByDate[key];
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDate?.getFullYear() === year && selectedDate?.getMonth() === month && selectedDate?.getDate() === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : d)}
                  className="aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all relative"
                  style={
                    isSelected
                      ? { background: 'rgba(57,230,57,0.15)', color: '#39e639', border: '1px solid rgba(57,230,57,0.3)' }
                      : isToday
                      ? { background: '#06b6d4', color: '#fff' }
                      : { color: 'rgba(255,255,255,0.7)' }
                  }
                  onMouseEnter={e => {
                    if (!isSelected && !isToday)
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && !isToday)
                      (e.currentTarget as HTMLButtonElement).style.background = '';
                  }}
                >
                  {day}
                  {hasAppts && !isSelected && (
                    <div
                      className="absolute bottom-1 w-1 h-1 rounded-full"
                      style={{ background: isToday ? '#fff' : '#39e639' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => openCreate(selectedDate || undefined)}
            className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl transition-all"
            style={{
              border: '2px dashed rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.35)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(57,230,57,0.4)';
              (e.currentTarget as HTMLButtonElement).style.color = '#39e639';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57,230,57,0.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLButtonElement).style.background = '';
            }}
          >
            <Plus size={16} />
            {selectedDate ? `Book ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'New Appointment'}
          </button>
        </div>

        {/* Appointment list */}
        <div
          className="lg:col-span-3 rounded-2xl overflow-hidden"
          style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex items-center justify-between p-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <h3 className="font-bold text-white">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'All Appointments'}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; }}
              >
                Show all
              </button>
            )}
          </div>
          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading...</div>
            ) : selectedAppts.length === 0 ? (
              <div className="p-10 text-center">
                <CalendarDays size={36} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>No appointments</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Click a date to book one.</p>
              </div>
            ) : selectedAppts.map(appt => {
              const start = new Date(appt.start_time);
              const end = new Date(appt.end_time);
              return (
                <div
                  key={appt.id}
                  className="p-4 transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = ''; }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="text-center rounded-xl p-2 min-w-[52px]"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {start.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-xl font-bold text-white leading-none">{start.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-white text-sm">{appt.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[appt.status]}`}>
                          {appt.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <Clock size={11} />
                          {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {appt.contact && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <User size={11} />
                            {(appt.contact as Contact).name}
                          </span>
                        )}
                        {appt.location && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <MapPin size={11} />
                            {appt.location}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {appt.status !== 'confirmed' && appt.status !== 'completed' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'confirmed')}
                            className="text-xs px-2 py-1 rounded-lg transition-colors font-medium"
                            style={{ color: '#6ee7b7' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(110,231,183,0.1)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                          >
                            Confirm
                          </button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(appt.id, 'completed')}
                            className="text-xs px-2 py-1 rounded-lg transition-colors font-medium"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(appt)}
                          className="text-xs px-2 py-1 rounded-lg transition-colors font-medium"
                          style={{ color: '#93c5fd' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(147,197,253,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(appt.id)}
                          className="text-xs px-2 py-1 rounded-lg transition-colors font-medium"
                          style={{ color: '#f87171' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.1)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div
            className="rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: '#0d1420', border: '1px solid rgba(57,230,57,0.15)' }}
          >
            <div
              className="flex items-center justify-between p-5 sticky top-0"
              style={{ background: '#0d1420', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h3 className="font-bold text-white">{editId ? 'Edit Appointment' : 'New Appointment'}</h3>
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
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Hair Consultation"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Start *</label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.85)',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>End *</label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.85)',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Client</label>
                <select
                  value={form.contact_id}
                  onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                    colorScheme: 'dark',
                  }}
                >
                  <option value="">Select client...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Address or video link"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Status</label>
                <div className="flex gap-2 flex-wrap">
                  {(['scheduled', 'confirmed', 'completed', 'cancelled'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
                      style={
                        form.status === s
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
                <label className="text-sm font-semibold block mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes..."
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
                disabled={!form.title || !form.start_time || !form.end_time}
                className="flex items-center gap-2 disabled:opacity-40 text-white text-sm font-medium px-5 py-2 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#39e639,#22a822)' }}
              >
                <Save size={15} />
                {editId ? 'Update' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
