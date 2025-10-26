import { useMemo, useState } from "react";
import AssumptionsSection from "./AssumptionsSection";
// Optional: if you have your install function + defaults, import them. Otherwise, fallback is used.
import { installationCostUSD, INSTALL_DEFAULTS } from "../utils/SolarCalculations";

interface Property {
  name: string;
  location: string;
  acreage: number;            // total acres
  usableAcreage?: number;     // optional, else 90% of total
  sunHours: number;           // peak-sun-hours/day (e.g., 5.2)
  gridDistance?: number;
}

const LIFETIME_YEARS = 25;

export function PropertyDetails({ property }: { property: Property | null }) {
  if (!property) {
    return (
      <div className="empty-state">
        <h3>Select a Property</h3>
        <p>Click a property to view details.</p>
      </div>
    );
  }

  // ── Sliders (local state) ─────────────────────────────────────────
  const [operationalExpenses, setOperationalExpenses] = useState<number>(350); // $/acre·yr
  const [electricityPrice, setElectricityPrice]     = useState<number>(0.11);  // $/kWh
  const [performanceRatioPct, setPerformanceRatioPct] = useState<number>(80);  // %
  const [systemDensityKWPerAcre, setSystemDensityKWPerAcre] = useState<number>(200); // kW/acre
  const [degradationPct, setDegradationPct] = useState<number>(0.5);           // %/yr (DS1)

  // ── Derived inputs ────────────────────────────────────────────────
  const usableAcres      = property.usableAcreage ?? property.acreage * 0.9;
  const performanceRatio = performanceRatioPct / 100;                // e.g., 80% → 0.80
  const densityMWPerAcre = systemDensityKWPerAcre / 1000;            // 200 kW/acre → 0.20 MW/acre
  const degrRate         = degradationPct / 100;                      // e.g., 0.5% → 0.005

  // ── Core lifetime calculations ────────────────────────────────────
  const calc = useMemo(() => {
    const mwDC = usableAcres * densityMWPerAcre;
    const kWhY1 = mwDC * 1000 * property.sunHours * 365 * performanceRatio;

    // Lifetime energy with degradation (geometric series):
    // sum_{t=1..N} kWhY1 * (1 - d)^(t-1) = kWhY1 * (1 - (1-d)^N) / d   (if d > 0)
    const lifetimeKWh = degrRate > 0
      ? kWhY1 * (1 - Math.pow(1 - degrRate, LIFETIME_YEARS)) / degrRate
      : kWhY1 * LIFETIME_YEARS;

    const lifetimeRevenue = lifetimeKWh * electricityPrice;

    // OpEx: constant per year (simple O1), multiplied by years
    const opexPerYear = usableAcres * operationalExpenses;
    const lifetimeOpEx = opexPerYear * LIFETIME_YEARS;

    // CapEx (fallback $1/Wdc if install function not used)
    const gridKm = property.gridDistance ?? 0;
    let capex = mwDC * 1_000_000 * 1.0; // $1/Wdc fallback
    // If you have your install fn + defaults, uncomment:
      const install = installationCostUSD({
      mwDC,
      gridDistanceKm: gridKm,
      install: INSTALL_DEFAULTS,
    });
    capex = install.total;

    const lifetimeNet = lifetimeRevenue - lifetimeOpEx - capex;

    // Payback: find smallest t with cumulative net >= CapEx
    // cumulativeNet(t) = sum_{i=1..t} (Revenue_i - OpEx)
    // Revenue_i = kWhY1 * (1-d)^(i-1) * price
    let cumulative = 0;
    let paybackYears: number = Infinity;
    for (let t = 1; t <= LIFETIME_YEARS; t++) {
      const kWh_t = kWhY1 * Math.pow(1 - degrRate, t - 1);
      const net_t = kWh_t * electricityPrice - opexPerYear;
      cumulative += net_t;
      if (cumulative >= capex) { paybackYears = t; break; }
    }

    const lifetimeRoiPct = capex > 0 ? (lifetimeNet / capex) * 100 : 0;

    // Capacity factor (approx): (sunHours * PR) / 24
    const capacityFactor = (property.sunHours * performanceRatio) / 24;

    return {
      mwDC,
      kWhY1,
      lifetimeKWh,
      lifetimeRevenue,
      lifetimeOpEx,
      lifetimeNet,
      capex,
      paybackYears,
      lifetimeRoiPct,
      capacityFactor,
    };
  }, [
    usableAcres,
    densityMWPerAcre,
    property.sunHours,
    performanceRatio,
    electricityPrice,
    operationalExpenses,
    degrRate,
    property.gridDistance,
  ]);

  // ── UI ────────────────────────────────────────────────────────────
  return (
    <div className="property-details">
      {/* Assumptions (S2) */}
      <AssumptionsSection
        operationalExpenses={operationalExpenses}
        setOperationalExpenses={setOperationalExpenses}
        electricityPrice={electricityPrice}
        setElectricityPrice={setElectricityPrice}
        performanceRatioPct={performanceRatioPct}
        setPerformanceRatioPct={setPerformanceRatioPct}
        systemDensityKWPerAcre={systemDensityKWPerAcre}
        setSystemDensityKWPerAcre={setSystemDensityKWPerAcre}
        degradationPct={degradationPct}
        setDegradationPct={setDegradationPct}
      />

      {/* Profit Analysis (Lifetime) */}
      <section className="detail-card">
        <h3>Profit Analysis (Lifetime, 25 years)</h3>

        <div className="detail-row">
          <span className="detail-label">System Size</span>
          <span className="detail-value">{calc.mwDC.toFixed(2)} MWdc</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Capacity Factor</span>
          <span className="detail-value">{(calc.capacityFactor * 100).toFixed(1)}%</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Lifetime Energy</span>
          <span className="detail-value">{(calc.lifetimeKWh / 1e6).toFixed(2)} GWh</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Lifetime Revenue</span>
          <span className="detail-value">${fmtMoney(calc.lifetimeRevenue)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Lifetime OpEx</span>
          <span className="detail-value">${fmtMoney(calc.lifetimeOpEx)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">CapEx (Install)</span>
          <span className="detail-value">${fmtMoney(calc.capex)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Lifetime Net Profit</span>
          <span className="detail-value">${fmtMoney(calc.lifetimeNet)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Payback</span>
          <span className="detail-value">
            {Number.isFinite(calc.paybackYears) ? `${calc.paybackYears} years` : "—"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Lifetime ROI</span>
          <span className="detail-value">
            {Number.isFinite(calc.lifetimeRoiPct) ? `${calc.lifetimeRoiPct.toFixed(1)}%` : "—"}
          </span>
        </div>
      </section>
    </div>
  );
}

// helpers
function fmtMoney(n: number) { return Math.round(n).toLocaleString(); }
function fmtInt(n: number)   { return Math.round(n).toLocaleString(); }
