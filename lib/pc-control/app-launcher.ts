import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs';
import os from 'os';
import path from 'path';

const execAsync = promisify(exec);
const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

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

export async function playYoutube(query: string): Promise<{ ok: boolean; message: string }> {
  const encoded = encodeURIComponent(query).replace(/'/g, '%27');
  const tmpScript = path.join(os.tmpdir(), `jarvis-yt-${Date.now()}.ps1`);

  try {
    const ps1Content = [
      '[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12',
      `$url = 'https://www.youtube.com/results?search_query=${encoded}'`,
      "$headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; 'Accept-Language' = 'tr-TR,tr;q=0.9' }",
      '$response = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 10',
      '$html = $response.Content',
      'if ($html -match \'\"videoId\":\"([a-zA-Z0-9_-]{11})\"\') { Write-Output $Matches[1] } else { Write-Output "NOT_FOUND" }',
    ].join('\n');

    await writeFileAsync(tmpScript, ps1Content, 'utf-8');

    const { stdout } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpScript}"`,
      { shell: 'cmd.exe', timeout: 20000 },
    );

    try { await unlinkAsync(tmpScript); } catch { /* ignore */ }

    const videoId = stdout.trim().split('\n')[0].trim();

    if (videoId && videoId !== 'NOT_FOUND' && videoId.length === 11) {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await execAsync(`start "" "${watchUrl}"`, { shell: 'cmd.exe' });
      return { ok: true, message: `YouTube'da oynatılıyor: ${query}` };
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encoded}`;
    await execAsync(`start "" "${searchUrl}"`, { shell: 'cmd.exe' });
    return { ok: true, message: `Video bulunamadı, YouTube araması açıldı: ${query}` };
  } catch (err) {
    try { await unlinkAsync(tmpScript); } catch { /* ignore */ }
    try {
      await execAsync(`start "" "https://www.youtube.com/results?search_query=${encoded}"`, { shell: 'cmd.exe' });
      return { ok: true, message: `YouTube araması açıldı: ${query}` };
    } catch {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      return { ok: false, message: `YouTube açılamadı: ${msg}` };
    }
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
