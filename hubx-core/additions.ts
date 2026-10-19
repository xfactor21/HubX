import type { CatalogEntry } from './catalog-types';

export const craftApps = [
  ['photocraft', 'PhotoCraft', 'Layered image editing and PSD workflows'],
  ['vectorcraft', 'VectorCraft', 'Vector illustration and shape editing'],
  ['filmcraft', 'FilmCraft', 'Video editing, color and sound'],
  ['lightcraft', 'LightCraft', 'Photo library and raw development'],
  ['pdfcraft', 'PdfCraft', 'Reading, organizing and protecting PDFs'],
  ['effectcraft', 'EffectCraft', 'Motion graphics and visual effects'],
  ['designcraft', 'DesignCraft', 'Page layout and publishing'],
  ['figcraft', 'FigCraft', 'Interface design and prototyping'],
  ['wordcraft', 'WordCraft', 'Word processing and document editing'],
  ['soundcraft', 'SoundCraft', 'Audio recording, editing and mixing'],
  ['deckcraft', 'DeckCraft', 'Presentations and slide shows'],
  ['cadcraft', 'CADCraft', 'Computer-aided design and drafting'],
  ['gridcraft', 'GridCraft', 'Spreadsheets and data analysis'],
] as const;

const craft: CatalogEntry[] = craftApps.map(([id, name, description], i) => ({
  id, name, description: `${description}. Part of ArtCraft’s early-development Crafting Apps suite; not a promised professional replacement.`,
  category: 'Creative suite', accent: ['cyan', 'pink', 'violet', 'lime'][i % 4]!, marker: '',
  license: 'MIT OR Apache-2.0 (code); assets have separate terms', delivery: 'Windows MSI or portable ZIP',
  runtime: 'Choose x64, ARM64 or x86 to match Windows. Early builds: work on copies and test import/export fidelity before production use.',
  sourceUrl: `https://github.com/storytold/${id}`, setupUrl: `https://getartcraft.com/apps/${id}`,
  downloads: [{ label: 'Official platform installers', url: `https://github.com/storytold/${id}/releases` }],
}));

const project = (id: string, name: string, repo: string, category: string, description: string, runtime: string, license: string): CatalogEntry => ({
  id, name, category, description, runtime, license, marker: '', accent: 'cyan', delivery: 'Source / Python environment',
  sourceUrl: `https://github.com/${repo}`, setupUrl: `https://github.com/${repo}#readme`, downloads: [],
});

export const additions: CatalogEntry[] = [
  { id: 'artcraft-launcher', name: 'ArtCraft Launcher', category: 'Creative suite', accent: 'pink', marker: '',
    license: 'MIT OR Apache-2.0 (code); assets have separate terms', delivery: 'Windows MSI or portable ZIP',
    description: 'The suite’s own launcher for installing and updating Crafting Apps. Review its update behavior separately from HubX.',
    runtime: 'Windows architecture-matched package; selecting apps inside ArtCraft can download and install third-party software.',
    sourceUrl: 'https://github.com/storytold/craft-launcher', setupUrl: 'https://getartcraft.com/apps',
    downloads: [{ label: 'Official launcher builds', url: 'https://github.com/storytold/craft-launcher/releases' }] },
  ...craft,
  { id: 'voicebox', name: 'Voicebox', category: 'Audio & music', accent: 'pink', marker: '', license: 'MIT (code); model terms separate',
    delivery: 'Upstream installer / user fork source', description: 'Local voice studio for synthesis, cloning, dictation and agent voice I/O. Your xfactor21 fork is retained as the source link.',
    runtime: 'Your fork has no published release binaries. Official Windows x64 installers come from jamiepine/voicebox; they do not contain your fork changes. Models and acceleration have separate setup needs. Clone voices only with permission.',
    sourceUrl: 'https://github.com/xfactor21/voicebox', setupUrl: 'https://voicebox.sh',
    downloads: [{ label: 'Upstream Windows builds (not fork binaries)', url: 'https://github.com/jamiepine/voicebox/releases' }] },
  project('ltx2', 'LTX-2 / LTX-2.5', 'Lightricks/LTX-2', 'Video', 'Current Lightricks audio-video pipeline family; upstream recommends LTX-2.5 checkpoints.', 'Git, uv, supported PyTorch acceleration and substantial checkpoint disk/VRAM. Follow the exact model license; not an ordinary desktop installer.', 'Custom LTX license; model/encoder terms separate'),
  project('wan22', 'Wan 2.2', 'Wan-Video/Wan2.2', 'Video', 'Newer Wan video-generation family, including multiple model/task sizes.', 'Python, compatible PyTorch/CUDA and task-specific model files. Requirements differ sharply: some A14B examples need 80 GB VRAM. Do not assume every variant fits a consumer GPU.', 'Apache-2.0 (code); model terms separate'),
  project('ace-step15', 'ACE-Step 1.5', 'ace-step/ACE-Step-1.5', 'Audio & music', 'Newer ACE-Step music generation with a Gradio interface and API.', 'Git and uv with platform-supported acceleration; first launch downloads model files. ROCm on Windows has a separate Python/driver path.', 'MIT (code); model terms separate'),
  project('chatterbox', 'Chatterbox', 'resemble-ai/chatterbox', 'Audio & music', 'Speech generation family with multilingual, Turbo and Nano options.', 'Isolated Python environment, PyTorch, model files and permission for reference voices. Use the matching example for the chosen model; do not remove provenance protections.', 'MIT (code); model terms separate'),
  project('kokoro', 'Kokoro', 'hexgrad/kokoro', 'Audio & music', 'Compact Kokoro-82M text-to-speech inference library.', 'Python environment, soundfile and espeak-ng; install the Windows espeak-ng MSI and ensure discovery/PATH. Language extras and voices vary.', 'Apache-2.0 (code); voice/model terms separate'),
  project('qwen3-tts', 'Qwen3-TTS', 'QwenLM/Qwen3-TTS', 'Audio & music', 'Qwen speech generation, voice design and cloning model family.', 'Python 3.12 environment recommended by upstream; qwen-tts and selected model files. FlashAttention is optional and platform-dependent. Obtain permission for cloned voices.', 'Apache-2.0 (code); model terms separate'),
];