import { useEffect, useRef, useState } from "react";
import { calculateSalary } from "./salaryCalculator";
import type { PfBase, PfType } from "./salaryCalculator";

export default function App() {
  const [ctc, setCtc] = useState("");
  const [basicPercent, setBasicPercent] = useState("40");
  const [pfBase, setPfBase] = useState<PfBase>("STATUTORY");
  const [pfType, setPfType] = useState<PfType>("FIXED");
  const [pfValue, setPfValue] = useState("1800");

  const ctcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ctcRef.current?.focus();
    ctcRef.current?.select();
  }, []);

  useEffect(() => {
    if (pfBase === "STATUTORY") {
      setPfType("FIXED");
      setPfValue("1800");
    } else {
      setPfType("PERCENTAGE");
      setPfValue("12");
    }
  }, [pfBase]);

  const hasCtc = Number(ctc) > 0;

  const commonInput = {
    annualCtc: Number(ctc),
    basicPercent: Number(basicPercent),
    pfBase,
    pfType,
    pfValue: Number(pfValue),
  };

  const oldResult = hasCtc
    ? calculateSalary({ ...commonInput, taxRegime: "OLD" })
    : null;

  const newResult = hasCtc
    ? calculateSalary({ ...commonInput, taxRegime: "NEW" })
    : null;

  const better =
    oldResult && newResult
      ? oldResult.monthlyInHand > newResult.monthlyInHand
        ? "OLD"
        : "NEW"
      : null;

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>MyInHand</h1>

        {/* Salary */}
        <section>
          <h3 style={sectionTitle}>Salary Details</h3>

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

        {/* PF */}
        <section>
          <h3 style={sectionTitle}>Provident Fund</h3>

          <div style={label}>PF Base</div>
          <select
            value={pfBase}
            onChange={(e) => setPfBase(e.target.value as PfBase)}
            style={input}
          >
            <option value="STATUTORY">Statutory (₹1,800)</option>
            <option value="FULL_BASIC">Full Basic (12%)</option>
          </select>

          <div style={label}>
            {pfType === "FIXED" ? "Employee PF (₹)" : "Employee PF (%)"}
          </div>
          <input
            value={pfValue}
            onChange={(e) => setPfValue(e.target.value)}
            style={input}
          />
        </section>

        {/* Results */}
        <section>
          <h3 style={sectionTitle}>In-Hand Comparison</h3>

          {!hasCtc && <p style={mutedText}>Enter Annual CTC to see results</p>}

          {hasCtc && oldResult && newResult && (
            <div style={grid}>
              <div
                style={{
                  ...box,
                  borderColor: better === "OLD" ? "#2e7d32" : "#ccc",
                }}
              >
                <h4 style={boxTitle}>Old Regime</h4>
                <p style={text}>
                  In-Hand: ₹{oldResult.monthlyInHand.toFixed(0)}
                </p>
                <p style={text}>Tax: ₹{oldResult.monthlyTax.toFixed(0)}</p>
              </div>

              <div
                style={{
                  ...box,
                  borderColor: better === "NEW" ? "#2e7d32" : "#ccc",
                }}
              >
                <h4 style={boxTitle}>New Regime</h4>
                <p style={text}>
                  In-Hand: ₹{newResult.monthlyInHand.toFixed(0)}
                </p>
                <p style={text}>Tax: ₹{newResult.monthlyTax.toFixed(0)}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

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
  background: "#ffffff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  color: "#111", // 🔑 FIX: force dark text for ALL children
};

const title: React.CSSProperties = {
  color: "#111",
};

const sectionTitle: React.CSSProperties = {
  marginTop: 24,
  marginBottom: 12,
  color: "#111",
};

const label: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 4,
  fontSize: 14,
  fontWeight: 600,
  color: "#222",
};

const text: React.CSSProperties = {
  color: "#111",
};

const mutedText: React.CSSProperties = {
  color: "#555",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 14,
  color: "#111",
  background: "#fff",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const box: React.CSSProperties = {
  padding: 16,
  border: "2px solid #ccc",
  borderRadius: 10,
};

const boxTitle: React.CSSProperties = {
  marginBottom: 8,
  color: "#111",
};
