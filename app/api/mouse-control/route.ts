import { NextResponse } from 'next/server';
import { getVirtualScreen } from '@/lib/mouse/mouse-control';
import { ensureMouseServer } from '@/lib/mouse/mouse-server';

ensureMouseServer();

export async function GET() {
  try {
    return NextResponse.json(getVirtualScreen());
  } catch (err) {
    return NextResponse.json(
      { x: 0, y: 0, width: 1920, height: 1080, error: String(err) },
      { status: 500 },
    );
  }
}
