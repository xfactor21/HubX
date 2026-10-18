import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createManagedDeepLinks } from "@runablehq/managed-auth/desktop/main";
import { registerIpcHandlers } from "./ipc";
import ports from "../../../__ports.cjs";

// Fully editable Electron main process — own the window, lifecycle, menus, tray,
// and IPC (starter handlers in ./ipc.ts). One platform call is enforced by
// `bun run lint`: createManagedDeepLinks. It registers the app's
// runable-<APPLICATION_ID> deep-link protocol, forwards deep links to the
// renderer, and backs managed sign-in (skills/app/references/desktop.md).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.setPath("userData", process.env.HUBX_TEST_DATA || path.join(app.getPath("appData"), "Open Source Hub"));

const isDev = !app.isPackaged;
const WEB_DEV_URL = process.env.WEBSITE_URL ?? `http://localhost:${ports.website}`;
const WEB_DIST = path.join(__dirname, "../web-dist");

let win: BrowserWindow | null = null;
const getWindow = () => win;

const deepLinks = createManagedDeepLinks({
  applicationId: process.env.APPLICATION_ID,
  getWindow,
});

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 650,
    title: "HubX",
    backgroundColor: "#07101e",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event) => event.preventDefault());
  if (isDev) {
    win.loadURL(WEB_DEV_URL);
  } else {
    win.loadFile(path.join(WEB_DIST, "index.html"));
  }
}



app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Windows/Linux deliver deep links as argv — of a second instance while the app
// is running, of this instance on cold start. Keep one instance and forward both.
if (app.requestSingleInstanceLock()) {
  app.on("second-instance", (_event, argv) => deepLinks.handleArgv(argv));
  app.whenReady().then(async () => {
    await registerIpcHandlers(getWindow);
    createWindow();
    deepLinks.handleArgv(process.argv);
  });
} else {
  app.quit();
}
