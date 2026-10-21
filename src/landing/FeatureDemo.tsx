"use client";

import { useEffect, useRef, useState } from "react";
import { founderCopy } from "./landing-copy";

const features = [
  { icon: "✦", title: "AI Assistant", description: "Smart AI tools that help grow and manage your business.", narration: "Your AI Assistant drafts professional customer replies, estimate follow-ups, and review requests in seconds, helping you keep conversations moving." },
  { icon: "◎", title: "ChatGPT", description: "AI-powered content creation, ideas and business support.", narration: "ChatGPT helps you create content, plan your marketing, find fresh ideas, and turn them into clear customer messages." },
  { icon: "↗", title: "AI Text Back", description: "Instant automated texting for missed calls and new leads.", narration: "AI Text Back helps respond to missed calls and capture new leads. Your unified inbox keeps customer conversations together." },
  { icon: "▣", title: "Appointments", description: "Simple booking, scheduling and customer reminders.", narration: "Appointments lets customers book instantly and sends friendly reminders, helping you stay organized and reduce missed meetings." },
  { icon: "◌", title: "Social Hub", description: "Connect, manage and post across your social platforms.", narration: "Social Hub lets you create content once, then schedule posts across your connected platforms to keep your business visible." },
  { icon: "☰", title: "Contacts", description: "Customer profiles, lead tracking and conversation history.", narration: "Contacts keeps customer details, lead tracking, and conversation history together, making every follow-up easier." },
  { icon: "⌂", title: "AI Website", description: "An AI-enhanced website designed to attract and convert.", narration: "Your AI-enhanced website helps customers discover your services, contact you, and take the next step, even while you're away." },
  { icon: "✉", title: "Broadcasts", description: "Send SMS, email and voice messages to your contacts.", narration: "Broadcasts sends updates, promotions, and offers to your contacts through text, email, or voice." },
  { icon: "⚙", title: "AI Configuration", description: "Control Zippy's tone, language and automated behavior.", narration: "AI Configuration puts you in control of Zippy's tone, language, and automated behavior, so it sounds like your business." },
];

const featureStart = 2;
const tour = [
  { title: "Run your business from the palm of your hand", target: "top", narration: "Run your business from the palm of your hand. MyZippy app offers all the media and marketing tools you need for success. Never miss a call, client, or dollar again." },
  { title: "Everything you need to keep business moving", target: "features-intro", narration: "Everything you need to keep business moving. Let's take a quick look." },
  ...features.map((feature, index) => ({ ...feature, target: `feature-card-${index}` })),
  { title: "How it works · The missed call", target: "tour-step-0", narration: "Here's how it connects: you're working and miss a call." },
  { title: "How it works · Your choice of response", target: "tour-step-1", narration: "Zippy AI assistant answers or sends a text back instantly. You choose how Zippy responds." },
  { title: "How it works · One inbox", target: "tour-step-2", narration: "The lead and conversation land in your unified inbox." },
  { title: "How it works · Follow-up and scheduling", target: "tour-step-3", narration: "Zippy answers questions, follows up, and offers available times." },
  { title: "How it works · The booking", target: "tour-step-4", narration: "The booking appears on your calendar, with the conversation attached." },
  { title: "Built from real experience", target: "why", narration: [founderCopy.heading, ...founderCopy.paragraphs].join(" ") },
  { title: "Get involved · For business owners", target: "tour-member", narration: "For business owners, become a MyZippy Founding Member and reserve prelaunch pricing. The first to respond receive priority access. Your registration email includes your individual link and QR code." },
  { title: "Get involved · For connectors", target: "tour-ambassador", narration: "For connectors, become a Founding Zippy Ambassador. Introduce business owners and earn one hundred dollars when an eligible referral becomes a paying customer." },
  { title: "Get involved · For organizations", target: "tour-fundraising", narration: "For organizations. Zippy Fundraising Partner. Raise money through your supporter network. ZippyMedia.AI donates $100 for each eligible referred business that becomes a paying customer. Start fundraising." },
  { title: "Your prelaunch offer", target: "pricing", narration: "One app. Total control. Claim your Prelaunch Pricing and free fourteen day trial. Your free fourteen day trial begins when MyZippy app launches. Thank you for joining us." },
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
    return (matches(name, youthful) ? 40 : 0) + (matches(name, ["natural", "premium", "enhanced", "neural"]) ? 200 : 0) + (/^en[-_]US$/i.test(voice.lang) ? 20 : 0) + (voice.localService ? 1 : 0);
  };
  return candidates.sort((a, b) => score(b) - score(a))[0] || english.find(v => /^en[-_]US$/i.test(v.lang)) || english[0];
}

export default function FeatureDemo() {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState("Your narrated tour starts automatically. If audio doesn’t begin, tap Start Demo.");
  const [audioBlocked, setAudioBlocked] = useState(false);
  const run = useRef(0);
  const startedOrRequested = useRef(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speechQueue = useRef<SpeechSynthesisUtterance[]>([]);
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
      speechQueue.current = [];
      setPlaying(false);
    };
    const visibility = () => { if (document.hidden) { cancel(); setStatus("Demo stopped. Tap Replay Demo to start again."); } };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", cancel);
    return () => { if ("speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", loadVoices); document.removeEventListener("visibilitychange", visibility); window.removeEventListener("pagehide", cancel); cancel(); };
  }, []);

  useEffect(() => {
    const beginOnInteraction = (event: Event) => {
      if (startedOrRequested.current || document.hidden) return;
      if (event.type === "keydown" && !["Enter", " "].includes((event as KeyboardEvent).key)) return;
      // Dedicated links and controls retain their own actions.
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("a, button, input, textarea, select, [role=button]")) return;
      start(0, true);
    };
    document.addEventListener("pointerup", beginOnInteraction);
    document.addEventListener("keydown", beginOnInteraction);
    return () => {
      document.removeEventListener("pointerup", beginOnInteraction);
      document.removeEventListener("keydown", beginOnInteraction);
    };
  }, []);

  useEffect(() => {
    const initialRun = run.current;
    const timer = setTimeout(() => {
      if (!document.hidden && run.current === initialRun) start(0, true, true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  function stop() {
    startedOrRequested.current = true;
    if (transition.current !== null) clearTimeout(transition.current);
    if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
    run.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    utterance.current = null;
      speechQueue.current = [];
    setPlaying(false);
    setStatus("Demo stopped. Tap Replay Demo to start again.");
  }

  function start(index = 0, fullTour = true, autoplay = false) {
    if (!autoplay) startedOrRequested.current = true;
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
      speechQueue.current = [];
      setActive(null);
      setPlaying(false);
      setAudioBlocked(true);
      setStatus("Tap anywhere on the page to begin the narrated tour. Your browser needs a tap before playing sound.");
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
      speechQueue.current = [];
        setStatus("Tour complete. Claim your prelaunch offer below, or replay anytime.");
        return;
      }
      const u = new SpeechSynthesisUtterance(tour[i].narration);
      speechQueue.current.push(u);
      u.lang = "en-US";
      u.rate = .98;
      u.pitch = 1;
      u.volume = .82;
      if (voice) u.voice = voice;
      let began = false;
      u.onstart = () => {
        if (token !== run.current) return;
        began = true;
        utterance.current = u;
        setActive(i);
        setStatus(`${fullTour ? "Section " + (i + 1) + " of " + tour.length + " · " : "Now playing · "}${tour[i].title}`);
        startedOrRequested.current = true;
        if (autoplayWatch.current !== null) clearTimeout(autoplayWatch.current);
        // Prepare the next section while this one speaks, removing timer gaps.
        if (fullTour && i + 1 < tour.length) speak(i + 1);
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
        speechQueue.current = speechQueue.current.filter(item => item !== u);
        if (fullTour) {
          if (i === tour.length - 1) {
            setPlaying(false);
            utterance.current = null;
            setStatus("Tour complete. Claim your prelaunch offer below, or replay anytime.");
          }
        } else {
          setPlaying(false);
          utterance.current = null;
          setStatus(`${tour[i].title} complete. Choose another feature, or replay the full demo.`);
        }
      };
      u.onerror = () => {
        if (token !== run.current) return;
        if (autoplay && i === index && !began) { requestTap(); return; }
        run.current++;
        window.speechSynthesis.cancel();
        setPlaying(false);
        utterance.current = null;
      speechQueue.current = [];
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
      <div><span className="eyebrow">{playing && active !== null ? `Section ${active + 1} of ${tour.length}` : "Narrated page tour"}</span><strong>{playing && active !== null ? tour[active].title : audioBlocked ? "Tap anywhere to hear the tour" : status.startsWith("Tour complete") ? "Tour complete" : "Tour stopped"}</strong></div>
      <button type="button" className="button" onClick={() => playing ? stop() : start()}>{playing ? "■ Stop" : audioBlocked ? "▶ Start Audio" : "▶ Replay"}</button>
    </aside>}
  </>;
}
