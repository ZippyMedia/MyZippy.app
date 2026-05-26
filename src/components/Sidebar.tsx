import { LayoutDashboard, Bot, MessageSquare, CalendarDays, Share2, Users, Settings, X, Zap } from 'lucide-react';
import { NavPage } from '../types';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems: { page: NavPage; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'assistant', label: 'AI Assistant', icon: Bot },
  { page: 'textback', label: 'AI Text Back', icon: MessageSquare },
  { page: 'appointments', label: 'Appointments', icon: CalendarDays },
  { page: 'social', label: 'Social Hub', icon: Share2 },
  { page: 'contacts', label: 'Contacts', icon: Users },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const handleNav = (page: NavPage) => {
    onNavigate(page);
    onToggle();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#050a12', borderRight: '1px solid rgba(57,230,57,0.12)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0" style={{ borderBottom: '1px solid rgba(57,230,57,0.1)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,230,57,0.12)', border: '1px solid rgba(57,230,57,0.35)', boxShadow: '0 0 12px rgba(57,230,57,0.2)' }}
            >
              <Zap size={16} style={{ color: '#39e639' }} />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight leading-tight block">
                My<span style={{ color: '#39e639' }}>Zippy</span>.app
              </span>
            </div>
            <img
              src="/zippy-mascot-transparent.png"
              alt="Zippy"
              className="flex-shrink-0 object-contain"
              style={{
                height: '44px',
                width: '44px',
                background: '#000',
                borderRadius: '10px',
                filter: 'drop-shadow(0 0 6px rgba(57,230,57,0.4)) drop-shadow(0 0 14px rgba(57,230,57,0.2))',
              }}
            />
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mascot */}
        <div className="flex justify-center px-4 pt-5 pb-3 flex-shrink-0">
          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ background: '#000' }}
            >
              <img
                src="/zippy-mascot-transparent.png"
                alt="Zippy"
                className="relative object-contain"
                style={{
                  height: '120px',
                  width: '120px',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  filter: 'drop-shadow(0 0 8px rgba(57,230,57,0.4)) drop-shadow(0 0 18px rgba(57,230,57,0.2))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          {navItems.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150"
                style={active
                  ? { background: 'rgba(57,230,57,0.14)', color: '#39e639', boxShadow: '0 0 12px rgba(57,230,57,0.1)' }
                  : { color: 'rgba(255,255,255,0.45)' }
                }
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = ''; } }}
              >
                <Icon size={17} style={active ? { color: '#39e639' } : {}} />
                {label}
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: '#39e639', boxShadow: '0 0 6px #39e639' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(57,230,57,0.1)' }}>
          <p className="text-xs text-center font-medium" style={{ color: 'rgba(57,230,57,0.4)' }}>
            Your 24/7 AI Sales Machine
          </p>
        </div>
      </aside>
    </>
  );
}
