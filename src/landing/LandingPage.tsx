import FeatureDemo from "./FeatureDemo";
import { founderCopy } from "./landing-copy";

const steps = [
  ["The call comes in—and you can’t answer","You’re up a ladder, under a sink, driving, or already with a customer."],
  ["Zippy AI assistant answers or sends a text back instantly.","You choose how Zippy responds."],
  ["The lead lands in your inbox","Caller details and conversation history stay together with SMS, web chat, Messenger and Instagram."],
  ["Zippy follows up and offers times","It handles common questions, offers available appointments and keeps the conversation moving."],
  ["You get the booking","The appointment appears on your calendar, with the complete conversation attached to the contact."],
];
const signup = "https://app.myzippy.app/trial-signup";

export default function Home() {
  return <main>
    <header className="nav-shell">
      <a className="brand brand-logo" href="#top" aria-label="MyZippy.app home"><img src="/myzippy-logo.png" alt="MyZippy.app" /></a>
      <nav aria-label="Primary navigation"><a href="#features">Features</a><a href="https://demo.myzippy.app/">Demo</a><a href="#how">How it works</a><a href="#why">Why Zippy</a><a href="#pricing">Prelaunch offer</a></nav>
    </header>

    <section className="hero section" id="top">
      <div className="hero-copy"><p className="eyebrow">AI-powered business automation</p><h1>Run your business from the palm of <em>your hand.</em></h1><p className="lead">Busy on a job when a customer calls? MyZippy helps you respond to missed calls, keep messages together and manage bookings. <strong>You choose how Zippy responds.</strong></p><div className="actions hero-cta-pair"><a className="button" href="https://demo.myzippy.app/">Click for Demo</a><a className="reservation-link" href={signup}>Reserve your prelaunch offer →</a></div><p className="fineprint">Prelaunch special offer <span>•</span> Priority access for the first to respond</p></div>
      <div className="hero-art"><div className="glow"/><img src="/zippy-hero.png" alt="Zippy mascot holding a phone showing the MyZippy dashboard"/></div>
    </section>
    <div className="ticker"><div>More leads <i>•</i> More bookings <i>•</i> More sales <i>•</i> More freedom <i>•</i> One app. Total control.</div></div>

    <section className="section outcomes" aria-label="What MyZippy helps you do"><article><h2>Respond faster.</h2><p>Help missed callers take the next step while you work.</p></article><article><h2>Stay organized.</h2><p>Keep customer messages and follow-ups together.</p></article><article><h2>Make booking easier.</h2><p>Manage appointments and reminders in one place.</p></article><p className="marketing-line">MyZippy.app offers all the media and marketing tools you need for success.</p></section>
    <FeatureDemo />

    <section className="section how-section" id="how"><div className="section-heading"><p className="eyebrow">How it works</p><h2>From a missed call to the next opportunity.</h2><p>Zippy helps keep the conversation moving while you’re on the tools. You stay in control of the response and the next step.</p></div><div className="steps">{steps.map((s,i)=><article id={`tour-step-${i}`} key={s[0]}><span>{i+1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div></article>)}</div></section>

    <section className="section founder" id="why"><div><p className="eyebrow founder-experience">Built from real experience</p><h2>{founderCopy.heading}</h2>{founderCopy.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="stat"><img src="/paul-myzippy.png" alt="Paul, founder of MyZippy.app" /></div></section>

    <section className="section programs" id="get-involved"><div className="section-heading"><p className="eyebrow">Be part of the MyZippy launch</p><h2>Get involved with MyZippy.app.</h2><p>Whether you own a business, connect people, or support an organization, there’s a place for you in the MyZippy launch.</p></div><div className="program-grid involvement-panel">
      <article id="tour-member"><span>For business owners</span><h3>MyZippy Founding Member</h3><p>Reserve our prelaunch special offer. The first to respond receive priority access, with a Free 14 Day Trial beginning when MyZippy.app launches.</p><a href={signup}>Claim your Prelaunch Pricing and Free 14 Day Trial</a></article>
      <article id="tour-ambassador"><span>For connectors</span><h3>Founding Zippy Ambassador</h3><p>Introduce business owners you know. When an eligible referral becomes a paying customer, you earn $100.</p><a href={`${signup}?interest=ambassador`}>Become an Ambassador →</a></article>
      <article id="tour-fundraising"><span>For organizations</span><h3>Zippy Fundraising Partner</h3><p>Raise money through your supporter network. ZippyMedia.AI donates $100 for each eligible referred business that becomes a paying customer.</p><a href={`${signup}?interest=organization`}>Start fundraising →</a></article>
    </div></section>

    <section className="section pricing" id="pricing"><div className="price-copy"><p className="eyebrow">One complete business system</p><h2>One app. Total control.</h2><p>Replace multiple subscriptions, missed opportunities and scattered tools with one complete business platform.</p><ul><li>Capture more leads</li><li>Respond faster</li><li>Stay organized</li></ul></div><div className="price-card"><p>PRELAUNCH SPECIAL OFFER</p><a className="button price-lock-cta" href={signup}>Claim your Prelaunch Pricing and Free 14 Day Trial</a><p>Priority access for the first to respond. Your Free 14 Day Trial begins when MyZippy.app launches.</p><p className="consent-note">By continuing, you agree to our <a href="/terms.html">Terms &amp; Conditions</a> and acknowledge our <a href="/privacy-policy.html">Privacy Policy</a>. If you opt in to texts, message frequency varies; message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. See <a href="/terms.html">SMS Terms</a>.</p></div></section>

    <footer className="legal-footer"><nav className="legal-links" aria-label="Legal"><a href="/terms.html">Terms &amp; Conditions</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/terms.html">SMS Terms</a></nav></footer>
  </main>;
}
