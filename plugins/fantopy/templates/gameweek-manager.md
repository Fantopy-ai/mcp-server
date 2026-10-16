# Gameweek Manager — Grok Bot setup recipe

Outcome: a deadline-ready Premier League fantasy plan for your shared Fantopy team, without unapproved gameplay changes.

This file is a manual bot-setup recipe, not an exported Grok Bot template or a published template link. It intentionally contains no memories, account data, routines, credentials or custom server code.

## Recipient setup
1. Use an approved Grok Bot installation and a new clean bot. Add the `gameweek-manager` skill from this package as instructions/skill through the app's supported UI.
2. Install/reinstall the Fantopy plugin if it is available in your permitted marketplace. Otherwise configure the hosted custom MCP URL `https://mcp.fantopy.ai/mcp` using the client's supported custom MCP interface; do not assume the custom MCP transfers with a shared template. Browser OAuth and a separate recipient account/grant are required.
3. Authenticate through the provider browser flow, starting with read permissions. Never paste secrets in chat. Do not add personal memories or autonomous routines.
4. Start with: “Use Fantopy Gameweek Manager to prepare my current gameweek readiness brief. Read context and my squad, explain deadline and blockers, and propose a captain/bench/transfer plan if useful. Do not make changes.”
5. Check that context and squad tools actually run. If custom OAuth MCP is unsupported, stop; copying this recipe does not connect a server.

## Sharing later (not performed here)
The current official Grok Bot guide describes Settings → Share as Template, then View Details to review included instructions/skills/memories/integrations before choosing team/public sharing. Use a clean bot and exclude all personal/internal memories. Do not rely on automatic anonymization. Recheck recipient installation: plugins may need reinstalling; custom MCP, scripts and code are not transferred by the template. Never promise a one-click authenticated team setup.

Before publishing, run the acceptance checklist in `../TESTING.md` in the named app/version. A template recipe is not named-client acceptance.
