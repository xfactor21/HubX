# HubX — Phase 1 tested preview

**Catalog refresh is ready for review.** The upgrade branch has 53 tools with dated official release/source snapshots and installation walkthroughs. The published 3.1.1 release is unchanged. Phase 2 starts only after approval.

## What changed

- Expanded the original 32 tools to **53**, preserving existing registration IDs.
- Added all **13 Crafting Apps and ArtCraft Launcher**, with early-development and file-fidelity limitations disclosed.
- Added Voicebox, LTX-2 / LTX-2.5, Wan 2.2, ACE-Step 1.5, Chatterbox, Kokoro and Qwen3-TTS.
- Added prerequisites, installation steps, launch/registration instructions, update precautions and troubleshooting for every entry.
- Added release/source provenance checked **18 October 2026**. These labels are not installed-version checks.
- Added verified selectors for **20 general packages and eight hardware choices**. Hardware selection is manual in this phase.
- Corrected LibreChat’s canonical repository. Marked archived Flowise and retained legacy workflows with successor/maintenance notes.
- Distinguished the user’s **xfactor21/voicebox** fork from **jamiepine/voicebox** installers. The fork has no published release binaries; upstream installers do not contain fork changes.
- Fixed build-cache invalidation for shared `hubx-core` changes.

## Verification

| Check | Result | Evidence |
| --- | --- | --- |
| Core, storage and streaming download regression tests | 31 passed, 0 failed; 506 assertions | `verification/phase1-tests.log` |
| Workspace typecheck | Passed | `verification/phase1-typecheck.log` |
| Lint | 0 errors, 0 warnings | `verification/phase1-lint.log` |
| Production web and Electron build | Passed | `verification/phase1-build.log` |
| Official URL audit | 129 of 129 resolved | `verification/phase1-links.json` |
| Official release asset selection | 28 of 28 matched | `verification/phase1-assets.json` |
| Browser and Electron interface | 53 cards, all 53 guides rendered, search/filter/empty state, 14 suite entries, persistence and modal Escape behavior passed | `verification/phase1-browser-ui.json`, `verification/phase1-native-ui.json` |
| Responsive browser | 390 px viewport, dashboard and detail dialog without horizontal overflow | `verification/phase1-browser-mobile.png`, `verification/phase1-browser-mobile-guide.png` |
| Native boundary rejection | Unapproved link, unknown tool/package and unregistered launch rejected | `verification/phase1-native-ui.json` |
| Renderer exceptions | None during recorded browser/native tests | UI JSON files |

Run the automated UI verification with `python scripts/verify-phase1-ui.py`. It requires the managed web server on its configured port, installed Google Chrome, and a test Electron instance with CDP on localhost port 9241 and a dedicated `HUBX_TEST_DATA` directory. UI checks deliberately do not repeat live GitHub API requests; package selection and link audits are separate evidence.

## What these results do not prove

URL resolution does not prove successful third-party installation. Asset selection verifies official repository provenance and matching names, not a download or execution of every vendor package. All 53 third-party setups have **not** been installed and tested on Windows.

Native UI verification ran in Electron on Linux. Windows installer lifecycle, upgrades, shortcuts and uninstall still need a real Windows pilot. Existing Windows builds remain unsigned. No new EXE was packaged for this checkpoint.

Live release checks can encounter GitHub rate limits; HubX reports errors rather than inventing successful offers. Research used authenticated reads locally, but credentials are not embedded in the app. Snapshot dates remain visible as new upstream releases arrive.

The production build reports a non-fatal 506 kB JavaScript chunk warning and a Node `module.register()` deprecation warning. Neither prevented compilation.

## Next checkpoint

**Phase 2:** opt-in local hardware/spec scan with explained download recommendations, especially ComfyUI variants. Unknown drivers, unsupported configurations and multiple GPUs must fall back to manual selection.

Skills (30), featured REA integration, MCP servers (30), and final integration/release packaging remain separate later phases. No draft PR is merged and no new release is published at this checkpoint.

## Official sources

Catalog source URLs and full commit/release dates are recorded per tool in `hubx-core/catalog.ts`, `hubx-core/additions.ts` and `hubx-core/snapshots.ts`. Selected packages and publisher-provided digests are recorded in `verification/phase1-assets.json`.

- [HubX repository](https://github.com/xfactor21/HubX)
- [Published HubX 3.1.1](https://github.com/xfactor21/HubX/releases/tag/v3.1.1)
- [Crafting Apps family](https://getartcraft.com/apps/wordcraft)
- [WordCraft releases](https://github.com/storytold/wordcraft/releases) — official GitHub packages were newer than the marketing-page version at the audit.
- [Voicebox fork](https://github.com/xfactor21/voicebox)
- [Voicebox upstream releases](https://github.com/jamiepine/voicebox/releases)
- [REA source](https://github.com/morluto/rea) — researched for Phase 3; not yet integrated.