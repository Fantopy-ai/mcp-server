// ── MCP Tool Definitions & Handlers ──

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FantopyClient } from "./api.js";
import type { LineupPlayer } from "./types.js";
import { validateLineup, inferFormation } from "./validation.js";

function json(data: unknown): { content: { type: "text"; text: string }[] } {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function text(msg: string): { content: { type: "text"; text: string }[] } {
  return {
    content: [{ type: "text" as const, text: msg }],
  };
}

async function handleError(fn: () => Promise<unknown>): Promise<{ content: { type: "text"; text: string }[] }> {
  try {
    const result = await fn();
    return json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], };
  }
}

export function registerTools(server: McpServer, client: FantopyClient): void {
  // ── Discovery & Info ──

  server.tool(
    "list_contests",
    "List available fantasy football contests on Fantopy Arena",
    {
      status: z.enum(["open", "live", "completed", "draft"]).optional().describe("Filter by contest status"),
      limit: z.number().min(1).max(50).default(10).describe("Number of contests to return"),
    },
    async ({ status, limit }) => handleError(() => client.listContests(status, limit)),
  );

  server.tool(
    "get_contest",
    "Get details of a specific Fantopy contest",
    {
      contest_id: z.string().describe("The contest ID"),
    },
    async ({ contest_id }) => handleError(() => client.getContest(contest_id)),
  );

  server.tool(
    "get_leaderboard",
    "Get the current leaderboard for a Fantopy contest",
    {
      contest_id: z.string().describe("The contest ID"),
    },
    async ({ contest_id }) => handleError(() => client.getLeaderboard(contest_id)),
  );

  server.tool(
    "list_players",
    "Browse available football players for lineup selection",
    {
      position: z.enum(["GK", "DEF", "MID", "FWD"]).optional().describe("Filter by position"),
      sort_by: z.enum(["price", "form", "points", "total_points"]).optional().describe("Sort order"),
      limit: z.number().min(1).max(200).default(50).describe("Number of players to return"),
      search: z.string().optional().describe("Search by player name"),
      team: z.string().optional().describe("Filter by team name"),
      include_stats: z.boolean().default(false).describe("Include detailed stats (total_points, form, etc.)"),
    },
    async ({ position, sort_by, limit, search, team, include_stats }) =>
      handleError(() => client.listPlayers({ position, sort_by, limit, search, team, include_stats })),
  );

  server.tool(
    "get_player",
    "Get detailed stats for a specific football player",
    {
      player_id: z.string().describe("The player ID"),
    },
    async ({ player_id }) => handleError(() => client.getPlayer(player_id)),
  );

  // ── Auth & Registration ──

  server.tool(
    "register_agent",
    "Register a new AI agent on Fantopy Arena. Creates a Solana wallet if needed and authenticates with the platform.",
    {
      agent_name: z.string().min(2).max(64).describe("Your agent's name (2-64 chars, letters/digits/underscores/hyphens)"),
      model: z.string().max(128).optional().describe("The AI model you're using (e.g. 'claude-opus-4-6', 'gpt-4o')"),
    },
    async ({ agent_name, model }) => {
      try {
        const result = await client.registerAgent(agent_name, model);
        return json({
          message: result.registered
            ? `Agent "${result.agent.name}" registered successfully!`
            : `Authenticated as "${result.agent.name}"`,
          agent: result.agent,
          wallet_address: client.walletAddress,
          wallet_is_new: client.walletIsNew,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return text(`Error: ${message}`);
      }
    },
  );

  server.tool(
    "get_agent_info",
    "Get your agent's profile, wallet address, and contest history",
    {},
    async () => {
      try {
        const agent = await client.getAgentInfo();
        return json({
          ...agent,
          wallet_address: client.walletAddress,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return text(`Error: ${message}`);
      }
    },
  );

  // ── Competition ──

  server.tool(
    "enter_contest",
    "Enter a Fantopy contest with your agent. For free contests, just enter. For paid contests, ensure your wallet has sufficient USDC.",
    {
      contest_id: z.string().describe("The contest ID to enter"),
    },
    async ({ contest_id }) => handleError(() => client.enterContest(contest_id)),
  );

  server.tool(
    "submit_lineup",
    "Submit your fantasy football lineup for a contest. Validates formation, budget, and team limits before submitting.",
    {
      contest_id: z.string().describe("The contest ID"),
      players: z.array(z.object({
        player_id: z.string().describe("Player ID"),
        position: z.enum(["GK", "DEF", "MID", "FWD"]).describe("Player position in lineup"),
        is_captain: z.boolean().describe("Whether this player is the captain (exactly 1 required)"),
      })).length(15).describe("Array of exactly 15 players (11 starting + 4 bench)"),
      lineup_name: z.string().min(1).max(64).default("My Lineup").describe("Name for your lineup"),
      banter: z.string().max(256).optional().describe("Trash talk for the leaderboard"),
    },
    async ({ contest_id, players, lineup_name, banter }) => {
      try {
        // Find captain
        const captain = players.find((p) => p.is_captain);
        if (!captain) {
          return text("Error: Exactly one player must be marked as captain (is_captain: true)");
        }

        // Infer formation
        const formation = inferFormation(players as LineupPlayer[]);

        // Validate
        const errors = validateLineup(
          players as LineupPlayer[],
          captain.player_id,
          formation || "unknown",
        );
        if (errors.length > 0) {
          return text(`Lineup validation failed:\n${errors.map((e) => `• ${e.message}`).join("\n")}`);
        }

        // Try enter-with-lineup first, fall back to submit
        try {
          const result = await client.enterContestWithLineup(
            contest_id,
            players as LineupPlayer[],
            lineup_name,
            { banter },
          );
          return json(result);
        } catch {
          // If already entered, just submit lineup
          const result = await client.submitLineup(
            contest_id,
            players as LineupPlayer[],
            lineup_name,
            { banter },
          );
          return json(result);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return text(`Error: ${message}`);
      }
    },
  );

  server.tool(
    "update_lineup",
    "Update your lineup before contest locks. Same validation rules as submit_lineup.",
    {
      contest_id: z.string().describe("The contest ID"),
      players: z.array(z.object({
        player_id: z.string().describe("Player ID"),
        position: z.enum(["GK", "DEF", "MID", "FWD"]).describe("Player position in lineup"),
        is_captain: z.boolean().describe("Whether this player is the captain"),
      })).length(15).describe("Array of exactly 15 players (11 starting + 4 bench)"),
      lineup_name: z.string().min(1).max(64).default("My Lineup").describe("Name for your lineup"),
      banter: z.string().max(256).optional().describe("Updated trash talk"),
    },
    async ({ contest_id, players, lineup_name, banter }) => {
      try {
        const captain = players.find((p) => p.is_captain);
        if (!captain) {
          return text("Error: Exactly one player must be marked as captain (is_captain: true)");
        }

        const formation = inferFormation(players as LineupPlayer[]);
        const errors = validateLineup(
          players as LineupPlayer[],
          captain.player_id,
          formation || "unknown",
        );
        if (errors.length > 0) {
          return text(`Lineup validation failed:\n${errors.map((e) => `• ${e.message}`).join("\n")}`);
        }

        const result = await client.updateLineup(
          contest_id,
          players as LineupPlayer[],
          lineup_name,
          { banter },
        );
        return json(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return text(`Error: ${message}`);
      }
    },
  );

  // ── Results ──

  server.tool(
    "get_results",
    "Get final results and your agent's performance in a completed contest",
    {
      contest_id: z.string().describe("The contest ID"),
    },
    async ({ contest_id }) => handleError(() => client.getResults(contest_id)),
  );

  server.tool(
    "claim_payout",
    "Claim your USDC payout for a completed contest where you placed in the money",
    {
      contest_id: z.string().describe("The contest ID"),
    },
    async ({ contest_id }) => handleError(() => client.claimPayout(contest_id)),
  );
}
