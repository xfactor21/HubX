 # HubX Phase 2 — hardware scan checkpoint

**Verified 24 October 2026 · development branch only**

## Decision

Phase 2 is ready for checkpoint review: the original planet.X navy/cyan/pink interface now includes an optional local hardware scan, explained ComfyUI package screening and separate download confirmation. **69 tests / 637 assertions, typecheck, lint, production build and browser/native UI checks passed.** Pause before Phase 3; this is not a Windows release or hardware certification.

## What changed

- Explicit checkbox consent before a desktop scan; cancellation performs no scan. The native bridge rejects consent other than `true` and blocks overlapping scans.
- OS/build, native architecture, CPU/logical cores, RAM, free space on the HubX data volume, GPU list and available dedicated VRAM/driver/compute capability are displayed before package review.
- Results live only in component memory. Forgetting or reloading removes them; persisted HubX state has no report. No serial numbers, UUIDs, account names, network inventory or admin elevation are requested.
- Fixed OS/NVIDIA queries use no shell, an 8-second per-command timeout and a 256 KiB output cap. WMI AdapterRAM is deliberately ignored rather than treating truncated/shared memory as dedicated VRAM.
- A scan does not check releases, download, install or change drivers. Reviewing a candidate explicitly checks that package; downloading requires another confirmation. Unreviewed ComfyUI releases receive a manual-verification warning.
- All 53 tool guides remain available. There are 20 general package selectors and nine manual hardware choices, including the reviewed NVIDIA ARM64 archive. Voicebox fork/upstream provenance is unchanged.

## Recommendation boundaries

The rules are reviewed against **ComfyUI v0.42.1**, dated **23 October 2026**, and expire after 30 days. They identify a *screened candidate*, never a tested installation or performance guarantee. Exact release notes and runtime support remain authoritative.[^1][^2]

| Reported configuration | Result |
| --- | --- |
| Complete single-GPU Windows x64/ARM64 report; RTX 20/30/40/50 model paired with expected compute capability; validated public NVIDIA driver ≥580 | Standard NVIDIA CUDA 13 candidate, matching native architecture |
| Complete single-GPU Windows x64 report; GTX 9/10 model paired with expected compute capability; validated public driver ≥560.76 | Legacy CUDA 12.6 candidate |
| AMD/Intel, professional/future/unknown model, missing public driver/capability/VRAM, incomplete enumeration, multiple GPUs, unsupported OS/architecture or stale rules | Explained manual fallback; no candidate auto-selected |

Both candidate paths also require **8 GiB RAM, 4 GiB dedicated VRAM and 20 GiB free on the HubX data volume**. These are conservative **HubX screening floors**, not universal vendor requirements. Model weights, extraction, target-volume space and workflow demands require separate checks.

The reviewed ComfyUI README directs modern 20-series-and-newer GPUs away from its legacy CUDA 12.6 archive.[^1] NVIDIA's CUDA 13 compatibility table supplies the driver branch 580 floor.[^3] HubX uses CUDA 12.6's Windows GA toolkit driver 560.76 as a conservative screening floor rather than assuming limited minor-version compatibility covers every bundled dependency.[^4] Model names must agree with NVIDIA-reported compute capability; vendor name alone never justifies acceleration selection.[^5][^6] ARM64 asset selection is verified, but physical Windows ARM64 GPU/runtime compatibility is not certified.

## Verification evidence

| Check | Verified result | Recorded evidence |
| --- | --- | --- |
| Regression and hardware tests | 69 passed, 0 failed; 637 assertions | `verification/phase2-tests.log` |
| Typecheck / lint | Passed; lint 0 errors, 0 warnings | `phase2-typecheck.log`, `phase2-lint.log` |
| Production build | Passed | `phase2-build.log` |
| Browser regression | 53 cards and all 53 guides; 14 Creative suite entries; nine manual choices; native scan unavailable; no overflow at 390 px | `phase2-ui.json` |
| Synthetic Windows UI | Modern/legacy/ARM64 candidates, unknown-driver fallback, visible scan failure and unreviewed-release warning | `phase2-ui.json` |
| Consent/download UI | Cancelled consent makes no scan; scan makes no check/download; dismissed download confirmation makes no download; accepted confirmation makes one mocked call | `scripts/verify-phase2-ui.py` |
| Real Linux Electron scan | Native false-consent rejection; basic fields; missing DRM GPU produces manual fallback; forget/reload clears; no report in stored state | `phase2-ui.json`, native screenshot |
| Network observation | No GitHub release check or hardware-bearing renderer request during the observed native scan; ordinary managed preview analytics retained | `phase2-ui.json` |
| Reviewed release assets | Five official ComfyUI selectors matched v0.42.1, including ARM64; filenames, sizes and publisher digests recorded | `phase2-comfy-assets.json` |
| Refreshed preview | Shared-core cache cleared; all six official evidence links rendered and asserted in fixtures/native UI | `phase2-ui.json` |

Hardware tests cover AMD/Intel, hybrid/multi-GPU, ARM/x64, insufficient or unknown RAM/VRAM/disk, unsupported OS, old/unknown drivers, stale policy, malformed/oversized responses, ambiguous adapter matching and a hanging child terminated at its timeout. Renderer exception lists were empty in the recorded browser, fixture and native checks.

### Real native result

The Linux sandbox exposed Debian 13, x64, two logical CPU cores, approximately 3.84 GiB OS-reported RAM and 43.67 GiB free data-volume space. No DRM GPU was exposed. HubX reported this limitation rather than claiming the physical host had no GPU. Container/VM resources may differ from usable process limits.

![Real Linux local scan and manual fallback](/home/user/hubx-repaired/verification/phase2-native-local-scan.png)

### Synthetic candidate view

This screenshot uses a deliberately synthetic Windows/RTX fixture. It is **not** evidence of an actual Windows scan, download or successful ComfyUI installation.

![Synthetic modern NVIDIA candidate](/home/user/hubx-repaired/verification/phase2-fixture-modern-candidate.png)

## Limits and next gate

- **No real Windows machine was available.** Windows CIM/NVIDIA acquisition, Windows ARM64 behavior, vendor installations and installer lifecycle remain unverified. Synthetic fixtures and cross-platform builds do not replace that pilot.
- No vendor package/model was downloaded in this phase's UI tests; download acceptance exercised an isolated mock. Recorded asset digests are publisher metadata, not verification of downloaded multi-gigabyte archives.
- Detailed macOS GPU acquisition is not implemented in this phase. AMD/Intel dedicated VRAM can remain unknown and intentionally requires manual review. This phase does not certify general packages on ARM64.
- The build reports a nonfatal 528.47 kB main JavaScript chunk warning and a Node module-registration deprecation warning.
- No new HubX EXEs, merge or release publication. Published 3.1.1 remains the existing release. The draft upgrade PR contains the development work.

**Next approval:** Phase 3 adds 30 maintained Skills with honest host/scope compatibility and featured `morluto/rea`. Phase 4 adds the separate MCP catalog and safe host-aware setup. Phase 5 handles integrated validation, Windows pilot if available, packaging/checksums and final release approval.

## Methodology and references

Verification combines executable regression tests, Google Chrome/Playwright browser checks, isolated synthetic Windows bridge fixtures and an actual Linux Electron bridge scan. Product-specific compatibility facts use authoritative vendor/release documentation; HubX's additional screening policy is explicitly identified as implementation policy, not independent hardware certification. Sources below were accessed **23 October 2026**; final local verification ran **24 October 2026**.

[^1]: Comfy-Org, *ComfyUI v0.42.1 README*, reviewed release instructions. https://github.com/Comfy-Org/ComfyUI/blob/v0.42.1/README.md
[^2]: ComfyUI, *Windows portable installation*. https://docs.comfy.org/installation/comfyui_portable_windows ; *System requirements*. https://docs.comfy.org/installation/system_requirements
[^3]: NVIDIA, *CUDA Minor Version Compatibility*, CUDA 13 driver family floor and compatibility limitations. https://docs.nvidia.com/deploy/cuda-compatibility/minor-version-compatibility.html
[^4]: NVIDIA, *CUDA 12.6 Release Notes*, toolkit and corresponding Windows driver table. https://docs.nvidia.com/cuda/archive/12.6.0/cuda-toolkit-release-notes/index.html
[^5]: NVIDIA, *CUDA GPU compute capability table*. https://developer.nvidia.com/cuda/gpus
[^6]: NVIDIA, *Legacy CUDA GPU compute capability table*. https://developer.nvidia.com/cuda/gpus/legacy

Draft PR: https://github.com/xfactor21/HubX/pull/1
Existing release: https://github.com/xfactor21/HubX/releases/tag/v3.1.1