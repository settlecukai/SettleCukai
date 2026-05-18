import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
// Notion/Linear inspired: warm neutral base, subtle borders, clean type
const tokens = {
  light: {
    bg: "#FAFAF8",
    surface: "#FFFFFF",
    surfaceAlt: "#F5F5F3",
    border: "#E8E8E4",
    borderStrong: "#D4D4CE",
    text: "#1A1A18",
    textSub: "#6B6B67",
    textMuted: "#9C9C97",
    accent: "#2D6A4F",
    accentLight: "#EAF2EE",
    accentText: "#2D6A4F",
    amber: "#92400E",
    amberLight: "#FEF3C7",
    red: "#991B1B",
    redLight: "#FEE2E2",
    blue: "#1E3A5F",
    blueLight: "#EFF6FF",
  },
  dark: {
    bg: "#111110",
    surface: "#1C1C1A",
    surfaceAlt: "#242422",
    border: "#2E2E2B",
    borderStrong: "#3D3D3A",
    text: "#EEEEEC",
    textSub: "#8C8C87",
    textMuted: "#5C5C58",
    accent: "#4ADE80",
    accentLight: "#14291E",
    accentText: "#4ADE80",
    amber: "#FCD34D",
    amberLight: "#1F1A07",
    red: "#F87171",
    redLight: "#1F0707",
    blue: "#93C5FD",
    blueLight: "#071525",
  }
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MONTHLY = [
  { month: "Oct", income: 6200 },
  { month: "Nov", income: 7100 },
  { month: "Dec", income: 9800 },
  { month: "Jan", income: 5800 },
  { month: "Feb", income: 6400 },
  { month: "Mar", income: 7320 },
  { month: "Apr", income: 8020 },
];

const TAX_BRACKETS = [
  { min: 0, max: 5000, rate: 0 },
  { min: 5001, max: 20000, rate: 1 },
  { min: 20001, max: 35000, rate: 3 },
  { min: 35001, max: 50000, rate: 8 },
  { min: 50001, max: 70000, rate: 13 },
  { min: 70001, max: 100000, rate: 21 },
  { min: 100001, max: 400000, rate: 24 },
];

const AI_INSIGHTS = [
  { id: 1, urgency: "high", title: "Unclaimed Lifestyle Relief", desc: "You've spent RM 2,100 on eligible lifestyle items (books, gadgets, internet). Claiming the full RM 2,500 relief could reduce your tax by RM 500.", action: "Add Relief" },
  { id: 2, urgency: "medium", title: "Missing EPF Entry", desc: "Your EPF contribution for March 2025 appears to be unrecorded. This may affect your RM 4,000 EPF relief claim.", action: "Review" },
  { id: 3, urgency: "low", title: "Freelance Threshold Alert", desc: "Your freelance income is RM 2,020 away from the threshold requiring mandatory business income reporting.", action: "Learn More" },
  { id: 4, urgency: "medium", title: "Education Relief Available", desc: "HRDF-approved courses qualify for up to RM 7,000 deduction. You currently have RM 7,000 remaining unclaimed.", action: "Add Relief" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => `RM ${Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (n) => n >= 1000 ? `RM ${(n / 1000).toFixed(1)}k` : `RM ${n}`;

function calcTax(chargable) {
  let tax = 0, breakdown = [];
  for (const b of TAX_BRACKETS) {
    if (chargable <= b.min) break;
    const taxable = Math.min(chargable, b.max) - b.min;
    const t = (taxable * b.rate) / 100;
    breakdown.push({ ...b, taxable, tax: t });
    tax += t;
  }
  return { tax: Math.round(tax), breakdown };
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, style = {} }) => {
  const s = { display: "inline-block", flexShrink: 0, ...style };
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", style: s };
  const icons = {
    home: <svg {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    calc: <svg {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></svg>,
    chart: <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    brain: <svg {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.16"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.16"/></svg>,
    user: <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    sun: <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
    moon: <svg {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
    check: <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>,
    shield: <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    arrow: <svg {...props}><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    x: <svg {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    chevron: <svg {...props}><polyline points="9 18 15 12 9 6"/></svg>,
    info: <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    trending: <svg {...props}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    refresh: <svg {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
    gift: <svg {...props}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
  };
  return icons[name] || null;
};

// ─── TOGGLE ──────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, t }) => (
  <button onClick={() => onChange(!checked)} style={{
    position: "relative", display: "inline-flex", alignItems: "center",
    width: 40, height: 22, borderRadius: 99, border: "none", cursor: "pointer",
    background: checked ? t.accent : t.border, transition: "background 0.2s", flexShrink: 0,
  }}>
    <span style={{
      position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#fff",
      left: checked ? 20 : 4, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </button>
);

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
const MiniBar = ({ data, t, activeIndex }) => {
  const max = Math.max(...data.map(d => d.income));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, width: "100%" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: "100%", borderRadius: "3px 3px 0 0",
            height: `${(d.income / max) * 68}px`,
            background: i === (activeIndex ?? data.length - 1) ? t.accent : t.border,
            transition: "height 0.5s ease",
          }} />
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "inherit" }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
const Divider = ({ t }) => <div style={{ height: 1, background: t.border, margin: "16px 0" }} />;

// ─── CARD ────────────────────────────────────────────────────────────────────
const Card = ({ children, t, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12,
    padding: "20px", transition: "border-color 0.15s",
    cursor: onClick ? "pointer" : "default", ...style,
  }}>
    {children}
  </div>
);

// ─── LABEL ───────────────────────────────────────────────────────────────────
const Label = ({ children, t }) => (
  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted }}>
    {children}
  </span>
);

// ─── DISCLAIMER SCREEN ───────────────────────────────────────────────────────
const DisclaimerScreen = ({ onAgree, t, dark }) => {
  const [checked, setChecked] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => { setTimeout(() => setAnimate(true), 50); }, []);

  const permissions = [
    { icon: "📩", title: "Read financial notifications", desc: "SMS and app alerts from banks and e-wallets" },
    { icon: "🔒", title: "Read-only access", desc: "We never modify, transfer, or store raw credentials" },
    { icon: "🛡️", title: "Local processing only", desc: "Your data is processed on-device and never sold" },
    { icon: "🗑️", title: "Revoke anytime", desc: "Disconnect any source from Profile & Settings" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "inherit",
    }}>
      <div style={{
        maxWidth: 440, width: "100%",
        opacity: animate ? 1 : 0, transform: animate ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.4s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: t.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 22,
          }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, letterSpacing: "-0.02em" }}>Cybertax</h1>
          <p style={{ fontSize: 13, color: t.textSub, margin: "4px 0 0" }}>Malaysian Tax Assistant</p>
        </div>

        <Card t={t} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="shield" size={15} style={{ color: t.accentText }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 4px", letterSpacing: "-0.01em" }}>Before we begin</h2>
              <p style={{ fontSize: 13, color: t.textSub, margin: 0, lineHeight: 1.5 }}>
                To calculate your taxes automatically, Cybertax needs permission to read financial notifications from your connected apps.
              </p>
            </div>
          </div>

          <Divider t={t} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {permissions.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{p.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: "0 0 2px" }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: t.textMuted, margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Divider t={t} />

          {/* Legal note */}
          <div style={{ background: t.surfaceAlt, borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: t.textSub, margin: 0, lineHeight: 1.6 }}>
              By continuing, you agree that Cybertax may access your financial notification data solely for the purpose of tax estimation. This application is a personal tax planning tool and does not constitute official LHDN advice. Final tax submissions must be made via <strong style={{ color: t.text }}>MyTax (mytax.hasil.gov.my)</strong>.
            </p>
          </div>

          {/* Checkbox */}
          <button
            onClick={() => setChecked(c => !c)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
              background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16,
            }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
              border: `1.5px solid ${checked ? t.accent : t.borderStrong}`,
              background: checked ? t.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}>
              {checked && <Icon name="check" size={11} style={{ color: dark ? "#111" : "#fff" }} />}
            </div>
            <span style={{ fontSize: 13, color: t.textSub, textAlign: "left", lineHeight: 1.5 }}>
              I have read and agree to the above terms. I understand this is an estimation tool and not a substitute for professional tax advice.
            </span>
          </button>

          {/* CTA */}
          <button
            onClick={() => checked && onAgree()}
            style={{
              width: "100%", padding: "12px", borderRadius: 9, border: "none",
              background: checked ? t.accent : t.border,
              color: checked ? (dark ? "#111" : "#fff") : t.textMuted,
              fontSize: 14, fontWeight: 600, cursor: checked ? "pointer" : "not-allowed",
              transition: "all 0.2s", letterSpacing: "-0.01em",
            }}>
            Continue to Cybertax
          </button>
        </Card>

        <p style={{ fontSize: 11, color: t.textMuted, textAlign: "center" }}>
          Your data stays on your device. We do not sell your information.
        </p>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ t, dark, reliefs }) => {
  const [syncing, setSyncing] = useState(false);
  const totalIncome = 8020;
  const annualIncome = totalIncome * 12;
  const totalReliefs = Object.values(reliefs).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const chargable = Math.max(annualIncome - totalReliefs, 0);
  const { tax } = calcTax(chargable);
  const prevYearTax = tax * 1.08;
  const taxPaid = Math.round(tax * 0.67);
  const refund = Math.max(taxPaid - tax, 0);
  const owingBalance = Math.max(tax - taxPaid, 0);
  const effectiveRate = chargable > 0 ? ((tax / chargable) * 100).toFixed(1) : "0.0";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Good morning, Ahmad</h1>
          <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Assessment Year 2025 • Updated just now</p>
        </div>
        <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1800); }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
            border: `1px solid ${t.border}`, background: t.surface, color: t.textSub,
            fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
          }}>
          <Icon name="refresh" size={13} style={{ color: t.textSub, ...(syncing ? { animation: "spin 0.8s linear infinite" } : {}) }} />
          Sync
        </button>
      </div>

      {/* Primary stat — Tax Payable */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Estimated Tax Payable — AY 2025</Label>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'DM Mono', monospace" }}>
              {fmt(tax)}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 6 }}>
              Effective rate <span style={{ color: t.text, fontWeight: 600 }}>{effectiveRate}%</span> &nbsp;·&nbsp; Monthly <span style={{ color: t.text, fontWeight: 600 }}>{fmt(Math.round(tax / 12))}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 2 }}>vs last year</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: tax < prevYearTax ? t.accentText : t.red }}>
              {tax < prevYearTax ? "▼" : "▲"} {fmt(Math.abs(Math.round(tax - prevYearTax)))}
            </div>
          </div>
        </div>
      </Card>

      {/* Secondary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {/* Tax Refund */}
        <Card t={t} style={{ background: refund > 0 ? t.accentLight : t.surface, border: `1px solid ${refund > 0 ? t.accent + "40" : t.border}` }}>
          <Label t={t}>Est. Refund</Label>
          <div style={{ fontSize: 22, fontWeight: 700, color: refund > 0 ? t.accentText : t.text, letterSpacing: "-0.02em", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            {refund > 0 ? fmt(refund) : "—"}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
            {refund > 0 ? `Paid RM ${taxPaid.toLocaleString()} · surplus` : owingBalance > 0 ? `Balance due ${fmt(owingBalance)}` : "On track"}
          </div>
        </Card>

        {/* Total Income */}
        <Card t={t}>
          <Label t={t}>Annual Income</Label>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            {fmtK(annualIncome)}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
            <span style={{ color: t.accentText, fontWeight: 600 }}>↑ 8.4%</span> vs last month
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <Card t={t}>
          <Label t={t}>Total Reliefs</Label>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            {fmtK(totalReliefs)}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Applied deductions</div>
        </Card>
        <Card t={t}>
          <Label t={t}>Chargable Income</Label>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
            {fmtK(chargable)}
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>After all reliefs</div>
        </Card>
      </div>

      {/* Monthly chart */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <Label t={t}>Monthly Income</Label>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 2 }}>Oct 2024 – Apr 2025</div>
          </div>
          <div style={{ fontSize: 13, color: t.accentText, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="trending" size={13} style={{ color: t.accentText }} /> +12% avg
          </div>
        </div>
        <MiniBar data={MOCK_MONTHLY} t={t} />
      </Card>

      {/* Income breakdown */}
      <Card t={t}>
        <Label t={t}>Income Breakdown</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Employment", pct: 75, amount: Math.round(annualIncome * 0.75) },
            { label: "Freelance", pct: 20, amount: Math.round(annualIncome * 0.20) },
            { label: "Other", pct: 5, amount: Math.round(annualIncome * 0.05) },
          ].map((row, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: t.textSub }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "'DM Mono', monospace" }}>{fmt(row.amount)}</span>
              </div>
              <div style={{ height: 4, background: t.surfaceAlt, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${row.pct}%`, background: t.accent, borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── TAX CALCULATOR ──────────────────────────────────────────────────────────
const TaxCalculator = ({ t, dark, reliefs, setReliefs }) => {
  const totalIncome = 8020 * 12;
  const totalReliefs = Object.values(reliefs).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const chargable = Math.max(totalIncome - totalReliefs, 0);
  const { tax } = calcTax(chargable);

  const reliefFields = [
    { key: "epf", label: "EPF Contributions", max: 4000, icon: "🏦" },
    { key: "socso", label: "SOCSO", max: 350, icon: "🛡️" },
    { key: "education", label: "Education Fees", max: 7000, icon: "🎓" },
    { key: "medical", label: "Medical Expenses", max: 8000, icon: "🏥" },
    { key: "lifestyle", label: "Lifestyle Relief", max: 2500, icon: "🛍️" },
    { key: "insurance", label: "Life Insurance", max: 3000, icon: "📋" },
    { key: "childcare", label: "Child Relief", max: 2000, icon: "👶" },
    { key: "parents", label: "Parents Medical", max: 8000, icon: "👴" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Tax Calculator</h1>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Edit reliefs below — tax updates in real time</p>
      </div>

      {/* Live result */}
      <Card t={t} style={{ marginBottom: 20, background: t.accentLight, border: `1px solid ${t.accent}40` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Label t={t}>Tax Payable</Label>
            <div style={{ fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
              {fmt(tax)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Chargable</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace" }}>{fmtK(chargable)}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
              Rate: <span style={{ color: t.accentText, fontWeight: 600 }}>{chargable > 0 ? ((tax / chargable) * 100).toFixed(1) : "0.0"}%</span>
            </div>
          </div>
        </div>
        <Divider t={t} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: t.textSub }}>Total Income</span>
          <span style={{ color: t.text, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmt(totalIncome)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
          <span style={{ color: t.textSub }}>Less Reliefs</span>
          <span style={{ color: t.accentText, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>– {fmt(totalReliefs)}</span>
        </div>
      </Card>

      {/* Income sources */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Income Sources</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "💼 Employment Income", val: Math.round(totalIncome * 0.75) },
            { label: "🖥️ Freelance / Side Income", val: Math.round(totalIncome * 0.20) },
            { label: "📦 Other Income", val: Math.round(totalIncome * 0.05) },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: t.textSub }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "'DM Mono', monospace" }}>{fmt(row.val)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Relief fields */}
      <Card t={t}>
        <Label t={t}>Tax Reliefs</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {reliefFields.map(f => {
            const val = parseFloat(reliefs[f.key]) || 0;
            const pct = Math.min((val / f.max) * 100, 100);
            return (
              <div key={f.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: t.textSub }}>{f.icon} {f.label}</span>
                  <span style={{ fontSize: 11, color: t.textMuted }}>max {fmtK(f.max)}</span>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: t.textMuted, pointerEvents: "none" }}>RM</span>
                  <input
                    type="number"
                    value={reliefs[f.key] || ""}
                    onChange={e => setReliefs(r => ({ ...r, [f.key]: Math.min(parseFloat(e.target.value) || 0, f.max) }))}
                    placeholder="0"
                    style={{
                      width: "100%", padding: "9px 12px 9px 30px", borderRadius: 8, fontSize: 13,
                      border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text,
                      outline: "none", fontFamily: "'DM Mono', monospace", boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                  />
                </div>
                {val > 0 && (
                  <div style={{ height: 3, background: t.border, borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: t.accent, borderRadius: 99, transition: "width 0.4s" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ─── TAX BRACKETS ────────────────────────────────────────────────────────────
const TaxBracketsScreen = ({ t, dark, reliefs }) => {
  const totalIncome = 8020 * 12;
  const totalReliefs = Object.values(reliefs).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const chargable = Math.max(totalIncome - totalReliefs, 0);
  const { tax, breakdown } = calcTax(chargable);
  const activeBracket = TAX_BRACKETS.findIndex(b => chargable >= b.min && chargable <= b.max);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Tax Brackets</h1>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Malaysia progressive income tax — AY 2025</p>
      </div>

      {/* Current position */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Your Position</Label>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: t.textSub }}>Chargable income</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{fmt(chargable)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: t.textSub }}>Tax payable</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{fmt(tax)}</div>
          </div>
        </div>
      </Card>

      {/* Brackets */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Bracket Visualiser</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {TAX_BRACKETS.map((b, i) => {
            const isActive = i === activeBracket;
            const isPast = chargable > b.max;
            const bd = breakdown.find(x => x.min === b.min);
            const pct = bd ? Math.min(((chargable - b.min) / (b.max - b.min)) * 100, 100) : 0;

            return (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: 9,
                background: isActive ? t.accentLight : t.surfaceAlt,
                border: `1px solid ${isActive ? t.accent + "50" : "transparent"}`,
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: (isActive || isPast) ? 8 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.accent, flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, color: isActive ? t.accentText : (isPast ? t.textSub : t.textMuted) }}>
                      {fmt(b.min)} – {b.max >= 400000 ? "Above" : fmt(b.max)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? t.accentText : (isPast ? t.textSub : t.textMuted) }}>{b.rate}%</span>
                    {bd && bd.tax > 0 && <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{fmt(Math.round(bd.tax))}</span>}
                  </div>
                </div>
                {(isActive || isPast) && (
                  <div style={{ height: 3, background: t.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: isPast ? "100%" : `${pct}%`, background: isActive ? t.accent : t.borderStrong, borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step by step */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Step-by-Step Calculation</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {breakdown.filter(b => b.taxable > 0).map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: t.surfaceAlt, borderRadius: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.accentText }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: t.textMuted }}>{fmt(b.min)} – {fmt(b.max)} @ {b.rate}%</div>
                <div style={{ fontSize: 12, color: t.textSub, fontFamily: "'DM Mono', monospace" }}>
                  {fmt(b.taxable)} × {b.rate}% = <span style={{ color: t.text, fontWeight: 600 }}>{fmt(Math.round(b.tax))}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderTop: `1px solid ${t.border}`, marginTop: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Total Tax</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace" }}>{fmt(tax)}</span>
          </div>
        </div>
      </Card>

      {/* Quick facts */}
      <Card t={t}>
        <Label t={t}>Quick Facts</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Filing deadline", val: "30 April 2025" },
            { label: "Residency threshold", val: "182 days in Malaysia" },
            { label: "Non-resident rate", val: "30% flat (no reliefs)" },
            { label: "Submit via", val: "MyTax (LHDN)" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: t.textSub }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{row.val}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── AI INSIGHTS ─────────────────────────────────────────────────────────────
const AIInsightsScreen = ({ t }) => {
  const [dismissed, setDismissed] = useState([]);
  const visible = AI_INSIGHTS.filter(i => !dismissed.includes(i.id));

  const urgencyStyle = (u, t) => ({
    high: { bg: t.accentLight, border: t.accent + "40", dot: t.accentText, badge: t.accentText, badgeBg: t.accentLight },
    medium: { bg: t.amberLight, border: t.amber + "40", dot: t.amber, badge: t.amber, badgeBg: t.amberLight },
    low: { bg: t.surfaceAlt, border: t.border, dot: t.textMuted, badge: t.textMuted, badgeBg: t.surfaceAlt },
  }[u]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>AI Insights</h1>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Personalised recommendations based on your data</p>
      </div>

      {/* Summary banner */}
      <Card t={t} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>🧠</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Cybertax AI</div>
            <div style={{ fontSize: 13, color: t.textSub }}>
              Analysed 80 transactions · Found <strong style={{ color: t.accentText }}>{visible.length} insights</strong> · Potential savings up to <strong style={{ color: t.accentText }}>RM 1,200</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map(ins => {
          const s = urgencyStyle(ins.urgency, t);
          return (
            <div key={ins.id} style={{
              padding: 16, borderRadius: 12, background: s.bg, border: `1px solid ${s.border}`,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{ins.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: s.badge, background: s.badgeBg, padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {ins.urgency}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: t.textSub, margin: "0 0 10px", lineHeight: 1.5 }}>{ins.desc}</p>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
                    padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 600, color: s.dot,
                  }}>
                    {ins.action} <Icon name="arrow" size={12} style={{ color: s.dot }} />
                  </button>
                </div>
                <button onClick={() => setDismissed(d => [...d, ins.id])} style={{
                  background: "none", border: "none", cursor: "pointer", color: t.textMuted,
                  padding: 2, flexShrink: 0,
                }}>
                  <Icon name="x" size={14} style={{ color: t.textMuted }} />
                </button>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <Card t={t}>
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>All caught up</div>
              <div style={{ fontSize: 13, color: t.textMuted }}>No pending insights. We'll alert you when new opportunities arise.</div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
const ProfileScreen = ({ t, dark, setDark, setDisclaimerAccepted }) => {
  const [profile, setProfile] = useState({
    name: "Ahmad Razif bin Zainal",
    ic: "920312-14-5678",
    email: "ahmad.razif@email.com",
    residency: "resident",
    hasSpouse: true,
    children: 2,
    employerEPF: true,
  });

  const notifSettings = [
    { label: "Tax deadline reminders", sub: "30 April filing reminder", on: true },
    { label: "Income detected alerts", sub: "When new income is parsed", on: true },
    { label: "Monthly tax summary", sub: "Monthly estimated tax report", on: false },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: "0 0 2px", letterSpacing: "-0.02em" }}>Profile & Settings</h1>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Your tax identity and preferences</p>
      </div>

      {/* Avatar */}
      <Card t={t} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: t.accentText, flexShrink: 0 }}>AR</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: t.textMuted }}>IC: {profile.ic}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: t.accentText }} />
            <span style={{ fontSize: 11, color: t.accentText, fontWeight: 600 }}>Malaysian Tax Resident</span>
          </div>
        </div>
      </Card>

      {/* Personal details */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Personal Details</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {[{ label: "Full Name", val: profile.name, key: "name" }, { label: "Email", val: profile.email, key: "email" }].map(f => (
            <div key={f.key}>
              <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 5 }}>{f.label}</div>
              <input defaultValue={f.val} style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text,
                outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
              }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Tax settings */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Tax Settings</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 5 }}>Residency Status</div>
            <select value={profile.residency} onChange={e => setProfile(p => ({ ...p, residency: e.target.value }))} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
              border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: "none",
            }}>
              <option value="resident">Tax Resident (≥182 days)</option>
              <option value="non-resident">Non-Resident (30% flat)</option>
              <option value="pr">Permanent Resident</option>
            </select>
          </div>
          {[
            { key: "employerEPF", label: "EPF via employer" },
            { key: "hasSpouse", label: "Married (spouse relief eligible)" },
          ].map(f => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: t.textSub }}>{f.label}</span>
              <Toggle checked={profile[f.key]} onChange={v => setProfile(p => ({ ...p, [f.key]: v }))} t={t} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 5 }}>Number of Children</div>
            <input type="number" value={profile.children} min={0} max={20}
              onChange={e => setProfile(p => ({ ...p, children: parseInt(e.target.value) || 0 }))}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13, border: `1px solid ${t.border}`, background: t.surfaceAlt, color: t.text, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Notifications</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          {notifSettings.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{n.label}</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>{n.sub}</div>
              </div>
              <Toggle checked={n.on} onChange={() => { }} t={t} />
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card t={t} style={{ marginBottom: 12 }}>
        <Label t={t}>Appearance</Label>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <span style={{ fontSize: 13, color: t.textSub }}>Dark mode</span>
          <Toggle checked={dark} onChange={setDark} t={t} />
        </div>
      </Card>

      {/* Reset disclaimer */}
      <Card t={t}>
        <Label t={t}>Data & Privacy</Label>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setDisclaimerAccepted(false)} style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.border}`,
            background: "none", color: t.textSub, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
          }}>
            Review data access disclaimer
          </button>
          <button style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.redLight}`,
            background: "none", color: t.red, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left",
          }}>
            Revoke all data permissions
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("dashboard");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [reliefs, setReliefs] = useState({ epf: 4000, socso: 350, lifestyle: 1500 });

  const t = dark ? tokens.dark : tokens.light;

  const navItems = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "calculator", label: "Calculator", icon: "calc" },
    { id: "brackets", label: "Brackets", icon: "chart" },
    { id: "ai", label: "Insights", icon: "brain" },
    { id: "profile", label: "Profile", icon: "user" },
  ];

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <Dashboard t={t} dark={dark} reliefs={reliefs} />;
      case "calculator": return <TaxCalculator t={t} dark={dark} reliefs={reliefs} setReliefs={setReliefs} />;
      case "brackets": return <TaxBracketsScreen t={t} dark={dark} reliefs={reliefs} />;
      case "ai": return <AIInsightsScreen t={t} />;
      case "profile": return <ProfileScreen t={t} dark={dark} setDark={setDark} setDisclaimerAccepted={setDisclaimerAccepted} />;
      default: return null;
    }
  };

  if (!disclaimerAccepted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
          input[type=number] { -moz-appearance: textfield; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <DisclaimerScreen onAgree={() => setDisclaimerAccepted(true)} t={t} dark={dark} />
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        select { appearance: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.2); border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: t.bg, color: t.text, transition: "background 0.2s, color 0.2s" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* Sidebar — desktop */}
          <aside style={{
            width: 220, flexShrink: 0, position: "sticky", top: 0, height: "100vh",
            background: t.surface, borderRight: `1px solid ${t.border}`,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }} className="ct-sidebar">
            {/* Logo */}
            <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Cybertax</div>
                  <div style={{ fontSize: 10, color: t.accentText, fontWeight: 600, letterSpacing: "0.06em" }}>MALAYSIA</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setScreen(item.id)} style={{
                  display: "flex", alignItems: "center", gap: 9, width: "100%",
                  padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: screen === item.id ? t.accentLight : "transparent",
                  color: screen === item.id ? t.accentText : t.textSub,
                  fontSize: 13, fontWeight: screen === item.id ? 600 : 400,
                  marginBottom: 2, transition: "all 0.15s", textAlign: "left",
                }}>
                  <Icon name={item.icon} size={15} style={{ color: screen === item.id ? t.accentText : t.textMuted }} />
                  {item.label}
                  {item.id === "ai" && AI_INSIGHTS.length > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: t.accentText, background: t.accentLight, padding: "1px 6px", borderRadius: 99 }}>
                      {AI_INSIGHTS.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* AY badge */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.border}` }}>
              <div style={{ padding: "10px 12px", background: t.surfaceAlt, borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.accentText, marginBottom: 2 }}>AY 2025 • Resident</div>
                <div style={{ fontSize: 11, color: t.textMuted }}>Deadline: 30 Apr 2025</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            {/* Mobile header */}
            <header style={{
              display: "none", padding: "14px 16px",
              background: t.surface, borderBottom: `1px solid ${t.border}`,
              alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, zIndex: 20,
            }} className="ct-mobile-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Cybertax</span>
              </div>
              <button onClick={() => setDark(d => !d)} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSub }}>
                <Icon name={dark ? "sun" : "moon"} size={14} style={{ color: t.textSub }} />
              </button>
            </header>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px 100px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
              {renderScreen()}
            </div>

            {/* Mobile bottom nav */}
            <nav style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              background: t.surface, borderTop: `1px solid ${t.border}`,
              display: "none", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 20,
            }} className="ct-bottom-nav">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setScreen(item.id)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "10px 4px 8px", border: "none", background: "transparent", cursor: "pointer",
                  color: screen === item.id ? t.accentText : t.textMuted, transition: "color 0.15s", position: "relative",
                }}>
                  {screen === item.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 2, borderRadius: 99, background: t.accent }} />}
                  <Icon name={item.icon} size={17} style={{ color: screen === item.id ? t.accentText : t.textMuted }} />
                  <span style={{ fontSize: 9, fontWeight: screen === item.id ? 700 : 400 }}>{item.label}</span>
                </button>
              ))}
            </nav>
          </main>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ct-sidebar { display: none !important; }
          .ct-mobile-header { display: flex !important; }
          .ct-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}