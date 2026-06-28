type TemplateVars = Record<string, string | number>;

function baseLayout(title: string, body: string): string {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Pretendard,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#0D1B2A;padding:24px;color:#ffffff;">
                <div style="font-size:18px;font-weight:800;">GloSource AI</div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:4px;">중국·해외 공급자 후보 발굴과 RFQ 준비 도구</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e2e8f0;padding:18px 28px;font-size:12px;line-height:20px;color:#64748b;">
                GloSource AI는 납품, 결제, 물류를 대행하지 않습니다. 공급자 후보 발굴과 발주 전 판단 자료 정리를 지원합니다.<br />
                문의: glosourceai@gmail.com
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function welcomeEmail(vars: TemplateVars = {}): string {
  const name = vars.name || '고객';
  return baseLayout('GloSource AI 가입을 환영합니다', `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;color:#0D1B2A;">${name}님, 환영합니다.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#475569;">무료 5회 분석으로 중국·해외 공급자 후보를 찾고 RFQ 초안을 준비해보세요.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      <tr>
        <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
          <div style="font-size:13px;font-weight:800;color:#0D1B2A;">처음 시작할 작업</div>
          <ul style="margin:10px 0 0;padding-left:18px;font-size:13px;line-height:22px;color:#475569;">
            <li>제품명과 수량 입력</li>
            <li>1688, Baidu 爱采购, Alibaba 후보 비교</li>
            <li>영문·중문 RFQ 초안 복사</li>
          </ul>
        </td>
      </tr>
    </table>
    <a href="https://glosourceai.com/#sourcing-tool" style="display:inline-block;background:#EA580C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:10px;">첫 소싱 시작하기</a>
  `);
}

export function receiptEmail(vars: TemplateVars = {}): string {
  const plan = vars.plan || 'Pro';
  const amount = vars.amount || '490,000원';
  const date = vars.date || '2026-05-04';
  return baseLayout('GloSource AI 결제 영수증', `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;color:#0D1B2A;">결제가 완료되었습니다.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#475569;">아래 구독 결제 내역을 확인해주세요.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      ${[
        ['플랜', plan],
        ['결제 금액', amount],
        ['결제일', date],
        ['상태', '결제 완료'],
      ].map(([label, value]) => `
        <tr>
          <td style="width:120px;background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:12px;font-size:13px;font-weight:800;color:#64748b;">${label}</td>
          <td style="border-bottom:1px solid #e2e8f0;padding:12px;font-size:13px;color:#0f172a;">${value}</td>
        </tr>
      `).join('')}
    </table>
    <p style="margin:18px 0 0;font-size:12px;line-height:20px;color:#64748b;">세금계산서가 필요한 경우 사업자등록증과 담당자 이메일을 보내주세요.</p>
  `);
}

export function creditLowEmail(vars: TemplateVars = {}): string {
  const remaining = vars.remaining || 3;
  return baseLayout('GloSource AI 크레딧 소진 알림', `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;color:#0D1B2A;">남은 분석 크레딧이 ${remaining}회입니다.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#475569;">이번 달 소싱 분석 한도가 얼마 남지 않았습니다. 계속 사용하려면 플랜을 변경하거나 다음 갱신일을 확인해주세요.</p>
    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:20px 0;">
      <div style="font-size:13px;font-weight:800;color:#9a3412;">운영 팁</div>
      <p style="margin:8px 0 0;font-size:13px;line-height:22px;color:#9a3412;">반복 품목은 기존 PDF 리포트와 RFQ 초안을 재사용하면 분석 크레딧을 절약할 수 있습니다.</p>
    </div>
    <a href="https://glosourceai.com/billing" style="display:inline-block;background:#0D1B2A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:10px;">구독 관리 보기</a>
  `);
}

export function passwordResetEmail(vars: TemplateVars = {}): string {
  const link = String(vars.link || '#');
  return baseLayout('GloSource AI 비밀번호 재설정', `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;color:#0D1B2A;">비밀번호 재설정</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#475569;">아래 버튼을 클릭해 새 비밀번호를 설정하세요. 링크는 <strong>1시간</strong> 후 만료됩니다.</p>
    <a href="${link}" style="display:inline-block;background:#EA580C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:10px;">비밀번호 재설정하기</a>
    <p style="margin:20px 0 0;font-size:12px;line-height:20px;color:#64748b;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다. 비밀번호는 변경되지 않습니다.</p>
  `);
}

export function verifyEmailTemplate(vars: TemplateVars = {}): string {
  const link = String(vars.link || '#');
  const name = String(vars.name || '고객');
  return baseLayout('GloSource AI 이메일 인증', `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:32px;color:#0D1B2A;">${name}님, 이메일을 인증해주세요.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#475569;">아래 버튼을 클릭하면 이메일 인증이 완료됩니다.</p>
    <a href="${link}" style="display:inline-block;background:#0D1B2A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;padding:12px 18px;border-radius:10px;">이메일 인증하기</a>
    <p style="margin:20px 0 0;font-size:12px;line-height:20px;color:#64748b;">본인이 가입하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
  `);
}

export const emailTemplates = [
  { id: 'welcome', name: '가입 환영', subject: 'GloSource AI 가입을 환영합니다', html: welcomeEmail({ name: '홍길동' }) },
  { id: 'receipt', name: '결제 영수증', subject: '[GloSource AI] 결제 영수증', html: receiptEmail({ plan: 'Pro', amount: '490,000원', date: '2026-05-04' }) },
  { id: 'credit-low', name: '크레딧 소진 알림', subject: '[GloSource AI] 남은 분석 크레딧이 얼마 남지 않았습니다', html: creditLowEmail({ remaining: 3 }) },
];
