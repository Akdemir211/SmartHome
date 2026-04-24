import TuyAPI from 'tuyapi';

interface TuyaDeviceConfig {
  id: string;
  key: string;
  ip?: string;
  version?: string;
  dps?: number;
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
  const globalVersion = process.env.TUYA_PROTOCOL_VERSION ?? '3.3';

  for (let i = 1; i <= 10; i++) {
    const id = process.env[`TUYA_DEVICE_${i}_ID`];
    const key = process.env[`TUYA_DEVICE_${i}_KEY`];
    if (!id || !key) continue;
    const ip = process.env[`TUYA_DEVICE_${i}_IP`] || undefined;
    const version = process.env[`TUYA_DEVICE_${i}_VERSION`] || globalVersion;
    const rawDps = process.env[`TUYA_DEVICE_${i}_DPS`];
    const dps = rawDps ? Number(rawDps) : undefined;
    deviceConfigCache.set(id, { id, key, ip, version, dps });
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

export type TuyaDeviceType = 'plug' | 'bulb';

export interface BulbState {
  brightness?: number;
  color?: string;
  colorTemp?: number;
}

const DPS_MAP: Record<TuyaDeviceType, number> = {
  plug: 1,
  bulb: 20,
};

import { COLOR_HSV, hsvToTuyaHex } from './bulb-constants';

function resolvePowerDps(tuyaDeviceId: string, deviceType: TuyaDeviceType): number {
  const cfg = deviceConfigCache.get(tuyaDeviceId);
  if (cfg?.dps) return cfg.dps;
  return DPS_MAP[deviceType] ?? 1;
}

export async function tuyaTurnOn(tuyaDeviceId: string, deviceType: TuyaDeviceType = 'plug'): Promise<TuyaResult> {
  const dps = resolvePowerDps(tuyaDeviceId, deviceType);
  const label = deviceType === 'bulb' ? 'Akıllı ampul' : 'Akıllı priz';
  try {
    await withConnection(tuyaDeviceId, async (device) => {
      await device.set({ dps, set: true });
    });
    return { ok: true, message: `${label} açıldı.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `${label} açılamadı: ${msg}` };
  }
}

export async function tuyaTurnOff(tuyaDeviceId: string, deviceType: TuyaDeviceType = 'plug'): Promise<TuyaResult> {
  const dps = resolvePowerDps(tuyaDeviceId, deviceType);
  const label = deviceType === 'bulb' ? 'Akıllı ampul' : 'Akıllı priz';
  try {
    await withConnection(tuyaDeviceId, async (device) => {
      await device.set({ dps, set: false });
    });
    return { ok: true, message: `${label} kapatıldı.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `${label} kapatılamadı: ${msg}` };
  }
}

export async function tuyaGetStatus(tuyaDeviceId: string, deviceType: TuyaDeviceType = 'plug'): Promise<TuyaResult> {
  const dps = resolvePowerDps(tuyaDeviceId, deviceType);
  const label = deviceType === 'bulb' ? 'Akıllı ampul' : 'Akıllı priz';
  try {
    const status = await withConnection(tuyaDeviceId, async (device) => {
      return await device.get({ dps });
    });
    const isOn = Boolean(status);
    return {
      ok: true,
      message: `${label} şu an ${isOn ? 'açık' : 'kapalı'}.`,
      data: { on: isOn },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `${label} durumu okunamadı: ${msg}` };
  }
}

export async function tuyaSetBulbState(
  tuyaDeviceId: string,
  state: BulbState,
): Promise<TuyaResult> {
  const cfg = getConfig(tuyaDeviceId);
  const pDps = cfg.dps ?? 20;
  const modeDps   = String(pDps + 1);
  const brightDps = String(pDps + 2);
  const ctDps     = String(pDps + 3);
  const colorDps  = String(pDps + 4);
  const powerKey  = String(pDps);

  const data: Record<string, unknown> = { [powerKey]: true };

  const isColorRequest = state.color && state.color !== 'beyaz';

  if (isColorRequest) {
    const entry = COLOR_HSV[state.color!];
    if (!entry) {
      return { ok: false, message: `Bilinmeyen renk: ${state.color}` };
    }
    const [h, s] = entry;
    const v = state.brightness !== undefined
      ? Math.round((state.brightness / 100) * 1000)
      : entry[2];
    data[modeDps] = 'colour';
    data[colorDps] = hsvToTuyaHex(h, s, v);
  } else {
    data[modeDps] = 'white';
    if (state.brightness !== undefined) {
      data[brightDps] = Math.round(10 + (state.brightness / 100) * 990);
    }
    if (state.colorTemp !== undefined) {
      data[ctDps] = Math.round((state.colorTemp / 100) * 1000);
    }
  }

  try {
    await withConnection(tuyaDeviceId, async (device) => {
      await device.set({ multiple: true, data });
    });

    const parts: string[] = [];
    if (isColorRequest) parts.push(`renk: ${state.color}`);
    if (state.color === 'beyaz') parts.push('beyaz mod');
    if (state.brightness !== undefined) parts.push(`parlaklık: %${state.brightness}`);
    if (state.colorTemp !== undefined) parts.push(`sıcaklık: %${state.colorTemp}`);
    const detail = parts.length > 0 ? ` (${parts.join(', ')})` : '';
    return { ok: true, message: `Akıllı ampul ayarlandı${detail}.` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { ok: false, message: `Ampul ayarlanamadı: ${msg}` };
  }
}

export async function tuyaControl(
  tuyaDeviceId: string,
  action: 'on' | 'off' | 'status' | 'set_bulb_state',
  deviceType: TuyaDeviceType = 'plug',
  bulbState?: BulbState,
): Promise<TuyaResult> {
  switch (action) {
    case 'on':
      return tuyaTurnOn(tuyaDeviceId, deviceType);
    case 'off':
      return tuyaTurnOff(tuyaDeviceId, deviceType);
    case 'status':
      return tuyaGetStatus(tuyaDeviceId, deviceType);
    case 'set_bulb_state':
      return tuyaSetBulbState(tuyaDeviceId, bulbState ?? {});
    default:
      return { ok: false, message: `Bilinmeyen aksiyon: ${action}` };
  }
}
