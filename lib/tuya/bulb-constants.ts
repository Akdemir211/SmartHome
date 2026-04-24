export const COLOR_HSV: Record<string, [number, number, number]> = {
  'kırmızı':  [0,   1000, 1000],
  'turuncu':  [30,  1000, 1000],
  'sarı':     [60,  1000, 1000],
  'yeşil':    [120, 1000, 1000],
  'turkuaz':  [180, 1000, 1000],
  'mavi':     [240, 1000, 1000],
  'mor':      [280, 1000, 1000],
  'pembe':    [330, 700,  1000],
  'lavanta':  [270, 500,  1000],
  'beyaz':    [0,   0,    1000],
};

export const BULB_COLORS = Object.keys(COLOR_HSV);

export function hsvToTuyaHex(h: number, s: number, v: number): string {
  return (
    h.toString(16).padStart(4, '0') +
    s.toString(16).padStart(4, '0') +
    v.toString(16).padStart(4, '0')
  );
}
