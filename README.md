# HubX

**planet.X presents — your tools, one launch point.**

HubX is a Windows desktop hub for discovering, organizing, and launching open-source tools. Browse a curated catalog, connect applications already on your machine, and choose exactly what to download from official sources—all in the original navy, cyan, and pink interface.

[Download the latest release](https://github.com/xfactor21/HubX/releases/latest) · [Report an issue](https://github.com/xfactor21/HubX/issues)

## Upgrade branch — Phase 2 preview

The `upgrade/catalog-skills-mcp` branch expands the catalog to **53 tools**, including all **13 Crafting Apps plus ArtCraft Launcher**, Voicebox, and newer video, music, and speech tools. Every entry has dated release/source provenance and setup instructions. The branch offers **20 general packages and nine manual hardware choices**; these are not automatic installs or updates to your installed software.

Voicebox links to the xfactor21 fork, while its installer is explicitly labeled as an upstream build—not a fork binary. Older projects remain available with maintenance notices. See the [upgrade plan](UPGRADE-PLAN.md) and [Phase 1 verification](verification/phase1.report/content.md).

Phase 2 adds an **explicitly consented, read-only desktop hardware scan**. Results stay in window memory and can be forgotten; no scan results are saved or uploaded. Explained ComfyUI candidates use reviewed model/compute-capability, driver, architecture and resource rules. Unknown drivers, AMD/Intel, ambiguous/multiple GPUs and unsupported systems fall back to manual verification. Downloads require a separate confirmation. See [Phase 2 verification](verification/phase2.report/content.md): **69 tests / 637 assertions**, typecheck, lint, production build, browser checks and a real Linux Electron scan passed. Windows behavior was tested with synthetic fixtures, not a real Windows pilot.

This is a tested development preview, **not a new Windows release**. Skills, featured REA integration, and MCP setup remain later phases, pending the next checkpoint approval. The published **3.1.1** downloads remain unchanged.

## What’s inside the published 3.1.1 release

- **32-project catalog:** search and filter across nine categories.
- **Local launch targets:** register an executable or a local service URL and open it from HubX.
- **Explicit downloads:** review official release assets before starting a download; no vendor software is installed automatically.
- **Hardware choices:** seven runtime options, with setup left under your control.
- **Safer file handling:** streaming downloads, cancellation, size checks, and published SHA-256 verification when available.
- **Persistent preferences:** atomic local storage, corrupt-state recovery, and compatible legacy registration import.
- **Two Windows distributions:** an assisted installer and a portable launcher.

HubX is **launcher-only**. Third-party applications and runtime packages are not bundled. The packaged interface works offline; release checks and downloads require an internet connection.

## Get started on Windows

Requires **Windows 10 or later, x64**.

1. Open the [release page](https://github.com/xfactor21/HubX/releases/latest).
2. Download `SHA256SUMS.txt` and either:
   - `HubX-3.1.1-Windows-x64-Setup.exe` for an assisted installation, folder selection, shortcuts, and a standard uninstaller.
   - `HubX-3.1.1-Windows-x64-portable.exe` to launch without installing shortcuts.
3. Check the file’s SHA-256 before running:

   ```powershell
   Get-FileHash .\HubX-3.1.1-Windows-x64-Setup.exe -Algorithm SHA256
   ```

4. Launch HubX, browse the catalog, and register your installed tools or local service URLs.

**Unsigned release:** the executables do not have an Authenticode signature. Windows may display publisher or reputation warnings; verify the download and checksum before proceeding.

The installer supports `/S` for quiet installation. If specifying a destination, an absolute `/D=...` argument must be last. Quiet installation and other installer lifecycle behavior still need a real Windows verification run.

## Storage and privacy

- Windows settings, registrations, and explicit downloads live in `%APPDATA%\Open Source Hub\`.
- The portable build uses the same application-data location; it does **not** save settings beside the EXE.
- Uninstalling preserves settings, registrations, and downloaded packages.
- Local launch targets are not sent to the backend.
- The browser preview has separate local storage and cannot access native files, download packages, or launch programs. The managed preview retains platform analytics.
- Third-party tools have their own requirements, licenses, and privacy policies. Downloading a package is not the same as installing it.

## Build from source

The source is a Bun workspace with React, Vite, Hono, and an Electron desktop shell. The mobile workspace is template scaffolding, not a released HubX mobile app.

### Prerequisites

- Bun (the workspace declares `bun@1.3.14`).
- Platform configuration for the managed development environment. `.env.template` documents the required variable names; real credentials are not included. Populate the root `.env` with your own configuration. Read ports from `__ports.cjs`, not the sample URL in the template.
- For Windows packaging: electron-builder’s NSIS tooling. Linux cross-builds additionally need Wine with 32-bit support and a graphical display such as Xvfb.

```bash
bun install --frozen-lockfile
bun test tests
bun run typecheck
bun run lint
bun run build
```

Start the web preview with `bun run dev`. In another terminal, run `bun run dev:desktop` for the desktop shell. Ports are managed by `__ports.cjs`; do not edit that file. Linux desktop development needs a graphical display.

```bash
bun run package:win    # Windows x64 Setup and portable builds
bun run package:linux  # Unpacked Linux verification build
```

Release outputs are written to `artifacts/`. Executables belong in GitHub Releases, not Git history.

### Repository layout

| Path | Purpose |
| --- | --- |
| `hubx-core/` | Shared catalog, release selection, contracts, and validation |
| `packages/web/` | Catalog interface and managed web/API workspace |
| `packages/desktop/` | Electron shell, IPC, local storage, downloads, and installer |
| `packages/mobile/` | Reserved template workspace; not a released mobile application |
| `tests/` | Regression tests for core behavior, storage, and downloads |
| `scripts/` | Packaging and verification utilities |
| `verification/` | Recorded build and test evidence |

## Release status: 3.1.1

Recorded verification includes **28 passing regression tests**, typecheck and lint, Windows x64 build compilation, an offline packaged Linux interface run, responsive browser checks, 72 resolving official links, 11 release-asset selectors, and one live plugin download checked against its published SHA-256.

Windows installation, quiet installation, upgrades, shortcuts, launch, and uninstall have **not yet been verified on a real Windows machine**. Cross-compilation is not Windows certification. Large hardware packages were not downloaded during verification. See [release notes](verification/RELEASE-NOTES.md) for scope and limitations.

## More to come

This is a foundation, not the finish line. More tools, smoother setup guidance, broader platform support, and further usability refinements are planned. No dates are promised—follow the releases for updates.

## Contributing

Found a problem or have a tool to suggest? [Open an issue](https://github.com/xfactor21/HubX/issues) with your operating system, HubX version, reproduction steps, and relevant logs. Remove credentials and personal launch paths before sharing logs. Pull requests are welcome; run tests, typecheck, lint, and the production build before submitting.

## License

HubX is released under the [MIT License](LICENSE). Catalog entries and downloaded third-party packages remain subject to their respective licenses.
