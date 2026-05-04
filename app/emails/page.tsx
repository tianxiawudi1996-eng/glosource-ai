import PortalShell from '../components/PortalShell';
import { emailTemplates } from './templates';

export default function EmailsPage() {
  return (
    <PortalShell active="emails" title="이메일 템플릿" subtitle="가입, 결제, 크레딧 알림에 사용하는 발송 문구를 확인합니다.">
      <div className="grid gap-6">
        {emailTemplates.map(template => (
          <section key={template.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#EA580C]">{template.name}</p>
                <h2 className="mt-1 text-lg font-black text-[#0D1B2A]">{template.subject}</h2>
              </div>
              <button className="w-fit rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">HTML 복사</button>
            </div>
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <div className="border-b border-slate-100 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
                <p className="text-sm font-black text-[#0D1B2A]">템플릿 변수</p>
                <div className="mt-4 space-y-2">
                  {[
                    ['name', '고객명'],
                    ['plan', '구독 플랜'],
                    ['amount', '결제 금액'],
                    ['remaining', '남은 크레딧'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex justify-between rounded-lg bg-white px-3 py-2 text-xs">
                      <span className="font-bold text-slate-500">{key}</span>
                      <span className="text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <iframe
                title={template.name}
                srcDoc={template.html}
                className="h-[520px] w-full bg-white"
              />
            </div>
          </section>
        ))}
      </div>
    </PortalShell>
  );
}
