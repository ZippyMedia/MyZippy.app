import { useEffect, useState, useCallback } from 'react';
import { Building2, Bell, Bot, Globe, Save, CheckCircle, ChevronRight, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BusinessSettings {
  business_name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  industry: string;
  bio: string;
  notification_new_message: boolean;
  notification_new_appointment: boolean;
  notification_appointment_reminder: boolean;
  notification_ai_auto_reply: boolean;
  notification_weekly_report: boolean;
  notification_marketing_tips: boolean;
  ai_auto_reply_enabled: boolean;
  ai_response_delay: number;
  ai_tone: string;
  ai_language: string;
  ai_sign_off: string;
  ai_greeting_enabled: boolean;
}

const defaultSettings: BusinessSettings = {
  business_name: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  industry: 'Beauty & Wellness',
  bio: '',
  notification_new_message: true,
  notification_new_appointment: true,
  notification_appointment_reminder: true,
  notification_ai_auto_reply: true,
  notification_weekly_report: false,
  notification_marketing_tips: false,
  ai_auto_reply_enabled: true,
  ai_response_delay: 30,
  ai_tone: 'friendly',
  ai_language: 'english',
  ai_sign_off: 'The Team',
  ai_greeting_enabled: true,
};

const industries = [
  'Beauty & Wellness', 'Health & Fitness', 'Restaurant & Food',
  'Retail & E-Commerce', 'Real Estate', 'Legal Services',
  'Medical & Dental', 'Education & Tutoring', 'Home Services',
  'Automotive', 'Technology', 'Finance & Accounting', 'Other',
];

const tones = ['friendly', 'professional', 'casual', 'formal', 'enthusiastic'];
const languages = ['english', 'spanish', 'french', 'portuguese', 'german'];
const delays = [0, 15, 30, 60, 120, 300];

type Section = 'profile' | 'notifications' | 'ai' | 'aiwebsite';

const sections: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'profile', label: 'Business Profile', icon: Building2, desc: 'Your business info & contact details' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email & push notification preferences' },
  { id: 'ai', label: 'AI Configuration', icon: Bot, desc: 'Auto-reply, tone & language settings' },
  { id: 'aiwebsite', label: 'AI Website', icon: Globe, desc: 'Free AI-generated website & hosting' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
      style={{ background: checked ? '#39e639' : 'rgba(255,255,255,0.12)' }}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-white/30"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.85)',
          '--tw-ring-color': '#188bf6',
        } as React.CSSProperties}
        onFocus={e => e.target.style.setProperty('--tw-ring-color', '#188bf6')}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

export default function Settings({ initialSection }: { initialSection?: string }) {
  const [activeSection, setActiveSection] = useState<Section>(
    (initialSection as Section) ?? 'profile'
  );
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection as Section);
  }, [initialSection]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('business_settings')
      .select('*')
      .is('user_id', null)
      .maybeSingle();

    if (data) {
      setSettingsId(data.id);
      const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest } = data;
      setSettings({ ...defaultSettings, ...rest });
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const set = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    const payload = { ...settings, user_id: null, updated_at: new Date().toISOString() };
    if (settingsId) {
      await supabase.from('business_settings').update(payload).eq('id', settingsId);
    } else {
      const { data } = await supabase.from('business_settings').insert(payload).select('id').maybeSingle();
      if (data) setSettingsId(data.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderProfile = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Business Name" value={settings.business_name} onChange={v => set('business_name', v)} placeholder="My Business" />
        <SelectField label="Industry" value={settings.industry} onChange={v => set('industry', v)} options={industries} />
        <InputField label="Email" value={settings.email} onChange={v => set('email', v)} type="email" placeholder="hello@mybusiness.com" />
        <InputField label="Phone" value={settings.phone} onChange={v => set('phone', v)} placeholder="+1 (555) 000-0000" />
        <InputField label="Website" value={settings.website} onChange={v => set('website', v)} placeholder="https://mybusiness.com" />
        <InputField label="Address" value={settings.address} onChange={v => set('address', v)} placeholder="123 Main St" />
        <InputField label="City" value={settings.city} onChange={v => set('city', v)} placeholder="New York" />
        <InputField label="State" value={settings.state} onChange={v => set('state', v)} placeholder="NY" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Business Bio</label>
        <textarea
          value={settings.bio}
          onChange={e => set('bio', e.target.value)}
          rows={4}
          placeholder="Tell customers what makes your business special..."
          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none placeholder-white/30"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.85)',
          }}
        />
      </div>
    </div>
  );

  const renderNotifications = () => {
    const notifItems = [
      { key: 'notification_new_message' as const, label: 'New Message', desc: 'When a new message arrives from any platform' },
      { key: 'notification_new_appointment' as const, label: 'New Appointment', desc: 'When a client books an appointment' },
      { key: 'notification_appointment_reminder' as const, label: 'Appointment Reminder', desc: '24 hours before upcoming appointments' },
      { key: 'notification_ai_auto_reply' as const, label: 'AI Auto-Reply', desc: 'When AI automatically responds to a message' },
      { key: 'notification_weekly_report' as const, label: 'Weekly Report', desc: 'Summary of your business activity each week' },
      { key: 'notification_marketing_tips' as const, label: 'Marketing Tips', desc: 'Tips to grow your business with Zippy' },
    ];
    return (
      <div className="space-y-1">
        {notifItems.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between py-3.5 last:border-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
            </div>
            <Toggle checked={settings[key] as boolean} onChange={v => set(key, v)} />
          </div>
        ))}
      </div>
    );
  };

  const renderAI = () => (
    <div className="space-y-5">
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>AI Auto-Reply</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Automatically respond to incoming messages</p>
        </div>
        <Toggle checked={settings.ai_auto_reply_enabled} onChange={v => set('ai_auto_reply_enabled', v)} />
      </div>

      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>AI Greeting</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Send a welcome message to new contacts</p>
        </div>
        <Toggle checked={settings.ai_greeting_enabled} onChange={v => set('ai_greeting_enabled', v)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField label="Response Tone" value={settings.ai_tone} onChange={v => set('ai_tone', v)} options={tones} />
        <SelectField label="Language" value={settings.ai_language} onChange={v => set('ai_language', v)} options={languages} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Response Delay</label>
        <div className="flex gap-2 flex-wrap">
          {delays.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => set('ai_response_delay', d)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                settings.ai_response_delay === d
                  ? { background: '#188bf6', border: '1px solid transparent', color: '#ffffff' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }
              }
            >
              {d === 0 ? 'Instant' : d < 60 ? `${d}s` : `${d / 60}m`}
            </button>
          ))}
        </div>
      </div>

      <InputField label="Sign-off Name" value={settings.ai_sign_off} onChange={v => set('ai_sign_off', v)} placeholder="The Team" />
    </div>
  );

  const renderAIWebsite = () => (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4 text-white" style={{ background: 'linear-gradient(135deg, #03045e 0%, #0a0f6e 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: '#37ca37' }} />
            <span className="text-xs font-bold" style={{ color: '#37ca37' }}>FREE with every plan — $497/mo value</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Your AI-Generated Website</h3>
          <p className="text-white/60 text-sm">We build, host, and optimize your website automatically using your business profile. No developers needed.</p>
        </div>
        <div
          className="p-5 space-y-4"
          style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['AI-Generated Design', 'Free Hosting Included', 'SEO Optimized', 'Mobile Responsive', 'CRM Connected', 'Auto-Updated'].map(feat => (
              <div key={feat} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{feat}</span>
              </div>
            ))}
          </div>

          {settings.website ? (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(57,230,57,0.1)', border: '1px solid rgba(57,230,57,0.25)' }}
            >
              <CheckCircle size={16} className="flex-shrink-0" style={{ color: '#39e639' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#6ef06e' }}>Website Active</p>
                <span className="text-xs truncate block" style={{ color: '#39e639' }}>{settings.website}</span>
              </div>
              <span className="flex-shrink-0 opacity-50 cursor-not-allowed">
                <ExternalLink size={14} style={{ color: '#39e639' }} />
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #37ca37, #188bf6)' }}
            >
              <Globe size={16} />
              Generate My Free Website
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const sectionContent: Record<Section, () => JSX.Element> = {
    profile: renderProfile,
    notifications: renderNotifications,
    ai: renderAI,
    aiwebsite: renderAIWebsite,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      {/* Sidebar nav */}
      <div
        className="w-full lg:w-64 xl:w-72 flex-shrink-0"
        style={{
          background: '#0d1420',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="p-4 lg:p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Settings</h2>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {sections.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 flex-shrink-0 lg:w-full"
                style={
                  activeSection === id
                    ? { background: 'linear-gradient(135deg, #03045e, #0e1a80)', color: '#ffffff' }
                    : { color: 'rgba(255,255,255,0.6)' }
                }
                onMouseEnter={e => {
                  if (activeSection !== id) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeSection !== id) {
                    (e.currentTarget as HTMLButtonElement).style.background = '';
                  }
                }}
              >
                <Icon size={16} style={{ color: activeSection === id ? '#39e639' : 'rgba(255,255,255,0.4)' }} />
                <div className="min-w-0 hidden lg:block">
                  <p className="text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-xs leading-tight mt-0.5" style={{ color: activeSection === id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)' }}>{desc}</p>
                </div>
                <span className="lg:hidden text-xs font-semibold whitespace-nowrap">{label}</span>
                {activeSection === id && <ChevronRight size={14} className="ml-auto hidden lg:block" style={{ color: 'rgba(255,255,255,0.4)' }} />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(255,255,255,0.4)' }} />
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white">{sections.find(s => s.id === activeSection)?.label}</h3>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{sections.find(s => s.id === activeSection)?.desc}</p>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: '#0d1420', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {sectionContent[activeSection]()}
            </div>

            {activeSection !== 'aiwebsite' && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: saved ? '#37ca37' : 'linear-gradient(135deg, #188bf6, #0e6fd4)' }}
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : saved ? (
                    <CheckCircle size={15} />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
