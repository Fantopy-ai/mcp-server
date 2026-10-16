# Fantopy — Gameweek Manager

Prepare a deadline-ready Premier League fantasy plan for the shared Fantopy team you also manage in the app. Read context and squad first; make changes only after approval of the exact action. Free-play; competition points and awards are virtual, not cash or crypto. AI runtime is not included.

This minimal distribution contains one Cursor-format plugin manifest, one remote MCP configuration and one outcome-led skill. No server executable, credentials or bundled runtime is included. OAuth is required at `https://mcp.fantopy.ai/mcp`.

## Local Cursor installation
Use an existing approved Cursor installation. Copy this directory's contents (including `.cursor-plugin`) into a **real directory** at `~/.cursor/plugins/local/fantopy`, then restart Cursor or run **Developer: Reload Window**. Open **Customize** and confirm `fantopy`, `gameweek-manager` and the Fantopy MCP server are discovered. Local plugin imports must be allowed by any organisation policy; an installed marketplace plugin with the same name takes precedence. Do not symlink to a directory outside the local plugins directory. These steps come from the current Cursor local-plugin guide, not an invented CLI install command.

Complete Fantopy OAuth in the client/browser, choosing read permissions first. This config intentionally has no token headers, command, environment variables or invented OAuth fields; URL-based remote transport and browser OAuth discovery are handled by the client. Configuring a URL does not prove OAuth compatibility.

Invoke `/gameweek-manager` or ask:
> Use Fantopy Gameweek Manager to prepare my current gameweek readiness brief. Read context and my squad, explain the deadline and blockers, and propose a captain/bench/transfer plan if useful. Do not make changes.

See `TESTING.md` for reproducible local and in-app tests. For Grok Bot, use `templates/gameweek-manager.md` as a manual recipe, not a purported importable export. Recipient OAuth/grants and custom MCP configuration are not shared.

## Safety and limitations
The skill is instruction-level guidance, not a client-side read-only tool firewall. The server may advertise write tools; use least-privilege provider grants and client tool confirmations. Every gameplay write needs exact owner approval, fresh rule/deadline/version context and exact post-write readback. No current-client acceptance is claimed by this package. Anonymous HTTP discovery or an earlier protocol-level run is not Cursor/Grok Bot success.

## Upstream documentation (retrieved 2026-10-16)
- Cursor reference: https://prod.cursor.com/docs/reference/plugins
- Cursor install/local test guide: https://prod.cursor.com/docs/plugins
- Grok marketplace submission: https://x.ai/bot/marketplace/submit-a-plugin
- Grok template limits: https://x.ai/bot/guides/templates-for-grok-bot

Grok's submission form requires both local and in-app testing; do not attest until the named-client gate in `TESTING.md` passes. The form labels Grok availability “coming soon”; do not conflate Grok, Grok Bot and Cursor. No repository push, marketplace submission, exported bot or template publication is performed by this artifact.
