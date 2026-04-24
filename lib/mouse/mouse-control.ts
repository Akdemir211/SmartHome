import koffi from 'koffi';

const user32 = koffi.load('user32.dll');

const SetProcessDPIAware = user32.func('int __stdcall SetProcessDPIAware()');
SetProcessDPIAware();

const SetCursorPos = user32.func('int __stdcall SetCursorPos(int x, int y)');
const GetSystemMetrics = user32.func('int __stdcall GetSystemMetrics(int nIndex)');
const mouseEventFn = user32.func(
  'void __stdcall mouse_event(unsigned int, unsigned int, unsigned int, unsigned int, uintptr_t)',
);

const LEFTDOWN = 0x0002;
const LEFTUP = 0x0004;
const RIGHTDOWN = 0x0008;
const RIGHTUP = 0x0010;

export function getVirtualScreen() {
  return {
    x: GetSystemMetrics(76),       // SM_XVIRTUALSCREEN
    y: GetSystemMetrics(77),       // SM_YVIRTUALSCREEN
    width: GetSystemMetrics(78),   // SM_CXVIRTUALSCREEN
    height: GetSystemMetrics(79),  // SM_CYVIRTUALSCREEN
    primaryWidth: GetSystemMetrics(0),   // SM_CXSCREEN
    primaryHeight: GetSystemMetrics(1),  // SM_CYSCREEN
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
