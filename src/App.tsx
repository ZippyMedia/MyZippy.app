import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import AITextBack from './pages/AITextBack';
import Appointments from './pages/Appointments';
import SocialHub from './pages/SocialHub';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import InvestorPage from './pages/InvestorPage';
import TrialBanner from './components/TrialBanner';
import PaywallModal from './components/PaywallModal';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { NavPage } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [settingsSection, setSettingsSection] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (typeof window !== 'undefined' && window.location.search.includes('investor')) {
    return <InvestorPage />;
  }

  const navigateToSettings = (section?: string) => {
    setSettingsSection(section);
    setCurrentPage('settings');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigateToSettings={navigateToSettings} onNavigate={setCurrentPage} />;
      case 'assistant': return <AIAssistant />;
      case 'textback': return <AITextBack />;
      case 'appointments': return <Appointments />;
      case 'social': return <SocialHub />;
      case 'contacts': return <Contacts />;
      case 'settings': return <Settings initialSection={settingsSection} />;
    }
  };

  return (
    <SubscriptionProvider>
      <div className="min-h-screen flex flex-col" style={{ background: '#050a12' }}>
        {/* <TrialBanner /> */}
        <div className="flex flex-1 min-h-0">
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(o => !o)}
          />
          <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
            <Header
              currentPage={currentPage}
              onMenuToggle={() => setSidebarOpen(o => !o)}
              onClose={() => setCurrentPage('dashboard')}
            />
            <main className="flex-1 overflow-auto">
              {renderPage()}
            </main>
          </div>
        </div>
        <PaywallModal />
      </div>
    </SubscriptionProvider>
  );
}
