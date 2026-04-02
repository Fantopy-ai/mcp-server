// ── Lineup Validation ──
// Enforces all lineup rules before hitting the API

import type { LineupPlayer, Player, Position } from "./types.js";
import { VALID_FORMATIONS } from "./types.js";

export interface ValidationError {
  message: string;
}

export function validateLineup(
  players: LineupPlayer[],
  captainId: string,
  formation: string,
  playerDetails?: Player[],
  budgetCap = 200,
  maxPerTeam = 3,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Exactly 15 players (11 starting + 4 bench)
  if (players.length !== 15) {
    errors.push({
      message: `Lineup must have exactly 15 players (11 starting + 4 bench), got ${players.length}`,
    });
  }

  // No duplicate player IDs
  const ids = players.map((p) => p.player_id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    errors.push({ message: "Lineup contains duplicate players" });
  }

  // Valid formation
  const formKey = formation.replace(/^1-/, ""); // normalize "1-4-4-2" → "4-4-2"
  const expectedFormation = VALID_FORMATIONS[formKey];
  if (!expectedFormation) {
    errors.push({
      message: `Invalid formation "${formation}" — valid options: ${Object.keys(VALID_FORMATIONS).join(", ")}`,
    });
  } else {
    // Count positions
    const positionCounts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const p of players) {
      if (p.position in positionCounts) {
        positionCounts[p.position]++;
      } else {
        errors.push({ message: `Invalid position "${p.position}" for player ${p.player_id}` });
      }
    }

    // Check formation match
    for (const [pos, expected] of Object.entries(expectedFormation)) {
      const actual = positionCounts[pos] || 0;
      if (actual !== expected) {
        errors.push({
          message: `Formation ${formation} requires ${expected} ${pos} players, got ${actual}`,
        });
      }
    }
  }

  // Exactly 1 GK
  const gkCount = players.filter((p) => p.position === "GK").length;
  if (gkCount !== 1) {
    errors.push({ message: `Lineup must have exactly 1 GK, got ${gkCount}` });
  }

  // Captain must be in lineup
  const captainInLineup = players.some((p) => p.player_id === captainId);
  if (!captainInLineup) {
    errors.push({
      message: `Captain (${captainId}) must be one of the 15 players in the lineup`,
    });
  }

  // Exactly one captain flag
  const captainFlags = players.filter((p) => p.is_captain).length;
  if (captainFlags !== 1) {
    errors.push({ message: `Exactly 1 player must be captain, got ${captainFlags}` });
  }

  // Budget + team limits (only if we have player details)
  if (playerDetails && playerDetails.length > 0) {
    const detailMap = new Map(playerDetails.map((p) => [String(p.id), p]));

    let totalCost = 0;
    const teamCounts: Record<string, number> = {};

    for (const lp of players) {
      const detail = detailMap.get(lp.player_id);
      if (detail) {
        totalCost += detail.price;
        const team = detail.team || "unknown";
        teamCounts[team] = (teamCounts[team] || 0) + 1;
      }
    }

    if (totalCost > budgetCap) {
      errors.push({
        message: `Budget exceeded: your lineup costs ${totalCost}, cap is ${budgetCap}`,
      });
    }

    for (const [team, count] of Object.entries(teamCounts)) {
      if (count > maxPerTeam) {
        errors.push({
          message: `Too many players from ${team} (${count}) — max ${maxPerTeam} per team`,
        });
      }
    }
  }

  return errors;
}

/** Infer formation string from player positions */
export function inferFormation(players: LineupPlayer[]): string | null {
  const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of players) {
    if (p.position in counts) counts[p.position]++;
  }

  const key = `${counts.DEF}-${counts.MID}-${counts.FWD}`;
  return VALID_FORMATIONS[key] ? key : null;
}
