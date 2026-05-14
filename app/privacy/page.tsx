import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — GloSource AI',
  description: 'GloSource AI Privacy Policy. How we collect, use, and protect your data. GDPR rights and data deletion requests.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#EA580C] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">G</span>
            </div>
            <span className="font-black text-white text-sm">GloSource AI</span>
          </Link>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-white font-semibold">Privacy</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-12">
          Last updated: May 15, 2026 · 최종 업데이트: 2026년 5월 15일
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-slate-300">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Who We Are</h2>
            <p>
              GloSource AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the sourcing research tool at glosource-ai.vercel.app.
              Questions about this policy can be sent to{' '}
              <a href="mailto:like2buyglobal@gmail.com" className="underline text-[#EA580C] hover:text-orange-400">
                like2buyglobal@gmail.com
              </a>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Data We Collect</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 pr-4 text-white font-semibold">Data</th>
                    <th className="text-left py-2 pr-4 text-white font-semibold">Why</th>
                    <th className="text-left py-2 text-white font-semibold">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4">Email address</td>
                    <td className="py-2 pr-4">Account creation, subscription management, support</td>
                    <td className="py-2">Until account deletion + 30 days</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Search queries</td>
                    <td className="py-2 pr-4">Delivering sourcing results, improving AI output quality</td>
                    <td className="py-2">12 months</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Usage logs (timestamp, result count)</td>
                    <td className="py-2 pr-4">Quota tracking, abuse prevention</td>
                    <td className="py-2">6 months</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Payment reference (not card data)</td>
                    <td className="py-2 pr-4">Subscription verification, refund processing</td>
                    <td className="py-2">5 years (legal requirement)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">IP address (anonymised)</td>
                    <td className="py-2 pr-4">Security, rate limiting</td>
                    <td className="py-2">90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> collect payment card numbers, passport or ID numbers, or sensitive personal data.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>To deliver sourcing search results via the Gemini API (Google).</li>
              <li>To manage your account, subscription, and quota.</li>
              <li>To send transactional emails (verification, password reset, subscription receipts).</li>
              <li>To improve the quality and accuracy of AI-generated supplier results.</li>
              <li>To detect and prevent abuse or fraud.</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> sell your personal data.
              We do <strong className="text-white">not</strong> use your data for advertising profiling.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We share data with the following processors solely to operate the Service:</p>
            <div className="space-y-3">
              {[
                { name: 'Google (Gemini API)', purpose: 'AI supplier analysis and search grounding — your search queries are processed to generate results. Google does not use these queries to train its models under its API terms.', location: 'US', policy: 'https://policies.google.com/privacy' },
                { name: 'Vercel', purpose: 'Hosting and serverless infrastructure', location: 'US / EU', policy: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Neon (PostgreSQL)', purpose: 'Account and usage log storage', location: 'US (AWS us-east-1)', policy: 'https://neon.tech/privacy' },
                { name: 'Resend', purpose: 'Transactional email delivery', location: 'US', policy: 'https://resend.com/legal/privacy-policy' },
              ].map(p => (
                <div key={p.name} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <p className="text-white font-semibold text-xs">{p.name} <span className="font-normal text-slate-400">— {p.location}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.purpose}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Cookies and Tracking</h2>
            <p className="mb-3">
              We use session cookies for authentication only. We do <strong className="text-white">not</strong> use
              advertising cookies, cross-site tracking pixels, or third-party analytics SDKs.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">
              Depending on your jurisdiction (including EU/EEA GDPR, UK GDPR, and Korean PIPA), you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 mb-3">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Rectification:</strong> Ask us to correct inaccurate data.</li>
              <li><strong className="text-white">Erasure (&ldquo;right to be forgotten&rdquo;):</strong> Request deletion of your account and associated data.</li>
              <li><strong className="text-white">Portability:</strong> Receive your search history in a machine-readable format (JSON or CSV).</li>
              <li><strong className="text-white">Restriction:</strong> Ask us to pause processing while a dispute is resolved.</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on our legitimate interests.</li>
            </ul>
            <p className="mb-3">
              To exercise any right, email{' '}
              <a href="mailto:like2buyglobal@gmail.com" className="underline text-[#EA580C] hover:text-orange-400">
                like2buyglobal@gmail.com
              </a>{' '}
              with the subject line <em>&ldquo;Privacy Request — [Your Right]&rdquo;</em>.
              We will respond within 30 days (GDPR standard).
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-slate-300">Supervisory authorities:</strong>{' '}
              EU/EEA users may lodge a complaint with their national data protection authority via{' '}
              <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="underline text-[#EA580C] hover:text-orange-400">edpb.europa.eu</a>.
              {' '}Korean users may contact the Personal Information Protection Commission at{' '}
              <a href="https://www.pipc.go.kr" target="_blank" rel="noopener noreferrer" className="underline text-[#EA580C] hover:text-orange-400">pipc.go.kr</a>.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Data Transfers</h2>
            <p>
              Your data is processed in the Republic of Korea and the United States (Vercel, Neon, Google).
              Transfers to the US are conducted under Standard Contractual Clauses (SCCs) or equivalent
              safeguards where required.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Children</h2>
            <p>
              The Service is not directed at children under 14. We do not knowingly collect personal data from
              children. If you believe we have inadvertently collected such data, please contact us for deletion.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy. We will notify you of material changes via email or an in-app notice.
              Continued use after 7 days from the notice constitutes acceptance.
            </p>
          </section>

          {/* Korean Summary */}
          <section className="border-t border-white/10 pt-10">
            <h2 className="text-lg font-bold text-white mb-3">한국어 요약 (Korean Summary)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 text-slate-300">
              <p><strong className="text-white">수집 데이터:</strong> 이메일, 검색 쿼리, 사용 로그, 결제 참조번호(카드번호 미수집)</p>
              <p><strong className="text-white">이용 목적:</strong> 소싱 결과 제공, 구독 관리, 서비스 개선. 광고 목적 제3자 제공 없음.</p>
              <p><strong className="text-white">제3자 처리자:</strong> Google(Gemini AI), Vercel(호스팅), Neon(DB), Resend(이메일)</p>
              <p><strong className="text-white">정보주체 권리:</strong> 열람·수정·삭제·이동·처리 정지 요청 가능. 이메일로 30일 내 처리.</p>
              <p><strong className="text-white">보존 기간:</strong> 계정 삭제 후 30일 내 이메일 삭제, 검색 기록 12개월, 결제 정보 5년(법적 의무)</p>
              <p><strong className="text-white">문의:</strong> like2buyglobal@gmail.com (제목: 개인정보 요청 — 요청 유형)</p>
            </div>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>© 2026 GloSource AI</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-white hover:text-slate-300 transition-colors">Privacy</Link>
            <a href="mailto:like2buyglobal@gmail.com" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
