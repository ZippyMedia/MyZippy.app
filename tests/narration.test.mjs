import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const code = ts.transpileModule(fs.readFileSync(new URL('../src/landing/FeatureDemo.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;

function player(visible = false) {
  const hooks = [];
  let cursor = 0;
  let timerId = 0;
  const timers = new Map();
  const spoken = [];
  const pendingSpeech = [];
  let currentSpeech = null;
  function beginSpeech(u) {
    currentSpeech = u;
    spoken.push(u);
    const ended = u.onend;
    u.onend = () => {
      if (currentSpeech !== u) { ended(); return; }
      currentSpeech = null;
      ended();
      if (!currentSpeech && pendingSpeech.length) beginSpeech(pendingSpeech.shift());
    };
    u.onstart();
  }
  function enqueueSpeech(u) {
    if (currentSpeech) pendingSpeech.push(u);
    else beginSpeech(u);
  }
  const scrolled = [];
  const effects = [];
  const listeners = new Map();
  const hooksMock = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], value => { hooks[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useEffect(callback) { effects.push(callback); },
  };
  const windowMock = {
    innerHeight: 700,
    matchMedia: () => ({ matches: false }),
    speechSynthesis: {
      getVoices: () => [{ name: 'Andrew Natural', lang: 'en-US', localService: true }],
      cancel() { pendingSpeech.length = 0; currentSpeech = null; }, resume() {},
      speak: enqueueSpeech,
    },
  };
  const doc = {
    addEventListener(name, fn) { listeners.set(name, fn); },
    removeEventListener(name) { listeners.delete(name); },
    getElementById: id => ({
    getBoundingClientRect: () => visible ? ({ top: 200, bottom: 300 }) : ({ top: 900, bottom: 1000 }),
    scrollIntoView(options) { scrolled.push({ id, options }); },
  }) };
  const m = { exports: {} };
  new Function('require', 'module', 'exports', 'window', 'document', 'SpeechSynthesisUtterance', 'setTimeout', 'clearTimeout', code)(
    name => {
      if (name === 'react') return hooksMock;
      if (name === './landing-copy') {
        const data = { exports: {} };
        const source = ts.transpileModule(fs.readFileSync(new URL('../src/landing/landing-copy.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
        new Function('exports', source)(data.exports);
        return data.exports;
      }
      return require(name);
    }, m, m.exports, windowMock, doc,
    class { constructor(text) { this.text = text; } },
    callback => { timers.set(++timerId, callback); return timerId; },
    id => timers.delete(id),
  );
  function render() { cursor = 0; return m.exports.default(); }
  function nodes(element) {
    if (!element || typeof element !== 'object') return [];
    return [element, ...[element.props?.children].flat(Infinity).flatMap(nodes)];
  }
  const click = label => {
    const button = nodes(render()).find(n => n.type === 'button' && n.props['aria-label'] === label);
    assert.ok(button, label); button.props.onClick();
  };
  return {
    spoken, scrolled, click, windowMock,
    queueCount: () => pendingSpeech.length,
    restoreSpeech() { windowMock.speechSynthesis.speak = enqueueSpeech; },
    mount() { effects.length = 0; render(); return effects.at(-1)(); },
    listenForTap() { effects.length = 0; render(); return effects.at(-2)(); },
    tap() { listeners.get('pointerup')?.({ type: 'pointerup', target: { closest: () => false } }); },
    advance() { const entry = timers.entries().next().value; if (entry) { timers.delete(entry[0]); entry[1](); } },
    timerCount: () => timers.size,
  };
}

test('full narration reaches every lower section and scrolls in speech order', () => {
  const p = player(); p.click('Start narrated page tour');
  for (let i = 0; i < 21; i++) {
    assert.equal(p.spoken.length, i + 1);
    p.spoken[i].onend(); p.advance();
  }
  assert.deepEqual(p.scrolled.map(s => s.id), [
    'top', 'features-intro',
    ...Array.from({ length: 9 }, (_, i) => `feature-card-${i}`),
    ...Array.from({ length: 5 }, (_, i) => `tour-step-${i}`),
    'why', 'tour-member', 'tour-ambassador', 'tour-fundraising', 'pricing',
  ]);
  const copySource = fs.readFileSync(new URL('../src/landing/landing-copy.ts', import.meta.url), 'utf8');
  const copy = JSON.parse(copySource.slice(copySource.indexOf('=') + 1).trim().replace(/;$/, ''));
  assert.equal(p.spoken[16].text, [copy.heading, ...copy.paragraphs].join(' '));
  assert.ok(p.spoken[16].text.includes('Giving back with MyZippy.app.'));
  assert.ok(p.spoken[2].text.startsWith('Your AI Assistant'));
  assert.equal(p.spoken[12].text, 'Zippy AI assistant answers or sends a text back instantly. You choose how Zippy responds.');
  const words = p.spoken.reduce((total, u) => total + u.text.split(/\s+/).length, 0);
  assert.ok(words <= 500, `Concise tour exceeds 500 words: ${words}`);
  assert.match(p.spoken[17].text, /For business owners/);
  assert.match(p.spoken[17].text, /Your registration email includes your individual link and QR code/);
  assert.ok(p.spoken[0].text.startsWith('Run your business from the palm of your hand.'));
  assert.ok(p.spoken[1].text.startsWith('Everything you need to keep business moving.'));
  assert.match(p.spoken[18].text, /For connectors/);
  assert.match(p.spoken[19].text, /For organizations/);
  assert.match(p.spoken[20].text, /free fourteen day trial begins when MyZippy app launches/i);
  assert.ok(p.spoken.every(u => u.voice.name === 'Andrew Natural'));
  assert.equal(p.timerCount(), 0);
  p.click('Replay narrated page tour from the beginning');
  assert.equal(p.scrolled.at(-1).id, 'top');
});

test('stop clears prepared speech and ignores stale speech callbacks', () => {
  const p = player(); p.click('Start narrated page tour');
  const old = p.spoken[0];
  assert.equal(p.queueCount(), 1);
  p.click('Stop narrated page tour');
  old.onend(); p.advance();
  assert.equal(p.timerCount(), 0);
  assert.equal(p.queueCount(), 0);
  assert.equal(p.spoken.length, 1);
});

test('a feature click plays only that feature', () => {
  const p = player(); p.click('Hear about Contacts');
  p.spoken[0].onend(); p.advance();
  assert.equal(p.spoken.length, 1);
  assert.equal(p.scrolled[0].id, 'feature-card-5');
});

test('unsupported speech leaves the feature cards usable', () => {
  const p = player(); delete p.windowMock.speechSynthesis;
  p.click('Start narrated page tour');
  p.click('Hear about Contacts');
  assert.equal(p.spoken.length, 0);
});

// A row must follow the narrator even when it was already within the viewport.
test('visible feature rows align below the header as narration advances', () => {
  const p = player(true); p.click('Start narrated page tour');
  for (let i = 0; i < 10; i++) { p.spoken[i].onend(); p.advance(); }
  assert.equal(p.scrolled.length, 11);
  assert.ok(p.scrolled.every(s => s.options.block === 'start'));
  assert.ok(p.scrolled.every(s => s.options.behavior === 'smooth'));
  assert.equal(p.scrolled.at(-1).id, 'feature-card-8');
});

test('opening the page starts the narrated tour without a click', () => {
  const p = player(); p.mount();
  assert.equal(p.spoken.length, 0);
  p.advance();
  assert.equal(p.spoken.length, 1);
  assert.equal(p.scrolled[0].id, 'top');
  assert.equal(p.timerCount(), 0);
});

test('blocked autoplay offers a manual start without scrolling', () => {
  const p = player();
  p.windowMock.speechSynthesis.speak = u => p.spoken.push(u);
  p.mount(); p.advance(); p.advance();
  assert.equal(p.scrolled.length, 0);
  p.restoreSpeech();
  p.click('Start narrated page tour');
  assert.equal(p.scrolled[0].id, 'top');
});

test('autoplay never interrupts a feature selected before it starts', () => {
  const p = player(); p.mount();
  p.click('Hear about Contacts'); p.advance();
  assert.equal(p.spoken.length, 1);
  assert.equal(p.scrolled[0].id, 'feature-card-5');
});

test('leaving before autoplay cancels the automatic start', () => {
  const p = player(); const cleanup = p.mount();
  cleanup(); p.advance();
  assert.equal(p.spoken.length, 0);
});

test('the first page tap starts the tour after browser-blocked autoplay', () => {
  const p = player(); p.listenForTap();
  p.windowMock.speechSynthesis.speak = u => p.spoken.push(u);
  p.mount(); p.advance(); p.advance();
  p.restoreSpeech();
  p.tap();
  assert.equal(p.spoken.length, 2);
  assert.equal(p.scrolled[0].id, 'top');
  p.tap();
  assert.equal(p.spoken.length, 2);
});

test('tapping the page never restarts automatic playback or a stopped tour', () => {
  const p = player(); p.listenForTap(); p.mount(); p.advance();
  p.tap(); assert.equal(p.spoken.length, 1);
  p.click('Stop narrated page tour'); p.tap();
  assert.equal(p.spoken.length, 1);
});

test('the next section is prepared without an artificial pause and selection clears it', () => {
  const p = player(); p.click('Start narrated page tour');
  assert.equal(p.spoken.length, 1);
  assert.equal(p.queueCount(), 1);
  assert.equal(p.timerCount(), 0);
  const first = p.spoken[0];
  p.click('Hear about Contacts');
  assert.equal(p.queueCount(), 0);
  first.onend();
  assert.equal(p.spoken.length, 2);
  assert.equal(p.scrolled.at(-1).id, 'feature-card-5');
});
