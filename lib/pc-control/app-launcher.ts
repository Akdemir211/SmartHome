import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AppEntry {
  label: string;
  command: string;
  processName: string;
}

const APP_WHITELIST: Record<string, AppEntry> = {
  chrome: {
    label: 'Google Chrome',
    command: 'start chrome',
    processName: 'chrome.exe',
  },
  firefox: {
    label: 'Firefox',
    command: 'start firefox',
    processName: 'firefox.exe',
  },
  edge: {
    label: 'Microsoft Edge',
    command: 'start msedge',
    processName: 'msedge.exe',
  },
  spotify: {
    label: 'Spotify',
    command: 'start spotify:',
    processName: 'Spotify.exe',
  },
  vscode: {
    label: 'Visual Studio Code',
    command: 'code',
    processName: 'Code.exe',
  },
  notepad: {
    label: 'Not Defteri',
    command: 'start notepad',
    processName: 'notepad.exe',
  },
  calculator: {
    label: 'Hesap Makinesi',
    command: 'start calc',
    processName: 'Calculator.exe',
  },
  explorer: {
    label: 'Dosya Gezgini',
    command: 'start explorer',
    processName: 'explorer.exe',
  },
  paint: {
    label: 'Paint',
    command: 'start mspaint',
    processName: 'mspaint.exe',
  },
  word: {
    label: 'Microsoft Word',
    command: 'start winword',
    processName: 'WINWORD.EXE',
  },
  excel: {
    label: 'Microsoft Excel',
    command: 'start excel',
    processName: 'EXCEL.EXE',
  },
  powerpoint: {
    label: 'Microsoft PowerPoint',
    command: 'start powerpnt',
    processName: 'POWERPNT.EXE',
  },
  teams: {
    label: 'Microsoft Teams',
    command: 'start msteams:',
    processName: 'ms-teams.exe',
  },
  discord: {
    label: 'Discord',
    command: 'start discord:',
    processName: 'Discord.exe',
  },
  whatsapp: {
    label: 'WhatsApp',
    command: 'start whatsapp:',
    processName: 'WhatsApp.exe',
  },
  telegram: {
    label: 'Telegram',
    command: 'start tg:',
    processName: 'Telegram.exe',
  },
};

export const APP_NAMES = Object.keys(APP_WHITELIST);

export function getAppLabel(name: string): string {
  return APP_WHITELIST[name.toLowerCase()]?.label ?? name;
}

export async function openApplication(name: string): Promise<{ ok: boolean; message: string }> {
  const key = name.toLowerCase();
  const app = APP_WHITELIST[key];
  if (!app) {
    return {
      ok: false,
      message: `"${name}" beyaz listede yok. Açılabilir uygulamalar: ${Object.values(APP_WHITELIST).map((a) => a.label).join(', ')}`,
    };
  }

  try {
    await execAsync(app.command, { shell: 'cmd.exe' });
    return { ok: true, message: `${app.label} açıldı.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `${app.label} açılırken hata: ${msg}` };
  }
}

export async function closeApplication(name: string): Promise<{ ok: boolean; message: string }> {
  const key = name.toLowerCase();
  const app = APP_WHITELIST[key];
  if (!app) {
    return { ok: false, message: `"${name}" beyaz listede yok.` };
  }

  try {
    await execAsync(`taskkill /IM "${app.processName}" /F`, { shell: 'cmd.exe' });
    return { ok: true, message: `${app.label} kapatıldı.` };
  } catch {
    return { ok: false, message: `${app.label} zaten çalışmıyor veya kapatılamadı.` };
  }
}
