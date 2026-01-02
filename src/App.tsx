import React, { useEffect, useMemo, useRef, useState } from "react";

const FEEDBACK_API =
  "https://script.google.com/macros/s/AKfycbx95gZM-aF_vZ2xiaIWPjuUZu7DMNpsjHoRI5WhveS_Gvw7UVWqJs9wUX3vpQmpf64/exec";

const LIKE_STORAGE_KEY = "myinhand_has_liked";

export default function App() {
  /* =========================
     Core Inputs
  ========================= */
  const [annualCtc, setAnnualCtc] = useState("");
  const [basicPercent, setBasicPercent] = useState("");

  const ctcRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ctcRef.current?.focus();
  }, []);

  const isCtcValid = Number(annualCtc) > 0;
  const isBasicValid = Number(basicPercent) > 0;

  const monthlyCtc = isCtcValid ? Number(annualCtc) / 12 : 0;

  const basic = useMemo(() => {
    if (!isCtcValid || !isBasicValid) return 0;
    return (monthlyCtc * Number(basicPercent)) / 100;
  }, [monthlyCtc, basicPercent, isCtcValid, isBasicValid]);

  /* =========================
     Allowances
  ========================= */
  const [hra, setHra] = useState(0);
  const [conveyance, setConveyance] = useState(1600);
  const [meal, setMeal] = useState(2200);
  const [medical, setMedical] = useState(1250);
  const [phone, setPhone] = useState(1500);
  const [special, setSpecial] = useState(0);
  const [isSpecialManual, setIsSpecialManual] = useState(false);

  useEffect(() => {
    if (basic > 0) setHra(Math.round(basic * 0.4));
  }, [basic]);

  const earningsWithoutSpecial =
    basic + hra + conveyance + meal + medical + phone;

  useEffect(() => {
    if (monthlyCtc > 0 && !isSpecialManual) {
      setSpecial(Math.max(monthlyCtc - earningsWithoutSpecial, 0));
    }
  }, [monthlyCtc, earningsWithoutSpecial, isSpecialManual]);

  const grossSalary = earningsWithoutSpecial + special;

  /* =========================
     Deductions
  ========================= */
  const [pfType, setPfType] = useState<"STATUTORY" | "FULL_BASIC">("STATUTORY");

  const employeePf =
    basic > 0 ? (pfType === "STATUTORY" ? 1800 : Math.round(basic * 0.12)) : 0;

  const professionalTax = basic > 0 ? 200 : 0;
  const incomeTax = basic > 0 ? 30000 : 0;

  const totalDeductions = employeePf + professionalTax + incomeTax;
  const inHand = grossSalary - totalDeductions;

  /* =========================
     Feedback + Likes
  ========================= */
  const [feedbackText, setFeedbackText] = useState("");
  const [username, setUsername] = useState("");
  const [feedbackList, setFeedbackList] = useState<
    { user: string; text: string; time: string }[]
  >([]);

  const [likes, setLikes] = useState(0);
  const hasLiked = localStorage.getItem(LIKE_STORAGE_KEY) === "true";

  useEffect(() => {
    // Load feedback
    fetch(`${FEEDBACK_API}?type=feedback`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setFeedbackList(
          data
            .map((f: any) => ({
              user: f.user || "Anonymous",
              text: f.feedback,
              time: new Date(f.timestamp).toLocaleString(),
            }))
            .reverse()
        );
      });

    // Load likes
    fetch(`${FEEDBACK_API}?type=likes`)
      .then((res) => res.json())
      .then((data) => setLikes(Number(data.likes) || 0));
  }, []);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;

    const params = new URLSearchParams({
      action: "feedback",
      feedback: feedbackText,
      user: username || "Anonymous",
    });

    await fetch(`${FEEDBACK_API}?${params.toString()}`);

    setFeedbackText("");
    setUsername("");

    const res = await fetch(`${FEEDBACK_API}?type=feedback`);
    const data = await res.json();
    if (!Array.isArray(data)) return;

    setFeedbackList(
      data
        .map((f: any) => ({
          user: f.user || "Anonymous",
          text: f.feedback,
          time: new Date(f.timestamp).toLocaleString(),
        }))
        .reverse()
    );
  };

  const handleLike = async () => {
    if (hasLiked) return;

    const res = await fetch(`${FEEDBACK_API}?action=like`);
    const data = await res.json();

    if (typeof data.likes === "number") {
      setLikes(data.likes);
      localStorage.setItem(LIKE_STORAGE_KEY, "true");
    }
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
            <option value="" disabled>
              Select Basic %
            </option>
            {Array.from({ length: 21 }, (_, i) => {
              const v = 30 + i;
              return (
                <option key={v} value={v}>
                  {v}%
                </option>
              );
            })}
          </select>

          {isCtcValid && isBasicValid && (
            <Muted>Monthly Basic: ₹ {basic.toFixed(0)}</Muted>
          )}
        </Section>

        <Section title="Earnings">
          <Row label="Basic Salary" value={basic} />
          <EditableRow label="HRA" value={hra} onChange={setHra} />
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
            label="Special Allowance"
            value={special}
            onChange={(v) => {
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

        <Section title="Summary">
          {isCtcValid && isBasicValid ? (
            <h2 style={net}>In-Hand Salary: ₹ {inHand.toFixed(0)}</h2>
          ) : (
            <Muted>Enter CTC and Basic % to see salary</Muted>
          )}
        </Section>

        {/* ---------- Feedback ---------- */}
        <Section title="Feedback">
          <Label text="Your Name (optional)" />
          <Input value={username} onChange={setUsername} />

          <Label text="Your Feedback" />
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            style={input}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button onClick={submitFeedback}>Submit Feedback</button>

            <button
              onClick={handleLike}
              disabled={hasLiked}
              style={{
                backgroundColor: hasLiked ? "#cfd8dc" : "#1976d2",
                color: hasLiked ? "#666" : "#fff",
                cursor: hasLiked ? "not-allowed" : "pointer",
                border: "none",
                padding: "8px 14px",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              👍 Like ({likes})
            </button>
          </div>

          {feedbackList.map((f, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <strong>{f.user}</strong> · {f.time}
              <div>{f.text}</div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

/* =========================
   Components & Styles
========================= */

const Section = ({ title, children }: any) => (
  <section>
    <h3 style={section}>{title}</h3>
    {children}
  </section>
);

const Label = ({ text }: any) => <div style={label}>{text}</div>;

const Input = React.forwardRef<HTMLInputElement, any>(
  ({ value, onChange }, ref) => (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={input}
    />
  )
);

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
const section: React.CSSProperties = { marginTop: 28 };
const label: React.CSSProperties = { fontWeight: 600, marginBottom: 4 };
const muted: React.CSSProperties = { fontSize: 13, color: "#555" };

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
