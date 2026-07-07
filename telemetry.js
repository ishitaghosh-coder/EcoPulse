/**
 * EcoPulse Stadium — Mock Telemetry Simulator
 * Simulates live IoT sensor feeds across 5 stadium sectors.
 * In production, replace with real-time WebSocket/REST feed from stadium IoT middleware.
 */

const SCENARIOS = {

  // ─────────────────────────────────────────────
  // SCENARIO 1: PRE-MATCH (30 min before kickoff)
  // Fans still arriving; systems running at pre-cool baseline
  // ─────────────────────────────────────────────
  prematch: {
    id: "prematch",
    label: "Pre-Match",
    matchMinute: "PRE",
    matchMinuteNumeric: 0,
    venue: "MetLife Stadium · New York / New Jersey",
    match: "Group A · Brazil vs Argentina",
    timestamp: "2026-07-15T19:30:00Z",
    description: "30 minutes before kickoff. Fans arriving across all gates. Pre-cooling active, lighting at max.",
    sectors: {
      north_concourse: {
        id: "north_concourse",
        label: "North Concourse",
        crowdDensity: 35,
        binFillLevel: 20,
        hvacLoad: 65,
        lightingLevel: 80,
        temperature: 27.4,
        isEgressActive: false,
        lastUpdated: "2026-07-15T19:29:45Z",
        status: "active"
      },
      south_concourse: {
        id: "south_concourse",
        label: "South Concourse",
        crowdDensity: 20,
        binFillLevel: 15,
        hvacLoad: 65,
        lightingLevel: 80,
        temperature: 26.8,
        isEgressActive: false,
        lastUpdated: "2026-07-15T19:29:50Z",
        status: "active"
      },
      east_concourse: {
        id: "east_concourse",
        label: "East Concourse",
        crowdDensity: 40,
        binFillLevel: 25,
        hvacLoad: 70,
        lightingLevel: 85,
        temperature: 28.1,
        isEgressActive: false,
        lastUpdated: "2026-07-15T19:29:52Z",
        status: "active"
      },
      west_concourse: {
        id: "west_concourse",
        label: "West Concourse",
        crowdDensity: 30,
        binFillLevel: 18,
        hvacLoad: 60,
        lightingLevel: 80,
        temperature: 27.0,
        isEgressActive: false,
        lastUpdated: "2026-07-15T19:29:47Z",
        status: "active"
      },
      pitch_zone: {
        id: "pitch_zone",
        label: "Pitch Zone",
        crowdDensity: null,
        binFillLevel: null,
        hvacLoad: 75,
        lightingLevel: 100,
        temperature: 23.0,
        isEgressActive: false,
        lastUpdated: "2026-07-15T19:29:55Z",
        status: "active"
      }
    }
  },

  // ─────────────────────────────────────────────
  // SCENARIO 2: 75TH MINUTE (Peak density)
  // Match in full swing. North packed. South nearly empty — but HVAC still maxed. Core waste scenario.
  // ─────────────────────────────────────────────
  minute75: {
    id: "minute75",
    label: "75th Minute",
    matchMinute: "75'",
    matchMinuteNumeric: 75,
    venue: "MetLife Stadium · New York / New Jersey",
    match: "Group A · Brazil vs Argentina",
    timestamp: "2026-07-15T21:15:00Z",
    description: "Match at 75 minutes. North Concourse near capacity. South Concourse largely vacated but still cooling at 100%. Prime energy waste event.",
    sectors: {
      north_concourse: {
        id: "north_concourse",
        label: "North Concourse",
        crowdDensity: 90,
        binFillLevel: 85,
        hvacLoad: 100,
        lightingLevel: 100,
        temperature: 30.2,
        isEgressActive: false,
        lastUpdated: "2026-07-15T21:14:55Z",
        status: "active"
      },
      south_concourse: {
        id: "south_concourse",
        label: "South Concourse",
        crowdDensity: 10,
        binFillLevel: 15,
        hvacLoad: 100, // <-- WASTE: 100% cooling for 10% occupancy
        lightingLevel: 100,
        temperature: 22.1,
        isEgressActive: false,
        lastUpdated: "2026-07-15T21:14:58Z",
        status: "active"
      },
      east_concourse: {
        id: "east_concourse",
        label: "East Concourse",
        crowdDensity: 65,
        binFillLevel: 60,
        hvacLoad: 85,
        lightingLevel: 100,
        temperature: 27.5,
        isEgressActive: false,
        lastUpdated: "2026-07-15T21:14:50Z",
        status: "active"
      },
      west_concourse: {
        id: "west_concourse",
        label: "West Concourse",
        crowdDensity: 55,
        binFillLevel: 45,
        hvacLoad: 80,
        lightingLevel: 100,
        temperature: 26.3,
        isEgressActive: false,
        lastUpdated: "2026-07-15T21:14:55Z",
        status: "active"
      },
      pitch_zone: {
        id: "pitch_zone",
        label: "Pitch Zone",
        crowdDensity: null,
        binFillLevel: null,
        hvacLoad: 90,
        lightingLevel: 100,
        temperature: 23.0,
        isEgressActive: false,
        lastUpdated: "2026-07-15T21:14:58Z",
        status: "active"
      }
    }
  },

  // ─────────────────────────────────────────────
  // SCENARIO 3: POST-MATCH EGRESS
  // Match over. Active crowd egress across North, South, East gates.
  // System proposes HVAC/lighting reductions — SAFETY RULE fires and BLOCKS them visibly.
  // ─────────────────────────────────────────────
  postmatch: {
    id: "postmatch",
    label: "Post-Match Egress",
    matchMinute: "FT",
    matchMinuteNumeric: 92,
    venue: "MetLife Stadium · New York / New Jersey",
    match: "Group A · Brazil vs Argentina · FT 2–1",
    timestamp: "2026-07-15T23:05:00Z",
    description: "Full-time. 78,000 fans in active egress across North, South, and East gates. Safety rule will override proposed HVAC and lighting reductions in egress corridors.",
    sectors: {
      north_concourse: {
        id: "north_concourse",
        label: "North Concourse",
        crowdDensity: 78,
        binFillLevel: 92, // near overflow — alert needed
        hvacLoad: 95,
        lightingLevel: 100,
        temperature: 29.1,
        isEgressActive: true, // PRIMARY EGRESS — safety rule triggers here
        lastUpdated: "2026-07-15T23:04:55Z",
        status: "active"
      },
      south_concourse: {
        id: "south_concourse",
        label: "South Concourse",
        crowdDensity: 72,
        binFillLevel: 78,
        hvacLoad: 90,
        lightingLevel: 100,
        temperature: 28.6,
        isEgressActive: true, // SECONDARY EGRESS — safety rule triggers here too
        lastUpdated: "2026-07-15T23:04:58Z",
        status: "active"
      },
      east_concourse: {
        id: "east_concourse",
        label: "East Concourse",
        crowdDensity: 85,
        binFillLevel: 88,
        hvacLoad: 100,
        lightingLevel: 100,
        temperature: 30.4,
        isEgressActive: true, // PRIMARY EGRESS — safety rule triggers here
        lastUpdated: "2026-07-15T23:04:50Z",
        status: "active"
      },
      west_concourse: {
        id: "west_concourse",
        label: "West Concourse",
        crowdDensity: 45,
        binFillLevel: 55,
        hvacLoad: 80,
        lightingLevel: 100,
        temperature: 26.1,
        isEgressActive: false, // NOT primary egress — can optimize
        lastUpdated: "2026-07-15T23:04:55Z",
        status: "active"
      },
      pitch_zone: {
        id: "pitch_zone",
        label: "Pitch Zone",
        crowdDensity: null,
        binFillLevel: null,
        hvacLoad: 55,
        lightingLevel: 85,
        temperature: 22.5,
        isEgressActive: false,
        lastUpdated: "2026-07-15T23:04:58Z",
        status: "active"
      }
    }
  },

  // ─────────────────────────────────────────────
  // SCENARIO 4: DATA GAP
  // 62nd minute. West Concourse sensor goes stale (last update 9 minutes ago).
  // DATA GAP rule fires — West commands default to MAINTAIN, score penalized.
  // ─────────────────────────────────────────────
  datagap: {
    id: "datagap",
    label: "Data Gap",
    matchMinute: "62'",
    matchMinuteNumeric: 62,
    venue: "MetLife Stadium · New York / New Jersey",
    match: "Group A · Brazil vs Argentina",
    timestamp: "2026-07-15T20:42:00Z",
    description: "62nd minute. West Concourse IoT node offline — sensor telemetry stale for 9 minutes. DATA GAP protocol active. System defaults to safe last-known settings for that sector.",
    sectors: {
      north_concourse: {
        id: "north_concourse",
        label: "North Concourse",
        crowdDensity: 80,
        binFillLevel: 72,
        hvacLoad: 95,
        lightingLevel: 100,
        temperature: 29.8,
        isEgressActive: false,
        lastUpdated: "2026-07-15T20:41:52Z",
        status: "active"
      },
      south_concourse: {
        id: "south_concourse",
        label: "South Concourse",
        crowdDensity: 20,
        binFillLevel: 25,
        hvacLoad: 90,  // still wasting on a near-empty zone
        lightingLevel: 100,
        temperature: 23.5,
        isEgressActive: false,
        lastUpdated: "2026-07-15T20:41:55Z",
        status: "active"
      },
      east_concourse: {
        id: "east_concourse",
        label: "East Concourse",
        crowdDensity: 60,
        binFillLevel: 55,
        hvacLoad: 80,
        lightingLevel: 100,
        temperature: 27.2,
        isEgressActive: false,
        lastUpdated: "2026-07-15T20:41:48Z",
        status: "active"
      },
      west_concourse: {
        id: "west_concourse",
        label: "West Concourse",
        crowdDensity: null,   // STALE: sensor offline
        binFillLevel: null,   // STALE: sensor offline
        hvacLoad: 75,         // last known value — treated as unreliable
        lightingLevel: 100,
        temperature: null,
        isEgressActive: false,
        lastUpdated: "2026-07-15T20:33:10Z", // <-- 9 minutes stale
        status: "stale"      // KEY: triggers DATA GAP logic in engine
      },
      pitch_zone: {
        id: "pitch_zone",
        label: "Pitch Zone",
        crowdDensity: null,
        binFillLevel: null,
        hvacLoad: 88,
        lightingLevel: 100,
        temperature: 23.0,
        isEgressActive: false,
        lastUpdated: "2026-07-15T20:41:55Z",
        status: "active"
      }
    }
  }
};

// Stale threshold in minutes — sensors not updated within this window trigger DATA GAP
const STALE_THRESHOLD_MINUTES = 5;

/**
 * Returns the active scenario telemetry object by scenario ID.
 * @param {string} scenarioId
 * @returns {object} scenario telemetry snapshot
 */
function getScenario(scenarioId) {
  return SCENARIOS[scenarioId] || SCENARIOS.minute75;
}

/**
 * Checks if a sector's last update is beyond the stale threshold.
 * This mirrors the DATA HANDLING RULE from the system prompt.
 * @param {string} lastUpdated - ISO timestamp string
 * @param {string} scenarioTimestamp - reference "current" time for the scenario
 * @returns {boolean}
 */
function isSensorStale(lastUpdated, scenarioTimestamp) {
  const last = new Date(lastUpdated).getTime();
  const current = new Date(scenarioTimestamp).getTime();
  const deltaMinutes = (current - last) / (1000 * 60);
  return deltaMinutes > STALE_THRESHOLD_MINUTES;
}
