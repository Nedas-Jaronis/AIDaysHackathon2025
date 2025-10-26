// Functions that calculate solar radiation

export type SolarAssumptions = {
    densityMWPerAcre: number;      // e.g. 0.20 fixed-tilt
    performanceRatio: number;      // e.g. 0.80
    degradation: number;           // e.g. 0.005 (0.5%/yr)
    costPerW: number;              // e.g. 1.00 $/Wdc
    opexPerKwYr: number;           // e.g. 15 $/kW-yr
    pricePerKWh: number;           // e.g. 0.11 $/kWh (PPA or wholesale)
    priceEscalation: number;       // e.g. 0.02 (2%/yr) or 0
    lifetimeYears: number;         // e.g. 25
    discountRate: number;          // e.g. 0.08 (8%) for NPV display
    interconnectAdderPerKm?: number; // e.g. 150000
};
  
export function systemSizeMW(usableAcres: number, densityMWPerAcre: number) {
    return usableAcres * densityMWPerAcre; // MWdc
}
  
export function year1EnergyKWh(
    mwDC: number,
    sunHoursPerDay: number,
    performanceRatio: number
) {
    return mwDC * 1000 * sunHoursPerDay * 365 * performanceRatio;
}
  
export function capexUSD(
    mwDC: number,
    costPerW: number,
    gridDistanceKm = 0,
    interconnectAdderPerKm = 0
) {
    const base = mwDC * 1_000_000 * costPerW;
    const interconnect = gridDistanceKm * interconnectAdderPerKm;
    return base + interconnect;
}
  
export function opexUSDPerYear(mwDC: number, opexPerKwYr: number) {
    return mwDC * 1000 * opexPerKwYr;
}
  
export function projectCashflows(params: {
    usableAcres: number;
    sunHoursPerDay: number;
    gridDistanceKm?: number;
    assumptions: SolarAssumptions;
}) {
    const {
      assumptions: A,
      usableAcres,
      sunHoursPerDay,
      gridDistanceKm = 0,
    } = params;
  
    const mwDC = systemSizeMW(usableAcres, A.densityMWPerAcre);
    const kWhY1 = year1EnergyKWh(mwDC, sunHoursPerDay, A.performanceRatio);
    const capex = capexUSD(mwDC, A.costPerW, gridDistanceKm, A.interconnectAdderPerKm ?? 0);
    const opex = opexUSDPerYear(mwDC, A.opexPerKwYr);
  
    const years = Array.from({ length: A.lifetimeYears }, (_, i) => i + 1);
  
    let price = A.pricePerKWh;
    const flows = years.map((t) => {
      const kWh_t = kWhY1 * Math.pow(1 - A.degradation, t - 1);
      if (t > 1) price = price * (1 + A.priceEscalation);
      const revenue = kWh_t * price;
      const net = revenue - opex;
      const discount = Math.pow(1 + A.discountRate, t);
      const npv = net / discount;
      return { year: t, kWh: kWh_t, pricePerKWh: price, revenue, opex, net, npv };
    });
  
    const npv = -capex + flows.reduce((s, f) => s + f.npv, 0);
    const year1 = flows[0];
    const paybackYears = year1.net > 0 ? capex / year1.net : Infinity;
    const roiYear1Pct = year1.net / capex * 100;
  
    return {
      mwDC,
      kWhYear1: kWhY1,
      capex,
      opexYear: opex,
      flows,
      npv,
      paybackYears,
      roiYear1Pct,
      capacityFactor: (sunHoursPerDay * A.performanceRatio) / 24,
    };
}
  

export type InstallCostAssumptions = {
    moduleCostPerW: number;       // e.g. 0.32
    inverterCostPerW: number;     // e.g. 0.07
    rackingCostPerW: number;      // e.g. 0.10
    wiringCostPerW: number;       // e.g. 0.15
    laborCostPerW: number;        // e.g. 0.15
    softCostPerW: number;         // e.g. 0.08
    interconnectPerKm: number;    // e.g. 150000
};

export function installationCostUSD(params: {
    mwDC: number;
    gridDistanceKm: number;
    install: InstallCostAssumptions;
  }) {
    const { mwDC, gridDistanceKm, install } = params;
    const watts = mwDC * 1_000_000;

    const costPerW =
        install.moduleCostPerW +
        install.inverterCostPerW +
        install.rackingCostPerW +
        install.wiringCostPerW +
        install.laborCostPerW +
        install.softCostPerW;

    const baseCost = watts * costPerW;
    const interconnectCost = gridDistanceKm * install.interconnectPerKm;

    return {
        total: baseCost + interconnectCost,
        breakdown: {
        baseCost,
        interconnectCost,
        costPerW
        }
    };
}

export type MaintenanceAssumptions = {
  opexPerKwYr: number;         // e.g. 15 $/kW-yr (base operations)
  inverterReservePerKwYr: number; // e.g. 4 $/kW-yr (future inverter replacements)
};

export function maintenanceCostUSD(params: {
  mwDC: number;
  acres: number;
  maint: MaintenanceAssumptions;
}) {
  const { mwDC, maint } = params;
  const kw = mwDC * 1000;

  const baseOpex = kw * maint.opexPerKwYr;
  const inverterReserve = kw * maint.inverterReservePerKwYr;

  return {
    total: baseOpex + inverterReserve,
    breakdown: {
      baseOpex,
      inverterReserve,
    }
  };
}

export const INSTALL_DEFAULTS = {
    moduleCostPerW: 0.32,
    inverterCostPerW: 0.07,
    rackingCostPerW: 0.10,
    wiringCostPerW: 0.15,
    laborCostPerW: 0.15,
    softCostPerW: 0.08,
    interconnectPerKm: 150_000,
};