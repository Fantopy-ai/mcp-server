# Installation and acceptance tests

## Automated local checks
From the parent artifact directory run:
```sh
python3 tests/test_package.py
python3 tests/run_upstream_validator.py
python3 tests/probe_endpoint.py
```
These are package content/schema-contract checks and anonymous discovery tests, not execution inside Cursor or Grok Bot. Source checks, when available, are separate server regression evidence and do not qualify this plugin in-app. The audit/report are outside this publishable directory.

## Named-client acceptance — still required
Use an existing authorised client; do not install a paid app or connect an account without owner approval. Record exact app name, version/build, OS, date, package hash and install method. Never substitute generic “MCP client” results.

1. **Discovery**: copy this package into Cursor's supported local directory and reload (README). In Customize verify the manifest, exactly one Gameweek Manager skill and hosted MCP server load. Capture sanitized evidence. For Grok Bot, verify the supported plugin/custom MCP setup and manually apply the recipe; there is no invented JSON template importer here.
2. **OAuth/read-only grant**: complete real client browser OAuth with only needed read scopes, including context:read and team:read. Confirm the expected Fantopy origin and do not pass secrets through chat. Record high-level granted scopes, not tokens, emails, account IDs or raw payloads.
3. **Authenticated discovery**: discover the current tools in-app; compare against the current catalog, investigate drift rather than hard-code a historical count. An October 11 protocol-level 18-tool report is historical context, not a current client receipt.
4. **Outcome**: invoke `/gameweek-manager` (Cursor) or the recipe prompt. Observe real `get_context` followed by `read_squad`, correct current game/week, deadline/timezone, context freshness and the owner's app/team match. Review privacy-safe summaries only. Confirm no writes, including metadata disclosure.
5. **Permission and safety**: with approved restricted scopes, confirm missing permission is handled safely, not bypassed. Ask for preparation without exact approval: verify no write occurs. Verify conflicting/stale/deadline-locked or ambiguous values stop execution; do not mutate production to create such cases. Do not treat scripted text checks as behavioral model proof.
6. **Optional writes**: NOT required for read-only acceptance. Only after separate explicit owner authorisation, test one exact action, live expected version/scope, idempotency where supported, and exact readback. Test stale/conflict handling only in an owner-approved safe environment. No gameplay write or revoke is authorised by this checklist.
7. **Recipient recipe**: if claiming Grok template distribution, create a clean bot, inspect View Details, confirm no personal memories/secrets/routines, then test a separate approved recipient reinstall/configuration/OAuth. No template sharing/publishing is authorised here.

## Exact remaining gate
Local package tests + anonymous discovery + source regressions do **not** satisfy the in-app gate. Before saying “works in Cursor” or “works in Grok Bot,” complete steps 1–5 in that exact client/version with dated sanitized receipts. For a transferable-template claim also complete step 7. Record unsupported OAuth/plugin import as a blocker rather than success. Do not check the marketplace form's local-and-in-app-tested attestation until this is true for each claimed target. Repository publication, publisher identity/logo/legal review and submission remain with the owner/parent; no repository URL or licence grant is invented here.
