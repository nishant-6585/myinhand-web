import { useEffect, useRef, useState } from "react";
import { calculatePayroll } from "./salaryCalculator";
import type { Earning, Deduction } from "./salaryCalculator";

export default function App() {
  const [ctc, setCtc] = useState("");
  const [basicPercent, setBasicPercent] = useState("40");

  const ctcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ctcRef.current?.focus();
    ctcRef.current?.select();
  }, []);

  const annualCtc = Number(ctc);
  const monthlyCtc = annualCtc / 12;

  // ---- Auto-generated earnings ----
  const basic = monthlyCtc * (Number(basicPercent) / 100);

  const earnings: Earning[] = [
    { key: "BASIC", label: "Basic Salary", amount: basic },
    {
      key: "HRA",
      label: "House Rent Allowance",
      amount: basic * 0.4,
    },
    { key: "CONVEYANCE", label: "Conveyance", amount: 1600 },
    { key: "MEAL", label: "Meal Voucher", amount: 2200 },
    { key: "MEDICAL", label: "Medical Allowance", amount: 1250 },
    { key: "PHONE", label: "Phone / Internet", amount: 1500 },
  ];

  // ---- Deductions (v1 fixed / placeholder) ----
  const deductions: Deduction[] = [
    { key: "PF", label: "Provident Fund", amount: 1800 },
    {
      key: "PROFESSIONAL_TAX",
      label: "Professional Tax",
      amount: 200,
    },
    {
      key: "INCOME_TAX",
      label: "Income Tax",
      amount: annualCtc ? 30000 : 0,
    },
  ];

  const payroll =
    annualCtc > 0
      ? calculatePayroll({
          annualCtc,
          basicPercent: Number(basicPercent),
          earnings,
          deductions,
        })
      : null;

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>MyInHand</h1>

        {/* --- Inputs --- */}
        <section>
          <h3 style={section}>CTC Setup</h3>

          <div style={label}>Annual CTC</div>
          <input
            ref={ctcRef}
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            style={input}
          />

          <div style={label}>Basic (% of CTC)</div>
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
        </section>

        {/* --- Earnings --- */}
        {payroll && (
          <section>
            <h3 style={section}>Earnings</h3>

            {payroll.earnings.map((e) => (
              <div key={e.key} style={row}>
                <span>{e.label}</span>
                <span>₹ {e.amount.toFixed(0)}</span>
              </div>
            ))}

            <div style={totalRow}>
              <strong>Total Earnings (A)</strong>
              <strong>₹ {payroll.totalEarnings.toFixed(0)}</strong>
            </div>
          </section>
        )}

        {/* --- Deductions --- */}
        {payroll && (
          <section>
            <h3 style={section}>Deductions</h3>

            {payroll.deductions.map((d) => (
              <div key={d.key} style={row}>
                <span>{d.label}</span>
                <span>₹ {d.amount.toFixed(0)}</span>
              </div>
            ))}

            <div style={totalRow}>
              <strong>Total Deductions (B)</strong>
              <strong>₹ {payroll.totalDeductions.toFixed(0)}</strong>
            </div>
          </section>
        )}

        {/* --- Net Salary --- */}
        {payroll && (
          <section>
            <h2 style={net}>Net Salary: ₹ {payroll.netSalary.toFixed(0)}</h2>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f4f6f8",
  padding: 20,
  display: "flex",
  justifyContent: "center",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 760,
  background: "#fff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  color: "#111",
};

const title: React.CSSProperties = {
  marginBottom: 12,
};

const section: React.CSSProperties = {
  marginTop: 24,
  marginBottom: 8,
};

const label: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 4,
  fontWeight: 600,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
};

const totalRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  borderTop: "1px solid #ddd",
  marginTop: 8,
  paddingTop: 8,
};

const net: React.CSSProperties = {
  marginTop: 24,
  color: "#2e7d32",
};
