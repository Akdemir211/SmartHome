import { Type, type FunctionDeclaration } from '@google/genai';

export const pcControlTools: FunctionDeclaration[] = [
  {
    name: 'open_application',
    description:
      'Bilgisayarda bir uygulama açar. Bilinen uygulamalar: chrome, firefox, edge, spotify, vscode, notepad, calculator, explorer, paint, word, excel, powerpoint, teams, discord, whatsapp, telegram, cmd, powershell, settings, store. Bunların dışında da herhangi bir uygulama adı verilebilir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Açılacak uygulamanın adı (bilinen kısayol adı veya tam uygulama adı).',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'close_application',
    description:
      'Bilgisayarda çalışan bir uygulamayı kapatır. Bilinen uygulama adı veya process adı verilebilir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Kapatılacak uygulamanın adı veya process adı.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'open_url',
    description:
      'Tarayıcıda bir URL açar. Web siteleri, arama sonuçları, haritalar vb. her türlü URL açılabilir. Şarkı/video için play_youtube kullan.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'Açılacak tam URL (https:// ile başlamalı).',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'play_youtube',
    description:
      'YouTube\'da bir şarkı, video veya içerik arar ve doğrudan ilk sonucu oynatır. Kullanıcı müzik dinlemek, video izlemek istediğinde bu aracı kullan. Arama sayfası değil, doğrudan video oynatılır.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Aranacak şarkı adı, sanatçı veya video başlığı. Örn: "Tarkan Kuzu Kuzu", "Ferhat Göçer Yıllarım"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'run_command',
    description:
      'Bilgisayarda bir CMD komutu çalıştırır ve çıktısını döndürür. Sistem bilgisi alma, ağ komutları, dosya işlemleri vb. için kullanılabilir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: {
          type: Type.STRING,
          description: 'Çalıştırılacak CMD komutu.',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'run_powershell',
    description:
      'Bilgisayarda bir PowerShell komutu çalıştırır ve çıktısını döndürür. Gelişmiş sistem yönetimi, bilgi sorgulama, otomasyon vb. için kullanılabilir.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: {
          type: Type.STRING,
          description: 'Çalıştırılacak PowerShell komutu.',
        },
      },
      required: ['command'],
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
      'Belirtilen dizinde dosya arar.',
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
      'Bir dosyayı varsayılan uygulamayla açar.',
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
      'Belirtilen konumda yeni bir klasör oluşturur.',
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
