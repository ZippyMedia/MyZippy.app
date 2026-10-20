import FeatureDemo from "./FeatureDemo";
import { founderCopy } from "./landing-copy";

const steps = [
  ["The call comes in—and you can’t answer","You’re up a ladder, under a sink, driving, or already with a customer."],
  ["Zippy texts back instantly","Seconds later, the caller gets a reply in your voice—before they call the next business."],
  ["The lead lands in your inbox","Caller details and conversation history stay together with SMS, web chat, Messenger and Instagram."],
  ["Zippy follows up and offers times","It handles common questions, offers available appointments and keeps the conversation moving."],
  ["You get the booking","The appointment appears on your calendar, with the complete conversation attached to the contact."],
];
const signup = "https://app.myzippy.app/trial-signup-page";

export default function Home() {
  return <main>
    <header className="nav-shell">
      <a className="brand brand-logo" href="#top" aria-label="MyZippy.app home"><img src="/myzippy-logo.png" alt="MyZippy.app" /></a>
      <nav aria-label="Primary navigation"><a href="#features">Features</a><a href="#features">Watch Demo</a><a href="#how">How it works</a><a href="#why">Why Zippy</a><a href="#pricing">Pricing</a></nav>
      <a className="button button-small" href={signup}>Claim your Prelaunch Pricing and 14 Day Free Trial</a>
    </header>

    <section className="hero section" id="top">
      <div className="hero-copy"><p className="eyebrow">AI-powered business automation</p><h1>Run your business from the palm of <em>your hand.</em></h1><p className="lead">Never miss a <strong>call, client, or dollar</strong> again. MyZippy brings your messages, follow-ups, bookings and business tools into one app.</p><div className="actions"><a className="button" href={signup}>Claim your Prelaunch Pricing and 14 Day Free Trial</a></div><p className="fineprint">Prelaunch special offer <span>•</span> Priority access for the first to respond</p></div>
      <div className="hero-art"><div className="glow"/><img src="/zippy-hero.png" alt="Zippy mascot holding a phone showing the MyZippy dashboard"/></div>
    </section>
    <div className="ticker"><div>More leads <i>•</i> More bookings <i>•</i> More sales <i>•</i> More freedom <i>•</i> One app. Total control.</div></div>

    <FeatureDemo />

    <section className="section how-section" id="how"><div className="section-heading"><p className="eyebrow">How it works</p><h2>A missed call becomes a booked job—on its own.</h2><p>The recovery loop runs while you’re on the tools. You only step in when there’s something worth your time.</p></div><div className="steps">{steps.map((s,i)=><article id={`tour-step-${i}`} key={s[0]}><span>{i+1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div></article>)}</div></section>

    <section className="section founder" id="why"><div><p className="eyebrow founder-experience">Built from real experience</p><h2>{founderCopy.heading}</h2>{founderCopy.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="stat"><img src="/paul-myzippy.png" alt="Paul, founder of MyZippy.app" /></div></section>

    <section className="section programs" id="get-involved"><div className="section-heading"><p className="eyebrow">Be part of the MyZippy launch</p><h2>Get involved with MyZippy.app.</h2><p>Whether you own a business, connect people, or support an organization, there’s a place for you in the MyZippy launch.</p></div><div className="program-grid involvement-panel">
      <article id="tour-member"><span>For business owners</span><h3>MyZippy Founding Member</h3><p>Reserve our prelaunch special offer. The first to respond receive priority access, with a free 14-day trial beginning when MyZippy.app launches.</p><a href={signup}>Claim your Prelaunch Pricing and 14 Day Free Trial</a></article>
      <article id="tour-ambassador"><span>For connectors</span><h3>Founding Zippy Ambassador</h3><p>Introduce business owners you know. When an eligible referral becomes a paying customer, you earn $100.</p><a href="mailto:info@myzippy.app?subject=Founding%20Zippy%20Ambassador">Become an Ambassador →</a></article>
      <article id="tour-fundraising"><span>For organizations</span><h3>Zippy Fundraising Partner</h3><p>Raise money through your supporter network. ZippyMedia.AI donates $100 for each eligible referred business that becomes a paying customer.</p><a href="mailto:info@myzippy.app?subject=Zippy%20Fundraising%20Partner">Start fundraising →</a></article>
    </div></section>

    <section className="section pricing" id="pricing"><div className="price-copy"><p className="eyebrow">One complete business system</p><h2>One app. Total control.</h2><p>Replace multiple subscriptions, missed opportunities and scattered tools with one complete business platform.</p><ul><li>Capture more leads</li><li>Respond faster</li><li>Stay organized</li></ul></div><div className="price-card"><p>PRELAUNCH SPECIAL OFFER</p><a className="button price-lock-cta" href={signup}>Claim your Prelaunch Pricing and 14 Day Free Trial</a><p>Priority access for the first to respond. Your free 14-day trial begins when MyZippy.app launches.</p><p className="consent-note">By continuing, you agree to our <a href="/terms.html">Terms &amp; Conditions</a> and acknowledge our <a href="/privacy-policy.html">Privacy Policy</a>. If you opt in to texts, message frequency varies; message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not a condition of purchase. See <a href="/terms.html">SMS Terms</a>.</p></div></section>

    <footer className="legal-footer"><nav className="legal-links" aria-label="Legal"><a href="/terms.html">Terms &amp; Conditions</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/terms.html">SMS Terms</a></nav></footer>
  </main>;
}
