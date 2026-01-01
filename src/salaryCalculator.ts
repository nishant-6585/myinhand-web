export type PfBase = "STATUTORY" | "FULL_BASIC";
export type PfType = "PERCENTAGE" | "FIXED";

export interface SalaryInput {
  annualCtc: number;
  basicPercent: number; // 30–50
  pfType: PfType;
  pfValue: number;
  pfBase: PfBase;
}

export interface SalaryOutput {
  monthlyCtc: number | null;
  monthlyBasic: number | null;
  employeePf: number | null;
  employerPf: number | null;
}

export function calculateSalary(input: SalaryInput): SalaryOutput {
  const { annualCtc, basicPercent, pfType, pfValue, pfBase } = input;

  if (annualCtc <= 0 || basicPercent < 30 || basicPercent > 50) {
    return {
      monthlyCtc: null,
      monthlyBasic: null,
      employeePf: null,
      employerPf: null,
    };
  }

  const monthlyCtc = annualCtc / 12;
  const monthlyBasic = (annualCtc * (basicPercent / 100)) / 12;

  let employeePf: number | null = null;

  const pfWage =
    pfBase === "STATUTORY" ? Math.min(monthlyBasic, 15000) : monthlyBasic;

  const maxPf = pfWage * 0.12;

  if (pfValue >= 0) {
    if (pfType === "PERCENTAGE") {
      const calculated = pfWage * (pfValue / 100);
      employeePf = Math.min(calculated, maxPf);
    }

    if (pfType === "FIXED") {
      employeePf = Math.min(pfValue, maxPf);
    }
  }

  const employerPf = employeePf;

  return {
    monthlyCtc,
    monthlyBasic,
    employeePf,
    employerPf,
  };
}
