import os from 'os';

const IS_WIN = os.platform() === 'win32';

let SetCursorPos: (x: number, y: number) => number;
let GetSystemMetrics: (idx: number) => number;
let mouseEventFn: (...args: number[]) => void;

if (IS_WIN) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const koffi = require('koffi');
  const user32 = koffi.load('user32.dll');
  const SetProcessDPIAware = user32.func('int __stdcall SetProcessDPIAware()');
  SetProcessDPIAware();

  SetCursorPos = user32.func('int __stdcall SetCursorPos(int x, int y)');
  GetSystemMetrics = user32.func('int __stdcall GetSystemMetrics(int nIndex)');
  mouseEventFn = user32.func(
    'void __stdcall mouse_event(unsigned int, unsigned int, unsigned int, unsigned int, uintptr_t)',
  );
} else {
  SetCursorPos = () => 0;
  GetSystemMetrics = (idx: number) => {
    if (idx === 0 || idx === 78) return 1920;
    if (idx === 1 || idx === 79) return 1080;
    return 0;
  };
  mouseEventFn = () => {};
}

const LEFTDOWN = 0x0002;
const LEFTUP = 0x0004;
const RIGHTDOWN = 0x0008;
const RIGHTUP = 0x0010;

export function getVirtualScreen() {
  return {
    x: GetSystemMetrics(76),
    y: GetSystemMetrics(77),
    width: GetSystemMetrics(78),
    height: GetSystemMetrics(79),
    primaryWidth: GetSystemMetrics(0),
    primaryHeight: GetSystemMetrics(1),
  };
}

export function moveMouse(x: number, y: number): void {
  SetCursorPos(Math.round(x), Math.round(y));
}

export function leftDown(x: number, y: number): void {
  SetCursorPos(Math.round(x), Math.round(y));
  mouseEventFn(LEFTDOWN, 0, 0, 0, 0);
}

export function leftUp(): void {
  mouseEventFn(LEFTUP, 0, 0, 0, 0);
}

export function rightDown(x: number, y: number): void {
  SetCursorPos(Math.round(x), Math.round(y));
  mouseEventFn(RIGHTDOWN, 0, 0, 0, 0);
}

export function rightUp(): void {
  mouseEventFn(RIGHTUP, 0, 0, 0, 0);
}

const MOUSEEVENTF_WHEEL = 0x0800;
const WHEEL_DELTA = 120;

export function scroll(direction: 'up' | 'down', amount = 3): void {
  const raw = direction === 'up' ? WHEEL_DELTA * amount : -(WHEEL_DELTA * amount);
  mouseEventFn(MOUSEEVENTF_WHEEL, 0, 0, (raw & 0xFFFFFFFF) >>> 0, 0);
}

export function doubleClick(x: number, y: number): void {
  SetCursorPos(Math.round(x), Math.round(y));
  mouseEventFn(LEFTDOWN, 0, 0, 0, 0);
  mouseEventFn(LEFTUP, 0, 0, 0, 0);
  mouseEventFn(LEFTDOWN, 0, 0, 0, 0);
  mouseEventFn(LEFTUP, 0, 0, 0, 0);
}

export function drag(fromX: number, fromY: number, toX: number, toY: number): void {
  SetCursorPos(Math.round(fromX), Math.round(fromY));
  mouseEventFn(LEFTDOWN, 0, 0, 0, 0);
  const steps = 20;
  for (let i = 1; i <= steps; i++) {
    SetCursorPos(
      Math.round(fromX + (toX - fromX) * (i / steps)),
      Math.round(fromY + (toY - fromY) * (i / steps)),
    );
  }
  mouseEventFn(LEFTUP, 0, 0, 0, 0);
}
