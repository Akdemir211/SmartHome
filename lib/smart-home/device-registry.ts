import type { Room } from '@/types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'living-room',
    label: 'Oturma Odası',
    devices: [
      { id: 'living-room-light', kind: 'light', label: 'Işık', on: true },
      {
        id: 'living-room-ac',
        kind: 'ac',
        label: 'Klima',
        on: false,
        temperature: 22,
      },
      { id: 'living-room-tv', kind: 'tv', label: 'TV', on: false },
      { id: 'living-room-curtain', kind: 'curtain', label: 'Perde', on: true },
    ],
  },
  {
    id: 'bedroom',
    label: 'Yatak Odası',
    devices: [
      { id: 'bedroom-light', kind: 'light', label: 'Işık', on: false },
      {
        id: 'bedroom-ac',
        kind: 'ac',
        label: 'Klima',
        on: false,
        temperature: 20,
      },
      { id: 'bedroom-curtain', kind: 'curtain', label: 'Perde', on: false },
    ],
  },
  {
    id: 'kitchen',
    label: 'Mutfak',
    devices: [
      { id: 'kitchen-light', kind: 'light', label: 'Işık', on: false },
      { id: 'kitchen-tv', kind: 'tv', label: 'Küçük TV', on: false },
    ],
  },
];

export const DEVICE_KIND_LABEL: Record<string, string> = {
  light: 'Işık',
  ac: 'Klima',
  tv: 'TV',
  curtain: 'Perde',
};

export function findRoomByKeyword(rooms: Room[], keyword: string) {
  const normalized = keyword.toLocaleLowerCase('tr-TR').trim();
  return rooms.find((room) =>
    room.label.toLocaleLowerCase('tr-TR').includes(normalized),
  );
}
