import { Type, type FunctionDeclaration } from '@google/genai';

const APP_NAME_ENUM = [
  'chrome', 'firefox', 'edge', 'spotify', 'vscode', 'notepad',
  'calculator', 'explorer', 'paint', 'word', 'excel', 'powerpoint',
  'teams', 'discord', 'whatsapp', 'telegram',
];

export const pcControlTools: FunctionDeclaration[] = [
  {
    name: 'open_application',
    description:
      'Bilgisayarda bir uygulama açar. Sadece beyaz listedeki uygulamalar açılabilir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Açılacak uygulamanın adı.',
          enum: APP_NAME_ENUM,
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'close_application',
    description:
      'Bilgisayarda çalışan bir uygulamayı kapatır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Kapatılacak uygulamanın adı.',
          enum: APP_NAME_ENUM,
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'set_volume',
    description:
      'Bilgisayarın ses seviyesini ayarlar (0-100 arası).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.NUMBER,
          description: 'Hedef ses seviyesi (0-100).',
        },
      },
      required: ['level'],
    },
  },
  {
    name: 'mute_volume',
    description: 'Bilgisayarın sesini kapatır veya açar (toggle).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'lock_computer',
    description: 'Bilgisayarı kilitler (kilit ekranına geçer).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'shutdown_computer',
    description: 'Bilgisayarı kapatır (5 saniye gecikmeyle).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'restart_computer',
    description: 'Bilgisayarı yeniden başlatır (5 saniye gecikmeyle).',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'sleep_computer',
    description: 'Bilgisayarı uyku moduna alır.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'cancel_shutdown',
    description: 'Planlanmış kapatma veya yeniden başlatmayı iptal eder.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'search_files',
    description:
      'Belirtilen dizinde dosya arar. Kullanıcının ev dizini ile sınırlıdır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        directory: {
          type: Type.STRING,
          description:
            'Arama yapılacak dizin (masaustu, indirilenler, belgeler, resimler, videolar, muzik veya tam yol).',
        },
        pattern: {
          type: Type.STRING,
          description: 'Aranacak dosya deseni (örn: *.pdf, rapor*, *.docx).',
        },
      },
      required: ['directory', 'pattern'],
    },
  },
  {
    name: 'open_file',
    description:
      'Bir dosyayı varsayılan uygulamayla açar. Kullanıcının ev dizini ile sınırlıdır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: {
          type: Type.STRING,
          description: 'Açılacak dosyanın yolu (tam yol veya ev dizinine göre).',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'create_folder',
    description:
      'Belirtilen konumda yeni bir klasör oluşturur. Kullanıcının ev dizini ile sınırlıdır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        directory: {
          type: Type.STRING,
          description: 'Klasörün oluşturulacağı üst dizin (masaustu, belgeler vb.).',
        },
        name: {
          type: Type.STRING,
          description: 'Oluşturulacak klasörün adı.',
        },
      },
      required: ['directory', 'name'],
    },
  },
];
