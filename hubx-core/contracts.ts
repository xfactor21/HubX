import type { Offer } from './releases';
import type { ScanResult } from './hardware';
export interface Registration { kind: 'file' | 'url'; target: string }
export interface Settings { automaticChecks: boolean }
export interface LocalState { settings: Settings; registrations: Record<string,Registration>; downloads: Record<string,Offer>; welcomed: boolean }
export interface Progress { id: string; received: number; total: number; status: string }
export interface Result { ok: boolean; message?: string; state?: LocalState; cancelled?: boolean }
export interface HubAPI {
  getState(): Promise<LocalState>;
  scanHardware(consent: boolean): Promise<ScanResult>;
  saveSettings(settings: Settings): Promise<Result>;
  welcome(): Promise<Result>;
  setUrl(id: string, url: string): Promise<Result>;
  chooseFile(id: string): Promise<Result>;
  clear(id: string): Promise<Result>;
  launch(id: string): Promise<Result>;
  check(ids: string[]): Promise<Offer[]>;
  download(id: string): Promise<Result>;
  cancel(id: string): Promise<Result>;
  openDownload(id: string): Promise<Result>;
  openOfficial(url: string): Promise<Result>;
  onProgress(cb: (p: Progress) => void): () => void;
}
export const defaultState = (): LocalState => ({settings:{automaticChecks:false},registrations:{},downloads:{},welcomed:false});