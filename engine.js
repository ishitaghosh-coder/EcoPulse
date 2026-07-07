/**
 * EcoPulse Stadium — Reasoning Engine
 *
 * Rule-logic implementation that mirrors the LLM system prompt for demo reliability.
 * Designed to be swapped for a live Antigravity/Gemini API call in production —
 * the three output block structure and safety-first constraint are identical.
 *
 * PRIORITY RULE (non-negotiable):
 *   Fan and staff safety always overrides sustainability optimization.
 *   Never issue a command that reduces visibility, ventilation, or emergency
 *   egress capacity in an active or exiting crowd zone.
 *
 * DATA HANDLING RULE:
 *   If telemetry for a sector is stale or missing, flag DATA GAP and default
 *   that sector's automated commands to MAINTAIN CURRENT SETTINGS.
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = {
  // Crowd density above this = zone is "active" — safety rule protects it
  ACTIVE_ZONE_DENSITY: 20,         // %
  // Bin fill above this = alert staff for emptying
  BIN_OVERFLOW_WARNING: 75,        // %
  BIN_OVERFLOW_CRITICAL: 90,       // %
  // HVAC waste: running at high load in a low-density zone
  HVAC_WASTE_LOAD: 80,             // % HVAC if density < LOW_DENSITY_CEILING
  LOW_DENSITY_CEILING: 25,         // % crowd density
  // Recommended HVAC standby level for near-empty zones
  HVAC_STANDBY_LEVEL: 30,          // %
  // Safe minimum lighting in any zone (human safety floor)
  LIGHTING_SAFETY_FLOOR: 80,       // %
  // Target comfort temperature range (from spec: 18–23.8°C)
  TEMP_MIN: 18,
  TEMP_MAX: 23.8,
};

// Score deductions (efficiency score starts at 100)
const SCORE_DEDUCTIONS = {
  HVAC_WASTE: 14,
  BIN_OVERFLOW_RISK: 6,
  BIN_OVERFLOW_CRITICAL: 12,
  DATA_GAP: 16,
  LIGHTING_WASTE: 8,
  SAFETY_BLOCK_FORCED: 0,   // safety blocks don't penalize score; they're correct behavior
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REASONING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core EcoPulse reasoning function.
 * Takes a scenario telemetry snapshot and returns the three synchronized output blocks.
 * @param {object} scenario - full scenario object from telemetry.js
 * @returns {{ metrics: object, alerts: Array, commands: Array, score: number }}
 */
function runEcoPulseEngine(scenario) {
  const sectors = scenario.sectors;
  const now = scenario.timestamp;

  let efficiencyScore = 100;
  const dataGaps = [];
  const wasteEvents = [];
  const safetyBlocks = [];
  const alerts = [];
  const commands = [];
  const sectorSummaries = [];

  // ── PASS 1: Scan each sector ──────────────────────────────────────────────
  for (const [key, sector] of Object.entries(sectors)) {
    const sectorId = sector.id.toUpperCase();
    const isStale = sector.status === "stale" || isSensorStale(sector.lastUpdated, now);
    const isMissing = sector.crowdDensity === null && sector.status === "stale";

    // ── DATA GAP CHECK ─────────────────────────────────────────────────────
    if (isStale || isMissing) {
      dataGaps.push({
        sectorId,
        label: sector.label,
        reason: isMissing ? "Sensor offline — no telemetry received" : "Telemetry stale beyond 5-minute threshold",
        lastSeen: sector.lastUpdated
      });
      efficiencyScore -= SCORE_DEDUCTIONS.DATA_GAP;

      // DATA GAP alerts
      alerts.push({
        priority: "critical",
        type: "data_gap",
        sectorId,
        message: `URGENT: IoT node offline — manual sector inspection required immediately`,
        icon: "🔴"
      });

      // DATA GAP commands — default to MAINTAIN
      commands.push({
        type: "maintain",
        sectorId,
        label: sector.label,
        action: "MAINTAIN CURRENT SETTINGS (DATA GAP — cannot optimize without verified telemetry)",
        estimatedSaving: null,
        safety: "neutral",
        isBlocked: false,
        isDataGap: true
      });

      sectorSummaries.push({
        label: sector.label,
        status: "data_gap",
        note: "⚠️ DATA GAP — Sensor offline or stale. Defaulting to safe last-known settings.",
        crowdDensity: null,
        binFillLevel: null,
        hvacLoad: sector.hvacLoad,
        lightingLevel: sector.lightingLevel
      });

      continue; // Skip further analysis for stale sectors
    }

    // ── SAFETY STATUS ──────────────────────────────────────────────────────
    const isActiveZone = (sector.crowdDensity !== null && sector.crowdDensity > THRESHOLDS.ACTIVE_ZONE_DENSITY)
                         || sector.isEgressActive;
    const isEgressActive = sector.isEgressActive;

    // ── HVAC WASTE DETECTION ───────────────────────────────────────────────
    const hasHvacWaste = sector.crowdDensity !== null
      && sector.crowdDensity < THRESHOLDS.LOW_DENSITY_CEILING
      && sector.hvacLoad >= THRESHOLDS.HVAC_WASTE_LOAD;

    if (hasHvacWaste) {
      wasteEvents.push({ sectorId, type: "hvac", label: sector.label, hvacLoad: sector.hvacLoad, density: sector.crowdDensity });
      efficiencyScore -= SCORE_DEDUCTIONS.HVAC_WASTE;

      if (isActiveZone || isEgressActive) {
        // SAFETY RULE FIRES — block the optimization
        const blockMsg = isEgressActive
          ? `HVAC reduction rejected — active egress zone (${sectorId})`
          : `HVAC reduction rejected — crowd density above safe-zone threshold (${sectorId})`;
        safetyBlocks.push({ sectorId, label: sector.label, type: "hvac", reason: blockMsg });
        commands.push({
          type: "blocked",
          sectorId,
          label: sector.label,
          proposed: `Reduce HVAC from ${sector.hvacLoad}% → ${THRESHOLDS.HVAC_STANDBY_LEVEL}%`,
          action: `⚠️ BLOCKED: ${blockMsg}`,
          estimatedSaving: "~38% sector power reduction (not applied — safety override)",
          safety: "blocked",
          isBlocked: true
        });
        alerts.push({
          priority: "warning",
          type: "safety_block",
          sectorId,
          message: `Safety rule active — HVAC cannot be reduced. ${isEgressActive ? "Active egress in progress." : "Zone above safety density threshold."}`,
          icon: "🛡️"
        });
      } else {
        // Zone is genuinely empty/near-empty — safe to optimize
        commands.push({
          type: "reduce_hvac",
          sectorId,
          label: sector.label,
          action: `Reduce HVAC load: ${sector.hvacLoad}% → ${THRESHOLDS.HVAC_STANDBY_LEVEL}% (standby mode)`,
          estimatedSaving: `~${Math.round((sector.hvacLoad - THRESHOLDS.HVAC_STANDBY_LEVEL) * 0.4)}% sector power reduction`,
          safety: "clear",
          isBlocked: false
        });
      }
    }

    // ── LIGHTING WASTE DETECTION ───────────────────────────────────────────
    const hasLightingWaste = sector.crowdDensity !== null
      && sector.crowdDensity < THRESHOLDS.LOW_DENSITY_CEILING
      && sector.lightingLevel > THRESHOLDS.LIGHTING_SAFETY_FLOOR + 10;

    if (hasLightingWaste && !hasHvacWaste) {
      // Only flag lighting if not already flagging HVAC waste (avoid double-counting)
      efficiencyScore -= SCORE_DEDUCTIONS.LIGHTING_WASTE;
      if (isActiveZone || isEgressActive) {
        const blockMsg = `Lighting reduction rejected — active zone safety floor must be maintained (${sectorId})`;
        safetyBlocks.push({ sectorId, label: sector.label, type: "lighting", reason: blockMsg });
        commands.push({
          type: "blocked",
          sectorId,
          label: sector.label,
          proposed: `Dim lighting from ${sector.lightingLevel}% → ${THRESHOLDS.LIGHTING_SAFETY_FLOOR}%`,
          action: `⚠️ BLOCKED: ${blockMsg}`,
          estimatedSaving: "~15% lighting energy (not applied — safety override)",
          safety: "blocked",
          isBlocked: true
        });
      } else {
        commands.push({
          type: "reduce_lighting",
          sectorId,
          label: sector.label,
          action: `Dim lighting: ${sector.lightingLevel}% → ${THRESHOLDS.LIGHTING_SAFETY_FLOOR}% (zone clear)`,
          estimatedSaving: "~15% lighting energy reduction",
          safety: "clear",
          isBlocked: false
        });
      }
    }

    // ── BIN FILL ALERTS ────────────────────────────────────────────────────
    if (sector.binFillLevel !== null) {
      if (sector.binFillLevel >= THRESHOLDS.BIN_OVERFLOW_CRITICAL) {
        efficiencyScore -= SCORE_DEDUCTIONS.BIN_OVERFLOW_CRITICAL;
        alerts.push({
          priority: "critical",
          type: "bin_overflow",
          sectorId,
          message: `CRITICAL: Bin fill at ${sector.binFillLevel}% — dispatch crew immediately, overflow imminent`,
          icon: "🗑️"
        });
      } else if (sector.binFillLevel >= THRESHOLDS.BIN_OVERFLOW_WARNING) {
        efficiencyScore -= SCORE_DEDUCTIONS.BIN_OVERFLOW_RISK;
        alerts.push({
          priority: "warning",
          type: "bin_fill",
          sectorId,
          message: `Bin fill at ${sector.binFillLevel}% — empty before peak crowd surge`,
          icon: "⚠️"
        });
      }
    }

    // ── CROWD DENSITY ALERTS ──────────────────────────────────────────────
    if (sector.crowdDensity !== null && sector.crowdDensity >= 85 && !sector.isEgressActive) {
      alerts.push({
        priority: "warning",
        type: "crowd_surge",
        sectorId,
        message: `Crowd density at ${sector.crowdDensity}% — monitor flow, consider gate redirect`,
        icon: "👥"
      });
    }

    // ── EGRESS ALERTS ──────────────────────────────────────────────────────
    if (sector.isEgressActive) {
      alerts.push({
        priority: "info",
        type: "egress_active",
        sectorId,
        message: `Active egress zone — maintain full HVAC, lighting and clear wayfinding. Safety rule protecting sector.`,
        icon: "🚪"
      });
    }

    // ── TEMPERATURE COMFORT CHECK ──────────────────────────────────────────
    if (sector.temperature !== null && sector.crowdDensity !== null && sector.crowdDensity > 30) {
      if (sector.temperature > THRESHOLDS.TEMP_MAX) {
        alerts.push({
          priority: "warning",
          type: "temperature",
          sectorId,
          message: `Zone temp ${sector.temperature.toFixed(1)}°C exceeds comfort ceiling (${THRESHOLDS.TEMP_MAX}°C) — increase HVAC`,
          icon: "🌡️"
        });
      }
    }

    // ── SECTOR SUMMARY (for organizer metrics panel) ────────────────────────
    const sectorEfficiency = _getSectorEfficiency(sector, hasHvacWaste, hasLightingWaste);
    sectorSummaries.push({
      label: sector.label,
      status: isEgressActive ? "egress" : (isActiveZone ? "active" : "low_density"),
      efficiency: sectorEfficiency,
      crowdDensity: sector.crowdDensity,
      binFillLevel: sector.binFillLevel,
      hvacLoad: sector.hvacLoad,
      lightingLevel: sector.lightingLevel,
      temperature: sector.temperature,
      hasWaste: hasHvacWaste || hasLightingWaste,
      isEgressActive
    });
  }

  // ── FINALIZE SCORE ────────────────────────────────────────────────────────
  efficiencyScore = Math.max(0, Math.min(100, Math.round(efficiencyScore)));

  // ── SORT ALERTS by priority ───────────────────────────────────────────────
  const priorityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // ── COMPUTE TOTAL ESTIMATED SAVINGS ──────────────────────────────────────
  const savingsEstimate = _computeSavingsEstimate(commands, scenario);

  return {
    scenario: {
      id: scenario.id,
      label: scenario.label,
      matchMinute: scenario.matchMinute,
      venue: scenario.venue,
      match: scenario.match,
      description: scenario.description
    },
    score: efficiencyScore,
    metrics: {
      sectorSummaries,
      wasteEvents,
      dataGaps,
      safetyBlocks,
      savingsEstimate
    },
    alerts,
    commands
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate per-sector efficiency (simple heuristic for display).
 */
function _getSectorEfficiency(sector, hasHvacWaste, hasLightingWaste) {
  let score = 100;
  if (hasHvacWaste) score -= 35;
  if (hasLightingWaste) score -= 15;
  if (sector.binFillLevel >= THRESHOLDS.BIN_OVERFLOW_CRITICAL) score -= 20;
  else if (sector.binFillLevel >= THRESHOLDS.BIN_OVERFLOW_WARNING) score -= 10;
  if (sector.temperature > THRESHOLDS.TEMP_MAX) score -= 10;
  return Math.max(0, score);
}

/**
 * Aggregate an estimated savings string from all approved (non-blocked) commands.
 */
function _computeSavingsEstimate(commands, scenario) {
  const approved = commands.filter(c => !c.isBlocked && !c.isDataGap && c.type !== "maintain");
  if (approved.length === 0) return null;
  // Count HVAC reductions vs lighting
  const hvacReductions = approved.filter(c => c.type === "reduce_hvac").length;
  const lightingReductions = approved.filter(c => c.type === "reduce_lighting").length;
  let parts = [];
  if (hvacReductions > 0) parts.push(`~${hvacReductions * 28}% HVAC load reduction`);
  if (lightingReductions > 0) parts.push(`~${lightingReductions * 15}% lighting energy saved`);
  return parts.join(" · ");
}

/**
 * Returns a label/color mapping for priority levels.
 */
function getPriorityMeta(priority) {
  switch (priority) {
    case "critical": return { label: "CRITICAL", colorClass: "alert-critical" };
    case "warning":  return { label: "WARNING",  colorClass: "alert-warning" };
    default:         return { label: "INFO",     colorClass: "alert-info" };
  }
}

/**
 * Returns display metadata for command types.
 */
function getCommandMeta(command) {
  if (command.isBlocked) return { colorClass: "cmd-blocked", icon: "🚫" };
  if (command.isDataGap) return { colorClass: "cmd-datagap", icon: "📡" };
  if (command.type === "reduce_hvac") return { colorClass: "cmd-approved", icon: "❄️" };
  if (command.type === "reduce_lighting") return { colorClass: "cmd-approved", icon: "💡" };
  return { colorClass: "cmd-neutral", icon: "⚙️" };
}
