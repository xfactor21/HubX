# HubX 3.1.1 — release verification (2026-10-13)

Launcher-only release. No vendor applications or hardware runtimes are bundled.

Passed: 28 automated regression tests; typecheck for all managed packages; lint with zero errors/warnings; web/desktop production builds; Windows x64 NSIS Setup + portable compilation; packaged Linux file:// UI test (32 cards, 9 categories, 7 hardware choices, settings and registration round-trip, zero renderer errors); 72/72 official URLs; 11/11 live package asset selectors; real Krita plugin download with matching published SHA-256; 390px browser UI with no horizontal overflow.

Repaired: missing NSIS include, payload/doc inconsistency, invalid installation paths and unsafe self-copy rollback, stale version-stamped release matching, arbitrary-download IPC trust, file validation/partial cleanup/cancellation, corrupt-state persistence, dead PaperQA link, decorative indexing preference, stale scripts/version markers, mobile overflow, generic icon.

Limitations: Windows EXEs are unsigned. A Wine silent-install attempt did not produce a reliable result; real Windows assisted install, silent install, upgrade, shortcuts, launch and uninstall remain unverified. No claim that every possible bug is eliminated. Vendor tools are outside the launcher scope. Download tests use fixtures plus one live plugin; multi-GB hardware downloads were not fetched.

Files: Setup.exe (installed use), portable.exe (no shortcuts), source.zip (managed workspace without secrets/dependencies/build outputs), SHA256SUMS.txt. README.md has rebuilding, storage and deployment instructions.

More to come: catalog additions, clearer setup guidance, and further usability refinements are planned. No delivery dates are committed.
