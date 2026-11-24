import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Plus,
  Copy,
  Check,
  Ban,
  Download,
  RefreshCw,
  Award,
  Activity,
  Building2,
  Users,
} from 'lucide-react';

interface AdminConsoleViewProps {
  onBack: () => void;
  isArabic?: boolean;
}

interface OrgRow {
  id: string;
  slug: string;
  name: string;
  max_seats: number;
}

interface VoucherRow {
  code: string;
  tier: string;
  org_slug: string | null;
  cohort_code: string | null;
  label: string | null;
  max_redemptions: number;
  redemption_count: number;
  valid_until: string | null;
  duration_days: number | null;
  revoked_at: string | null;
  created_at: string;
}

interface SeatRow {
  device_id: string;
  tier: string;
  cohort_code: string | null;
  label: string | null;
  display_name: string | null;
  activated_at: string;
  expires_at: string | null;
  org_slug: string | null;
}

interface HealthSnapshot {
  ok: boolean;
  version?: string;
  checks?: {
    supabase?: { ok: boolean; configured: boolean; latencyMs?: number };
    redis?: { ok: boolean; configured: boolean; latencyMs?: number };
  };
}

type PlanOption = 'monthly' | '3month' | 'lifetime' | 'trial' | 'academy_student' | 'academy_teacher';

export function AdminConsoleView({ onBack, isArabic: initialArabic = true }: AdminConsoleViewProps) {
  const [isArabic, setIsArabic] = useState(initialArabic);
  // Secret lives ONLY in React component memory — never written to localStorage or sessionStorage
  const [secretInput, setSecretInput] = useState('');
  const [sessionSecret, setSessionSecret] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [activeSeats, setActiveSeats] = useState<SeatRow[]>([]);
  const [cohortCount, setCohortCount] = useState(0);
  const [filterOrg, setFilterOrg] = useState('');

  // Bulk generator form
  const [plan, setPlan] = useState<PlanOption>('monthly');
  const [count, setCount] = useState(10);
  const [orgSlug, setOrgSlug] = useState('');
  const [cohortCode, setCohortCode] = useState('');
  const [label, setLabel] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(Date.now() + 7 * 86_400_000);
    return d.toISOString().slice(0, 10);
  });
  const [maxRedemptions, setMaxRedemptions] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Quick certificate issuer
  const [certStudent, setCertStudent] = useState('');
  const [certTrack, setCertTrack] = useState('Arabic → English Cognitive Bridge (CEFR B1)');
  const [certOrg, setCertOrg] = useState('');
  const [issuedCertCode, setIssuedCertCode] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: HealthSnapshot) => setHealth(data))
      .catch(() => setHealth({ ok: false }));
  }, []);

  const fetchDashboard = useCallback(
    async (secret: string, orgFilter = '') => {
      setLoading(true);
      setAuthError(null);
      try {
        const qs = orgFilter ? `?orgSlug=${encodeURIComponent(orgFilter)}` : '';
        const res = await fetch(`/api/admin/vouchers${qs}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${secret}` },
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          error?: string;
          organizations?: OrgRow[];
          vouchers?: VoucherRow[];
          activeSeats?: SeatRow[];
          cohortProgress?: unknown[];
        } | null;

        if (!res.ok || !data?.ok) {
          if (res.status === 401) {
            setSessionSecret(null);
            setAuthError(isArabic ? 'مفتاح الإدارة غير صحيح.' : 'Invalid admin secret.');
          } else {
            setAuthError(data?.error || 'Failed to load admin dashboard');
          }
          return false;
        }

        setOrgs(Array.isArray(data.organizations) ? data.organizations : []);
        setVouchers(Array.isArray(data.vouchers) ? data.vouchers : []);
        setActiveSeats(Array.isArray(data.activeSeats) ? data.activeSeats : []);
        setCohortCount(Array.isArray(data.cohortProgress) ? data.cohortProgress.length : 0);
        return true;
      } catch {
        setAuthError(isArabic ? 'تعذر الاتصال بالخادم.' : 'Unable to reach server.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isArabic]
  );

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = secretInput.trim();
    if (!trimmed) return;
    const ok = await fetchDashboard(trimmed, filterOrg);
    if (ok) {
      setSessionSecret(trimmed);
      setSecretInput('');
    }
  };

  const handleLock = () => {
    setSessionSecret(null);
    setSecretInput('');
    setVouchers([]);
    setActiveSeats([]);
    setGeneratedCodes([]);
    setIssuedCertCode(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionSecret) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const payload: Record<string, unknown> = {
        action: 'generate',
        plan,
        count: Math.max(1, Math.min(50, count)),
        maxRedemptions: Math.max(1, Math.min(1000, maxRedemptions)),
      };
      if (orgSlug) payload.orgSlug = orgSlug;
      if (cohortCode.trim()) payload.cohortCode = cohortCode.trim().toUpperCase();
      if (label.trim()) payload.label = label.trim();
      if (plan === 'trial' && validUntil) {
        payload.validUntil = new Date(`${validUntil}T23:59:59Z`).toISOString();
      }

      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionSecret}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        codes?: Array<{ code: string }>;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        setStatusMsg(`❌ ${data?.error || 'Generate failed'}`);
        return;
      }

      const list = (data.codes || []).map((c) => c.code);
      setGeneratedCodes(list);
      setStatusMsg(
        isArabic
          ? `✅ تم توليد ${list.length} كود بنجاح.`
          : `✅ Generated ${list.length} voucher code(s).`
      );
      await fetchDashboard(sessionSecret, filterOrg);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (code: string) => {
    if (!sessionSecret) return;
    if (
      !window.confirm(
        isArabic
          ? `هل تريد إلغاء الكود ${code} نهائياً وتعطيل الأجهزة المرتبطة به؟`
          : `Revoke voucher ${code} and expire linked seats?`
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionSecret}`,
        },
        body: JSON.stringify({ action: 'revoke', code }),
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        setStatusMsg(isArabic ? `🚫 تم إلغاء الكود ${code}.` : `🚫 Revoked ${code}.`);
        await fetchDashboard(sessionSecret, filterOrg);
      } else {
        setStatusMsg(`❌ ${data?.error || 'Revoke failed'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!sessionSecret) return;
    const qs = filterOrg
      ? `?format=csv&orgSlug=${encodeURIComponent(filterOrg)}`
      : '?format=csv';
    const res = await fetch(`/api/admin/vouchers${qs}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${sessionSecret}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      setStatusMsg(isArabic ? '❌ فشل تصدير ملف CSV.' : '❌ CSV export failed.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filterOrg ? `cohort-progress-${filterOrg}.csv` : 'cohort-progress.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionSecret || !certStudent.trim() || !certTrack.trim()) return;
    setLoading(true);
    setIssuedCertCode(null);
    try {
      const res = await fetch('/api/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionSecret}`,
        },
        body: JSON.stringify({
          studentName: certStudent.trim(),
          trackTitle: certTrack.trim(),
          orgSlug: certOrg || undefined,
        }),
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        certificate?: { cert_code: string };
        error?: string;
      } | null;
      if (res.ok && data?.ok && data.certificate?.cert_code) {
        setIssuedCertCode(data.certificate.cert_code);
        setCertStudent('');
      } else {
        setStatusMsg(`❌ ${data?.error || 'Certificate issue failed'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#0A0E13] text-[#EEF2F5] pb-16"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <header className="sticky top-0 z-30 bg-[#0A0E13]/95 backdrop-blur-md border-b border-stone-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 min-h-[40px] rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold hover:bg-stone-800 cursor-pointer"
            >
              ← {isArabic ? 'العودة' : 'Back'}
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-teal-400" />
              <div>
                <h1 className="text-sm sm:text-base font-black">
                  {isArabic ? 'لوحة المؤسس والمنظمات (v8.0)' : 'Founder & Org Console (v8.0)'}
                </h1>
                <p className="text-[11px] text-stone-400">
                  {isArabic ? 'إدارة الأكواد والمقاعد والشهادات بأمان كامل' : 'Secure vouchers, seats & verifiable certificates'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {health && (
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                  health.ok
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/15 text-red-300 border-red-500/30'
                }`}
              >
                <Activity size={12} />
                {health.ok ? 'API OK' : 'Degraded'}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsArabic((v) => !v)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold cursor-pointer"
            >
              {isArabic ? 'EN' : 'عربي'}
            </button>
            {sessionSecret && (
              <button
                type="button"
                onClick={handleLock}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={13} />
                {isArabic ? 'قفل الجلسة' : 'Lock'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {!sessionSecret ? (
          <form
            onSubmit={handleUnlock}
            className="max-w-md mx-auto mt-10 p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-base font-black">
                  {isArabic ? 'فتح لوحة الإدارة' : 'Unlock Admin Console'}
                </h2>
                <p className="text-xs text-stone-400">
                  {isArabic
                    ? 'يُحفظ المفتاح في ذاكرة الجلسة فقط ولا يُخزّن أبداً في المتصفح.'
                    : 'Secret stays in session memory only — never saved to localStorage.'}
                </p>
              </div>
            </div>

            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder={isArabic ? 'أدخل ADMIN_API_SECRET' : 'Enter ADMIN_API_SECRET'}
              autoComplete="off"
              className="w-full px-4 py-3 rounded-2xl bg-[#0A0E13] border border-stone-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              dir="ltr"
            />

            {authError && (
              <p className="text-xs font-bold text-red-400">{authError}</p>
            )}

            <button
              type="submit"
              disabled={loading || !secretInput.trim()}
              className="w-full py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-stone-950 font-black text-sm cursor-pointer transition"
            >
              {loading
                ? isArabic ? 'جاري التحقق...' : 'Verifying...'
                : isArabic ? 'دخول آمن' : 'Unlock Console'}
            </button>
          </form>
        ) : (
          <>
            {/* Stats & Org Filter Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Building2 size={13} /> {isArabic ? 'المنظمات' : 'Organizations'}
                </span>
                <span className="text-2xl font-black text-teal-300">{orgs.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Users size={13} /> {isArabic ? 'المقاعد النشطة' : 'Active Seats'}
                </span>
                <span className="text-2xl font-black text-emerald-300">{activeSeats.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400">
                  {isArabic ? 'إجمالي الأكواد' : 'Total Vouchers'}
                </span>
                <span className="text-2xl font-black text-amber-300">{vouchers.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <span className="text-[11px] text-stone-400">
                  {isArabic ? 'طلاب الدفعات' : 'Cohort Students'}
                </span>
                <span className="text-2xl font-black text-cyan-300">{cohortCount}</span>
              </div>
            </div>

            {/* Filter & CSV Export Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-bold text-stone-300">
                  {isArabic ? 'تصفية حسب المنظمة:' : 'Filter Organization:'}
                </label>
                <select
                  value={filterOrg}
                  onChange={(e) => {
                    const next = e.target.value;
                    setFilterOrg(next);
                    fetchDashboard(sessionSecret, next);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs font-bold text-white"
                >
                  <option value="">{isArabic ? 'الكل (عام + المنظمات)' : 'All Organizations'}</option>
                  {orgs.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.name} ({o.slug})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => fetchDashboard(sessionSecret, filterOrg)}
                  className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  {isArabic ? 'تحديث' : 'Refresh'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                {isArabic ? 'تصدير تقدم الدفعة (CSV)' : 'Export Cohort CSV'}
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-2xl bg-stone-900 border border-teal-500/40 text-xs font-bold text-teal-200">
                {statusMsg}
              </div>
            )}

            {/* 1-Click Bulk Voucher Generator */}
            <section className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
              <h2 className="text-sm font-black flex items-center gap-2">
                <Plus size={16} className="text-amber-400" />
                {isArabic ? 'توليد أكواد جماعي بضغطة واحدة (حتى 50 كود)' : '1-Click Bulk Voucher Generator (Up to 50)'}
              </h2>

              <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'الباقة' : 'Plan'}</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as PlanOption)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs font-bold text-white"
                  >
                    <option value="monthly">Monthly · 50 EGP (30d)</option>
                    <option value="3month">3-Month · 120 EGP (90d)</option>
                    <option value="lifetime">Lifetime · 299 EGP</option>
                    <option value="trial">Trial (Hard Valid Until)</option>
                    <option value="academy_student">Academy Student</option>
                    <option value="academy_teacher">Academy Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'العدد (1-50)' : 'Count (1-50)'}</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'المنظمة (اختياري)' : 'Organization (Optional)'}</label>
                  <select
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs font-bold text-white"
                  >
                    <option value="">{isArabic ? 'عام (بدون منظمة)' : 'Global (Direct)'}</option>
                    {orgs.map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'كود الدفعة (اختياري)' : 'Cohort Code (Optional)'}</label>
                  <input
                    type="text"
                    value={cohortCode}
                    onChange={(e) => setCohortCode(e.target.value)}
                    placeholder="ALAQSA-2026"
                    dir="ltr"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'المقاعد لكل كود' : 'Seats per Code'}</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs font-bold text-white"
                  />
                </div>

                {plan === 'trial' ? (
                  <div>
                    <label className="text-[11px] text-amber-300 block mb-1">
                      {isArabic ? 'تاريخ الانتهاء الصارم' : 'Hard Valid Until'}
                    </label>
                    <input
                      type="date"
                      required
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-amber-500/50 text-xs font-bold text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">{isArabic ? 'وصف مخصص' : 'Custom Label'}</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={isArabic ? 'دفعة نوفمبر' : 'November Batch'}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs text-white"
                    />
                  </div>
                )}

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs cursor-pointer transition"
                  >
                    {isArabic ? `توليد ${count} كود الآن` : `Generate ${count} Code(s)`}
                  </button>
                </div>
              </form>

              {generatedCodes.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0A0E13] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-300">
                      {isArabic ? 'الأكواد الجديدة الجاهزة للنسخ:' : 'Newly Generated Codes:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(generatedCodes.join('\n'), 'all')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'all' ? <Check size={13} /> : <Copy size={13} />}
                      {isArabic ? 'نسخ الكل' : 'Copy All'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" dir="ltr">
                    {generatedCodes.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => copyText(c, c)}
                        className="px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-700 hover:border-teal-400 font-mono text-xs text-teal-300 flex items-center justify-between gap-1 cursor-pointer"
                      >
                        <span className="truncate">{c}</span>
                        {copiedKey === c ? <Check size={12} className="text-emerald-400 shrink-0" /> : <Copy size={12} className="shrink-0 opacity-60" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Quick Verifiable Certificate Issuer */}
            <section className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
              <h2 className="text-sm font-black flex items-center gap-2">
                <Award size={16} className="text-cyan-400" />
                {isArabic ? 'إصدار شهادة موثّقة (TB-CERT)' : 'Issue Verifiable Certificate (TB-CERT)'}
              </h2>
              <form onSubmit={handleIssueCert} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={certStudent}
                  onChange={(e) => setCertStudent(e.target.value)}
                  placeholder={isArabic ? 'اسم الطالب بالكامل' : 'Student Full Name'}
                  className="px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={certTrack}
                  onChange={(e) => setCertTrack(e.target.value)}
                  placeholder={isArabic ? 'اسم المسار / الشهادة' : 'Track Title'}
                  className="px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={certOrg}
                    onChange={(e) => setCertOrg(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#0A0E13] border border-stone-700 text-xs text-white"
                  >
                    <option value="">{isArabic ? 'Thinking Bridge' : 'Thinking Bridge'}</option>
                    {orgs.map((o) => (
                      <option key={o.slug} value={o.slug}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-stone-950 font-black text-xs cursor-pointer shrink-0"
                  >
                    {isArabic ? 'إصدار' : 'Issue'}
                  </button>
                </div>
              </form>
              {issuedCertCode && (
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="font-mono font-black text-cyan-300" dir="ltr">
                    {issuedCertCode}
                  </span>
                  <a
                    href={`/verify/${encodeURIComponent(issuedCertCode)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 text-stone-950 font-black"
                  >
                    {isArabic ? 'فتح صفحة التحقق والطباعة ↗' : 'Open Verify & Print ↗'}
                  </a>
                </div>
              )}
            </section>

            {/* Vouchers Table with Revoke */}
            <section className="p-5 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
              <h2 className="text-sm font-black">
                {isArabic ? 'الأكواد الصادرة وإلغاء الأكواد المسربة' : 'Issued Vouchers & Leak Revocation'}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400">
                      <th className="py-2 px-2 text-start">{isArabic ? 'الكود' : 'Code'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'الباقة' : 'Tier'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'المنظمة' : 'Org'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'المقاعد' : 'Seats'}</th>
                      <th className="py-2 px-2 text-start">{isArabic ? 'الحالة' : 'Status'}</th>
                      <th className="py-2 px-2 text-end">{isArabic ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.slice(0, 60).map((v) => {
                      const isRevoked = Boolean(v.revoked_at);
                      const isExpired = Boolean(v.valid_until && Date.parse(v.valid_until) <= Date.now());
                      const isExhausted = v.redemption_count >= v.max_redemptions;
                      return (
                        <tr key={v.code} className="border-b border-stone-800/60">
                          <td className="py-2.5 px-2 font-mono font-bold text-teal-300" dir="ltr">
                            {v.code}
                          </td>
                          <td className="py-2.5 px-2 text-stone-300">{v.label || v.tier}</td>
                          <td className="py-2.5 px-2 text-stone-400">{v.org_slug || '—'}</td>
                          <td className="py-2.5 px-2 font-mono">
                            {v.redemption_count}/{v.max_redemptions}
                          </td>
                          <td className="py-2.5 px-2">
                            {isRevoked ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
                                {isArabic ? 'ملغي' : 'Revoked'}
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 font-bold">
                                {isArabic ? 'منتهي' : 'Expired'}
                              </span>
                            ) : isExhausted ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                                {isArabic ? 'مستخدم' : 'Used'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                                {isArabic ? 'نشط' : 'Active'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => copyText(v.code, v.code)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                                title="Copy"
                              >
                                {copiedKey === v.code ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                              {!isRevoked && (
                                <button
                                  type="button"
                                  onClick={() => handleRevoke(v.code)}
                                  className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Ban size={12} />
                                  {isArabic ? 'إلغاء' : 'Revoke'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {vouchers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-stone-500">
                          {isArabic ? 'لا توجد أكواد بعد.' : 'No vouchers yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
