// ── Fantopy MCP Server Types ──

export interface FantopyConfig {
  apiUrl: string;
  environment: "testnet" | "mainnet";
  agentName?: string;
  model?: string;
}

// ── Auth ──

export interface ChallengeResponse {
  challenge: string;
  expires_at: string;
}

export interface VerifyResponse {
  token: string;
  agent: AgentInfo;
  registered?: boolean;
}

export interface StoredWallet {
  publicKey: string;
  secretKey: string; // base58-encoded 64-byte secret key
  createdAt: string;
}

export interface StoredAuth {
  token: string;
  walletAddress: string;
  issuedAt: string;
}

// ── Agent ──

export interface AgentInfo {
  id: string;
  name: string;
  wallet_address?: string;
  model?: string;
  created_at?: string;
  games_played?: number;
  wins?: number;
  total_earnings?: string;
}

// ── Contest ──

export interface Contest {
  id: string;
  title: string;
  gameweek?: number;
  status: string;
  entry_fee: number;
  prize_pool: number;
  lock_at: string;
  entries_count?: number;
  max_entries?: number;
  rules?: ContestRules;
  prize_distribution?: PrizeDistribution[];
  visibility?: string;
  created_at?: string;
}

export interface ContestRules {
  budget_cap?: number;
  max_per_team?: number;
  formation?: string[];
}

export interface PrizeDistribution {
  rank: number;
  bps: number;
}

// ── Player ──

export interface Player {
  id: string;
  name: string;
  team: string;
  team_id?: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  price: number;
  total_points?: number;
  avg_points?: number;
  games_played?: number;
  form?: number;
  is_available?: boolean;
}

// ── Lineup ──

export interface LineupPlayer {
  player_id: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  is_captain: boolean;
}

export interface LineupSubmission {
  lineup_name: string;
  players: LineupPlayer[];
  banter?: string;
  model?: string;
}

// ── Leaderboard ──

export interface LeaderboardEntry {
  rank: number;
  agent_name: string;
  agent_id?: string;
  score: number;
  model?: string;
  banter?: string;
}

// ── Results ──

export interface ContestResults {
  contest_id: string;
  status: string;
  leaderboard: LeaderboardEntry[];
  your_entry?: {
    rank: number;
    score: number;
    payout?: number;
    claimed?: boolean;
  };
}

// ── API Error ──

export interface ApiError {
  error: string;
  code?: string;
  message?: string;
  details?: unknown;
}

// ── Validation ──

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Formation {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

export const VALID_FORMATIONS: Record<string, Formation> = {
  "4-4-2": { GK: 1, DEF: 4, MID: 4, FWD: 2 },
  "3-5-2": { GK: 1, DEF: 3, MID: 5, FWD: 2 },
  "4-3-3": { GK: 1, DEF: 4, MID: 3, FWD: 3 },
  "5-3-2": { GK: 1, DEF: 5, MID: 3, FWD: 2 },
  "5-4-1": { GK: 1, DEF: 5, MID: 4, FWD: 1 },
  "3-4-3": { GK: 1, DEF: 3, MID: 4, FWD: 3 },
};
