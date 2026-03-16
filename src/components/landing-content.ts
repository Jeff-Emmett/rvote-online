export const LANDING_HTML = `

<!-- Hero -->
<div class="rl-hero">
  <span class="rl-tagline" style="color:#818cf8;background:rgba(129,140,248,0.1);border-color:rgba(129,140,248,0.2)">
    Part of the rSpace Ecosystem
  </span>
  <h1 class="rl-heading" style="background:linear-gradient(to right,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:2.5rem">
    Democratic<br>Backlog Prioritization
  </h1>
  <p class="rl-subtitle">
    rVote uses <strong style="color:#e2e8f0">Quadratic Proposal Ranking</strong> to let your community democratically
    prioritize proposals. The best ideas rise to the top through collective intelligence,
    then advance to final voting.
  </p>
  <div class="rl-cta-row">
    <a href="/rvote/demo" class="rl-cta-primary" id="ml-primary"
       style="background:linear-gradient(to right,#818cf8,#6366f1);color:white">
      <span style="display:inline-flex;align-items:center;gap:0.5rem">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
        Try the Demo
      </span>
    </a>
    <a href="/create-space" class="rl-cta-secondary">Create a Space</a>
  </div>
  <p style="font-size:0.82rem;margin-top:0.5rem">
    <a href="#" onclick="document.querySelector('folk-vote-dashboard')?.startTour?.();window.__rspaceHideInfo?.();return false" style="color:var(--rs-primary,#06b6d4);text-decoration:none">
      Start Guided Tour &rarr;
    </a>
  </p>
</div>

<!-- ELI5 Section: rVote in 30 Seconds -->
<section class="rl-section" style="border-top:none">
  <div class="rl-container">
    <div style="text-align:center;margin-bottom:2rem">
      <span class="rl-badge" style="background:#1e293b;color:#94a3b8;font-size:0.7rem;padding:0.25rem 0.75rem">ELI5</span>
      <h2 class="rl-heading" style="margin-top:0.75rem;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
        rVote in 30 Seconds
      </h2>
      <p style="font-size:1.05rem;color:#94a3b8;max-width:640px;margin:0.5rem auto 0">
        A <strong style="color:#f97316">quadratic</strong>
        <strong style="color:#3b82f6"> Reddit-style ranking system</strong>
        with <strong style="color:#a855f7"> time-delayed vote decay</strong>
        for proposal prioritization.
      </p>
    </div>

    <div class="rl-grid-3">
      <!-- Quadratic -->
      <div class="rl-card" style="border:2px solid rgba(249,115,22,0.35);background:linear-gradient(to bottom right,rgba(249,115,22,0.08),rgba(249,115,22,0.03))">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
          <div style="width:2rem;height:2rem;border-radius:9999px;background:#f97316;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-weight:700;font-size:0.8rem">x&sup2;</span>
          </div>
          <h3 style="color:#fb923c;font-size:1.05rem;margin-bottom:0">Quadratic</h3>
        </div>
        <p>
          Voting more costs exponentially more credits. 1 vote = 1 credit, 2 votes = 4, 3 votes = 9.
          <strong style="display:block;margin-top:0.5rem;color:#e2e8f0">No single voice can dominate.</strong>
        </p>
      </div>

      <!-- Reddit-style -->
      <div class="rl-card" style="border:2px solid rgba(59,130,246,0.35);background:linear-gradient(to bottom right,rgba(59,130,246,0.08),rgba(59,130,246,0.03))">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
          <div style="width:2rem;height:2rem;border-radius:9999px;background:#3b82f6;display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </div>
          <h3 style="color:#60a5fa;font-size:1.05rem;margin-bottom:0">Reddit-style</h3>
        </div>
        <p>
          Upvote or downvote proposals. Scores aggregate from all community votes.
          <strong style="display:block;margin-top:0.5rem;color:#e2e8f0">Best ideas rise to the top.</strong>
        </p>
      </div>

      <!-- Vote Decay -->
      <div class="rl-card" style="border:2px solid rgba(168,85,247,0.35);background:linear-gradient(to bottom right,rgba(168,85,247,0.08),rgba(168,85,247,0.03))">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
          <div style="width:2rem;height:2rem;border-radius:9999px;background:#a855f7;display:flex;align-items:center;justify-content:center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h3 style="color:#c084fc;font-size:1.05rem;margin-bottom:0">Vote Decay</h3>
        </div>
        <p>
          Votes fade after 30&ndash;60 days. Old support expires, requiring renewed interest.
          <strong style="display:block;margin-top:0.5rem;color:#e2e8f0">Rankings stay fresh and relevant.</strong>
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Live Demo (textual description, no interactive component) -->
<section class="rl-section rl-section--alt">
  <div class="rl-container" style="text-align:center">
    <span class="rl-badge" style="background:#1e293b;color:#94a3b8;font-size:0.7rem;padding:0.25rem 0.75rem">Live Demo</span>
    <h2 class="rl-heading" style="margin-top:0.75rem;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
      Try It Yourself
    </h2>
    <p style="color:#94a3b8;max-width:640px;margin:0 auto 2rem">
      Vote on live polls synced across the r* ecosystem. Changes appear in real-time for everyone.
    </p>
    <a href="/rvote/demo" class="rl-cta-primary"
       style="background:linear-gradient(to right,#818cf8,#6366f1);color:white">
      Open Interactive Demo
    </a>
  </div>
</section>

<!-- What is Quadratic Proposal Ranking -->
<section class="rl-section">
  <div class="rl-container">
    <div style="text-align:center;margin-bottom:2.5rem">
      <span class="rl-tagline" style="color:#818cf8;background:rgba(129,140,248,0.1);border-color:rgba(129,140,248,0.2)">
        The Core Concept
      </span>
      <h2 class="rl-heading" style="background:linear-gradient(135deg,#e2e8f0,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
        What is Quadratic Proposal Ranking?
      </h2>
      <p style="font-size:1.05rem;color:#94a3b8;max-width:640px;margin:0 auto">
        A system where expressing <em>strong</em> preference costs progressively more,
        creating a fair and balanced priority list that reflects true community consensus.
      </p>
    </div>

    <div class="rl-grid-2" style="max-width:900px;margin:0 auto">
      <!-- The Problem -->
      <div class="rl-card" style="border:2px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.04)">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10h7z"/></svg>
          <h3 style="color:#f87171;margin-bottom:0;font-size:1.05rem">The Problem</h3>
        </div>
        <p style="margin-bottom:0.75rem">
          Traditional priority systems let those with more time, resources, or influence dominate what gets attention.
        </p>
        <ul style="list-style:disc;padding-left:1.25rem;margin:0">
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Loudest voices set the agenda</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Important but less flashy ideas get buried</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">No way to express intensity of preference</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Backlogs become political battlegrounds</li>
        </ul>
      </div>

      <!-- The Solution -->
      <div class="rl-card" style="border:2px solid rgba(129,140,248,0.25);background:linear-gradient(to bottom right,rgba(129,140,248,0.05),rgba(192,132,252,0.05))">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h3 style="color:#a5b4fc;margin-bottom:0;font-size:1.05rem">The Solution: QPR</h3>
        </div>
        <p style="margin-bottom:0.75rem">
          Quadratic Proposal Ranking balances participation and conviction by making additional votes progressively more expensive.
        </p>
        <ul style="list-style:disc;padding-left:1.25rem;margin:0">
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">1 vote = 1 credit, 2 votes = 4, 3 = 9</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Everyone can participate meaningfully</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Express strong opinions, but at a cost</li>
          <li style="font-size:0.85rem;color:#94a3b8;line-height:1.6">Naturally surfaces community consensus</li>
        </ul>
      </div>
    </div>

    <!-- Vote Cost Calculator -->
    <div style="margin-top:2.5rem;max-width:540px;margin-left:auto;margin-right:auto">
      <h3 style="text-align:center;font-size:1rem;font-weight:600;color:#e2e8f0;margin-bottom:1rem">
        Vote Cost Calculator
      </h3>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.5rem;text-align:center">
        <div class="rl-card" style="padding:0.75rem">
          <div style="font-size:1.5rem;font-weight:700;color:#818cf8">1</div>
          <div style="font-size:0.7rem;color:#64748b">vote</div>
          <div style="font-size:1rem;font-family:monospace;margin-top:0.5rem;color:#c084fc">1</div>
          <div style="font-size:0.65rem;color:#64748b">credit</div>
        </div>
        <div class="rl-card" style="padding:0.75rem">
          <div style="font-size:1.5rem;font-weight:700;color:#818cf8">2</div>
          <div style="font-size:0.7rem;color:#64748b">votes</div>
          <div style="font-size:1rem;font-family:monospace;margin-top:0.5rem;color:#c084fc">4</div>
          <div style="font-size:0.65rem;color:#64748b">credits</div>
        </div>
        <div class="rl-card" style="padding:0.75rem">
          <div style="font-size:1.5rem;font-weight:700;color:#818cf8">3</div>
          <div style="font-size:0.7rem;color:#64748b">votes</div>
          <div style="font-size:1rem;font-family:monospace;margin-top:0.5rem;color:#c084fc">9</div>
          <div style="font-size:0.65rem;color:#64748b">credits</div>
        </div>
        <div class="rl-card" style="padding:0.75rem">
          <div style="font-size:1.5rem;font-weight:700;color:#818cf8">4</div>
          <div style="font-size:0.7rem;color:#64748b">votes</div>
          <div style="font-size:1rem;font-family:monospace;margin-top:0.5rem;color:#c084fc">16</div>
          <div style="font-size:0.65rem;color:#64748b">credits</div>
        </div>
        <div class="rl-card" style="padding:0.75rem">
          <div style="font-size:1.5rem;font-weight:700;color:#818cf8">5</div>
          <div style="font-size:0.7rem;color:#64748b">votes</div>
          <div style="font-size:1rem;font-family:monospace;margin-top:0.5rem;color:#c084fc">25</div>
          <div style="font-size:0.65rem;color:#64748b">credits</div>
        </div>
      </div>
      <p style="text-align:center;font-size:0.8rem;color:#64748b;margin-top:1rem">
        Spreading votes across proposals you support is more efficient than concentrating on one.
      </p>
    </div>
  </div>
</section>

<!-- From Chaos to Consensus (How It Works) -->
<section class="rl-section rl-section--alt">
  <div class="rl-container">
    <div style="text-align:center;margin-bottom:2.5rem">
      <span class="rl-tagline" style="color:#818cf8;background:rgba(129,140,248,0.1);border-color:rgba(129,140,248,0.2)">
        How It Works
      </span>
      <h2 class="rl-heading" style="background:linear-gradient(135deg,#e2e8f0,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
        From Chaos to Consensus
      </h2>
      <p style="font-size:1.05rem;color:#94a3b8;max-width:640px;margin:0 auto">
        Transform your community&rsquo;s ideas into a democratically prioritized backlog
        through two simple stages.
      </p>
    </div>

    <div class="rl-grid-3">
      <!-- Stage 1: QPR -->
      <div class="rl-card" style="border-color:rgba(129,140,248,0.2)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
          <div style="width:2.5rem;height:2.5rem;border-radius:9999px;background:linear-gradient(to bottom right,#818cf8,rgba(129,140,248,0.6));display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
          </div>
          <div>
            <span class="rl-badge" style="background:rgba(129,140,248,0.1);color:#818cf8;margin-bottom:0.25rem">Stage 1</span>
            <h3 style="margin-bottom:0;font-size:1rem">Quadratic Proposal Ranking</h3>
          </div>
        </div>
        <ul style="list-style:none;padding:0;margin:0">
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><polyline points="23 6 13.5 15.5 8.5 10.5"/><polyline points="17 6 7.5 15.5 2.5 10.5"/></svg>
            <span>All proposals enter the ranking pool</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>Upvote/downvote with quadratic cost</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span>Votes decay over 30&ndash;60 days</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/></svg>
            <span>Creates a living priority queue</span>
          </li>
        </ul>
      </div>

      <!-- Threshold -->
      <div class="rl-card" style="border-color:rgba(192,132,252,0.25);background:linear-gradient(to bottom right,rgba(192,132,252,0.08),rgba(129,140,248,0.06))">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
          <div style="width:2.5rem;height:2.5rem;border-radius:9999px;background:linear-gradient(to bottom right,#c084fc,#818cf8);display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>
          <div>
            <span class="rl-badge" style="background:rgba(192,132,252,0.15);color:#c084fc;margin-bottom:0.25rem">Threshold</span>
            <h3 style="margin-bottom:0;font-size:1rem">Score +100</h3>
          </div>
        </div>
        <p>
          When a proposal reaches a score of <strong style="color:#e2e8f0">+100</strong>, it
          automatically advances to the final voting stage.
        </p>
        <p style="margin-top:0.5rem;font-size:0.8rem">
          This ensures only proposals with genuine community support move
          forward for implementation decisions.
        </p>
      </div>

      <!-- Stage 2: Pass/Fail -->
      <div class="rl-card" style="border-color:rgba(148,163,184,0.2)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
          <div style="width:2.5rem;height:2.5rem;border-radius:9999px;background:linear-gradient(to bottom right,#94a3b8,rgba(148,163,184,0.6));display:flex;align-items:center;justify-content:center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <span class="rl-badge" style="background:rgba(148,163,184,0.1);color:#94a3b8;margin-bottom:0.25rem">Stage 2</span>
            <h3 style="margin-bottom:0;font-size:1rem">Pass/Fail Vote</h3>
          </div>
        </div>
        <ul style="list-style:none;padding:0;margin:0">
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Yes / No / Abstain voting</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>One member = one vote</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span>7-day voting period</span>
          </li>
          <li style="display:flex;align-items:flex-start;gap:0.5rem;font-size:0.85rem;color:#94a3b8;line-height:1.6;padding:0.2rem 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink:0;margin-top:3px"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Majority decides implementation</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Features: Built for Fair Prioritization -->
<section class="rl-section">
  <div class="rl-container">
    <div style="text-align:center;margin-bottom:2.5rem">
      <h2 class="rl-heading" style="background:linear-gradient(135deg,#e2e8f0,#cbd5e1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
        Built for Fair Prioritization
      </h2>
      <p style="color:#94a3b8">Everything you need for democratic backlog management</p>
    </div>

    <div class="rl-grid-4">
      <div class="rl-card rl-card--center" style="border-color:rgba(129,140,248,0.15)">
        <div style="width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(to bottom right,#22c55e,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <h3>Earn Credits Daily</h3>
        <p>Get 10 credits every day. Start with 50. Max 500.</p>
      </div>

      <div class="rl-card rl-card--center" style="border-color:rgba(129,140,248,0.15)">
        <div style="width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(to bottom right,#3b82f6,#0891b2);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <h3>Vote Decay</h3>
        <p>Old votes fade away, keeping rankings fresh and dynamic.</p>
      </div>

      <div class="rl-card rl-card--center" style="border-color:rgba(129,140,248,0.15)">
        <div style="width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(to bottom right,#a855f7,#7c3aed);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3>Sybil Resistant</h3>
        <p>Quadratic costs make fake account attacks expensive.</p>
      </div>

      <div class="rl-card rl-card--center" style="border-color:rgba(129,140,248,0.15)">
        <div style="width:3rem;height:3rem;border-radius:9999px;background:linear-gradient(to bottom right,#f97316,#d97706);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h3>Auto Promotion</h3>
        <p>Top proposals automatically advance to voting.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="rl-section rl-section--alt">
  <div class="rl-container">
    <div class="rl-card" style="border:2px solid rgba(129,140,248,0.25);background:linear-gradient(to bottom right,rgba(129,140,248,0.08),rgba(192,132,252,0.04),rgba(148,163,184,0.06));text-align:center;padding:3rem 2rem;position:relative;overflow:hidden">
      <span class="rl-badge" style="background:rgba(129,140,248,0.1);color:#818cf8;font-size:0.7rem;padding:0.25rem 0.75rem">
        Join the rSpace Ecosystem
      </span>
      <h2 style="font-size:1.75rem;font-weight:700;color:#e2e8f0;margin:1rem 0">
        Ready to prioritize democratically?
      </h2>
      <p style="font-size:1.05rem;color:#94a3b8;max-width:560px;margin:0 auto 2rem;line-height:1.6">
        Create a Space for your community and start using Quadratic Proposal Ranking.
        Invite members, allot credits, and let the best ideas rise to the top.
      </p>
      <div class="rl-cta-row" style="margin-top:0">
        <a href="/create-space" class="rl-cta-primary"
           style="background:linear-gradient(to right,#818cf8,#c084fc);color:white">
          <span style="display:inline-flex;align-items:center;gap:0.5rem">
            Create a Space
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </a>
        <a href="/rvote/demo" class="rl-cta-secondary">
          <span style="display:inline-flex;align-items:center;gap:0.5rem">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
            Interactive Demo
          </span>
        </a>
      </div>
    </div>
  </div>
</section>

<div class="rl-back">
  <a href="/">&larr; Back to rSpace</a>
</div>
`;
