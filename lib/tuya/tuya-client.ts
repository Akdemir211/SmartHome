import TuyAPI from 'tuyapi';

interface TuyaDeviceConfig {
  id: string;
  key: string;
  ip?: string;
  version?: string;
}

interface TuyaResult {
  ok: boolean;
  message: string;
  data?: unknown;
}

interface PoolEntry {
  device: TuyAPI;
  connected: boolean;
  idleTimer: ReturnType<typeof setTimeout> | null;
}

const IDLE_TIMEOUT_MS = 60_000;
const deviceConfigCache = new Map<string, TuyaDeviceConfig>();
const pool = new Map<string, PoolEntry>();

function loadAllDeviceConfigs(): void {
  if (deviceConfigCache.size > 0) return;
  const version = process.env.TUYA_PROTOCOL_VERSION ?? '3.3';

  for (let i = 1; i <= 10; i++) {
    const id = process.env[`TUYA_DEVICE_${i}_ID`];
    const key = process.env[`TUYA_DEVICE_${i}_KEY`];
    if (!id || !key) continue;
    const ip = process.env[`TUYA_DEVICE_${i}_IP`] || undefined;
    deviceConfigCache.set(id, { id, key, ip, version });
  }
}

function getConfig(tuyaDeviceId: string): TuyaDeviceConfig {
  loadAllDeviceConfigs();
  const cfg = deviceConfigCache.get(tuyaDeviceId);
  if (!cfg) {
    throw new Error(
      `Tuya cihazı bulunamadı: ${tuyaDeviceId}. .env.local dosyasını kontrol edin.`,
    );
  }
  return cfg;
}

function resetIdleTimer(entry: PoolEntry, tuyaDeviceId: string): void {
  if (entry.idleTimer) clearTimeout(entry.idleTimer);
  entry.idleTimer = setTimeout(() => {
    try { entry.device.disconnect(); } catch { /* ignore */ }
    entry.connected = false;
    pool.delete(tuyaDeviceId);
  }, IDLE_TIMEOUT_MS);
}

async function getOrCreateConnection(tuyaDeviceId: string): Promise<TuyAPI> {
  const existing = pool.get(tuyaDeviceId);
  if (existing?.connected) {
    resetIdleTimer(existing, tuyaDeviceId);
    return existing.device;
  }

  if (existing) {
    try { existing.device.disconnect(); } catch { /* ignore */ }
    pool.delete(tuyaDeviceId);
  }

  const cfg = getConfig(tuyaDeviceId);
  const opts: Record<string, unknown> = {
    id: cfg.id,
    key: cfg.key,
    version: cfg.version ?? '3.3',
    issueRefreshOnConnect: true,
  };
  if (cfg.ip) opts.ip = cfg.ip;

  const device = new TuyAPI(opts);

  const entry: PoolEntry = { device, connected: false, idleTimer: null };

  device.on('disconnected', () => {
    entry.connected = false;
    pool.delete(tuyaDeviceId);
  });

  device.on('error', () => {
    entry.connected = false;
    pool.delete(tuyaDeviceId);
  });

  if (!cfg.ip) {
    await device.find({ timeout: 10000 });
  }

  await device.connect();
  entry.connected = true;
  pool.set(tuyaDeviceId, entry);
  resetIdleTimer(entry, tuyaDeviceId);

  return device;
}

async function withConnection<T>(
  tuyaDeviceId: string,
  fn: (device: TuyAPI) => Promise<T>,
): Promise<T> {
  let device: TuyAPI;
  try {
    device = await getOrCreateConnection(tuyaDeviceId);
  } catch {
    pool.delete(tuyaDeviceId);
    device = await getOrCreateConnection(tuyaDeviceId);
  }

  try {
    return await fn(device);
  } catch (err) {
    pool.delete(tuyaDeviceId);
    try { device.disconnect(); } catch { /* ignore */ }
    throw err;
  }
}

export async function tuyaTurnOn(tuyaDeviceId: string): Promise<TuyaResult> {
  try {
    await withConnection(tuyaDeviceId, async (device) => {
      await device.set({ set: true });
    });
    return { ok: true, message: 'Akıllı priz açıldı.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Priz açılamadı: ${msg}` };
  }
}

export async function tuyaTurnOff(tuyaDeviceId: string): Promise<TuyaResult> {
  try {
    await withConnection(tuyaDeviceId, async (device) => {
      await device.set({ set: false });
    });
    return { ok: true, message: 'Akıllı priz kapatıldı.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Priz kapatılamadı: ${msg}` };
  }
}

export async function tuyaGetStatus(tuyaDeviceId: string): Promise<TuyaResult> {
  try {
    const status = await withConnection(tuyaDeviceId, async (device) => {
      return await device.get();
    });
    const isOn = Boolean(status);
    return {
      ok: true,
      message: `Akıllı priz şu an ${isOn ? 'açık' : 'kapalı'}.`,
      data: { on: isOn },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Priz durumu okunamadı: ${msg}` };
  }
}

export async function tuyaControl(
  tuyaDeviceId: string,
  action: 'on' | 'off' | 'status',
): Promise<TuyaResult> {
  switch (action) {
    case 'on':
      return tuyaTurnOn(tuyaDeviceId);
    case 'off':
      return tuyaTurnOff(tuyaDeviceId);
    case 'status':
      return tuyaGetStatus(tuyaDeviceId);
    default:
      return { ok: false, message: `Bilinmeyen aksiyon: ${action}` };
  }
}
