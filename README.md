# EcoPulse Stadium
### A GenAI-Powered Sustainability & Operations Engine for FIFA World Cup 2026

[![Demo](https://img.shields.io/badge/demo-live-00e87c?style=flat-square&logo=html5)](#)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#)
[![FIFA WC 2026](https://img.shields.io/badge/FIFA%20WC-2026-purple?style=flat-square)](#)

---

## What It Does

EcoPulse Stadium is a GenAI reasoning engine that ingests live stadium telemetry — crowd density, energy consumption, smart bin fill levels, and HVAC/lighting status — and produces **three synchronized outputs every reasoning cycle**:

| Output Block | Purpose |
|---|---|
| 📊 **Organizer Sustainability Metrics** | Real-time efficiency scorecard with per-sector breakdowns and DATA GAP flags |
| 🔔 **Ground Staff Actions & Alerts** | Short, push-notification-style instructions ordered by priority (safety → overflow → routine) |
| ⚡ **Automated Utility Commands** | Direct HVAC, lighting, and ventilation commands — or explicit BLOCKED notices when safety overrides them |

**Core differentiator:** one reasoning layer handles both sustainability *and* operations together, resolving trade-offs (e.g., "can we dim lights here without affecting egress safety?") in a single pass. The **safety-first priority rule** is a hard constraint — not a preference — and its enforcement is always visible in the UI.

---

## The Four Scenarios

| Scenario | Match State | Key Demonstration |
|---|---|---|
| ⚽ **Pre-Match** | 30 min before kickoff | Fans arriving; pre-cooling baseline; routine optimization approved |
| 🔥 **75th Minute** | Peak density | North packed, South near-empty but HVAC still at 100% — waste detected and reduced |
| 🚪 **Post-Match Egress** | Full-time | Safety rule **fires visibly** — HVAC and lighting reductions BLOCKED in active egress corridors |
| 📡 **Data Gap** | 62nd minute | West Concourse IoT node offline — `DATA GAP` protocol activates, sector commands default to MAINTAIN |

---

## Architecture

```
        Live Telemetry Inputs
 (crowd density | energy/HVAC | smart bin levels | lighting)
                    │
                    ▼
     ┌─────────────────────────────┐
     │   EcoPulse Reasoning Engine  │
     │   (engine.js)                │
     │   Safety > Sustainability    │  ← hard-coded non-negotiable constraint
     │   DATA GAP → MAINTAIN        │  ← never act on stale/missing sensors
     └─────────────────────────────┘
                    │
   ┌────────────────┼────────────────┐
   ▼                ▼                ▼
Organizer      Ground Staff     Automated Utility
Dashboard      Alert Feed       Commands
(efficiency    (priority-       (HVAC/lighting/
 scorecard)     ordered push     ventilation adj.
                notifications)   or BLOCKED)
```

---

## Reasoning Engine (engine.js)

The JS reasoning engine is a **rule-logic mirror of the LLM system prompt** (`prompts/system_prompt.txt`), implemented for demo reliability so the dashboard works fully offline without API keys.

**Designed to swap for a live Antigravity/Gemini API call in production** — the three output block structure, the safety constraint, and the DATA GAP handling are identical. To integrate a live LLM:

1. POST the telemetry snapshot (JSON) to the Gemini/Antigravity API with the system prompt as context
2. Parse the three output blocks from the model response
3. Render them in the same three panel containers in `index.html`

---

## Safety Priority Rule

```
PRIORITY RULE (non-negotiable):
Fan and staff safety always overrides sustainability optimization.
Never issue a command that reduces visibility, ventilation, or emergency
egress capacity in an active or exiting crowd zone, regardless of
projected energy savings.
```

When this rule fires (Post-Match Egress scenario), the Utility Commands panel shows:

```
⚠️ BLOCKED: HVAC reduction rejected — active egress zone (EAST_GATE)
Est. impact: ~38% sector power reduction (not applied — safety override)
```

The block is always **visible and explicit** — never silent.

---

## DATA GAP Handling

```
DATA HANDLING RULE:
If telemetry for a sector is stale (not updated within the expected
interval) or missing, flag it as "DATA GAP - [sector]" and default
that sector's automated commands to MAINTAIN CURRENT SETTINGS.
```

The Data Gap scenario demonstrates this with the West Concourse sensor going offline at 62'. The sector is flagged in all three panels and excluded from optimization.

---

## File Structure

```
ecopulse-stadium/
├── index.html               ← Dashboard (HTML + inline JS controller)
├── style.css                ← Design system (dark glassmorphism, animated gauges)
├── engine.js                ← EcoPulse reasoning engine (rule-logic)
├── telemetry.js             ← Mock sensor data simulator (4 scenarios)
├── mock-data/
│   └── sample_telemetry.json   ← Reference 75th-minute snapshot
├── prompts/
│   └── system_prompt.txt    ← LLM system prompt for production integration
└── README.md
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Structure | HTML5 semantic |
| Styling | Vanilla CSS (glassmorphism, dark mode, micro-animations) |
| Logic | Vanilla JavaScript (no framework, no build step needed) |
| Fonts | Google Fonts — Outfit + JetBrains Mono |
| Data | Mock JSON telemetry (telemetry.js) |
| LLM (production) | Antigravity / Gemini Flash |

---

## Running Locally

No build step required. Just open `index.html` in any modern browser:

```bash
# Option 1: direct open
open index.html   # macOS
start index.html  # Windows

# Option 2: local dev server (recommended for production swap)
npx serve .
```

---

## Projected Impact

| Metric | Target |
|---|---|
| HVAC energy reduction (low-density zones) | Up to 40% per sector |
| Bin overflow events | Eliminated via predictive alerts |
| Staff response time | Reduced via plain-language push notifications vs raw dashboards |
| Safety blocks honored | 100% (hard constraint, not a preference) |

---

## Privacy & Safety Notes

- All crowd data is **aggregated zone-level only** — no individual tracking
- Safety rule is **hard-coded into the reasoning engine**, not left to model discretion
- Designed as an **integration layer** over existing IoT/HVAC systems — no new hardware required for pilot
- DATA GAP handling ensures **no automated action is taken on incomplete sensor data**

---

## Context

Built for the FIFA World Cup 2026 hackathon. The 2026 tournament runs across 16 stadiums in 3 countries, with 104 matches and 5.5M+ attendees. Sustainability operations (HVAC, lighting, waste) and staff operations run as separate silos today — EcoPulse closes the loop with a single reasoning layer.

See the full technical context in `docs/` and `prompts/system_prompt.txt`.
