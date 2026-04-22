import { NextResponse } from 'next/server';
import { openApplication, closeApplication, openUrl, runCommand, runPowerShell, playYoutube } from '@/lib/pc-control/app-launcher';
import {
  setVolume,
  muteVolume,
  lockComputer,
  shutdownComputer,
  restartComputer,
  sleepComputer,
  cancelShutdown,
} from '@/lib/pc-control/system-control';
import { searchFiles, openFile, createFolder } from '@/lib/pc-control/file-manager';

interface PcRequest {
  tool: string;
  args: Record<string, unknown>;
}

export async function POST(req: Request) {
  try {
    const { tool, args } = (await req.json()) as PcRequest;

    console.log(`[PC-CONTROL] ${tool}`, args);

    let result: { ok: boolean; message: string; data?: unknown };

    switch (tool) {
      case 'open_application':
        result = await openApplication(String(args.name ?? ''));
        break;
      case 'close_application':
        result = await closeApplication(String(args.name ?? ''));
        break;
      case 'open_url':
        result = await openUrl(String(args.url ?? ''));
        break;
      case 'play_youtube':
        result = await playYoutube(String(args.query ?? ''));
        break;
      case 'run_command':
        result = await runCommand(String(args.command ?? ''));
        break;
      case 'run_powershell':
        result = await runPowerShell(String(args.command ?? ''));
        break;
      case 'set_volume':
        result = await setVolume(Number(args.level ?? 50));
        break;
      case 'mute_volume':
        result = await muteVolume();
        break;
      case 'lock_computer':
        result = await lockComputer();
        break;
      case 'shutdown_computer':
        result = await shutdownComputer();
        break;
      case 'restart_computer':
        result = await restartComputer();
        break;
      case 'sleep_computer':
        result = await sleepComputer();
        break;
      case 'cancel_shutdown':
        result = await cancelShutdown();
        break;
      case 'search_files':
        result = await searchFiles(
          String(args.directory ?? ''),
          String(args.pattern ?? '*'),
        );
        break;
      case 'open_file':
        result = await openFile(String(args.file_path ?? ''));
        break;
      case 'create_folder':
        result = await createFolder(
          String(args.directory ?? ''),
          String(args.name ?? ''),
        );
        break;
      default:
        result = { ok: false, message: `Bilinmeyen PC komutu: ${tool}` };
    }

    console.log(`[PC-CONTROL] Sonuç:`, result);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[PC-CONTROL] Hata:', err);
    return NextResponse.json(
      { ok: false, message: 'Sunucu hatası' },
      { status: 500 },
    );
  }
}
