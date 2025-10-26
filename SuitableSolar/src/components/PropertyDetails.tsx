import { useState, useMemo } from "react";
import AssumptionsSection from "./AssumptionsSection";
// If you have these from your earlier solar.ts:
import { installationCostUSD, INSTALL_DEFAULTS } from "../utils/SolarCalculations";
// If not available, comment the import above and see fallback in code comments.

interface Property {
  name: string;
  location: string;
  acreage: number;          // total acres
  usableAcreage?: number;   // optional, else we use 90% of total
  sunHours: number;         // “peak sun hours” per day (e.g., 5.2)
  gridDistanceKm?: number;  // optional, affects interconnect cost if you use it
  price?: number;           // if you show it elsewhere
}

export function PropertyDetails({ property }: { property: Property | null }) {
  if (!property) {
    return (
      <div className="empty-state">
        <h3>Select a Property</h3>
        <p>Click a property to view details.</p>
      </div>
    );
  }

  // ── Assumption sliders (live, local) ─────────────────────────────
  const [operationalExpenses, setOperationalExpenses] = useState<number>(350); // $/acre·yr
  const [electricityPrice, setElectricityPrice] = useState<number>(0.11);      // $/kWh
  const [performanceRatioPct, setPerformanceRatioPct] = useState<number>(80);  // %
  const [systemDensityKWPerAcre, setSystemDensityKWPerAcre] = useState<number>(200); // kW/acre

  // ── Derived values for the math ──────────────────────────────────
  const usableAcres = property.usableAcreage ?? property.acreage * 0.9;
  const performanceRatio = performanceRatioPct / 100;           // 80% → 0.80
  const densityMWPerAcre = systemDensityKWPerAcre / 1000;       // 200 kW/acre → 0.20 MW/acre

  // ── Core calculations (Year 1 simple model) ──────────────────────
  const calc = useMemo(() => {
    const mwDC = usableAcres * densityMWPerAcre;

    // Year-1 energy (kWh): MWdc → kW * sunHours/day * 365 * PR
    const kWhYear1 = mwDC * 1000 * property.sunHours * 365 * performanceRatio;

    // Revenue Year-1
    const revenueY1 = kWhYear1 * electricityPrice;

    // OpEx Year-1 (O1: simple per-acre)
    const opexY1 = usableAcres * operationalExpenses;

    // CapEx (use your existing breakdown if available)
    const gridKm = property.gridDistanceKm ?? 0;
    let capex = mwDC * 1_000_000 * 1.0; // fallback $1/Wdc if you don't import installationCostUSD
    try {
      // Prefer your install function for realism (if imported)
      const install = installationCostUSD({
        mwDC,
        gridDistanceKm: gridKm,
        install: INSTALL_DEFAULTS,
      });
      capex = install.total;
    } catch (_) {
      // keep fallback
    }

    const netY1 = revenueY1 - opexY1;
    const paybackYears = netY1 > 0 ? capex / netY1 : Infinity;
    const roiY1Pct = netY1 > 0 ? (netY1 / capex) * 100 : -Infinity;

    return {
      mwDC,
      kWhYear1,
      revenueY1,
      opexY1,
      netY1,
      capex,
      paybackYears,
      roiY1Pct,
      capacityFactor: (property.sunHours * performanceRatio) / 24, // rough CF
    };
  }, [
    usableAcres,
    densityMWPerAcre,
    property.sunHours,
    performanceRatio,
    electricityPrice,
    operationalExpenses,
    property.gridDistanceKm,
  ]);

  // ── UI ────────────────────────────────────────────────────────────
  return (
    <div className="property-details">
      <div className="detail-header-row">
        <h2 className="section-title">Property Details</h2>
      </div>

      <div className="detail-card">
        <h3>{property.name}</h3>
        <div className="detail-row">
          <span className="detail-label">Location</span>
          <span className="detail-value">{property.location}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Acreage</span>
          <span className="detail-value">{fmtInt(property.acreage)} acres</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Sun Hours</span>
          <span className="detail-value">{property.sunHours.toFixed(2)} h/day</span>
        </div>
      </div>

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
      />

      {/* Solar Output & ROI */}
      <section className="detail-card">
        <h3>Solar Output & ROI</h3>

        <div className="detail-row">
          <span className="detail-label">System Size</span>
          <span className="detail-value">{calc.mwDC.toFixed(2)} MWdc</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Capacity Factor</span>
          <span className="detail-value">{(calc.capacityFactor * 100).toFixed(1)}%</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Year-1 Energy</span>
          <span className="detail-value">{(calc.kWhYear1 / 1e6).toFixed(2)} GWh</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Year-1 Revenue</span>
          <span className="detail-value">${fmtMoney(calc.revenueY1)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">OpEx (Year-1)</span>
          <span className="detail-value">${fmtMoney(calc.opexY1)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Net (Year-1)</span>
          <span className="detail-value">${fmtMoney(calc.netY1)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">CapEx (Install)</span>
          <span className="detail-value">${fmtMoney(calc.capex)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Payback</span>
          <span className="detail-value">
            {Number.isFinite(calc.paybackYears) ? `${calc.paybackYears.toFixed(1)} years` : "—"}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">ROI (Year-1)</span>
          <span className="detail-value">
            {Number.isFinite(calc.roiY1Pct) ? `${calc.roiY1Pct.toFixed(1)}%` : "—"}
          </span>
        </div>
      </section>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────
function fmtMoney(n: number) {
  return Math.round(n).toLocaleString();
}
function fmtInt(n: number) {
  return Math.round(n).toLocaleString();
}
