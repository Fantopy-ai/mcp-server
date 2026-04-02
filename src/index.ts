#!/usr/bin/env node
// ── Fantopy MCP Server ──
// MCP server for Fantopy Arena — AI fantasy football on Solana

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FantopyClient } from "./api.js";
import { registerTools } from "./tools.js";
import type { FantopyConfig } from "./types.js";

// ── Configuration from environment ──

function getConfig(): FantopyConfig {
  const env = (process.env.FANTOPY_ENV || "testnet").toLowerCase();

  const apiUrls: Record<string, string> = {
    testnet: "https://test-api.fantopy.ai/v1",
    mainnet: "https://api.fantopy.ai/v1",
    dev: "https://dev-api.fantopy.ai/v1",
    local: "http://localhost:4000/v1",
  };

  const apiUrl = process.env.FANTOPY_API_URL || apiUrls[env] || apiUrls.testnet;

  return {
    apiUrl,
    environment: env === "mainnet" ? "mainnet" : "testnet",
    agentName: process.env.FANTOPY_AGENT_NAME,
    model: process.env.FANTOPY_MODEL,
  };
}

// ── Parse CLI args ──

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--env" && argv[i + 1]) {
      args.env = argv[++i];
    } else if (argv[i] === "--api-url" && argv[i + 1]) {
      args.apiUrl = argv[++i];
    } else if (argv[i] === "--agent-name" && argv[i + 1]) {
      args.agentName = argv[++i];
    } else if (argv[i] === "--model" && argv[i + 1]) {
      args.model = argv[++i];
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      console.error(`
fantopy-mcp — MCP server for Fantopy Arena

Usage: fantopy-mcp [options]

Options:
  --env <env>           Environment: testnet (default), mainnet, dev, local
  --api-url <url>       Custom API URL (overrides --env)
  --agent-name <name>   Agent name for registration
  --model <model>       AI model identifier (e.g. claude-opus-4-6)
  --help, -h            Show this help

Environment variables:
  FANTOPY_ENV           Same as --env
  FANTOPY_API_URL       Same as --api-url
  FANTOPY_AGENT_NAME    Same as --agent-name
  FANTOPY_MODEL         Same as --model

Wallet is stored at ~/.fantopy/wallet.json (auto-generated on first run).
Auth token is cached at ~/.fantopy/auth.json (auto-refreshed).
`.trim());
      process.exit(0);
    }
  }
  return args;
}

// ── Main ──

async function main(): Promise<void> {
  const args = parseArgs();

  // CLI args override env vars
  if (args.env) process.env.FANTOPY_ENV = args.env;
  if (args.apiUrl) process.env.FANTOPY_API_URL = args.apiUrl;
  if (args.agentName) process.env.FANTOPY_AGENT_NAME = args.agentName;
  if (args.model) process.env.FANTOPY_MODEL = args.model;

  const config = getConfig();

  // Create MCP server
  const server = new McpServer({
    name: "fantopy",
    version: "0.1.0",
  });

  // Create API client
  const client = new FantopyClient(config);

  // Register all tools
  registerTools(server, client);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup info to stderr (stdout is reserved for MCP protocol)
  console.error(`[fantopy-mcp] Started — ${config.environment} (${config.apiUrl})`);
  console.error(`[fantopy-mcp] Wallet: ${client.walletAddress}`);
}

main().catch((err) => {
  console.error("[fantopy-mcp] Fatal error:", err);
  process.exit(1);
});
