import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root')!);
const params = new URLSearchParams(window.location.search);
const isApp = params.has('app') || params.has('investor');

async function render() {
  if (isApp) {
    const [{ default: App }] = await Promise.all([import('./App.tsx'), import('./index.css')]);
    root.render(<StrictMode><App /></StrictMode>);
    return;
  }
  await import('./landing/landing.css');
  const { default: Page } = await import('./landing/LandingPage');
  root.render(<StrictMode><Page /></StrictMode>);
}

void render();
