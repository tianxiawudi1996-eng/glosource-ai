// Real-time 국세청 business-registration status check (data.go.kr odcloud nts-businessman).
// Confirms a government-registered firm is still an ACTIVE business (계속사업자) vs
// closed (폐업) / suspended (휴업). Same DATAGO_SERVICE_KEY as the other registries.
export interface NtsStatus {
  bizrno: string;
  registered: boolean;
  active: boolean;
  statusText: string;
  taxType: string | null;
}

interface NtsApiRow {
  b_no: string;
  b_stt?: string;
  b_stt_cd?: string;
  tax_type?: string;
}

// Batch-check business-registration numbers (up to 100 per call). Best-effort: any
// network/timeout/quota error yields no entry for that batch (never throws).
export async function checkBusinessStatus(bizrnos: (string | null | undefined)[]): Promise<Map<string, NtsStatus>> {
  const out = new Map<string, NtsStatus>();
  const key = process.env.DATAGO_SERVICE_KEY;
  if (!key) return out;
  const clean = [...new Set(bizrnos.map((b) => String(b || '').replace(/\D/g, '')).filter((b) => b.length === 10))];
  if (!clean.length) return out;
  for (let i = 0; i < clean.length; i += 100) {
    const batch = clean.slice(i, i + 100);
    try {
      const res = await fetch(`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b_no: batch }),
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) continue;
      const j = (await res.json()) as { data?: NtsApiRow[] };
      for (const d of j.data ?? []) {
        const registered = !!d.b_stt_cd && d.b_stt_cd.trim() !== '';
        out.set(d.b_no, {
          bizrno: d.b_no,
          registered,
          active: d.b_stt_cd === '01', // 01 = 계속사업자
          statusText: d.b_stt || '',
          taxType: d.tax_type || null,
        });
      }
    } catch { /* skip batch on error/timeout */ }
  }
  return out;
}
