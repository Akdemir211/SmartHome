import { Type, type FunctionDeclaration } from '@google/genai';

export const computerControlTools: FunctionDeclaration[] = [
  {
    name: 'computer_mouse_click',
    description:
      'Ekranın belirtilen (x, y) koordinatına tıklar. Varsayılan sol tık.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: 'Ekran X koordinatı' },
        y: { type: Type.NUMBER, description: 'Ekran Y koordinatı' },
        button: {
          type: Type.STRING,
          description: '"left" veya "right". Varsayılan: "left"',
        },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'computer_mouse_double_click',
    description: 'Ekranın belirtilen koordinatına çift tıklar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: 'Ekran X koordinatı' },
        y: { type: Type.NUMBER, description: 'Ekran Y koordinatı' },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'computer_mouse_move',
    description:
      'Fareyi belirtilen koordinata taşır (tıklamadan).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: 'Ekran X koordinatı' },
        y: { type: Type.NUMBER, description: 'Ekran Y koordinatı' },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'computer_mouse_drag',
    description:
      'Bir noktadan diğerine sürükle-bırak yapar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from_x: { type: Type.NUMBER, description: 'Başlangıç X' },
        from_y: { type: Type.NUMBER, description: 'Başlangıç Y' },
        to_x: { type: Type.NUMBER, description: 'Bitiş X' },
        to_y: { type: Type.NUMBER, description: 'Bitiş Y' },
      },
      required: ['from_x', 'from_y', 'to_x', 'to_y'],
    },
  },
  {
    name: 'computer_scroll',
    description: 'Fare tekerleğini yukarı veya aşağı kaydırır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        direction: {
          type: Type.STRING,
          description: '"up" veya "down"',
        },
        amount: {
          type: Type.NUMBER,
          description: 'Kaydırma miktarı (varsayılan: 3)',
        },
      },
      required: ['direction'],
    },
  },
  {
    name: 'computer_type_text',
    description:
      'Klavyeden metin yazar. Türkçe karakterler dahil her dili destekler. Metin bir alana yazmak için önce o alana tıkla.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: 'Yazılacak metin' },
      },
      required: ['text'],
    },
  },
  {
    name: 'computer_press_key',
    description:
      'Bir tuş veya tuş kombinasyonu basar. Örnekler: "enter", "tab", "escape", "backspace", "delete", "space", "ctrl+c", "ctrl+v", "ctrl+a", "ctrl+z", "alt+tab", "alt+f4", "ctrl+shift+t", "win", "f5", "up", "down", "left", "right", "home", "end", "pageup", "pagedown"',
    parameters: {
      type: Type.OBJECT,
      properties: {
        key: {
          type: Type.STRING,
          description: 'Tuş veya kombinasyon (örn: "ctrl+c")',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'computer_wait',
    description:
      'Belirtilen süre kadar bekler. Uygulama açılması, sayfa yüklenmesi gibi işlemlerden sonra kullan.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ms: {
          type: Type.NUMBER,
          description: 'Beklenecek milisaniye (100-10000)',
        },
      },
      required: ['ms'],
    },
  },
  {
    name: 'computer_screenshot',
    description:
      'Ekranın görüntüsünü alır. Ekrandaki mevcut durumu görmek için kullan. Ekran paylaşımı aktifse buna gerek yok.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

export const COMPUTER_TOOL_NAMES = new Set(
  computerControlTools.map((t) => t.name),
);
