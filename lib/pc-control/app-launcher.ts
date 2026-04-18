import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AppShortcut {
  label: string;
  command: string;
  processName: string;
}

const KNOWN_APPS: Record<string, AppShortcut> = {
  chrome: { label: 'Google Chrome', command: 'start chrome', processName: 'chrome.exe' },
  firefox: { label: 'Firefox', command: 'start firefox', processName: 'firefox.exe' },
  edge: { label: 'Microsoft Edge', command: 'start msedge', processName: 'msedge.exe' },
  spotify: { label: 'Spotify', command: 'start spotify:', processName: 'Spotify.exe' },
  vscode: { label: 'Visual Studio Code', command: 'code', processName: 'Code.exe' },
  notepad: { label: 'Not Defteri', command: 'start notepad', processName: 'notepad.exe' },
  calculator: { label: 'Hesap Makinesi', command: 'start calc', processName: 'Calculator.exe' },
  explorer: { label: 'Dosya Gezgini', command: 'start explorer', processName: 'explorer.exe' },
  paint: { label: 'Paint', command: 'start mspaint', processName: 'mspaint.exe' },
  word: { label: 'Microsoft Word', command: 'start winword', processName: 'WINWORD.EXE' },
  excel: { label: 'Microsoft Excel', command: 'start excel', processName: 'EXCEL.EXE' },
  powerpoint: { label: 'Microsoft PowerPoint', command: 'start powerpnt', processName: 'POWERPNT.EXE' },
  teams: { label: 'Microsoft Teams', command: 'start msteams:', processName: 'ms-teams.exe' },
  discord: { label: 'Discord', command: 'start discord:', processName: 'Discord.exe' },
  whatsapp: { label: 'WhatsApp', command: 'start whatsapp:', processName: 'WhatsApp.exe' },
  telegram: { label: 'Telegram', command: 'start tg:', processName: 'Telegram.exe' },
  cmd: { label: 'Komut İstemi', command: 'start cmd', processName: 'cmd.exe' },
  powershell: { label: 'PowerShell', command: 'start powershell', processName: 'powershell.exe' },
  settings: { label: 'Ayarlar', command: 'start ms-settings:', processName: 'SystemSettings.exe' },
  store: { label: 'Microsoft Store', command: 'start ms-windows-store:', processName: 'WinStore.App.exe' },
};

export async function openApplication(name: string): Promise<{ ok: boolean; message: string }> {
  const key = name.toLowerCase().trim();
  const known = KNOWN_APPS[key];

  const command = known ? known.command : `start "" "${name}"`;
  const label = known ? known.label : name;

  try {
    await execAsync(command, { shell: 'cmd.exe' });
    return { ok: true, message: `${label} açıldı.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `${label} açılırken hata: ${msg}` };
  }
}

export async function closeApplication(name: string): Promise<{ ok: boolean; message: string }> {
  const key = name.toLowerCase().trim();
  const known = KNOWN_APPS[key];
  const processName = known ? known.processName : `${name}.exe`;
  const label = known ? known.label : name;

  try {
    await execAsync(`taskkill /IM "${processName}" /F`, { shell: 'cmd.exe' });
    return { ok: true, message: `${label} kapatıldı.` };
  } catch {
    return { ok: false, message: `${label} zaten çalışmıyor veya kapatılamadı.` };
  }
}

export async function openUrl(url: string): Promise<{ ok: boolean; message: string }> {
  try {
    await execAsync(`start "" "${url}"`, { shell: 'cmd.exe' });
    return { ok: true, message: `URL açıldı: ${url}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `URL açılırken hata: ${msg}` };
  }
}

export async function runCommand(command: string): Promise<{ ok: boolean; message: string; data?: string }> {
  const BLOCKED = [/format\s/i, /del\s+\/s/i, /rmdir\s+\/s/i, /rm\s+-rf/i, /diskpart/i, /bcdedit/i, /reg\s+delete/i];
  for (const pattern of BLOCKED) {
    if (pattern.test(command)) {
      return { ok: false, message: 'Bu komut güvenlik nedeniyle engellendi.' };
    }
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      shell: 'cmd.exe',
      timeout: 15000,
      maxBuffer: 1024 * 512,
    });
    const output = (stdout || stderr || '').trim();
    return {
      ok: true,
      message: output ? `Komut çalıştırıldı. Çıktı: ${output.slice(0, 500)}` : 'Komut başarıyla çalıştırıldı.',
      data: output.slice(0, 2000),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Komut çalıştırılamadı: ${msg.slice(0, 300)}` };
  }
}

async function fetchFromPiped(query: string, instance: string): Promise<string> {
  const res = await fetch(`${instance}/search?q=${encodeURIComponent(query)}&filter=videos`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) throw new Error('not ok');
  const data = await res.json() as { items?: { url?: string }[] };
  const url = data.items?.[0]?.url;
  if (!url) throw new Error('no items');
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) throw new Error('no id');
  return m[1];
}

async function fetchFromYouTubeHtml(query: string): Promise<string> {
  const res = await fetch(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error('not ok');
  const html = await res.text();
  const m = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
  if (!m) throw new Error('no id');
  return m[1];
}

async function fetchVideoId(query: string): Promise<string | null> {
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.in.projectsegfau.lt',
  ];

  try {
    const videoId = await Promise.any([
      ...pipedInstances.map((inst) => fetchFromPiped(query, inst)),
      fetchFromYouTubeHtml(query),
    ]);
    return videoId;
  } catch {
    return null;
  }
}

export async function playYoutube(query: string): Promise<{ ok: boolean; message: string }> {
  try {
    const videoId = await fetchVideoId(query);

    if (videoId) {
      await execAsync(`start "" "https://www.youtube.com/watch?v=${videoId}"`, { shell: 'cmd.exe' });
      return { ok: true, message: `YouTube'da oynatılıyor: ${query}` };
    }

    await execAsync(`start "" "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}"`, { shell: 'cmd.exe' });
    return { ok: true, message: `YouTube araması açıldı: ${query}` };
  } catch {
    return { ok: false, message: `YouTube açılamadı.` };
  }
}

export async function runPowerShell(command: string): Promise<{ ok: boolean; message: string; data?: string }> {
  const BLOCKED = [/Format-Volume/i, /Remove-Item\s.*-Recurse.*C:\\/i, /Clear-Disk/i, /Initialize-Disk/i];
  for (const pattern of BLOCKED) {
    if (pattern.test(command)) {
      return { ok: false, message: 'Bu PowerShell komutu güvenlik nedeniyle engellendi.' };
    }
  }

  try {
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -Command "${command.replace(/"/g, '\\"')}"`,
      { shell: 'cmd.exe', timeout: 15000, maxBuffer: 1024 * 512 },
    );
    const output = (stdout || stderr || '').trim();
    return {
      ok: true,
      message: output ? `PowerShell çalıştırıldı. Çıktı: ${output.slice(0, 500)}` : 'PowerShell komutu başarıyla çalıştırıldı.',
      data: output.slice(0, 2000),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `PowerShell hatası: ${msg.slice(0, 300)}` };
  }
}
