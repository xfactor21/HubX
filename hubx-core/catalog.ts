export const tools = [
  {
    id: "anythingllm", name: "AnythingLLM", category: "AI assistants", marker: "01", accent: "cyan", license: "MIT", delivery: "Official Windows installer", runtime: "Desktop application; connect a local or cloud model provider.",
    description: "Local-first AI workspace for chat, documents, research, and agent-style workflows.", sourceUrl: "https://github.com/Mintplex-Labs/anything-llm", setupUrl: "https://anythingllm.com/download", downloads: [{ label: "Windows installer", url: "https://github.com/Mintplex-Labs/anything-llm/releases" }]
  },
  {
    id: "jan", name: "Jan", category: "AI assistants", marker: "02", accent: "pink", license: "Apache-2.0", delivery: "Official Windows installer", runtime: "Windows 10+; local model inference benefits from a compatible GPU.",
    description: "Offline-first desktop chat application for running and managing local LLMs.", sourceUrl: "https://github.com/janhq/jan", setupUrl: "https://jan.ai/", downloads: [{ label: "Windows x64 setup", url: "https://github.com/janhq/jan/releases" }]
  },
  {
    id: "librechat", name: "LibreChat", category: "AI assistants", marker: "03", accent: "violet", license: "MIT", delivery: "Self-hosted application", runtime: "Docker or Node.js setup; an LLM provider and optional database configuration are required.",
    description: "Self-hosted multi-provider chat interface with agents, tools, presets, and team-oriented controls.", sourceUrl: "https://github.com/danny-avila/LibreChat", setupUrl: "https://www.librechat.ai/docs/", downloads: []
  },
  {
    id: "khoj", name: "Khoj", category: "AI assistants", marker: "04", accent: "lime", license: "AGPL-3.0", delivery: "Self-hosted application", runtime: "Run with the project’s supported local, Docker, or hosted deployment path and connect a supported LLM.",
    description: "Self-hosted AI second brain for web and document search, custom agents, and automations.", sourceUrl: "https://github.com/khoj-ai/khoj", setupUrl: "https://docs.khoj.dev/", downloads: []
  },
  {
    id: "comfyui", name: "ComfyUI", category: "Images", marker: "05", accent: "cyan", license: "GPL-3.0", delivery: "Official Windows portable archive", runtime: "Select the matching AMD, Intel, or NVIDIA portable package; model downloads are separate.",
    description: "Node-based diffusion workflow interface and backend for image-generation pipelines.", sourceUrl: "https://github.com/Comfy-Org/ComfyUI", setupUrl: "https://docs.comfy.org/installation/desktop/windows", downloads: [
      { label: "NVIDIA portable", url: "https://github.com/Comfy-Org/ComfyUI/releases" },
      { label: "AMD portable", url: "https://github.com/Comfy-Org/ComfyUI/releases" },
      { label: "Intel portable", url: "https://github.com/Comfy-Org/ComfyUI/releases" }
    ]
  },
  {
    id: "invokeai", name: "InvokeAI", category: "Images", marker: "06", accent: "pink", license: "Apache-2.0", delivery: "Official setup", runtime: "A supported Python or launcher setup plus image-model files are required.",
    description: "Creative engine and web interface for Stable Diffusion image-generation workflows.", sourceUrl: "https://github.com/invoke-ai/InvokeAI", setupUrl: "https://invoke-ai.github.io/InvokeAI/installation/", downloads: []
  },
  {
    id: "krita-ai-diffusion", name: "Krita AI Diffusion", category: "Images", marker: "07", accent: "violet", license: "GPL-3.0", delivery: "Official plugin archive", runtime: "Requires Krita and a configured local or cloud diffusion backend.",
    description: "Krita plugin for inpainting, outpainting, and text-guided image generation.", sourceUrl: "https://github.com/Acly/krita-ai-diffusion", setupUrl: "https://github.com/Acly/krita-ai-diffusion#installation", downloads: [{ label: "Plugin ZIP", url: "https://github.com/Acly/krita-ai-diffusion/releases" }]
  },
  {
    id: "forge", name: "Stable Diffusion WebUI Forge", category: "Images", marker: "08", accent: "lime", license: "AGPL-3.0", delivery: "Official Windows portable archive", runtime: "Choose a CUDA/Torch archive compatible with the installed NVIDIA driver; model files are separate.",
    description: "Optimized Stable Diffusion web interface distributed with Windows portable builds.", sourceUrl: "https://github.com/lllyasviel/stable-diffusion-webui-forge", setupUrl: "https://github.com/lllyasviel/stable-diffusion-webui-forge#installation", downloads: [{ label: "CUDA 12.4 portable", url: "https://github.com/lllyasviel/stable-diffusion-webui-forge/releases" }]
  },
  {
    id: "ltx-video", name: "LTX-Video", category: "Video", marker: "09", accent: "cyan", license: "Apache-2.0", delivery: "Model and source project", runtime: "Python environment, supported GPU, and model weights are required.",
    description: "Open video-generation model family and inference code from Lightricks.", sourceUrl: "https://github.com/Lightricks/LTX-Video", setupUrl: "https://github.com/Lightricks/LTX-Video#readme", downloads: []
  },
  {
    id: "wan21", name: "Wan 2.1", category: "Video", marker: "10", accent: "pink", license: "Apache-2.0", delivery: "Model and source project", runtime: "Python environment, supported GPU, and model weights are required.",
    description: "Open large-scale video-generation models and inference resources from Wan-Video.", sourceUrl: "https://github.com/Wan-Video/Wan2.1", setupUrl: "https://github.com/Wan-Video/Wan2.1#readme", downloads: []
  },
  {
    id: "cogvideox", name: "CogVideoX-2B", category: "Video", marker: "11", accent: "violet", license: "Apache-2.0", delivery: "Model and source project", runtime: "Python environment and downloadable model weights are required.",
    description: "2B-parameter text-to-video model available through the CogVideo project.", sourceUrl: "https://github.com/zai-org/CogVideo", setupUrl: "https://github.com/zai-org/CogVideo#readme", downloads: []
  },
  {
    id: "open-sora", name: "Open-Sora", category: "Video", marker: "12", accent: "lime", license: "Apache-2.0", delivery: "Model and source project", runtime: "Python environment, a compatible GPU, and model checkpoints are required.",
    description: "Open-source video-production research project and model implementation.", sourceUrl: "https://github.com/hpcaitech/Open-Sora", setupUrl: "https://hpcaitech.github.io/Open-Sora/", downloads: []
  },
  {
    id: "browser-use", name: "Browser Use", category: "Agents", marker: "13", accent: "cyan", license: "MIT", delivery: "Python framework", runtime: "Python application setup and an LLM connection are required; browser automation has external-site implications.",
    description: "Python framework for building AI agents that interact with websites through browser automation.", sourceUrl: "https://github.com/browser-use/browser-use", setupUrl: "https://docs.browser-use.com/", downloads: []
  },
  {
    id: "openhands", name: "OpenHands", category: "Agents", marker: "14", accent: "pink", license: "MIT", delivery: "Official Windows installer", runtime: "Install the agent desktop application, then configure a supported provider or local model.",
    description: "AI-driven software-development agent platform with a packaged Windows desktop option.", sourceUrl: "https://github.com/OpenHands/OpenHands", setupUrl: "https://docs.all-hands.dev/", downloads: [{ label: "Windows setup", url: "https://github.com/OpenHands/OpenHands/releases" }]
  },
  {
    id: "crewai", name: "CrewAI", category: "Agents", marker: "15", accent: "violet", license: "MIT", delivery: "Python framework", runtime: "Python project setup, defined agents, and an LLM connection are required.",
    description: "Framework for orchestrating collaborative multi-agent workflows.", sourceUrl: "https://github.com/crewAIInc/crewAI", setupUrl: "https://docs.crewai.com/", downloads: []
  },
  {
    id: "autogen", name: "AutoGen", category: "Agents", marker: "16", accent: "lime", license: "MIT (code); CC-BY-4.0 (docs)", delivery: "Programming framework", runtime: "Python or .NET application setup, defined agents, and model access are required.",
    description: "Microsoft framework for developing agentic applications and multi-agent conversations.", sourceUrl: "https://github.com/microsoft/autogen", setupUrl: "https://microsoft.github.io/autogen/", downloads: []
  },
  {
    id: "cline", name: "Cline", category: "Coding", marker: "17", accent: "cyan", license: "Apache-2.0", delivery: "VS Code extension", runtime: "Requires VS Code-compatible editor and a configured model provider.",
    description: "Autonomous coding assistant available as an IDE extension, CLI assistant, and SDK.", sourceUrl: "https://github.com/cline/cline", setupUrl: "https://docs.cline.bot/", downloads: [{ label: "VSIX extension", url: "https://github.com/cline/cline/releases" }]
  },
  {
    id: "aider", name: "Aider", category: "Coding", marker: "18", accent: "pink", license: "Apache-2.0", delivery: "Python CLI", runtime: "Python, a terminal, a code repository, and an LLM provider are required.",
    description: "Terminal-based AI pair-programming tool that works directly with a codebase.", sourceUrl: "https://github.com/Aider-AI/aider", setupUrl: "https://aider.chat/docs/install.html", downloads: []
  },
  {
    id: "continue", name: "Continue", category: "Coding", marker: "19", accent: "violet", license: "Apache-2.0", delivery: "IDE extension", runtime: "Requires a supported IDE and an available local or remote model provider.",
    description: "Open-source coding assistant and agent extension for supported development environments.", sourceUrl: "https://github.com/continuedev/continue", setupUrl: "https://docs.continue.dev/", downloads: []
  },
  {
    id: "tabby", name: "Tabby", category: "Coding", marker: "20", accent: "lime", license: "License file in source", delivery: "Official Windows portable archive", runtime: "Extract a CPU, CUDA, or Vulkan Windows build, then configure the server and an IDE extension.",
    description: "Self-hosted AI coding assistant with Windows CPU, CUDA, and Vulkan release archives.", sourceUrl: "https://github.com/TabbyML/tabby", setupUrl: "https://tabby.tabbyml.com/docs/", downloads: [{ label: "Windows CPU portable", url: "https://github.com/TabbyML/tabby/releases" }]
  },
  {
    id: "gpt-researcher", name: "GPT Researcher", category: "Research", marker: "21", accent: "cyan", license: "Apache-2.0", delivery: "Self-hosted Python application", runtime: "Python/Docker setup, an LLM provider, and a supported search service are required.",
    description: "Autonomous research agent for multi-source reports using a chosen model provider.", sourceUrl: "https://github.com/assafelovic/gpt-researcher", setupUrl: "https://docs.gptr.dev/", downloads: []
  },
  {
    id: "vane", name: "Vane", category: "Research", marker: "22", accent: "pink", license: "MIT", delivery: "Self-hosted application", runtime: "Local setup and a supported model/search configuration are required.",
    description: "Privacy-focused self-hosted answering engine for web search and deep research.", sourceUrl: "https://github.com/ItzCrazyKns/Vane", setupUrl: "https://github.com/ItzCrazyKns/Vane#readme", downloads: []
  },
  {
    id: "paperqa", name: "PaperQA", category: "Research", marker: "23", accent: "violet", license: "Apache-2.0", delivery: "Python package", runtime: "Python environment, documents, and a configured language model are required.",
    description: "High-accuracy retrieval-augmented question answering for scholarly and technical documents.", sourceUrl: "https://github.com/Future-House/paper-qa", setupUrl: "https://github.com/Future-House/paper-qa#readme", downloads: []
  },
  {
    id: "local-deep-research", name: "Local Deep Research", category: "Research", marker: "24", accent: "lime", license: "MIT", delivery: "Self-hosted application", runtime: "Container or Python setup, model provider, and selected search integrations are required.",
    description: "Local-first research assistant with multiple search sources, document support, and citations.", sourceUrl: "https://github.com/LearningCircuit/local-deep-research", setupUrl: "https://github.com/LearningCircuit/local-deep-research#readme", downloads: []
  },
  {
    id: "ace-step", name: "ACE-Step", category: "Audio & music", marker: "25", accent: "cyan", license: "Apache-2.0", delivery: "Model and source project", runtime: "Python environment, compatible acceleration, and model weights are required.",
    description: "Open music-generation foundation model and associated project code.", sourceUrl: "https://github.com/ace-step/ACE-Step", setupUrl: "https://ace-step.github.io/", downloads: []
  },
  {
    id: "whisper", name: "Whisper", category: "Audio & music", marker: "26", accent: "pink", license: "MIT", delivery: "Python package", runtime: "Python, FFmpeg, and a selected speech-recognition model are required.",
    description: "General-purpose speech-recognition model and reference implementation.", sourceUrl: "https://github.com/openai/whisper", setupUrl: "https://github.com/openai/whisper#setup", downloads: []
  },
  {
    id: "openvoice", name: "OpenVoice", category: "Audio & music", marker: "27", accent: "violet", license: "MIT", delivery: "Model and source project", runtime: "Python environment, compatible dependencies, and voice model weights are required.",
    description: "Voice-cloning and speech-style transfer research implementation.", sourceUrl: "https://github.com/myshell-ai/OpenVoice", setupUrl: "https://research.myshell.ai/open-voice", downloads: []
  },
  {
    id: "faster-whisper", name: "Faster Whisper", category: "Audio & music", marker: "28", accent: "lime", license: "MIT", delivery: "Python package", runtime: "Python and CTranslate2 runtime; GPU acceleration requires compatible CUDA tooling.",
    description: "High-performance Whisper inference implementation based on CTranslate2.", sourceUrl: "https://github.com/SYSTRAN/faster-whisper", setupUrl: "https://github.com/SYSTRAN/faster-whisper#readme", downloads: []
  },
  {
    id: "langflow", name: "Langflow", category: "Automation", marker: "29", accent: "cyan", license: "MIT", delivery: "Python application", runtime: "Python environment, optional database, and configured providers are required.",
    description: "Visual application for building AI-powered flows, agents, and integrations.", sourceUrl: "https://github.com/langflow-ai/langflow", setupUrl: "https://docs.langflow.org/", downloads: []
  },
  {
    id: "flowise", name: "Flowise", category: "Automation", marker: "30", accent: "pink", license: "License file in source", delivery: "Node.js application", runtime: "Node.js setup or supported container deployment plus configured providers are required.",
    description: "Visual platform for building AI agents, chatflows, and document-processing pipelines.", sourceUrl: "https://github.com/FlowiseAI/Flowise", setupUrl: "https://docs.flowiseai.com/", downloads: []
  },
  {
    id: "sim", name: "Sim", category: "Automation", marker: "31", accent: "violet", license: "Apache-2.0", delivery: "Self-hosted workspace", runtime: "Local development or deployment setup and configured providers are required.",
    description: "Collaborative workspace for building, deploying, and monitoring AI agent workflows.", sourceUrl: "https://github.com/simstudioai/sim", setupUrl: "https://docs.sim.ai/", downloads: []
  },
  {
    id: "activepieces", name: "Activepieces Community Edition", category: "Automation", marker: "32", accent: "lime", license: "License file in source", delivery: "Self-hosted automation platform", runtime: "Docker or supported deployment setup plus connected accounts/services are required.",
    description: "Open-source workflow automation platform with AI agents, MCP support, and integrations.", sourceUrl: "https://github.com/activepieces/activepieces", setupUrl: "https://www.activepieces.com/docs/install/overview", downloads: []
  }
];

export type Tool = (typeof tools)[number];
