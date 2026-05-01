import os from 'os';

const IS_WIN = os.platform() === 'win32';

let SendInput: (n: number, buf: Buffer, size: number) => number;

const INPUT_KEYBOARD = 1;
const INPUT_SIZE = 40;
const KEYEVENTF_UNICODE = 0x0004;
const KEYEVENTF_KEYUP = 0x0002;

if (IS_WIN) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const koffi = require('koffi');
  const user32 = koffi.load('user32.dll');
  SendInput = user32.func(
    'uint32_t __stdcall SendInput(uint32_t nInputs, void* pInputs, int32_t cbSize)',
  );
} else {
  SendInput = () => 0;
}

const VK: Record<string, number> = {
  ctrl: 0x11, control: 0x11,
  alt: 0x12, menu: 0x12,
  shift: 0x10,
  win: 0x5B, windows: 0x5B,
  enter: 0x0D, return: 0x0D,
  tab: 0x09,
  escape: 0x1B, esc: 0x1B,
  space: 0x20,
  backspace: 0x08, back: 0x08,
  delete: 0x2E, del: 0x2E,
  insert: 0x2D,
  home: 0x24,
  end: 0x23,
  pageup: 0x21, pgup: 0x21,
  pagedown: 0x22, pgdn: 0x22,
  up: 0x26, down: 0x28, left: 0x25, right: 0x27,
  f1: 0x70, f2: 0x71, f3: 0x72, f4: 0x73,
  f5: 0x74, f6: 0x75, f7: 0x76, f8: 0x77,
  f9: 0x78, f10: 0x79, f11: 0x7A, f12: 0x7B,
  volumeup: 0xAF, volup: 0xAF,
  volumedown: 0xAE, voldown: 0xAE,
  mute: 0xAD,
  printscreen: 0x2C, prtsc: 0x2C,
  capslock: 0x14, caps: 0x14,
  numlock: 0x90, scrolllock: 0x91,
};

function resolveVk(key: string): number {
  const k = key.toLowerCase().trim();
  if (VK[k] !== undefined) return VK[k];
  if (k.length === 1) {
    const c = k.charCodeAt(0);
    if (c >= 0x61 && c <= 0x7A) return c - 0x20;
    if (c >= 0x30 && c <= 0x39) return c;
  }
  return 0;
}

function makeKey(wVk: number, wScan: number, flags: number): Buffer {
  const buf = Buffer.alloc(INPUT_SIZE, 0);
  buf.writeUInt32LE(INPUT_KEYBOARD, 0);
  buf.writeUInt16LE(wVk, 8);
  buf.writeUInt16LE(wScan, 10);
  buf.writeUInt32LE(flags, 12);
  return buf;
}

export function typeText(text: string): void {
  const inputs: Buffer[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    inputs.push(makeKey(0, code, KEYEVENTF_UNICODE));
    inputs.push(makeKey(0, code, KEYEVENTF_UNICODE | KEYEVENTF_KEYUP));
  }
  if (inputs.length === 0) return;
  SendInput(inputs.length, Buffer.concat(inputs), INPUT_SIZE);
}

export function pressKey(combo: string): void {
  const parts = combo.split('+').map((s) => s.trim());
  const codes = parts.map(resolveVk).filter(Boolean);
  if (codes.length === 0) return;

  const inputs: Buffer[] = [];
  for (const vk of codes) inputs.push(makeKey(vk, 0, 0));
  for (let i = codes.length - 1; i >= 0; i--) inputs.push(makeKey(codes[i], 0, KEYEVENTF_KEYUP));

  SendInput(inputs.length, Buffer.concat(inputs), INPUT_SIZE);
}

export function keyDown(combo: string): void {
  const codes = combo.split('+').map((s) => resolveVk(s.trim())).filter(Boolean);
  if (codes.length === 0) return;
  const inputs = codes.map((vk) => makeKey(vk, 0, 0));
  SendInput(inputs.length, Buffer.concat(inputs), INPUT_SIZE);
}

export function keyUp(combo: string): void {
  const codes = combo.split('+').map((s) => resolveVk(s.trim())).filter(Boolean);
  if (codes.length === 0) return;
  const inputs = codes.map((vk) => makeKey(vk, 0, KEYEVENTF_KEYUP));
  SendInput(inputs.length, Buffer.concat(inputs), INPUT_SIZE);
}
