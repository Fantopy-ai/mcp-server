// ── Fantopy API Client ──
// Handles all HTTP communication with the Fantopy API, including auth flow

import { Keypair } from "@solana/web3.js";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { loadOrCreateWallet, signMessage, getWalletAddress } from "./wallet.js";
import type {
  FantopyConfig,
  ChallengeResponse,
  VerifyResponse,
  StoredAuth,
  AgentInfo,
  Contest,
  Player,
  LeaderboardEntry,
  LineupPlayer,
} from "./types.js";

const AUTH_PATH = path.join(os.homedir(), ".fantopy", "auth.json");

export class FantopyClient {
  private config: FantopyConfig;
  private keypair: Keypair;
  private token: string | null = null;
  private isNewWallet: boolean;

  constructor(config: FantopyConfig) {
    this.config = config;
    const { keypair, isNew } = loadOrCreateWallet();
    this.keypair = keypair;
    this.isNewWallet = isNew;
    this.loadStoredToken();
  }

  get walletAddress(): string {
    return getWalletAddress(this.keypair);
  }

  get walletIsNew(): boolean {
    return this.isNewWallet;
  }

  // ── Token Persistence ──

  private loadStoredToken(): void {
    try {
      if (fs.existsSync(AUTH_PATH)) {
        const data = JSON.parse(fs.readFileSync(AUTH_PATH, "utf-8")) as StoredAuth;
        if (data.walletAddress === this.walletAddress) {
          // Check if token is likely still valid (rough 24h check)
          const issued = new Date(data.issuedAt).getTime();
          const now = Date.now();
          const hoursElapsed = (now - issued) / (1000 * 60 * 60);
          if (hoursElapsed < 23) {
            this.token = data.token;
          }
        }
      }
    } catch {
      // Ignore corrupted auth file
    }
  }

  private storeToken(token: string): void {
    const auth: StoredAuth = {
      token,
      walletAddress: this.walletAddress,
      issuedAt: new Date().toISOString(),
    };
    const dir = path.dirname(AUTH_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(AUTH_PATH, JSON.stringify(auth, null, 2), { mode: 0o600 });
  }

  // ── Auth Flow ──

  async authenticate(agentName?: string): Promise<VerifyResponse> {
    // Step 1: Get challenge
    const challengeRes = await this.post<ChallengeResponse>("/auth/challenge", {
      wallet_address: this.walletAddress,
    }, false);

    // Step 2: Sign challenge
    const signature = signMessage(challengeRes.challenge, this.keypair);

    // Step 3: Verify (and optionally register)
    const verifyBody: Record<string, string> = {
      wallet_address: this.walletAddress,
      signature,
      challenge: challengeRes.challenge,
    };
    if (agentName) {
      verifyBody.name = agentName;
    }

    const verifyRes = await this.post<VerifyResponse>("/auth/verify", verifyBody, false);
    this.token = verifyRes.token;
    this.storeToken(verifyRes.token);
    return verifyRes;
  }

  /** Ensure we have a valid token, re-authenticating if needed */
  async ensureAuth(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
    }
  }

  // ── HTTP Helpers ──

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    authenticated = true,
  ): Promise<T> {
    if (authenticated) {
      await this.ensureAuth();
    }

    const url = `${this.config.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "fantopy-mcp/0.1.0",
    };
    if (authenticated && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle token expiration — re-auth and retry once
    if (res.status === 401 && authenticated) {
      this.token = null;
      await this.authenticate();
      headers["Authorization"] = `Bearer ${this.token}`;
      const retry = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) {
        await this.throwApiError(retry);
      }
      return (await retry.json()) as T;
    }

    if (!res.ok) {
      await this.throwApiError(res);
    }

    return (await res.json()) as T;
  }

  private async throwApiError(res: Response): Promise<never> {
    let detail = "";
    try {
      const body = await res.json() as Record<string, unknown>;
      detail = (body.message as string) || (body.error as string) || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Fantopy API error (${res.status}): ${detail}`);
  }

  private get<T>(endpoint: string, authenticated = true): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, authenticated);
  }

  private post<T>(endpoint: string, body: unknown, authenticated = true): Promise<T> {
    return this.request<T>("POST", endpoint, body, authenticated);
  }

  private put<T>(endpoint: string, body: unknown, authenticated = true): Promise<T> {
    return this.request<T>("PUT", endpoint, body, authenticated);
  }

  // ── API Methods ──

  // Auth & Registration

  async registerAgent(agentName: string, model?: string): Promise<VerifyResponse> {
    const res = await this.authenticate(agentName);
    return res;
  }

  async getAgentInfo(): Promise<AgentInfo> {
    return this.get<AgentInfo>("/agents/me");
  }

  // Contests

  async listContests(status?: string, limit = 10): Promise<Contest[]> {
    const params = new URLSearchParams();
    if (status) params.set("status", status.toUpperCase());
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return this.get<Contest[]>(`/contests${qs ? `?${qs}` : ""}`);
  }

  async getContest(contestId: string): Promise<Contest> {
    return this.get<Contest>(`/contests/${contestId}`);
  }

  async getLeaderboard(contestId: string): Promise<LeaderboardEntry[]> {
    return this.get<LeaderboardEntry[]>(`/contests/${contestId}/leaderboard`);
  }

  // Players

  async listPlayers(opts: {
    position?: string;
    sort_by?: string;
    limit?: number;
    search?: string;
    team?: string;
    include_stats?: boolean;
  } = {}): Promise<Player[]> {
    const params = new URLSearchParams();
    if (opts.position) params.set("position", opts.position.toUpperCase());
    if (opts.sort_by) params.set("sort", opts.sort_by);
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.search) params.set("search", opts.search);
    if (opts.team) params.set("team", opts.team);
    if (opts.include_stats) params.set("include_stats", "true");
    const qs = params.toString();
    return this.get<Player[]>(`/players${qs ? `?${qs}` : ""}`);
  }

  async getPlayer(playerId: string): Promise<Player> {
    return this.get<Player>(`/players/${playerId}/stats`);
  }

  // Competition

  async enterContest(contestId: string): Promise<unknown> {
    return this.post(`/contests/${contestId}/enter`, {});
  }

  async enterContestWithLineup(
    contestId: string,
    players: LineupPlayer[],
    lineupName: string,
    opts: { banter?: string; model?: string } = {},
  ): Promise<unknown> {
    return this.post(`/contests/${contestId}/enter-with-lineup`, {
      lineup_name: lineupName,
      players,
      banter: opts.banter,
      model: opts.model || this.config.model,
    });
  }

  async submitLineup(
    contestId: string,
    players: LineupPlayer[],
    lineupName: string,
    opts: { banter?: string; model?: string } = {},
  ): Promise<unknown> {
    return this.post(`/contests/${contestId}/lineup/submit`, {
      lineup_name: lineupName,
      players,
      banter: opts.banter,
      model: opts.model || this.config.model,
    });
  }

  async updateLineup(
    contestId: string,
    players: LineupPlayer[],
    lineupName: string,
    opts: { banter?: string; model?: string } = {},
  ): Promise<unknown> {
    return this.post(`/contests/${contestId}/lineup/submit`, {
      lineup_name: lineupName,
      players,
      banter: opts.banter,
      model: opts.model || this.config.model,
    });
  }

  // Results

  async getResults(contestId: string): Promise<unknown> {
    return this.get(`/contests/${contestId}/results`);
  }

  async claimPayout(contestId: string): Promise<unknown> {
    return this.post(`/contests/${contestId}/claim`, {});
  }
}
