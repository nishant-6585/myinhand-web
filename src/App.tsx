import { useEffect, useRef, useState } from "react";
import { calculateSalary } from "./salaryCalculator";
import type { PfBase, PfType } from "./salaryCalculator";

function App() {
  const [ctc, setCtc] = useState("");
  const [basicPercent, setBasicPercent] = useState("40");

  const [pfBase, setPfBase] = useState<PfBase>("STATUTORY");
  const [pfType, setPfType] = useState<PfType>("PERCENTAGE");
  const [pfValue, setPfValue] = useState("");

  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Refs
  const ctcRef = useRef<HTMLInputElement>(null);
  const basicRef = useRef<HTMLSelectElement>(null);
  const pfBaseRef = useRef<HTMLSelectElement>(null);
  const pfTypeRef = useRef<HTMLSelectElement>(null);
  const pfValueRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus Annual CTC
  useEffect(() => {
    ctcRef.current?.focus();
    ctcRef.current?.select();
  }, []);

  const result = calculateSalary({
    annualCtc: Number(ctc),
    basicPercent: Number(basicPercent),
    pfBase,
    pfType,
    pfValue: Number(pfValue),
  });

  const handleSubmitFeedback = () => {
    if (!comment.trim()) return;
    setSubmitted(true);
    setComment("");
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: 4 }}>MyInHand</h1>
        <p style={{ color: "#666", marginTop: 0 }}>
          Understand your real take-home salary
        </p>

        <hr />

        <h3>Salary Details</h3>

        <div style={fieldStyle}>
          <div style={labelStyle}>Annual CTC (₹)</div>
          <input
            ref={ctcRef}
            type="number"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") basicRef.current?.focus();
            }}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>Basic Salary (% of CTC)</div>
          <select
            ref={basicRef}
            value={basicPercent}
            onChange={(e) => setBasicPercent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pfBaseRef.current?.focus();
            }}
            style={selectStyle}
          >
            {Array.from({ length: 21 }, (_, i) => {
              const value = 30 + i;
              return (
                <option key={value} value={value}>
                  {value}%
                </option>
              );
            })}
          </select>
        </div>

        <hr />

        <h3>Provident Fund</h3>

        <div style={fieldStyle}>
          <div style={labelStyle}>PF Calculation Base</div>
          <select
            ref={pfBaseRef}
            value={pfBase}
            onChange={(e) => setPfBase(e.target.value as PfBase)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pfTypeRef.current?.focus();
            }}
            style={selectStyle}
          >
            <option value="STATUTORY">Statutory (₹15,000 cap → ₹1,800)</option>
            <option value="FULL_BASIC">Full Basic (12% of actual Basic)</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>Employee PF Type</div>
          <select
            ref={pfTypeRef}
            value={pfType}
            onChange={(e) => setPfType(e.target.value as PfType)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pfValueRef.current?.focus();
            }}
            style={selectStyle}
          >
            <option value="PERCENTAGE">% of PF Wage</option>
            <option value="FIXED">Fixed Monthly Amount</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <div style={labelStyle}>
            {pfType === "PERCENTAGE"
              ? "Employee PF (%)"
              : "Employee PF Amount (₹ / month)"}
          </div>
          <input
            ref={pfValueRef}
            type="number"
            value={pfValue}
            onChange={(e) => setPfValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") feedbackRef.current?.focus();
            }}
            style={inputStyle}
          />
        </div>

        <hr />

        <h3>Results</h3>

        {result.monthlyCtc !== null && (
          <p>
            Monthly CTC: <strong>₹ {result.monthlyCtc.toFixed(2)}</strong>
          </p>
        )}

        {result.monthlyBasic !== null && (
          <p>
            Monthly Basic Salary:{" "}
            <strong>₹ {result.monthlyBasic.toFixed(2)}</strong>
          </p>
        )}

        {result.employeePf !== null && (
          <p>
            Employee PF: <strong>₹ {result.employeePf.toFixed(2)}</strong>
          </p>
        )}

        {result.employerPf !== null && (
          <p style={{ color: "#777" }}>
            Employer PF (not part of in-hand):{" "}
            <strong>₹ {result.employerPf.toFixed(2)}</strong>
          </p>
        )}

        {pfBase === "STATUTORY" && result.employeePf !== null && (
          <p style={{ fontSize: 12, color: "#999" }}>
            PF calculated on statutory wage cap of ₹15,000
          </p>
        )}

        <hr />

        <h3>Feedback</h3>

        <div style={fieldStyle}>
          <div style={labelStyle}>Your Feedback</div>
          <textarea
            ref={feedbackRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell us what can be improved…"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <button style={buttonStyle} onClick={handleSubmitFeedback}>
          Submit Feedback
        </button>

        {submitted && (
          <p style={{ color: "green", marginTop: 8 }}>
            Thank you for your feedback 🙏
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#f4f6f8",
  padding: "20px",
  display: "flex",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "720px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const fieldStyle: React.CSSProperties = {
  marginTop: "14px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#333",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
};

const buttonStyle: React.CSSProperties = {
  marginTop: "12px",
  padding: "12px 16px",
  backgroundColor: "#1976d2",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  width: "100%",
  fontSize: "15px",
};

export default App;
