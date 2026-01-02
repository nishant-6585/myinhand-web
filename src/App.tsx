import React, { useEffect, useMemo, useRef, useState } from "react";

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

  console.log("APP TSX LOADED");

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

  // Auto-derive HRA (40% of Basic) initially
  useEffect(() => {
    setHra(Math.round(basic * 0.4));
  }, [basic]);

  const earningsWithoutSpecial =
    basic + hra + conveyance + meal + medical + phone;

  // Auto-balance Special Allowance until user edits it
  useEffect(() => {
    if (!isSpecialManual) {
      const autoSpecial = Math.max(monthlyCtc - earningsWithoutSpecial, 0);
      setSpecial(Math.round(autoSpecial));
    }
  }, [monthlyCtc, earningsWithoutSpecial, isSpecialManual]);

  const grossSalary = earningsWithoutSpecial + special;

  /* =========================
     Provident Fund (Derived)
  ========================= */
  const [pfType, setPfType] = useState<"STATUTORY" | "FULL_BASIC">("STATUTORY");

  const employeePf = pfType === "STATUTORY" ? 1800 : Math.round(basic * 0.12);

  /* =========================
     Other Deductions
  ========================= */
  const professionalTax = 200;
  const incomeTax = 30000; // placeholder (monthly)

  const totalDeductions = employeePf + professionalTax + incomeTax;

  const inHand = grossSalary - totalDeductions;

  /* =========================
     UI
  ========================= */
  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>MyInHand</h1>

        {/* -------- Salary Setup -------- */}
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

        {/* -------- Earnings -------- */}
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
            onChange={(v) => {
              setSpecial(v);
              setIsSpecialManual(true);
            }}
          />

          <TotalRow label="Total Earnings (A)" value={grossSalary} />
        </Section>

        {/* -------- Deductions -------- */}
        <Section title="Deductions">
          <Label text="Provident Fund (Employee)" />

          <select
            value={pfType}
            onChange={(e) =>
              setPfType(e.target.value as "STATUTORY" | "FULL_BASIC")
            }
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

        {/* -------- Summary -------- */}
        <Section title="Summary">
          <h2 style={net}>In-Hand Salary: ₹ {inHand.toFixed(0)}</h2>
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
  {
    value: string;
    onChange: (v: string) => void;
  }
>(({ value, onChange }, ref) => (
  <input
    ref={ref}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={input}
  />
));

const EditableRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div style={row}>
    <span style={{ color: "red" }}>EDITABLE → {label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={smallInput}
    />
  </div>
);

const Row = ({ label, value }: { label: string; value: number }) => (
  <div style={row}>
    <span>{label}</span>
    <strong>₹ {value.toFixed(0)}</strong>
  </div>
);

const TotalRow = ({ label, value }: { label: string; value: number }) => (
  <div style={totalRow}>
    <strong>{label}</strong>
    <strong>₹ {value.toFixed(0)}</strong>
  </div>
);

const Muted = ({ children }: { children: React.ReactNode }) => (
  <div style={muted}>{children}</div>
);

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

const title: React.CSSProperties = {
  marginBottom: 12,
};

const section: React.CSSProperties = {
  marginTop: 28,
  marginBottom: 12,
};

const label: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 4,
};

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
  color: "#0d47a1", // 🔑 text color (dark blue)
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

const net: React.CSSProperties = {
  color: "#2e7d32",
};
