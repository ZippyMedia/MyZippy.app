import { Zap, ArrowRight, Clock, AlertTriangle, X, Star } from 'lucide-react';
import { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';

export default function TrialBanner() {
  const { status, trialDaysLeft, showPaywall } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (status === 'loading' || status === 'active' || dismissed) return null;

  if (status === 'expired' || status === 'cancelled') {
    return (
      <div className="text-white px-6 py-4 flex items-center gap-4 justify-between" style={{ background: '#0d1420', borderBottom: '1px solid rgba(57,230,57,0.15)' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle size={20} className="flex-shrink-0" style={{ color: '#39e639' }} />
          <div>
            <p className="font-bold text-base">Your trial has expired</p>
            <p className="text-sm hidden sm:block" style={{ color: 'rgba(255,255,255,0.45)' }}>Activate your plan to restore full access and go live.</p>
          </div>
        </div>
        <button
          onClick={showPaywall}
          className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #39e639, #22a822)' }}
        >
          <Zap size={14} />
          Activate Now — $497/mo
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  const isUrgent = trialDaysLeft <= 3;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: '#050a12',
        borderBottom: '1px solid rgba(57,230,57,0.12)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 w-96 h-full opacity-10 blur-2xl"
          style={{ background: '#37ca37', transform: 'translateX(-50%)' }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-full opacity-10 blur-2xl"
          style={{ background: '#188bf6' }}
        />
      </div>

      <div className="relative px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(55,202,55,0.2)', border: '1px solid rgba(55,202,55,0.4)' }}>
            {isUrgent ? (
              <AlertTriangle size={16} className="text-amber-300" />
            ) : (
              <Clock size={16} className="text-cyan-300" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm sm:text-base leading-tight">
              {trialDaysLeft === 0
                ? 'Last day of your free preview!'
                : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in your free preview`}
            </p>
            <p className="text-white/55 text-xs sm:text-sm hidden sm:block truncate">
              You're in demo mode — nothing is live yet. Activate to start capturing real leads & bookings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-white/60 text-xs">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span>AI Website included</span>
          </div>

          <button
            onClick={showPaywall}
            className="relative group flex items-center gap-2 text-white text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all hover:scale-105 active:scale-[0.98] shadow-lg"
            style={{ background: 'linear-gradient(135deg, #37ca37, #22a822)' }}
          >
            <Zap size={14} className="flex-shrink-0" />
            <span>Activate — $497<span className="font-normal opacity-80">/mo</span></span>
            <ArrowRight size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {!isUrgent && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-white/30 hover:text-white/60 transition-colors rounded-lg hover:bg-white/10"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
