"use client";

import { useState, useEffect, useCallback } from "react";

interface InfoPopupProps {
  appName: string;
  appIcon: string;
  landingHtml: string;
  storageKey?: string;
}

const CSS = `
/* ── CSS Variables (dark theme defaults) ── */
.info-popup-scope {
  --rs-bg-surface: #16213e;
  --rs-bg-page: #1a1a2e;
  --rs-bg-hover: rgba(255,255,255,0.04);
  --rs-primary: #e94560;
  --rs-accent: #14b8a6;
  --rs-text-primary: #eee;
  --rs-text-secondary: #b0b0c0;
  --rs-text-muted: #6b7280;
  --rs-border: rgba(255,255,255,0.08);
  --rs-border-subtle: rgba(255,255,255,0.05);
  --rs-card-bg: rgba(255,255,255,0.03);
  --rs-card-border: rgba(255,255,255,0.06);
  --rs-gradient-brand: linear-gradient(135deg, #14b8a6, #22d3ee);
  --rs-gradient-cta: linear-gradient(135deg, #14b8a6, #06b6d4);
  --rs-btn-secondary-bg: rgba(255,255,255,0.06);
  --rs-border-strong: rgba(255,255,255,0.15);
  --rs-bg-surface-raised: rgba(255,255,255,0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ── Info button (fixed, bottom-right) ── */
.info-popup-trigger {
  position: fixed; bottom: 20px; right: 20px; z-index: 9999;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(20,184,166,0.15), rgba(79,70,229,0.1));
  border: 1px solid rgba(20,184,166,0.3);
  color: #14b8a6; font-size: 1.2rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.info-popup-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(0,0,0,0.4);
  border-color: rgba(20,184,166,0.5);
}

/* ── Backdrop overlay ── */
.rapp-info-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: rapp-overlay-in 0.2s ease-out;
}
@keyframes rapp-overlay-in { from { opacity: 0; } to { opacity: 1; } }

/* ── Panel — centered modal ── */
.rapp-info-panel {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  z-index: 10001;
  width: min(520px, calc(100vw - 32px)); max-height: calc(100vh - 64px);
  background: var(--rs-bg-surface);
  border: 1px solid rgba(20,184,166,0.25);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(20,184,166,0.1), 0 0 60px rgba(20,184,166,0.06);
  display: flex; flex-direction: column; overflow: hidden;
  animation: rapp-info-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes rapp-info-in {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* ── Header with icon + name ── */
.rapp-info-panel__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(20,184,166,0.12), rgba(79,70,229,0.08));
  border-bottom: 1px solid rgba(20,184,166,0.18);
}
.rapp-info-panel__header-left { display: flex; align-items: center; gap: 10px; }
.rapp-info-panel__icon { font-size: 1.5rem; line-height: 1; }
.rapp-info-panel__title {
  font-size: 1.05rem; font-weight: 700; letter-spacing: 0.01em;
  background: linear-gradient(135deg, #14b8a6, #22d3ee);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.rapp-info-panel__close {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  color: var(--rs-text-muted); font-size: 1.2rem; cursor: pointer;
  border-radius: 8px; line-height: 1;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.rapp-info-panel__close:hover {
  color: var(--rs-text-primary); background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.15);
}

/* ── Body ── */
.rapp-info-panel__body {
  padding: 0; overflow-y: auto; flex: 1;
  color: var(--rs-text-secondary); font-size: 0.92rem; line-height: 1.65;
}
.rapp-info-panel__body h1, .rapp-info-panel__body h2, .rapp-info-panel__body h3 {
  color: var(--rs-text-primary); margin: 0 0 8px;
}
.rapp-info-panel__body h1 { font-size: 1.3rem; }
.rapp-info-panel__body h2 { font-size: 1.1rem; }
.rapp-info-panel__body h3 { font-size: 0.95rem; }
.rapp-info-panel__body p { margin: 0 0 10px; }
.rapp-info-panel__body a { color: var(--rs-primary); }

/* ── Panel-scoped overrides for rich landing content ── */
.rapp-info-panel__body .rl-hero { padding: 1.75rem 1.5rem 1.25rem; text-align: center; }
.rapp-info-panel__body .rl-hero .rl-heading { font-size: 1.5rem !important; }
.rapp-info-panel__body .rl-heading { font-size: 1.2rem; margin-bottom: 0.5rem; }
.rapp-info-panel__body .rl-tagline { font-size: 0.65rem; padding: 0.3rem 0.85rem; margin-bottom: 1rem; }
.rapp-info-panel__body .rl-subtitle { font-size: 1rem !important; margin-bottom: 0.75rem; }
.rapp-info-panel__body .rl-subtext { font-size: 0.9rem !important; margin-bottom: 1.25rem; line-height: 1.7; }
.rapp-info-panel__body .rl-hero .rl-subtext { font-size: 0.92rem !important; }
.rapp-info-panel__body .rl-section { padding: 1.5rem 1.25rem; border-top: 1px solid var(--rs-border-subtle); }
.rapp-info-panel__body .rl-section--alt { background: rgba(20,184,166,0.03); }
.rapp-info-panel__body .rl-container { max-width: 100%; }
.rapp-info-panel__body .rl-grid-2,
.rapp-info-panel__body .rl-grid-3,
.rapp-info-panel__body .rl-grid-4 { grid-template-columns: 1fr 1fr !important; gap: 0.75rem; }
.rapp-info-panel__body .rl-card { padding: 1.15rem; border-radius: 0.75rem; }
.rapp-info-panel__body .rl-card h3 { font-size: 0.88rem; margin-bottom: 0.35rem; }
.rapp-info-panel__body .rl-card p { font-size: 0.82rem; line-height: 1.55; margin-bottom: 0; }
.rapp-info-panel__body .rl-icon-box { width: 2.5rem; height: 2.5rem; font-size: 1.25rem; border-radius: 0.6rem; margin-bottom: 0.65rem; }
.rapp-info-panel__body .rl-card--center .rl-icon-box { margin: 0 auto 0.65rem; }
.rapp-info-panel__body .rl-step__num { width: 2.25rem; height: 2.25rem; font-size: 0.75rem; margin-bottom: 0.5rem; }
.rapp-info-panel__body .rl-step h3 { font-size: 0.88rem; }
.rapp-info-panel__body .rl-step p { font-size: 0.82rem; }
.rapp-info-panel__body .rl-cta-row { margin-top: 1.5rem; gap: 0.625rem; display: flex; flex-wrap: wrap; justify-content: center; }
.rapp-info-panel__body .rl-cta-primary {
  padding: 0.75rem 1.5rem; font-size: 0.92rem; font-weight: 600;
  border-radius: 10px; text-decoration: none;
  background: var(--rs-gradient-cta, linear-gradient(135deg, #14b8a6, #06b6d4));
  color: #fff; box-shadow: 0 4px 16px rgba(20,184,166,0.3);
  transition: transform 0.15s, box-shadow 0.15s;
}
.rapp-info-panel__body .rl-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(20,184,166,0.4); }
.rapp-info-panel__body .rl-cta-secondary {
  padding: 0.75rem 1.5rem; font-size: 0.92rem; font-weight: 600;
  border-radius: 10px; text-decoration: none;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  color: var(--rs-text-secondary); transition: transform 0.15s, border-color 0.15s, color 0.15s, background 0.15s;
}
.rapp-info-panel__body .rl-cta-secondary:hover { transform: translateY(-1px); border-color: rgba(20,184,166,0.4); color: var(--rs-text-primary); background: rgba(20,184,166,0.08); }
.rapp-info-panel__body a[onclick*="startTour"],
.rapp-info-panel__body a[href*="tour"] { display: none; }
.rapp-info-panel__body .rl-badge { font-size: 0.65rem; padding: 0.15rem 0.5rem; }
.rapp-info-panel__body .rl-integration { padding: 1rem; border-radius: 0.75rem; gap: 0.75rem; }
.rapp-info-panel__body .rl-integration h3 { font-size: 0.88rem; }
.rapp-info-panel__body .rl-integration p { font-size: 0.82rem; }
.rapp-info-panel__body .rl-check-list li { font-size: 0.82rem; padding: 0.3rem 0; }
.rapp-info-panel__body .rl-divider { margin: 1rem 0; }
.rapp-info-panel__body .rl-divider span { font-size: 0.65rem; }
.rapp-info-panel__body .rl-back { padding: 1.25rem 0 1.5rem; }
.rapp-info-panel__body .rl-back a { font-size: 0.82rem; }
.rapp-info-panel__body::-webkit-scrollbar { width: 5px; }
.rapp-info-panel__body::-webkit-scrollbar-track { background: transparent; }
.rapp-info-panel__body::-webkit-scrollbar-thumb { background: rgba(20,184,166,0.2); border-radius: 9999px; }
.rapp-info-panel__body::-webkit-scrollbar-thumb:hover { background: rgba(20,184,166,0.35); }

/* ── Rich Landing CSS ── */
.rl-section { border-top: 1px solid var(--rs-border-subtle); padding: 4rem 1.5rem; }
.rl-section--alt { background: var(--rs-bg-hover); }
.rl-container { max-width: 1100px; margin: 0 auto; }
.rl-hero { text-align: center; padding: 5rem 1.5rem 3rem; max-width: 820px; margin: 0 auto; }
.rl-tagline {
  display: inline-block; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--rs-accent); background: rgba(20,184,166,0.1);
  border: 1px solid rgba(20,184,166,0.2);
  padding: 0.35rem 1rem; border-radius: 9999px; margin-bottom: 1.5rem;
}
.rl-heading {
  font-size: 2rem; font-weight: 700; line-height: 1.15;
  margin-bottom: 0.75rem; letter-spacing: -0.01em;
  background: var(--rs-gradient-brand);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.rl-hero .rl-heading { font-size: 2.5rem; }
.rl-subtitle { font-size: 1.25rem; font-weight: 500; color: var(--rs-text-primary); margin-bottom: 1rem; }
.rl-hero .rl-subtitle { font-size: 1.35rem; }
.rl-subtext { font-size: 1.05rem; color: var(--rs-text-secondary); line-height: 1.65; max-width: 640px; margin: 0 auto 2rem; }
.rl-hero .rl-subtext { font-size: 1.15rem; }
.rl-grid-2 { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
.rl-grid-3 { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
.rl-grid-4 { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
@media (min-width: 640px) {
  .rl-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .rl-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .rl-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) { .rl-grid-4 { grid-template-columns: repeat(4, 1fr); } }
.rl-card {
  background: var(--rs-card-bg); border: 1px solid var(--rs-card-border);
  border-radius: 1rem; padding: 1.75rem; transition: border-color 0.2s;
}
.rl-card:hover { border-color: rgba(20,184,166,0.3); }
.rl-card h3 { font-size: 0.95rem; font-weight: 600; color: var(--rs-text-primary); margin-bottom: 0.5rem; }
.rl-card p { font-size: 0.875rem; color: var(--rs-text-secondary); line-height: 1.6; }
.rl-card--center { text-align: center; }
.rl-step { display: flex; flex-direction: column; align-items: center; text-align: center; }
.rl-step__num {
  width: 2.5rem; height: 2.5rem; border-radius: 9999px;
  background: rgba(20,184,166,0.1); color: var(--rs-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;
}
.rl-step h3 { font-size: 0.95rem; font-weight: 600; color: var(--rs-text-primary); margin-bottom: 0.25rem; }
.rl-step p { font-size: 0.82rem; color: var(--rs-text-secondary); line-height: 1.55; }
.rl-cta-row { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
.rl-cta-primary {
  display: inline-block; padding: 0.8rem 2rem; border-radius: 0.5rem;
  background: var(--rs-gradient-cta); color: white; font-size: 0.95rem; font-weight: 600;
  text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;
}
.rl-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(20,184,166,0.3); }
.rl-cta-secondary {
  display: inline-block; padding: 0.8rem 2rem; border-radius: 0.5rem;
  background: var(--rs-btn-secondary-bg); border: 1px solid var(--rs-border);
  color: var(--rs-text-secondary); font-size: 0.95rem; font-weight: 600;
  text-decoration: none; transition: transform 0.2s, border-color 0.2s, color 0.2s;
}
.rl-cta-secondary:hover { transform: translateY(-2px); border-color: var(--rs-border-strong); color: var(--rs-text-primary); }
.rl-check-list { list-style: none; padding: 0; margin: 0; }
.rl-check-list li {
  display: flex; align-items: flex-start; gap: 0.5rem;
  font-size: 0.875rem; color: var(--rs-text-secondary); line-height: 1.55; padding: 0.35rem 0;
}
.rl-check-list li::before { content: "\\2713"; color: var(--rs-accent); font-weight: 700; flex-shrink: 0; margin-top: 0.05em; }
.rl-check-list li strong { color: var(--rs-text-primary); font-weight: 600; }
.rl-badge {
  display: inline-block; font-size: 0.65rem; font-weight: 700;
  color: white; background: var(--rs-accent);
  padding: 0.15rem 0.5rem; border-radius: 9999px;
}
.rl-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.5rem 0; }
.rl-divider::before, .rl-divider::after { content: ""; flex: 1; height: 1px; background: var(--rs-border-subtle); }
.rl-divider span { font-size: 0.75rem; color: var(--rs-text-muted); white-space: nowrap; }
.rl-icon-box {
  width: 3rem; height: 3rem; border-radius: 0.75rem;
  background: rgba(20,184,166,0.12); color: var(--rs-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin-bottom: 1rem;
}
.rl-card--center .rl-icon-box { margin: 0 auto 1rem; }
.rl-integration {
  display: flex; align-items: flex-start; gap: 1rem;
  background: rgba(20,184,166,0.04); border: 1px solid rgba(20,184,166,0.15);
  border-radius: 1rem; padding: 1.5rem;
}
.rl-integration h3 { font-size: 0.95rem; font-weight: 600; color: var(--rs-text-primary); margin-bottom: 0.35rem; }
.rl-integration p { font-size: 0.85rem; color: var(--rs-text-secondary); line-height: 1.55; }
.rl-back { padding: 2rem 0 3rem; text-align: center; }
.rl-back a { font-size: 0.85rem; color: var(--rs-text-muted); text-decoration: none; transition: color 0.2s; }
.rl-back a:hover { color: var(--rs-text-primary); }
.rl-progress { height: 0.5rem; border-radius: 9999px; background: var(--rs-border-subtle); overflow: hidden; }
.rl-progress__fill { height: 100%; border-radius: 9999px; background: var(--rs-accent); }
.rl-tier { display: flex; gap: 0.5rem; margin: 1rem 0; }
.rl-tier__item { flex: 1; text-align: center; border-radius: 0.5rem; border: 1px solid var(--rs-border-subtle); padding: 0.5rem; font-size: 0.75rem; }
.rl-tier__item--active { border-color: rgba(20,184,166,0.4); background: rgba(20,184,166,0.05); color: var(--rs-accent); }
.rl-tier__item--active strong { color: var(--rs-accent); }
.rl-zoom-bar { display: flex; flex-direction: column; gap: 0.5rem; }
.rl-zoom-bar__row { display: flex; align-items: center; gap: 0.75rem; }
.rl-zoom-bar__label { font-size: 0.7rem; color: var(--rs-text-muted); width: 1.2rem; text-align: right; font-family: monospace; }
.rl-zoom-bar__bar { height: 1.5rem; border-radius: 0.375rem; background: rgba(99,102,241,0.15); display: flex; align-items: center; padding: 0 0.75rem; }
.rl-zoom-bar__name { font-size: 0.75rem; font-weight: 600; color: var(--rs-text-primary); white-space: nowrap; }
.rl-zoom-bar__span { font-size: 0.6rem; color: var(--rs-text-muted); margin-left: auto; white-space: nowrap; }

@media (max-width: 600px) {
  .rapp-info-panel {
    top: auto; left: 8px; right: 8px; bottom: 8px;
    transform: none; width: auto; max-height: 85vh;
    animation: rapp-info-in-mobile 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes rapp-info-in-mobile {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .rapp-info-panel__body .rl-grid-2,
  .rapp-info-panel__body .rl-grid-3,
  .rapp-info-panel__body .rl-grid-4 { grid-template-columns: 1fr !important; }
  .rl-hero { padding: 3rem 1rem 2rem; }
  .rl-hero .rl-heading { font-size: 2rem; }
  .rl-section { padding: 2.5rem 1rem; }
}
`;

export default function InfoPopup({ appName, appIcon, landingHtml, storageKey }: InfoPopupProps) {
  const key = storageKey || `${appName}-info-seen`;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (!localStorage.getItem(key)) {
        setTimeout(() => setOpen(true), 800);
        localStorage.setItem(key, "1");
      }
    } catch {}
  }, [key]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  if (!mounted) return null;

  return (
    <div className="info-popup-scope">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Fixed info button */}
      <button
        className="info-popup-trigger"
        onClick={() => setOpen(true)}
        aria-label={`About ${appName}`}
        title={`About ${appName}`}
      >
        &#9432;
      </button>

      {/* Modal */}
      {open && (
        <>
          <div className="rapp-info-overlay" onClick={close} />
          <div className="rapp-info-panel">
            <div className="rapp-info-panel__header">
              <div className="rapp-info-panel__header-left">
                <span className="rapp-info-panel__icon">{appIcon}</span>
                <span className="rapp-info-panel__title">{appName}</span>
              </div>
              <button className="rapp-info-panel__close" onClick={close} aria-label="Close">
                &times;
              </button>
            </div>
            <div
              className="rapp-info-panel__body"
              dangerouslySetInnerHTML={{ __html: landingHtml }}
            />
          </div>
        </>
      )}
    </div>
  );
}
