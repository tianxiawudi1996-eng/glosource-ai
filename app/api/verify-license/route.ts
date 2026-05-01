import { NextRequest, NextResponse } from 'next/server';
import { isValidLicenseKey, getPlanTier } from '../../lib/licenseAuth';

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { key?: string };
    const key = body.key?.trim() ?? null;

    if (!key) {
      return NextResponse.json({ valid: false, error: '라이선스 키를 입력해주세요.' });
    }

    if (isValidLicenseKey(key)) {
      return NextResponse.json({ valid: true, plan: getPlanTier(key) });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error('[verify-license]', error);
    return NextResponse.json({ valid: false, error: '검증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
