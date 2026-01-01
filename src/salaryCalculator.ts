export type PfBase = "STATUTORY" | "FULL_BASIC";
export type PfType = "PERCENTAGE" | "FIXED";
export type TaxRegime = "OLD" | "NEW";

export interface SalaryInput {
  annualCtc: number;
  basicPercent: number;
  pfType: PfType;
  pfValue: number;
  pfBase: PfBase;
  taxRegime: TaxRegime;
}

export interface SalaryOutput {
  monthlyCtc: number;
  monthlyBasic: number;
  monthlyHra: number;
  monthlyGross: number;
  employeePf: number;
  employerPf: number;
  monthlyTax: number;
  monthlyInHand: number;
}

export function calculateSalary(input: SalaryInput): SalaryOutput {
  const { annualCtc, basicPercent, pfType, pfValue, pfBase, taxRegime } = input;

  const monthlyCtc = annualCtc / 12;
  const monthlyBasic = (annualCtc * basicPercent) / 100 / 12;
  const monthlyHra = monthlyBasic * 0.4;
  const monthlyGross = monthlyBasic + monthlyHra;

  // PF wage
  const pfWage =
    pfBase === "STATUTORY" ? Math.min(monthlyBasic, 15000) : monthlyBasic;

  const maxPf = pfWage * 0.12;

  let employeePf = 0;

  if (pfType === "PERCENTAGE") {
    employeePf = Math.min(pfWage * (pfValue / 100), maxPf);
  } else {
    employeePf = Math.min(pfValue, maxPf);
  }

  const employerPf = employeePf;

  // ---- TAX ----
  const standardDeduction = 50000;
  const taxableIncome = Math.max(annualCtc - standardDeduction, 0);

  let annualTax = 0;

  if (taxRegime === "OLD") {
    if (taxableIncome > 1000000) {
      annualTax += (taxableIncome - 1000000) * 0.3;
      annualTax += 500000 * 0.2;
      annualTax += 250000 * 0.05;
    } else if (taxableIncome > 500000) {
      annualTax += (taxableIncome - 500000) * 0.2;
      annualTax += 250000 * 0.05;
    } else if (taxableIncome > 250000) {
      annualTax += (taxableIncome - 250000) * 0.05;
    }
  } else {
    const slabs = [
      { limit: 300000, rate: 0.05 },
      { limit: 300000, rate: 0.1 },
      { limit: 300000, rate: 0.15 },
      { limit: 300000, rate: 0.2 },
      { limit: 300000, rate: 0.25 },
      { limit: Infinity, rate: 0.3 },
    ];

    let remaining = taxableIncome - 300000;

    for (const slab of slabs) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, slab.limit);
      annualTax += taxable * slab.rate;
      remaining -= taxable;
    }
  }

  annualTax *= 1.04; // cess
  const monthlyTax = annualTax / 12;

  const monthlyInHand = monthlyGross - employeePf - monthlyTax;

  return {
    monthlyCtc,
    monthlyBasic,
    monthlyHra,
    monthlyGross,
    employeePf,
    employerPf,
    monthlyTax,
    monthlyInHand,
  };
}
