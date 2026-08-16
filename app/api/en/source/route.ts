import type { NextRequest } from 'next/server';
import { handleSourcingPost } from '@/app/api/source/handler';

export { maxDuration } from '@/app/api/source/handler';

export async function POST(request: NextRequest) {
  return handleSourcingPost(request, 'en');
}
