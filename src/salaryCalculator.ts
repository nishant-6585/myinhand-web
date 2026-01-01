// ---------- Types ----------

export type EarningKey =
  | "BASIC"
  | "HRA"
  | "LTA"
  | "CONVEYANCE"
  | "MEAL"
  | "MEDICAL"
  | "PHONE"
  | "SPECIAL";

export type DeductionKey =
  | "PF"
  | "PROFESSIONAL_TAX"
  | "INCOME_TAX"
  | "INSURANCE"
  | "MEAL_DEDUCTION";

export interface Earning {
  key: EarningKey;
  label: string;
  amount: number;
}

export interface Deduction {
  key: DeductionKey;
  label: string;
  amount: number;
}

export interface PayrollInput {
  annualCtc: number;
  basicPercent: number;
  earnings: Earning[];
  deductions: Deduction[];
}

export interface PayrollOutput {
  earnings: Earning[];
  deductions: Deduction[];
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
}

// ---------- Core Engine ----------

export function calculatePayroll(input: PayrollInput): PayrollOutput {
  const monthlyCtc = input.annualCtc / 12;

  const earningsWithoutSpecial = input.earnings.filter(
    (e) => e.key !== "SPECIAL"
  );

  const earningsSum = earningsWithoutSpecial.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const specialAmount = Math.max(monthlyCtc - earningsSum, 0);

  const earnings: Earning[] = [
    ...earningsWithoutSpecial,
    {
      key: "SPECIAL",
      label: "Special / Consolidated Allowance",
      amount: specialAmount,
    },
  ];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  const totalDeductions = input.deductions.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  const netSalary = totalEarnings - totalDeductions;

  return {
    earnings,
    deductions: input.deductions,
    totalEarnings,
    totalDeductions,
    netSalary,
  };
}
