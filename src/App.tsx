import React, { useEffect, useMemo, useRef, useState } from "react";

const FEEDBACK_API =
  "https://script.google.com/macros/s/AKfycbzqbgAHVUz2D51D0gOmPHhEHes4Xe7vb_sR1D4RPEci5LKY6P2Kg37BM_6Rcnmt/exec";

export default function App() {
  /* =========================
     Core Inputs
  ========================= */
  const [annualCtc, setAnnualCtc] = useState("3600000");
  const [basicPercent, setBasicPercent] = useState("48");

  const ctcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ctcRef.current?.focus();
    ctcRef.current?.select();
  }, []);

  const monthlyCtc = Number(annualCtc) / 12 || 0;

  const basic = useMemo(() => {
    return (monthlyCtc * Number(basicPercent)) / 100;
  }, [monthlyCtc, basicPercent]);

  /* =========================
     Allowances (Editable)
  ========================= */
  const [hra, setHra] = useState(0);
  const [conveyance, setConveyance] = useState(1600);
  const [meal, setMeal] = useState(2200);
  const [medical, setMedical] = useState(1250);
  const [phone, setPhone] = useState(1500);
  const [special, setSpecial] = useState(0);

  const [isSpecialManual, setIsSpecialManual] = useState(false);

  useEffect(() => {
    setHra(Math.round(basic * 0.4));
  }, [basic]);

  const earningsWithoutSpecial =
    basic + hra + conveyance + meal + medical + phone;

  useEffect(() => {
    if (!isSpecialManual) {
      const autoSpecial = Math.max(monthlyCtc - earningsWithoutSpecial, 0);
      setSpecial(Math.round(autoSpecial));
    }
  }, [monthlyCtc, earningsWithoutSpecial, isSpecialManual]);

  const grossSalary = earningsWithoutSpecial + special;

  /* =========================
     Provident Fund
  ========================= */
  const [pfType, setPfType] = useState<"STATUTORY" | "FULL_BASIC">("STATUTORY");
  const employeePf = pfType === "STATUTORY" ? 1800 : Math.round(basic * 0.12);

  /* =========================
     Other Deductions
  ========================= */
  const professionalTax = 200;
  const incomeTax = 30000;
  const totalDeductions = employeePf + professionalTax + incomeTax;
  const inHand = grossSalary - totalDeductions;

  /* =========================
     Feedback (Google Sheets)
  ========================= */
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackList, setFeedbackList] = useState<string[]>([]);

  useEffect(() => {
    fetch(FEEDBACK_API)
      .then((res) => res.json())
      .then((data) => {
        const texts = data.map((item: any) => item.feedback);
        setFeedbackList(texts.reverse());
      })
      .catch(console.error);
  }, []);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;

    await fetch(FEEDBACK_API, {
      method: "POST",
      body: JSON.stringify({
        feedback: feedbackText,
        userAgent: navigator.userAgent,
      }),
    });

    setFeedbackList((prev) => [feedbackText, ...prev]);
    setFeedbackText("");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>MyInHand</h1>

        <Section title="CTC Setup">
          <Label text="Annual CTC" />
          <Input ref={ctcRef} value={annualCtc} onChange={setAnnualCtc} />

          <Label text="Basic (% of CTC)" />
          <select
            value={basicPercent}
            onChange={(e) => setBasicPercent(e.target.value)}
            style={input}
          >
            {Array.from({ length: 21 }, (_, i) => {
              const v = 30 + i;
              return (
                <option key={v} value={v}>
                  {v}%
                </option>
              );
            })}
          </select>

          <Muted>Monthly Basic: ₹ {basic.toFixed(0)}</Muted>
        </Section>

        <Section title="Earnings">
          <Row label="Basic Salary" value={basic} />
          <EditableRow
            label="House Rent Allowance"
            value={hra}
            onChange={setHra}
          />
          <EditableRow
            label="Conveyance"
            value={conveyance}
            onChange={setConveyance}
          />
          <EditableRow label="Meal Voucher" value={meal} onChange={setMeal} />
          <EditableRow
            label="Medical Allowance"
            value={medical}
            onChange={setMedical}
          />
          <EditableRow
            label="Phone / Internet"
            value={phone}
            onChange={setPhone}
          />
          <EditableRow
            label="Special / Consolidated Allowance"
            value={special}
            onChange={(v: number) => {
              setSpecial(v);
              setIsSpecialManual(true);
            }}
          />
          <TotalRow label="Total Earnings (A)" value={grossSalary} />
        </Section>

        <Section title="Deductions">
          <Label text="Provident Fund (Employee)" />
          <select
            value={pfType}
            onChange={(e) => setPfType(e.target.value as any)}
            style={input}
          >
            <option value="STATUTORY">Statutory (₹1,800)</option>
            <option value="FULL_BASIC">12% of Full Basic</option>
          </select>

          <Row label="Employee PF" value={employeePf} />
          <Row label="Professional Tax" value={professionalTax} />
          <Row label="Income Tax (monthly)" value={incomeTax} />
          <TotalRow label="Total Deductions (B)" value={totalDeductions} />
        </Section>

        <Section title="Summary">
          <h2 style={net}>In-Hand Salary: ₹ {inHand.toFixed(0)}</h2>
        </Section>

        {/* -------- Feedback -------- */}
        <Section title="Feedback">
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share your feedback..."
            style={{
              width: "100%",
              minHeight: 80,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={submitFeedback}
            style={{
              marginTop: 10,
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Submit Feedback
          </button>

          <div style={{ marginTop: 20 }}>
            {feedbackList.map((fb, i) => (
              <div
                key={i}
                style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}
              >
                {fb}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* =========================
   Small UI Components
========================= */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h3 style={section}>{title}</h3>
    {children}
  </section>
);

const Label = ({ text }: { text: string }) => <div style={label}>{text}</div>;

const Input = React.forwardRef<
  HTMLInputElement,
  { value: string; onChange: (v: string) => void }
>(({ value, onChange }, ref) => (
  <input
    ref={ref}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={input}
  />
));

const EditableRow = ({ label, value, onChange }: any) => (
  <div style={row}>
    <span>{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={smallInput}
    />
  </div>
);

const Row = ({ label, value }: any) => (
  <div style={row}>
    <span>{label}</span>
    <strong>₹ {value.toFixed(0)}</strong>
  </div>
);

const TotalRow = ({ label, value }: any) => (
  <div style={totalRow}>
    <strong>{label}</strong>
    <strong>₹ {value.toFixed(0)}</strong>
  </div>
);

const Muted = ({ children }: any) => <div style={muted}>{children}</div>;

/* =========================
   Styles
========================= */

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6f8",
  padding: 20,
  display: "flex",
  justifyContent: "center",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 820,
  background: "#fff",
  padding: 28,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  color: "#111",
};

const title: React.CSSProperties = { marginBottom: 12 };
const section: React.CSSProperties = { marginTop: 28, marginBottom: 12 };
const label: React.CSSProperties = { fontWeight: 600, marginBottom: 4 };
const muted: React.CSSProperties = {
  fontSize: 13,
  color: "#555",
  marginTop: 6,
};
const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};
const smallInput: React.CSSProperties = {
  width: 160,
  padding: "6px 8px",
  borderRadius: 6,
  border: "2px solid #1976d2",
  background: "#e3f2fd",
  color: "#0d47a1",
  fontWeight: 600,
  textAlign: "right",
};
const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};
const totalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  borderTop: "1px solid #ddd",
  paddingTop: 8,
  marginTop: 8,
};
const net: React.CSSProperties = { color: "#2e7d32" };
