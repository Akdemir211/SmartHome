'use client';

import { create } from 'zustand';
import type { BulbMode, DeviceKind, Room } from '@/types';
import { INITIAL_ROOMS } from './device-registry';

interface BulbProperties {
  brightness?: number;
  color?: string;
  colorTemp?: number;
  bulbMode?: BulbMode;
}

interface DevicesStore {
  rooms: Room[];
  setDeviceOn: (roomId: string, deviceKind: DeviceKind, on: boolean) => boolean;
  setAcTemperature: (roomId: string, temperature: number) => boolean;
  setBulbProperties: (roomId: string, props: BulbProperties) => boolean;
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
  setBulbProperties: (roomId, props) => {
    let changed = false;
    set((prev) => {
      const rooms = prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          devices: room.devices.map((device) => {
            if (device.kind !== 'bulb') return device;
            changed = true;
            return {
              ...device,
              on: true,
              ...(props.brightness !== undefined && { brightness: props.brightness }),
              ...(props.color !== undefined && { color: props.color }),
              ...(props.colorTemp !== undefined && { colorTemp: props.colorTemp }),
              ...(props.bulbMode !== undefined && { bulbMode: props.bulbMode }),
            };
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
