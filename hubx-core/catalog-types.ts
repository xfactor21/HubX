export interface CatalogEntry {
  id: string;
  name: string;
  category: string;
  marker: string;
  accent: string;
  license: string;
  delivery: string;
  runtime: string;
  description: string;
  sourceUrl: string;
  setupUrl: string;
  downloads: { label: string; url: string }[];
}
export interface CatalogSnapshot {
  checkedAt: string;
  repo: string;
  release: string | null;
  releaseDate: string | null;
  commit: string;
  commitDate: string;
  archived: boolean;
  note: string;
}
export interface SetupGuide {
  prerequisites: string[];
  steps: string[];
  commands?: string;
  launch: string;
  update: string;
  troubleshooting: string;
}