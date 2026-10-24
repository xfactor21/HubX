import { ipcRenderer, contextBridge } from "electron";
import { createManagedAuthBridge } from "@runablehq/managed-auth/desktop/preload";

// window.managedAuth — { openExternal, onDeepLink, getRedirectTarget }, backed by
// the IPC surface createManagedDeepLinks registers in main.ts. Managed sign-in
// reads this key; keep it (`bun run lint` enforces the import).
const managedAuth = createManagedAuthBridge();
contextBridge.exposeInMainWorld("managedAuth", managedAuth);

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  openExternal: managedAuth.openExternal,
  onDeepLink: managedAuth.onDeepLink,
});
contextBridge.exposeInMainWorld("hubx", {
 getState:()=>ipcRenderer.invoke('hub:state'),
 scanHardware:(consent:boolean)=>ipcRenderer.invoke('hub:hardware',consent),
 saveSettings:(s:unknown)=>ipcRenderer.invoke('hub:settings',s),
 welcome:()=>ipcRenderer.invoke('hub:welcome'),
 setUrl:(id:string,url:string)=>ipcRenderer.invoke('hub:url',id,url),
 chooseFile:(id:string)=>ipcRenderer.invoke('hub:file',id),
 clear:(id:string)=>ipcRenderer.invoke('hub:clear',id),
 launch:(id:string)=>ipcRenderer.invoke('hub:launch',id),
 check:(ids:string[])=>ipcRenderer.invoke('hub:check',ids),
 download:(id:string)=>ipcRenderer.invoke('hub:download',id),
 cancel:(id:string)=>ipcRenderer.invoke('hub:cancel',id),
 openDownload:(id:string)=>ipcRenderer.invoke('hub:open-download',id),
 openOfficial:(url:string)=>ipcRenderer.invoke('hub:official',url),
 onProgress:(cb:(p:unknown)=>void)=> {const listener=(_:unknown,p:unknown)=>cb(p);ipcRenderer.on('hub:progress',listener);return ()=>ipcRenderer.removeListener('hub:progress',listener);},
});
