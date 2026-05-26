import { Bell, Menu, X } from 'lucide-react';
import { NavPage } from '../types';

interface HeaderProps {
  currentPage: NavPage;
  onMenuToggle: () => void;
  onClose: () => void;
}

const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your business performance' },
  assistant: { title: 'AI Assistant', subtitle: 'Your intelligent business advisor' },
  textback: { title: 'AI Text Back', subtitle: 'Automated response rules and triggers' },
  appointments: { title: 'Appointments', subtitle: 'Schedule and manage bookings' },
  social: { title: 'Social Hub', subtitle: 'All your platforms in one place' },
  contacts: { title: 'Contacts', subtitle: 'Manage your customers and leads' },
  settings: { title: 'Settings', subtitle: 'Configure your business profile' },
};

export default function Header({ currentPage, onMenuToggle, onClose }: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];
  const showClose = currentPage !== 'dashboard';

  return (
    <header
      className="h-16 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-10"
      style={{
        background: '#050a12',
        borderBottom: '1px solid rgba(57,230,57,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl transition-colors lg:hidden"
        style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-extrabold text-lg leading-tight" style={{ color: '#fff' }}>
          {title}
        </h1>
        <p className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
      </div>

      <button
        className="relative p-2 rounded-xl transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#39e639', boxShadow: '0 0 6px #39e639' }} />
      </button>

      {showClose ? (
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 lg:hidden"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)',
          }}
          aria-label="Close section"
        >
          <X size={18} />
        </button>
      ) : null}

      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden hidden lg:flex items-center justify-center"
        style={{ background: '#000' }}
      >
        <img
          src="/zippy-mascot-transparent.png"
          alt="Zippy"
          className="w-9 h-9 object-contain"
          style={{ filter: 'drop-shadow(0 0 5px rgba(57,230,57,0.4)) drop-shadow(0 0 12px rgba(57,230,57,0.2))' }}
        />
      </div>
    </header>
  );
}
