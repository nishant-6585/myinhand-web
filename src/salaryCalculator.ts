export type PfType = "PERCENTAGE" | "FIXED";

export interface SalaryInput {
  annualCtc: number;
  basicPercent: number; // 0–40
  pfType: PfType;
  pfValue: number; // % or fixed amount
}

export interface SalaryOutput {
  monthlyCtc: number | null;
  monthlyBasic: number | null;
  employeePf: number | null;
  employerPf: number | null;
}

export function calculateSalary(input: SalaryInput): SalaryOutput {
  const { annualCtc, basicPercent, pfType, pfValue } = input;

  if (annualCtc <= 0 || basicPercent < 0 || basicPercent > 50) {
    return {
      monthlyCtc: null,
      monthlyBasic: null,
      employeePf: null,
      employerPf: null,
    };
  }

  const monthlyCtc = annualCtc / 12;
  const monthlyBasic = (annualCtc * (basicPercent / 100)) / 12;

  // Employee PF calculation (capped at 12% of Basic)
  let employeePf: number | null = null;
  const maxPf = monthlyBasic * 0.12;

  if (pfValue >= 0) {
    if (pfType === "PERCENTAGE") {
      const calculated = monthlyBasic * (pfValue / 100);
      employeePf = Math.min(calculated, maxPf);
    }

    if (pfType === "FIXED") {
      employeePf = Math.min(pfValue, maxPf);
    }
  }

  // Employer PF mirrors Employee PF
  const employerPf = employeePf;

  return {
    monthlyCtc,
    monthlyBasic,
    employeePf,
    employerPf,
  };
}
