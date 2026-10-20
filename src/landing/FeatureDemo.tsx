"use client";

import { useEffect, useRef, useState } from "react";
import { founderCopy } from "./landing-copy";

const features = [
  { icon: "✦", title: "AI Assistant", description: "Smart AI tools that help grow and manage your business.", narration: "Need the perfect response? Your AI Assistant creates a clear, professional reply in seconds. Draft a lead follow-up, respond to an estimate request, or ask a happy customer for a review. Zippy helps you keep the conversation moving." },
  { icon: "◎", title: "ChatGPT", description: "AI-powered content creation, ideas and business support.", narration: "Need a fresh idea or help finding the right words? With ChatGPT-powered business support, you can create content, plan your marketing, and turn your ideas into clear customer messages. Ask Zippy for help, right from the palm of your hand." },
  { icon: "↗", title: "AI Text Back", description: "Instant automated texting for missed calls and new leads.", narration: "Miss a call? Here's where Zippy gets to work. It responds in seconds, so every opportunity stays alive. Zippy captures the lead, starts the conversation, and keeps your business moving forward. Your messages stay together in one inbox, ready when you are." },
  { icon: "▣", title: "Appointments", description: "Simple booking, scheduling and customer reminders.", narration: "Customers can book appointments instantly, while Zippy sends friendly reminders automatically. Keep your schedule organized and help customers remember when to meet you, so you can spend more time doing the work." },
  { icon: "◌", title: "Social Hub", description: "Connect, manage and post across your social platforms.", narration: "Create your social content once, then schedule it everywhere in just a few taps. Social Hub brings your connected social platforms together, making it easier to keep your business visible while you're busy with customers." },
  { icon: "☰", title: "Contacts", description: "Customer profiles, lead tracking and conversation history.", narration: "Every lead, customer, and valuable opportunity stays organized and ready for action. Keep customer details and conversation history together, so you can pick up where you left off and follow up with confidence." },
  { icon: "⌂", title: "AI Website", description: "An AI-enhanced website designed to attract and convert.", narration: "Your AI-enhanced website turns more visitors into real leads for your business. Give customers a clear way to learn about your services, reach out, and take the next step, even when you're away from your phone." },
  { icon: "✉", title: "Broadcasts", description: "Send SMS, email and voice messages to your contacts.", narration: "Send updates, promotions, and special offers whenever you're ready to grow. Broadcasts help you reach your contacts with text, email, or voice messages, keeping your business in touch with the customers who matter." },
  { icon: "⚙", title: "AI Configuration", description: "Control Zippy's tone, language and automated behavior.", narration: "Make Zippy sound like your business. AI Configuration lets you choose the tone, language, and automated behavior that fit your customers. You're in control of how your assistant communicates. MyZippy app. One app. Total control." },
];

const featureStart = 2;
const tour = [
  { title: "Run your business from the palm of your hand", target: "top", narration: "Run your business from the palm of your hand. Never miss a call, client, or dollar again. MyZippy brings your messages, follow-ups, bookings and business tools into one app. Claim your prelaunch pricing and fourteen day free trial, with priority access for the first to respond." },
  { title: "Everything you need to keep business moving", target: "features-intro", narration: "Everything you need to keep business moving. Hear the features, then continue through how it works, our story, the ways to join, and your prelaunch offer. The page scrolls along with the narration. Let's explore what MyZippy can do for your business." },
  ...features.map((feature, index) => ({ ...feature, target: `feature-card-${index}` })),
  { title: "How it works · The missed call", target: "tour-step-0", narration: "Now, let's follow a missed call from start to finish. You're up a ladder, under a sink, driving, or already helping a customer. You can't always stop to answer. That's where Zippy steps in." },
  { title: "How it works · Instant text back", target: "tour-step-1", narration: "Zippy texts the caller back in seconds, using your business's voice. A quick, friendly response gives that customer a reason to stay in touch before calling the next business." },
  { title: "How it works · One inbox", target: "tour-step-2", narration: "The new lead and conversation land in your unified inbox. Caller details stay together with texts, web chat, Messenger, and Instagram, so it's easier to see the whole conversation." },
  { title: "How it works · Follow-up and scheduling", target: "tour-step-3", narration: "Zippy keeps the conversation moving. It can answer common questions, follow up, and offer available appointment times, helping the customer take the next step." },
  { title: "How it works · The booking", target: "tour-step-4", narration: "When the customer books, the appointment appears on your calendar, with the conversation attached to their contact. One connected process helps turn a missed call into a new opportunity." },
  { title: "Built from real experience", target: "why", narration: [founderCopy.heading, ...founderCopy.paragraphs].join(" ") },
  { title: "Get involved · For business owners", target: "tour-member", narration: "Get involved with MyZippy app. Whether you own a business, connect people, or support an organization, there’s a place for you in the MyZippy launch. Everyone will receive their own individual link and QR code. For business owners, become a MyZippy Founding Member. Reserve our prelaunch special offer. The first to respond receive priority access, with a free fourteen day trial beginning when MyZippy app launches. Claim your prelaunch pricing and fourteen day free trial." },
  { title: "Get involved · For connectors", target: "tour-ambassador", narration: "For connectors, become a Founding Zippy Ambassador. Introduce business owners you know. When an eligible referral becomes a paying customer, you earn one hundred dollars. Become an Ambassador and help more business owners discover MyZippy." },
  { title: "Get involved · For organizations", target: "tour-fundraising", narration: "For organizations, become a Zippy Fundraising Partner. Raise money through your supporter network. ZippyMedia donates one hundred dollars for each eligible referred business that becomes a paying customer. Start fundraising and put your connections to work for your organization. However you choose to get involved, you’re helping build the MyZippy community." },
  { title: "Your prelaunch offer", target: "pricing", narration: "One app. Total control. Bring your business communication, follow-ups, bookings, and marketing tools together. Ready to take the next step? Tap Claim your Prelaunch Pricing and fourteen Day Free Trial. You'll receive priority access, with your free fourteen day trial beginning when MyZippy launches. Thank you for taking the tour." },
];

// Prefer youthful male narrators; keep their natural pitch and use a relaxed pace.
function chooseNarrator(voices: SpeechSynthesisVoice[]) {
  const youthful = ["andrew", "guy", "aaron", "evan", "ryan", "joey", "eric"];
  const male = [...youthful, "davis", "alex", "daniel", "matthew", "brian", "david", "mark", "roger", "male"];
  const female = ["aria", "jenny", "samantha", "ava", "allison", "susan", "zira", "female"];
  const novelty = ["bells", "boing", "bubbles", "cellos", "organ", "trinoids", "whisper", "zarvox"];
  const matches = (name: string, hints: string[]) => hints.some(h => new RegExp(`\\b${h}\\b`, "i").test(name));
  const english = voices.filter(v => /^en(?:[-_]|$)/i.test(v.lang) && !matches(v.name, novelty));
  const candidates = english.filter(v => matches(v.name, male) && !matches(v.name, female));
  const score = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    return (matches(name, youthful) ? 100 : 0) + (matches(name, ["natural", "premium", "enhanced", "neural"]) ? 45 : 0) + (/^en[-_]US$/i.test(voice.lang) ? 20 : 0) + (voice.localService ? 1 : 0);
  };
  return candidates.sort((a, b) => score(b) - score(a))[0] || english.find(v => /^en[-_]US$/i.test(v.lang)) || english[0];
}

export default function FeatureDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Your narrated tour starts automatically. If audio doesn’t begin, tap Start Demo.");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const run = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const narrator = useRef<SpeechSynthesisVoice | undefined>(undefined);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayWatch = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (active === null || !playing) return;
    const target = document.getElementById(tour[active].target);
    target?.classList.add("tour-active");
    document.body.classList.add("tour-running");
    return () => {
      target?.classList.remove("tour-active");
      document.body.classList.remove("tour-running");
    };
  }, [active, playing]);

  useEffect(() => {
    const loadVoices = () => {
      if ("speechSynthesis" in window) narrator.current = chooseNarrator(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    const cancel = () => {
      if (transition.current !== null) clearTimeout(transition.current);
      if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
      run.current++;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      utterance.current = null;
      setPlaying(false);
    };
    const visibility = () => { if (document.hidden) { cancel(); setStatus("Demo stopped. Tap Replay Demo to start again."); } };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", cancel);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", loadVoices); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", cancel); cancel(); };
  }, []);

  useEffect(() => {
    const initialRun = run.current;
    const timer = setTimeout(() => {
      if (!document.hidden && run.current === initialRun) start(0, true, true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  function stop() {
    if (transition.current !== null) clearTimeout(transition.current);
    if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
    run.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance.current = null;
    setPlaying(false);
    setStatus("Demo stopped. Tap Replay Demo to start again.");
  }

  function start(index = 0, fullTour = true, autoplay = false) {
    if (transition.current !== null) clearTimeout(transition.current);
    if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
    run.current++;
    const token = run.current;
    setAudioBlocked(false);
    const requestTap = () => {
      if (token !== run.current) return;
      run.current++;
      if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
      window.speechSynthesis.cancel();
      utterance.current = null;
      setActive(null);
      setPlaying(false);
      setAudioBlocked(true);
      setStatus("Tap Start Audio to hear the narrated tour. Your browser needs a tap before playing sound.");
    };
    if (!("speechSynthesis" in window)) {
      setActive(index);
      setPlaying(false);
      setStatus("Audio isn't available in this browser. Choose any feature to read its description.");
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    setPlaying(true);
    // Use one voice throughout the tour, even if the browser loads more later.
    let voice = chooseNarrator(window.speechSynthesis.getVoices()) || narrator.current;
    let voiceChecks = 0;
    const speak = (i: number) => {
      if (token !== run.current) return;
      if (!voice && voiceChecks < 6) {
        voice = chooseNarrator(window.speechSynthesis.getVoices()) || narrator.current;
        if (!voice) {
          voiceChecks++;
          setStatus("Getting your narrator ready…");
          transition.current = setTimeout(() => speak(i), 100);
          return;
        }
      }
      if (i >= tour.length) {
        setPlaying(false);
        utterance.current = null;
        setStatus("Tour complete. Claim your prelaunch offer below, or replay anytime.");
        return;
      }
      setActive(i);
      setStatus(`${fullTour ? "Section " + (i + 1) + " of " + tour.length + " · " : "Now playing · "}${tour[i].title}`);
      const u = new SpeechSynthesisUtterance(tour[i].narration);
      utterance.current = u;
      u.lang = "en-US";
      u.rate = .98;
      u.pitch = 1;
      u.volume = .82;
      if (voice) u.voice = voice;
      let began = false;
      u.onstart = () => {
        if (token !== run.current) return;
        began = true;
        if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
        const card = document.getElementById(tour[i].target);
        if (!card) return;
        const rect = card.getBoundingClientRect();
        // Align each narrated feature's row below the sticky header, even if
        // it was already visible. Cards in the same grid row share a position.
        const isFeature = i >= featureStart && i < featureStart + features.length;
        const isOpening = i < featureStart;
        if (isOpening || isFeature || rect.top < 145 || rect.bottom > window.innerHeight) {
          card.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
            block: isOpening || isFeature ? "start" : "center",
          });
        }
      };
      u.onend = () => {
        if (token !== run.current) return;
        if (fullTour) {
          utterance.current = null;
          transition.current = setTimeout(() => speak(i + 1), 180);
        }
        else { setPlaying(false); utterance.current = null; setStatus(`${tour[i].title} complete. Choose another feature, or replay the full demo.`); }
      };
      u.onerror = () => {
        if (token !== run.current) return;
        if (autoplay && i === index && !began) { requestTap(); return; }
        setPlaying(false);
        utterance.current = null;
        setStatus("Audio couldn't play. Tap a feature to try again; its description is shown below.");
      };
      try {
        window.speechSynthesis.speak(u);
        if (autoplay && i === index && !began && token === run.current) {
          autoplayWatch.current = setTimeout(requestTap, 4000);
        }
      } catch {
        if (autoplay) requestTap();
        else u.onerror?.(new Event("error") as SpeechSynthesisErrorEvent);
      }
    };
    speak(index);
  }

  return <><section className="section feature-section" id="features" aria-labelledby="features-heading">
    <div className="section-heading" id="features-intro"><p className="eyebrow">Features · Audio demo</p><h2 id="features-heading">Everything you need to keep business moving.</h2><p>Hear the features, then continue through how it works, our story, the ways to join, and your prelaunch offer. The page scrolls along with the narration.</p></div>
    <div className="feature-demo-controls">
      <button type="button" className="button" onClick={() => playing ? stop() : start()} aria-label={playing ? "Stop narrated page tour" : active === null ? "Start narrated page tour" : "Replay narrated page tour from the beginning"}>{playing ? "■ Stop Demo" : active === null ? "▶ Start Demo" : "▶ Replay Demo"}</button>
      <p role="status" aria-live="polite">{status}</p>
    </div>
    <div className="feature-layout"><div className="feature-grid">{features.map((f, i) => <button type="button" key={f.title} id={`feature-card-${i}`} className={`feature${active === i + featureStart ? " feature-active" : ""}`} onClick={() => start(i + featureStart, false)} aria-label={`Hear about ${f.title}`} aria-pressed={active === i + featureStart}>
      <span className="feature-icon" aria-hidden="true">{f.icon}</span><span><b>{f.title}</b><small>{f.description}</small><span className="feature-listen">{active === i + featureStart && playing ? "● Playing" : "▶ Listen"}</span></span>
    </button>)}</div></div>
    {active !== null && active >= featureStart && active < featureStart + features.length && <div className="feature-narration"><p className="eyebrow">{tour[active].title}</p><p>{tour[active].narration}</p></div>}
  </section>
    {(active !== null || audioBlocked) && <aside className="tour-player" aria-label="Narrated page tour controls">
      <div><span className="eyebrow">{playing && active !== null ? `Section ${active + 1} of ${tour.length}` : "Narrated page tour"}</span><strong>{playing && active !== null ? tour[active].title : audioBlocked ? "Tap to start your audio tour" : status.startsWith("Tour complete") ? "Tour complete" : "Tour stopped"}</strong></div>
      <button type="button" className="button" onClick={() => playing ? stop() : start()}>{playing ? "■ Stop" : audioBlocked ? "▶ Start Audio" : "▶ Replay"}</button>
    </aside>}
  </>;
}
