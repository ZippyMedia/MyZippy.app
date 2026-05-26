import { useEffect, useRef, useState } from 'react';
import {
  Zap, Bot, CalendarDays, MessageSquare, Share2, Globe, PhoneCall,
  Users, TrendingUp, DollarSign, CheckCircle, ArrowRight, Star,
  BarChart2, Inbox, Shield, Clock, Target, ChevronDown, Mail
} from 'lucide-react';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const metrics = [
  { value: '$14.9B', label: 'AI Chatbot Market by 2030', sub: '23% CAGR', icon: TrendingUp, color: '#37ca37' },
  { value: '82%', label: 'SMBs miss inbound calls', sub: 'Lost revenue daily', icon: PhoneCall, color: '#188bf6' },
  { value: '67%', label: 'Customers prefer messaging', sub: 'Over phone calls', icon: MessageSquare, color: '#37ca37' },
  { value: '3.4B', label: 'Social media users', sub: 'Addressable market', icon: Share2, color: '#188bf6' },
];

const features = [
  {
    icon: Bot,
    title: 'AI Sales Assistant',
    desc: 'Always-on AI that qualifies leads, answers questions, and closes deals 24/7 without human intervention.',
    color: '#37ca37',
    bg: 'rgba(55,202,55,0.08)',
  },
  {
    icon: PhoneCall,
    title: 'AI Voice + Text Back',
    desc: 'Missed calls automatically trigger instant AI-powered SMS responses — turning every missed call into a lead.',
    color: '#188bf6',
    bg: 'rgba(24,139,246,0.08)',
  },
  {
    icon: CalendarDays,
    title: '24/7 Appointment Booking',
    desc: 'Clients book appointments automatically at any hour, syncing directly with the business calendar.',
    color: '#37ca37',
    bg: 'rgba(55,202,55,0.08)',
  },
  {
    icon: Inbox,
    title: 'Unified Social Inbox',
    desc: 'Instagram, Facebook, TikTok, Google, LinkedIn, Twitter, and YouTube — all managed from one dashboard.',
    color: '#188bf6',
    bg: 'rgba(24,139,246,0.08)',
  },
  {
    icon: Globe,
    title: 'Free AI Website',
    desc: 'Every subscriber gets a free AI-generated website with hosting, SEO, and CRM integration built in.',
    color: '#37ca37',
    bg: 'rgba(55,202,55,0.08)',
  },
  {
    icon: Users,
    title: 'Contact & CRM',
    desc: 'Centralized lead database with automatic data capture from every platform and interaction.',
    color: '#188bf6',
    bg: 'rgba(24,139,246,0.08)',
  },
  {
    icon: null,
    title: 'ChatGPT-Powered Conversations',
    desc: 'Zippy is built on ChatGPT, delivering human-like conversations that understand context, handle objections, and convert prospects into paying customers — all on autopilot.',
    color: '#37ca37',
    bg: 'rgba(55,202,55,0.08)',
    customIcon: (
      <svg viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
        <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.118 10.079 10.079 0 0 0-9.617 6.977 9.967 9.967 0 0 0-6.663 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.118 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.24-11.818zm-15.113 21.188a7.473 7.473 0 0 1-4.797-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.491 7.669zm-16.152-6.88a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zm-2.102-17.45A7.47 7.47 0 0 1 7.27 10.4c0 .033-.001.065-.001.098v9.2a1.297 1.297 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L5.422 23.761a7.504 7.504 0 0 1-1.257-10.013zm27.688 6.441-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.299a1.293 1.293 0 0 0-.647-1.307zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943 4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V18.232z" fill="#37ca37"/>
      </svg>
    ),
  },
];

const traction = [
  { icon: Target, label: 'Target Market', value: '33M+ US SMBs', color: '#37ca37' },
  { icon: DollarSign, label: 'Starting Price', value: '$297 / month', color: '#188bf6' },
  { icon: BarChart2, label: 'AI Website Value', value: '$497/mo included free', color: '#37ca37' },
  { icon: Clock, label: 'Setup Time', value: 'Under 10 minutes', color: '#188bf6' },
  { icon: Shield, label: 'Infrastructure', value: 'Enterprise-grade', color: '#37ca37' },
  { icon: Star, label: 'AI Availability', value: '24 / 7 / 365', color: '#188bf6' },
];

const competitors = [
  { name: 'Zippy', ai: true, voice: true, social: true, website: true, price: '$297/mo', highlight: true },
  { name: 'HubSpot', ai: false, voice: false, social: false, website: false, price: '$800+/mo', highlight: false },
  { name: 'GoHighLevel', ai: false, voice: false, social: false, website: false, price: '$297/mo', highlight: false },
  { name: 'ManyChat', ai: false, voice: false, social: true, website: false, price: '$99/mo', highlight: false },
];

const platforms = [
  { label: 'IG', name: 'Instagram', gradient: 'from-pink-500 to-rose-600' },
  { label: 'FB', name: 'Facebook', gradient: 'from-blue-600 to-blue-700' },
  { label: 'TK', name: 'TikTok', gradient: 'from-slate-700 to-slate-900' },
  { label: 'G', name: 'Google', gradient: 'from-amber-500 to-orange-500' },
  { label: 'IN', name: 'LinkedIn', gradient: 'from-sky-600 to-sky-700' },
  { label: 'X', name: 'Twitter / X', gradient: 'from-sky-400 to-sky-500' },
  { label: 'YT', name: 'YouTube', gradient: 'from-red-500 to-red-700' },
];

export default function InvestorPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is the core problem Zippy solves?',
      a: 'Small and medium businesses lose an estimated 75% of inbound leads because they miss calls, respond too slowly on social media, or simply lack the staff to follow up 24/7. Zippy replaces that gap with always-on AI — capturing every lead, replying instantly, and booking appointments automatically.',
    },
    {
      q: 'How does Zippy generate revenue?',
      a: 'Zippy operates on a SaaS subscription model starting at $297/month per business. Enterprise and agency tiers provide additional revenue from resellers and white-label deployments.',
    },
    {
      q: 'What is the competitive moat?',
      a: 'Zippy is the only platform combining AI voice-to-text-back, multi-platform social inbox, automated appointment booking, and a free AI-generated website in a single subscription. Competitors offer one or two of these features; Zippy offers the complete stack.',
    },
    {
      q: 'What is the target customer?',
      a: 'Any service-based SMB — salons, dental offices, gyms, contractors, real estate agents, insurance brokers — who relies on inbound calls and social media inquiries to acquire clients. The US alone has 33M+ such businesses.',
    },
    {
      q: 'What stage is the company at?',
      a: 'Zippy has a fully functional product deployed in production with live users. The platform is built on enterprise-grade infrastructure and ready for growth-stage investment to accelerate sales and marketing.',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-inter overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Zippy_Bot_no_background.png" alt="Zippy" className="h-9 w-9 object-contain" />
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#03045e' }}>My Zippy App</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ borderColor: 'rgba(55,202,55,0.4)', color: '#2aaa2a', background: 'rgba(55,202,55,0.07)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-zippy-green animate-pulse" />
              Investor Overview
            </span>
            <button
              disabled
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full text-white/60 cursor-not-allowed opacity-50"
              style={{ background: '#03045e' }}
            >
              <Mail size={13} />
              Contact Us
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-16 pb-24 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #03045e 0%, #0a0f6e 55%, #0d1a8a 100%)' }}
      >
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(55,202,55,0.12)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: 'rgba(24,139,246,0.12)', transform: 'translate(-25%, 30%)' }} />
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-3xl" style={{ background: 'rgba(55,202,55,0.06)', transform: 'translate(-50%, -50%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 text-sm font-semibold" style={{ borderColor: 'rgba(55,202,55,0.35)', background: 'rgba(55,202,55,0.1)', color: '#4dd94d' }}>
              <Zap size={14} />
              Investor Overview — 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.07] mb-6 tracking-tight">
              The AI That Runs<br />
              <span style={{ color: '#37ca37' }}>Your Business</span><br />
              While You Sleep
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
              My Zippy App is the all-in-one AI sales platform built for small businesses — capturing every lead, booking every appointment, and managing every social channel, automatically.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                disabled
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white/60 text-sm cursor-not-allowed opacity-50"
                style={{ background: '#37ca37', boxShadow: '0 8px 32px rgba(55,202,55,0.3)' }}
              >
                Request a Demo
                <ArrowRight size={16} />
              </button>
              <a
                href="#problem"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
              >
                Learn More
                <ChevronDown size={16} />
              </a>
            </div>
          </div>

          {/* Right — Zippy mascot + floating stats */}
          <div className="relative flex-shrink-0 flex items-end justify-center" style={{ width: '320px', height: '360px' }}>
            <img
              src="/Zippy_Bot_no_background.png"
              alt="Zippy Bot"
              className="h-80 w-auto object-contain relative z-10"
              style={{ filter: 'drop-shadow(0 0 48px rgba(55,202,55,0.55))' }}
            />
            {/* Floating badges */}
            <div
              className="absolute top-6 -left-4 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xl animate-bounce"
              style={{ background: 'rgba(24,139,246,0.9)', backdropFilter: 'blur(8px)', animationDuration: '3s' }}
            >
              <div className="flex items-center gap-1.5"><Bot size={12} />AI Active 24/7</div>
            </div>
            <div
              className="absolute top-24 -right-8 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xl"
              style={{ background: 'rgba(55,202,55,0.9)', backdropFilter: 'blur(8px)', animation: 'bounce 3.5s infinite' }}
            >
              <div className="flex items-center gap-1.5"><CalendarDays size={12} />Booked!</div>
            </div>
            <div
              className="absolute bottom-16 -left-10 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xl"
              style={{ background: 'rgba(3,4,94,0.9)', border: '1px solid rgba(55,202,55,0.4)', backdropFilter: 'blur(8px)', animation: 'bounce 4s infinite' }}
            >
              <div className="flex items-center gap-1.5"><MessageSquare size={12} />Lead Captured</div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs">
          <ChevronDown size={18} className="animate-bounce" />
        </div>
      </section>

      {/* MARKET METRICS */}
      <section id="problem" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#188bf6', background: 'rgba(24,139,246,0.08)' }}>Market Opportunity</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">A Trillion-Dollar Problem<br />for 33 Million Businesses</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Small businesses collectively lose billions in revenue every year because they simply can't respond fast enough. Zippy changes that.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map(({ value, label, sub, icon: Icon, color }, i) => (
              <FadeIn key={label} delay={i * 80}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${color}15` }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <p className="text-3xl font-extrabold mb-1 tracking-tight" style={{ color: '#03045e' }}>{value}</p>
                  <p className="text-slate-700 text-sm font-semibold mb-1">{label}</p>
                  <p className="text-xs font-medium" style={{ color }}>{sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#37ca37', background: 'rgba(55,202,55,0.08)' }}>Product</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything a Business Needs,<br />Powered by AI</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Seven integrated modules — one subscription. No extra tools, no extra staff.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color, bg, customIcon }, i) => (
              <FadeIn key={title} delay={i * 60}>
                <div className="rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: bg }}>
                    {customIcon ?? (Icon && <Icon size={22} style={{ color }} />)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PLATFORMS */}
      <section style={{ background: 'linear-gradient(135deg, #03045e 0%, #0a0f6e 100%)' }} className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#4dd94d', background: 'rgba(55,202,55,0.12)' }}>Unified Social Hub</span>
            <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight">All 7 Major Platforms. One Inbox.</h2>
            <p className="text-white/50 max-w-lg mx-auto text-base mb-10">Businesses no longer need to switch between apps. Zippy unifies every customer conversation in one place.</p>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {platforms.map(({ label, name, gradient }, i) => (
                <div key={name} className="flex flex-col items-center gap-2" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold text-sm shadow-lg`}>
                    {label}
                  </div>
                  <span className="text-white/50 text-xs">{name}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TRACTION / KEY STATS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#188bf6', background: 'rgba(24,139,246,0.08)' }}>Business Model</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Built for Scalable,<br />Recurring Revenue</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Every customer is a monthly subscription. High retention, low churn, and a massive addressable market.</p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {traction.map(({ icon: Icon, label, value, color }, i) => (
              <FadeIn key={label} delay={i * 70}>
                <div className="bg-white rounded-2xl px-6 py-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg leading-none mb-1">{value}</p>
                    <p className="text-slate-500 text-xs font-medium">{label}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITIVE COMPARISON */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#37ca37', background: 'rgba(55,202,55,0.08)' }}>Competitive Advantage</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">The Only All-In-One<br />AI Platform for SMBs</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">No competitor offers everything Zippy provides in a single subscription at this price point.</p>
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-5 py-4 font-bold text-slate-700">Platform</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-700">AI Sales</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-700">Voice → Text</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-700">Social Inbox</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-700">Free Website</th>
                    <th className="text-center px-4 py-4 font-bold text-slate-700">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map(({ name, ai, voice, social, website, price, highlight }) => (
                    <tr
                      key={name}
                      className={`border-b border-slate-100 last:border-0 ${highlight ? 'font-semibold' : ''}`}
                      style={highlight ? { background: 'rgba(55,202,55,0.05)' } : {}}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {highlight && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#37ca37' }} />
                          )}
                          <span style={highlight ? { color: '#03045e', fontWeight: 800 } : { color: '#475569' }}>{name}</span>
                          {highlight && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(55,202,55,0.15)', color: '#2aaa2a' }}>Best Value</span>}
                        </div>
                      </td>
                      {[ai, voice, social, website].map((has, i) => (
                        <td key={i} className="text-center px-4 py-4">
                          {has
                            ? <CheckCircle size={18} className="mx-auto" style={{ color: '#37ca37' }} />
                            : <span className="text-slate-300 text-lg font-light mx-auto block">—</span>
                          }
                        </td>
                      ))}
                      <td className="text-center px-4 py-4 font-bold" style={{ color: highlight ? '#03045e' : '#94a3b8' }}>{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full" style={{ color: '#188bf6', background: 'rgba(24,139,246,0.08)' }}>Due Diligence</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Frequently Asked<br />Investor Questions</h2>
            </div>
          </FadeIn>
          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <FadeIn key={i} delay={i * 50}>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  >
                    <span className="font-bold text-slate-900 text-sm leading-snug">{q}</span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-slate-400 transition-transform duration-300"
                      style={{ transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  <div
                    style={{
                      maxHeight: faqOpen === i ? '300px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.35s ease',
                    }}
                  >
                    <p className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{a}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #03045e 0%, #0a0f6e 60%, #0d1a8a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(55,202,55,0.12)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(24,139,246,0.1)', transform: 'translate(-25%, 30%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <img src="/Zippy_Bot_no_background.png" alt="Zippy" className="h-24 w-auto object-contain mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 32px rgba(55,202,55,0.5))' }} />
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
              Ready to Invest in the<br /><span style={{ color: '#37ca37' }}>Future of SMB AI?</span>
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              We're building the operating system for every small business on the planet. Let's talk.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                disabled
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-extrabold text-white/60 text-base cursor-not-allowed opacity-50"
                style={{ background: '#37ca37', boxShadow: '0 10px 40px rgba(55,202,55,0.35)' }}
              >
                <Mail size={18} />
                Request Investor Deck
              </button>
              <button
                disabled
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white/40 text-base border border-white/10 cursor-not-allowed opacity-50"
              >
                Schedule a Call
                <ArrowRight size={16} />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Zippy_Bot_no_background.png" alt="Zippy" className="h-7 w-7 object-contain" />
            <span className="font-extrabold text-sm" style={{ color: '#03045e' }}>My Zippy App</span>
          </div>
          <p className="text-slate-400 text-xs">© 2026 My Zippy App. All rights reserved. For investor inquiries only.</p>
          <span className="text-xs font-semibold opacity-50" style={{ color: '#188bf6' }}>invest@myzippyapp.com</span>
        </div>
      </footer>
    </div>
  );
}
