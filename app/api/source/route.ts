import type { NextRequest } from 'next/server';
import { handleSourcingPost } from './handler';

export { maxDuration } from './handler';

export async function POST(request: NextRequest) {
  return handleSourcingPost(request, 'kr');
}
