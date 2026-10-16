# Fantopy MCP — hosted connector migration

> **Deprecated local package:** this repository preserves the historical
> `@fantopy/mcp-server` source. Do not install or run this package for the current
> Fantopy game. The current connector is hosted and requires OAuth.

## Premier League fantasy for the agent era

Fantopy is free-play Premier League fantasy football. Play in the app or connect
an assistant to the **same account and 15-player team**. Start with read-only
access; team changes and friends' competition management are optional and limited
to the permissions the owner approves in Fantopy. Points and awards are virtual,
not cash or crypto. Your AI runtime is not included.

- Website: https://fantopy.ai
- Play: https://app.fantopy.ai
- **Remote MCP URL: `https://mcp.fantopy.ai/mcp`**
- **Authentication: OAuth, with user sign-in and consent in Fantopy**

The old World Cup prediction game, `/arena` onboarding, anonymous-agent creation,
wallet authentication and local npm/stdin-stdout setup are not the current path.

## Connect safely

1. In a client that supports remote MCP with OAuth, add
   `https://mcp.fantopy.ai/mcp` as the server URL. Configuration screens and formats
   vary by client; a skill or URL alone does not install a working connector.
2. Complete sign-in and consent in Fantopy's browser flow. Start with view/read
   permissions. Never hand passwords, one-time codes, recovery codes, wallet keys
   or bearer tokens to the assistant or paste them into chat or repository files.
3. After consent, discover the available tools. Begin with `get_context`, then
   `read_squad`, to inspect rules, deadlines, permissions and your existing team.
4. Ask for an explanation or proposal first. Only request changes you actually
   want, within the approved permissions and current deadline/version checks.
   Do not grant write access merely to test the connection.

Example first prompt:

> Read my Fantopy context and squad. Summarize my Premier League team, deadlines
> and approved permissions. Do not create a team, enter competitions or change
> anything.

## Verification and limitations

A protocol-level read-only acceptance test on **October 11, 2026** completed
browser consent, OAuth token exchange, MCP initialization, an 18-tool catalog,
`get_context` and `read_squad`. That is a dated protocol snapshot, **not proof of
acceptance in any branded client**. Discover the live catalog after consent;
availability depends on the current server and grant.

An unauthenticated request to the MCP URL returns HTTP 401 with OAuth discovery
metadata. This is expected, not evidence that the server has no tools.

## Historical repository

The TypeScript source, package manifest and lockfile are preserved for history.
This repository is not the current hosted server source or a deployment guide.
Do not publish a new version of the legacy npm package to connect to Fantopy.

[API_REFERENCE.md](API_REFERENCE.md) and [SPEC.md](SPEC.md) describe the retired
wallet/contest-era implementation, not the current service contract. Their
historical examples must not be used as current onboarding or action instructions.

For current integrations, use the hosted OAuth URL above and the live authorized
MCP tool schemas. Third-party listings may lag behind this migration notice.

## License

MIT
