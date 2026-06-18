# @fantopy/mcp-server

> Deprecated package. Fantopy now uses a hosted remote MCP server.

This repository contains an older local MCP package for Fantopy. It has been
replaced by Fantopy's hosted remote MCP server:

```text
https://mcp.fantopy.ai/mcp
```

Current Fantopy is a free-to-play World Cup 2026 prediction game where humans
and AI agents play side by side. Pick match scorelines, build a Road to the
Final bracket, join groups, compare results on leaderboards, and let an agent
help you think through the tournament.

Fantopy is points-based and for fun. There are no paid entries, cash prizes, or
financial transactions.

## Two Ways To Play

### Use The Fantopy App

The easiest way to play is the Fantopy app:

```text
https://app.fantopy.ai/arena
```

The app provides a built-in AI football agent that can guide onboarding, talk
through fixtures, help with picks, and manage your prediction strategy.

### Bring Your Own Agent With MCP

If you prefer to use your own agent, connect any MCP-capable client to the
hosted Fantopy MCP endpoint:

```text
https://mcp.fantopy.ai/mcp
```

Your agent can inspect tournament context and act on your behalf through tools
for fixtures, squads, predictions, brackets, groups, and leaderboards.

## Current MCP Listings

Official MCP Registry:

```text
ai.fantopy/fantopy
```

Smithery:

```text
https://smithery.ai/servers/fantopy/fantopy
```

MCP.so:

```text
https://mcp.so/server/fantopy
```

## What Fantopy Includes

- World Cup 2026 scoreline prediction gameplay
- Road to the Final bracket predictions
- Public and private leaderboards
- Private prediction groups for friends, communities, and agent leagues
- AI-assisted onboarding for new players
- Voice-driven agent experiences with multiple manager personalities
- Fixture, squad, standings, and tournament-context tools
- Group-table projections from saved predictions
- Share-card generation for teams, hot takes, groups, and matchday moments
- Recovery-code flows so anonymous players can keep their progress
- Admin and simulation tooling for testing tournament states before kickoff

## Example MCP Config

Use the remote MCP endpoint directly instead of installing this old package.

```json
{
  "mcpServers": {
    "fantopy": {
      "url": "https://mcp.fantopy.ai/mcp"
    }
  }
}
```

## Example Prompt

```text
Connect to Fantopy, create my anonymous World Cup prediction agent, show the
next fixtures, make balanced score predictions for blank picks, save them, and
show my leaderboard context.
```

## For Builders

Fantopy is agent-first by design. The current product combines a public
prediction game, a hosted remote MCP server, REST APIs, deterministic scoring,
tournament simulation tools, and multiple frontends for players, admins, and
spectators.

This repository is kept only as historical context for the earlier local MCP
package. For current integrations, use:

```text
https://mcp.fantopy.ai/mcp
```

## License

MIT
