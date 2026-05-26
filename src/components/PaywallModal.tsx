import { X, Zap, CheckCircle2, Lock, ArrowRight, Bot, CalendarDays, Share2, MessageSquareText, Globe } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';


const features = [
  { icon: Bot, label: 'Ai Assistant — unlimited conversations' },
  { icon: MessageSquareText, label: 'Ai Text Back — auto-reply to every message' },
  { icon: CalendarDays, label: 'Appointment booking & calendar management' },
  { icon: Share2, label: 'Social Hub — all platforms unified' },
  { icon: Globe, label: 'Free Ai website + hosting included' },
  { icon: Zap, label: '24/7 automation — capture leads while you sleep' },
];

export default function PaywallModal() {
  const { hidePaywall, paywallFeature, paywallVisible } = useSubscription();

  if (!paywallVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={hidePaywall}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative p-8 text-white text-center" style={{ background: 'linear-gradient(135deg, #03045e 0%, #0a0f6e 60%, #0e1a80 100%)' }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25" style={{ background: '#37ca37', transform: 'translate(30%, -40%)' }} />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-25" style={{ background: '#188bf6', transform: 'translate(-20%, 40%)' }} />
          </div>

          <button
            onClick={hidePaywall}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(55,202,55,0.2)', border: '1px solid rgba(55,202,55,0.4)' }}>
              <Lock size={28} style={{ color: '#37ca37' }} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: 'rgba(55,202,55,0.15)', border: '1px solid rgba(55,202,55,0.3)', color: '#37ca37' }}>
              <Zap size={11} />
              Activate Your My Zippy App Plan
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {paywallFeature ? `Unlock ${paywallFeature}` : 'Unlock Full Access'}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              You're in preview mode. Activate your subscription to go live and start capturing real leads, bookings, and auto-replies.
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl p-4 mb-5 border" style={{ background: 'rgba(55,202,55,0.04)', borderColor: 'rgba(55,202,55,0.2)' }}>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-bold text-slate-900">$497</span>
              <span className="text-slate-500 text-sm">/month</span>
            </div>
            <p className="text-xs text-slate-500">Everything you need to run your business on autopilot</p>
          </div>

          <div className="space-y-2.5 mb-6">
            {features.map(({ label }) => (
              <div key={label} className="flex items-center gap-3">
                <CheckCircle2 size={17} style={{ color: '#37ca37' }} className="flex-shrink-0" />
                <span className="text-sm text-slate-700">{label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <a
              href="mailto:support@myzippyapp.com?subject=Activate%20My%20Zippy%20App%20Plan&body=Hi%2C%20I%27d%20like%20to%20activate%20my%20My%20Zippy%20App%20Pro%20plan.%20Please%20send%20me%20a%20payment%20link."
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #37ca37, #188bf6)' }}
            >
              Activate Now — $497/mo
              <ArrowRight size={18} />
            </a>
            <button
              onClick={hidePaywall}
              className="w-full py-2.5 rounded-2xl text-slate-500 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Continue previewing
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Our team will send you a secure payment link to complete activation.
          </p>
        </div>
      </div>
    </div>
  );
}
