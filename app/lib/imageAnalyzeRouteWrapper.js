import { checkAuthAndQuota } from './authMiddleware';
import { POST as handleImageAnalysis, maxDuration } from '../api/source/image-analyze/handler';

export { maxDuration };

export async function POST(request) {
  const auth = await checkAuthAndQuota(request, 'image_analyze');
  if (!auth.ok) return auth.response;
  return handleImageAnalysis(request);
}
