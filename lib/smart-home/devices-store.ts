'use client';

import { create } from 'zustand';
import type { DeviceKind, Room } from '@/types';
import { INITIAL_ROOMS } from './device-registry';

interface DevicesStore {
  rooms: Room[];
  setDeviceOn: (roomId: string, deviceKind: DeviceKind, on: boolean) => boolean;
  setAcTemperature: (roomId: string, temperature: number) => boolean;
  getSnapshot: () => Room[];
  reset: () => void;
}

function cloneRooms(rooms: Room[]): Room[] {
  return rooms.map((room) => ({
    ...room,
    devices: room.devices.map((device) => ({ ...device })),
  }));
}

export const useDevicesStore = create<DevicesStore>((set, get) => ({
  rooms: cloneRooms(INITIAL_ROOMS),
  setDeviceOn: (roomId, deviceKind, on) => {
    let changed = false;
    set((prev) => {
      const rooms = prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          devices: room.devices.map((device) => {
            if (device.kind !== deviceKind) return device;
            if (device.on === on) return device;
            changed = true;
            return { ...device, on };
          }),
        };
      });
      return { rooms };
    });
    return changed;
  },
  setAcTemperature: (roomId, temperature) => {
    let changed = false;
    set((prev) => {
      const rooms = prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          devices: room.devices.map((device) => {
            if (device.kind !== 'ac') return device;
            changed = true;
            return { ...device, temperature, on: true };
          }),
        };
      });
      return { rooms };
    });
    return changed;
  },
  getSnapshot: () => get().rooms,
  reset: () => set(() => ({ rooms: cloneRooms(INITIAL_ROOMS) })),
}));
