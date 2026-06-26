import { NextResponse } from 'next/server';

// SECURITY: this endpoint must NEVER return the long-lived GEMINI_API_KEY to the client.
// The previous version returned process.env.GEMINI_API_KEY to any unauthenticated caller,
// which let anyone exfiltrate the key (it also powers /api/source, /api/translate, etc.) and
// rack up unbounded billing. Live voice needs a short-lived EPHEMERAL token minted server-side
// (Gemini Live ephemeral auth). Until that is implemented, live mode is disabled and the client
// falls back to Demo mode — no secret ever leaves the server.
export async function GET() {
  return NextResponse.json(
    {
      error: 'voice_live_not_enabled',
      message: 'Live voice is not enabled yet. Use Demo mode. (Server must mint an ephemeral token; the API key is never sent to the browser.)',
    },
    { status: 501 },
  );
}
