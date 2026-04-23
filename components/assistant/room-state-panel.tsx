'use client';

import { useDevicesStore } from '@/lib/smart-home/devices-store';
import type { Device, DeviceKind } from '@/types';

const ICONS: Record<DeviceKind, string> = {
  light: 'M12 3v1.5m0 15V21m8.485-8.485H21M3 12.515H1.515m14.95-6.364.707-.707m-11.314 11.314.707.707m11.314 0 .707-.707M5.343 5.343l-.707.707M12 7.5a4.5 4.5 0 1 0 4.5 4.5 4.5 4.5 0 0 0-4.5-4.5z',
  ac: 'M3 8.25h18M3 12h18M3 15.75h18M7.5 4.5v15M16.5 4.5v15',
  tv: 'M4.5 5.25h15A1.5 1.5 0 0 1 21 6.75v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.75v-9A1.5 1.5 0 0 1 4.5 5.25ZM8.25 20.25h7.5',
  curtain:
    'M4.5 4.5h15M6 4.5v14.25M18 4.5v14.25M6 18.75h12M9 4.5v12M15 4.5v12',
  plug: 'M12 2v4m-3-4v4m6-4v4M6 8h12a1 1 0 0 1 1 1v2a5 5 0 0 1-4 4.9V18a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-2.1A5 5 0 0 1 7 11V9a1 1 0 0 1 1-1z',
};

function DeviceChip({ device }: { device: Device }) {
  const icon = ICONS[device.kind] ?? ICONS.light;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
        device.on
          ? 'border-jarvis-cyan/30 bg-jarvis-cyan/5 text-jarvis-cyan'
          : 'border-white/5 bg-white/[0.02] text-slate-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          className="h-4 w-4"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        <span className="text-xs font-medium tracking-wide">
          {device.label}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em]">
        {device.kind === 'ac' && device.on
          ? `${device.temperature ?? 22}°`
          : device.on
            ? 'Açık'
            : 'Kapalı'}
      </span>
    </div>
  );
}

export function RoomStatePanel() {
  const rooms = useDevicesStore((s) => s.rooms);

  return (
    <aside className="pointer-events-none absolute bottom-6 right-6 z-10 hidden w-72 flex-col gap-3 md:flex">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-xl backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Ev Durumu
          </h2>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jarvis-cyan/80" />
        </div>
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id}>
              <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">
                {room.label}
              </p>
              <div className="space-y-1.5">
                {room.devices.map((device) => (
                  <DeviceChip key={device.id} device={device} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
