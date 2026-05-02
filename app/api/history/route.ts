import { NextRequest, NextResponse } from 'next/server';
import { kvGetHistory, kvClearHistory, kvSaveHistory, isKvConfigured } from '../../lib/kv';
import type { HistoryEntry } from '../../lib/kv';

export const maxDuration = 10;

const DEV_KEY = 'glosource-dev-2026';

function isDevAuthed(request: NextRequest): boolean {
  return request.headers.get('x-dev-key') === DEV_KEY;
}

export async function GET(request: NextRequest) {
  if (!isDevAuthed(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const history = await kvGetHistory();
  return NextResponse.json({
    success: true,
    data: history,
    source: isKvConfigured() ? 'kv' : 'kv_not_configured',
    count: history.length,
  });
}

export async function POST(request: NextRequest) {
  const entry = (await request.json()) as HistoryEntry;
  await kvSaveHistory(entry);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!isDevAuthed(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  await kvClearHistory();
  return NextResponse.json({ success: true });
}
