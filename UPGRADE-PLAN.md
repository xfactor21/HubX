 # HubX upgrade plan

Approved 18 October 2026. Preserve planet.X branding and navy/cyan/pink styling. Work in `upgrade/catalog-skills-mcp`, with a draft pull request. Deliver a tested preview at the end of each phase and wait for approval before beginning the next.

## Phase 1 — catalog, freshness, and instructions

- Audit all 32 original entries against official repositories, releases, documentation, and license files.
- Keep existing registration IDs stable; retain legacy projects with explicit maintenance/successor notices rather than silently breaking saved launch targets.
- Include all 13 Crafting Apps and ArtCraft Launcher, xfactor21/voicebox with explicit upstream distribution provenance, and verified additions in video/music/speech.
- Display dated release/source snapshots, not a claim that installed software has been updated. A source commit and a released executable are different versions.
- Provide prerequisites, step-by-step setup, launch/registration, update and troubleshooting notes for every entry, plus official links.
- Add release selectors only for verified official asset names. Failed, ambiguous, or missing matches must remain visible failures.
- Deliver preview and verification evidence; no final Windows release yet.

## Phase 2 — opt-in hardware scan and recommendations

Desktop-only local scan: OS/build, architecture, CPU, RAM, GPU adapters/VRAM, driver versions, and free disk space where available. Use bounded OS-native queries and validated parsing. No serial numbers, network inventory, telemetry upload, or admin elevation.

Show the scan results before selecting a package. Rule-based recommendations must explain their evidence, driver minimums, architecture and resource constraints. Multiple GPUs, unknown drivers and unsupported hardware must produce a manual fallback, not a confident guess. ComfyUI CUDA variants require actual release notes/driver support, not vendor name alone. Reconfirm each download; never silently install software or drivers.

Acceptance: fixture matrix for NVIDIA/AMD/Intel, ARM/x64, multi-GPU, insufficient disk/RAM and failed scans; real Linux scan and Windows pilot if available. Browser clearly reports unavailable native scanning.

## Phase 3 — Skills and featured REA

Separate Skills navigation; 30 initially curated entries selected for maintenance, provenance, usefulness, license clarity and installation safety. Display supported hosts explicitly: Claude Code, Claude Desktop, Codex CLI/desktop, and user-global/project scope where actually supported. Claude Desktop skill import is not assumed equivalent to CLI filesystem installation.

Feature `morluto/rea` prominently on the home screen. Follow its actual setup workflow, which registers an MCP server **and** matching instructions; skill-only copying is insufficient. Detect prerequisites, present commands/actions for review, back up configuration, verify agent readiness and demonstrate an authorized local sample. Native analysis requires a supported analysis provider; do not claim universal binary analysis without one.

Global means installation in the current user's supported host directories, not a universal plugin or system-wide elevation. Pin reviewed versions/commits, inspect archives for traversal/symlinks, never execute commands supplied by downloaded skill text, and never overwrite unrelated user files.

## Phase 4 — MCP catalog and host setup

Separate MCP section with 30 curated servers. Distinguish local stdio, local HTTP and hosted servers. Show package, transport, required runtimes/accounts, credential requirements, permissions, license and supported hosts. REA and Voicebox may appear here as well as in their other roles, without duplicating installs.

Host-aware setup merges configuration with backups and preserves unrelated entries. Use correct JSON/TOML formats and platform paths; validate before writing and support undo of HubX-owned changes. Never put secrets in source, logs, generated screenshots or Git history. Services with accounts/OAuth cannot honestly be one-click anonymous installs. Validate installation separately from runtime connectivity and tool availability.

## Phase 5 — integration and release

Regression tests, typecheck, lint, production build, native UI tests, persistence/migration checks, explicit network link/asset audits and installer lifecycle pilot when a real Windows machine is available. Package both Windows EXEs, source ZIP, checksums and release notes. Verify upload digests. Final approval before merging/publishing.

## Boundaries and release communication

No bundled vendor payload; downloads/installations remain user-approved. Hardware scan and setup helpers are not permission to run arbitrary scripts. Do not alter the user's Voicebox fork without a separate request. Keep GitHub description/README tool-focused as previously requested; source catalog retains real project names. Unsigned builds and unverified Windows behavior must remain disclosed.

More to come: additional tools and broader compatibility after each tested milestone.