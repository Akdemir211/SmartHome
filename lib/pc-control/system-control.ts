import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function ps(command: string): Promise<{ stdout: string; stderr: string }> {
  return execAsync(`powershell -NoProfile -Command "${command}"`, {
    shell: 'cmd.exe',
  });
}

export async function setVolume(level: number): Promise<{ ok: boolean; message: string }> {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  try {
    const script = `
      $wshShell = New-Object -ComObject WScript.Shell;
      1..50 | ForEach-Object { $wshShell.SendKeys([char]174) };
      $steps = [math]::Round(${clamped} / 2);
      1..$steps | ForEach-Object { $wshShell.SendKeys([char]175) }
    `.replace(/\n/g, ' ');
    await ps(script);
    return { ok: true, message: `Ses seviyesi %${clamped} olarak ayarlandı.` };
  } catch {
    try {
      const nircmd = `nircmd.exe setsysvolume ${Math.round((clamped / 100) * 65535)}`;
      await execAsync(nircmd, { shell: 'cmd.exe' });
      return { ok: true, message: `Ses seviyesi %${clamped} olarak ayarlandı.` };
    } catch {
      return { ok: false, message: 'Ses seviyesi ayarlanamadı.' };
    }
  }
}

export async function muteVolume(): Promise<{ ok: boolean; message: string }> {
  try {
    const script = `$wshShell = New-Object -ComObject WScript.Shell; $wshShell.SendKeys([char]173)`;
    await ps(script);
    return { ok: true, message: 'Ses kapatıldı / açıldı (toggle).' };
  } catch {
    return { ok: false, message: 'Ses kapatılamadı.' };
  }
}

export async function lockComputer(): Promise<{ ok: boolean; message: string }> {
  try {
    await execAsync('rundll32.exe user32.dll,LockWorkStation', { shell: 'cmd.exe' });
    return { ok: true, message: 'Bilgisayar kilitlendi.' };
  } catch {
    return { ok: false, message: 'Bilgisayar kilitlenemedi.' };
  }
}

export async function shutdownComputer(): Promise<{ ok: boolean; message: string }> {
  try {
    await execAsync('shutdown /s /t 5 /c "Jarvis tarafından kapatılıyor"', { shell: 'cmd.exe' });
    return { ok: true, message: 'Bilgisayar 5 saniye içinde kapanacak.' };
  } catch {
    return { ok: false, message: 'Bilgisayar kapatılamadı.' };
  }
}

export async function restartComputer(): Promise<{ ok: boolean; message: string }> {
  try {
    await execAsync('shutdown /r /t 5 /c "Jarvis tarafından yeniden başlatılıyor"', { shell: 'cmd.exe' });
    return { ok: true, message: 'Bilgisayar 5 saniye içinde yeniden başlayacak.' };
  } catch {
    return { ok: false, message: 'Bilgisayar yeniden başlatılamadı.' };
  }
}

export async function sleepComputer(): Promise<{ ok: boolean; message: string }> {
  try {
    await ps('Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)');
    return { ok: true, message: 'Bilgisayar uyku moduna alındı.' };
  } catch {
    return { ok: false, message: 'Uyku moduna geçilemedi.' };
  }
}

export async function cancelShutdown(): Promise<{ ok: boolean; message: string }> {
  try {
    await execAsync('shutdown /a', { shell: 'cmd.exe' });
    return { ok: true, message: 'Kapatma/yeniden başlatma iptal edildi.' };
  } catch {
    return { ok: false, message: 'İptal edilecek bir zamanlayıcı bulunamadı.' };
  }
}
