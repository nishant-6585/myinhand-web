import { useState } from "react";
import { calculateSalary } from "./salaryCalculator";

function App() {
  const [ctc, setCtc] = useState("");
  const [basicPercent, setBasicPercent] = useState("40");

  const [pfType, setPfType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [pfValue, setPfValue] = useState("");

  const result = calculateSalary({
    annualCtc: Number(ctc),
    basicPercent: Number(basicPercent),
    pfType,
    pfValue: Number(pfValue),
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>MyInHand</h1>
      <p>CTC to In-Hand Salary Calculator</p>

      {/* Annual CTC */}
      <div style={{ marginTop: "20px" }}>
        <label>
          Annual CTC:
          <input
            type="number"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      {/* Basic % */}
      <div style={{ marginTop: "10px" }}>
        <label>
          Basic Salary (% of CTC):
          <select
            value={basicPercent}
            onChange={(e) => setBasicPercent(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            {Array.from({ length: 21 }, (_, i) => {
              const value = 30 + i; // 30 to 50
              return (
                <option key={value} value={value}>
                  {value}%
                </option>
              );
            })}
          </select>
        </label>
      </div>

      {/* Outputs */}
      {result.monthlyCtc !== null && (
        <p style={{ marginTop: "20px" }}>
          Monthly CTC: <strong>₹ {result.monthlyCtc.toFixed(2)}</strong>
        </p>
      )}

      {result.monthlyBasic !== null && (
        <p>
          Monthly Basic Salary:{" "}
          <strong>₹ {result.monthlyBasic.toFixed(2)}</strong>
        </p>
      )}

      {/* PF Type */}
      <div style={{ marginTop: "10px" }}>
        <label>
          Employee PF Type:
          <select
            value={pfType}
            onChange={(e) =>
              setPfType(e.target.value as "PERCENTAGE" | "FIXED")
            }
            style={{ marginLeft: "10px" }}
          >
            <option value="PERCENTAGE">% of Basic</option>
            <option value="FIXED">Fixed Monthly Amount</option>
          </select>
        </label>
      </div>

      {/* PF Value */}
      <div style={{ marginTop: "10px" }}>
        <label>
          {pfType === "PERCENTAGE"
            ? "Employee PF (% of Basic, max 12%)"
            : "Employee PF Amount (₹ / month, max 12% of Basic)"}
          :
          <input
            type="number"
            value={pfValue}
            onChange={(e) => setPfValue(e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      {/* PF Outputs */}
      {result.employeePf !== null && (
        <p>
          Employee PF: <strong>₹ {result.employeePf.toFixed(2)}</strong>
        </p>
      )}

      {result.employerPf !== null && (
        <p style={{ color: "gray" }}>
          Employer PF (same as Employee PF, not part of in-hand):{" "}
          <strong>₹ {result.employerPf.toFixed(2)}</strong>
        </p>
      )}
    </div>
  );
}

export default App;
