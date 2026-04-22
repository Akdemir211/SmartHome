import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const HOME_DIR = 'C:\\Users\\Hp';

const ALLOWED_ROOTS = [
  HOME_DIR,
  path.join(HOME_DIR, 'Desktop'),
  path.join(HOME_DIR, 'Documents'),
  path.join(HOME_DIR, 'Downloads'),
  path.join(HOME_DIR, 'Music'),
  path.join(HOME_DIR, 'Pictures'),
  path.join(HOME_DIR, 'Videos'),
  path.join(HOME_DIR, 'OneDrive'),
  path.join(HOME_DIR, 'OneDrive', 'Masaüstü'),
];

const SHORTCUT_MAP: Record<string, string> = {
  masaustu: path.join(HOME_DIR, 'OneDrive', 'Masaüstü'),
  masaüstü: path.join(HOME_DIR, 'OneDrive', 'Masaüstü'),
  desktop: path.join(HOME_DIR, 'Desktop'),
  belgeler: path.join(HOME_DIR, 'Documents'),
  documents: path.join(HOME_DIR, 'Documents'),
  indirilenler: path.join(HOME_DIR, 'Downloads'),
  downloads: path.join(HOME_DIR, 'Downloads'),
  muzik: path.join(HOME_DIR, 'Music'),
  music: path.join(HOME_DIR, 'Music'),
  resimler: path.join(HOME_DIR, 'Pictures'),
  pictures: path.join(HOME_DIR, 'Pictures'),
  videolar: path.join(HOME_DIR, 'Videos'),
  videos: path.join(HOME_DIR, 'Videos'),
};

function resolveDirectory(dir: string): string {
  const lower = dir.toLowerCase().trim();
  if (SHORTCUT_MAP[lower]) return SHORTCUT_MAP[lower];
  const abs = path.isAbsolute(dir) ? dir : path.join(HOME_DIR, dir);
  return path.normalize(abs);
}

function isPathAllowed(target: string): boolean {
  const normalized = path.normalize(target).toLowerCase();
  return ALLOWED_ROOTS.some((root) => normalized.startsWith(root.toLowerCase()));
}

export async function searchFiles(
  directory: string,
  pattern: string,
): Promise<{ ok: boolean; message: string; data?: string[] }> {
  const dir = resolveDirectory(directory);
  if (!isPathAllowed(dir)) {
    return { ok: false, message: `Bu dizine erişim izni yok: ${dir}` };
  }

  try {
    const psCmd = `Get-ChildItem -Path '${dir}' -Recurse -Filter '${pattern}' -File -ErrorAction SilentlyContinue | Select-Object -First 20 -ExpandProperty FullName`;
    const { stdout } = await execAsync(`powershell -NoProfile -Command "${psCmd}"`, {
      shell: 'cmd.exe',
    });

    const files = stdout.trim().split('\n').filter(Boolean).map((f) => f.trim());
    if (files.length === 0) {
      return { ok: true, message: `"${pattern}" deseniyle eşleşen dosya bulunamadı.`, data: [] };
    }
    return {
      ok: true,
      message: `${files.length} dosya bulundu.`,
      data: files,
    };
  } catch {
    return { ok: false, message: `Dosya araması başarısız oldu.` };
  }
}

export async function openFile(filePath: string): Promise<{ ok: boolean; message: string }> {
  const abs = path.isAbsolute(filePath)
    ? path.normalize(filePath)
    : path.normalize(path.join(HOME_DIR, filePath));

  if (!isPathAllowed(abs)) {
    return { ok: false, message: `Bu dosyaya erişim izni yok: ${abs}` };
  }

  try {
    await execAsync(`start "" "${abs}"`, { shell: 'cmd.exe' });
    return { ok: true, message: `Dosya açıldı: ${path.basename(abs)}` };
  } catch {
    return { ok: false, message: `Dosya açılamadı: ${abs}` };
  }
}

export async function createFolder(
  directory: string,
  name: string,
): Promise<{ ok: boolean; message: string }> {
  const dir = resolveDirectory(directory);
  const target = path.join(dir, name);

  if (!isPathAllowed(target)) {
    return { ok: false, message: `Bu konumda klasör oluşturma izni yok.` };
  }

  try {
    await execAsync(`mkdir "${target}"`, { shell: 'cmd.exe' });
    return { ok: true, message: `"${name}" klasörü oluşturuldu: ${target}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('already exists') || msg.includes('zaten var')) {
      return { ok: false, message: `"${name}" klasörü zaten mevcut.` };
    }
    return { ok: false, message: `Klasör oluşturulamadı: ${msg}` };
  }
}
