import SliderField from "./SliderField";

type Props = {
  operationalExpenses: number;                 // $/acre·yr
  setOperationalExpenses: (v: number) => void;

  electricityPrice: number;                    // $/kWh
  setElectricityPrice: (v: number) => void;

  performanceRatioPct: number;                 // 70–90 (%)
  setPerformanceRatioPct: (v: number) => void;

  systemDensityKWPerAcre: number;              // 100–300 (kW/acre)
  setSystemDensityKWPerAcre: (v: number) => void;

  degradationPct: number;                      // 0.0–1.0 (%)
  setDegradationPct: (v: number) => void;
};

export default function AssumptionsSection(p: Props) {
  return (
    <section className="detail-card">
      <h3>Assumptions</h3>

      <SliderField
        label="Operational Expenses"
        min={200}
        max={1000}
        step={10}
        value={p.operationalExpenses}
        onChange={p.setOperationalExpenses}
        suffix=" $/acre·yr"
      />

      <SliderField
        label="Electricity Price"
        min={0.05}
        max={0.25}
        step={0.005}
        value={round(p.electricityPrice, 3)}
        onChange={p.setElectricityPrice}
        suffix=" $/kWh"
      />

      <SliderField
        label="Performance Ratio"
        min={70}
        max={90}
        step={1}
        value={p.performanceRatioPct}
        onChange={p.setPerformanceRatioPct}
        suffix="%"
      />

      <SliderField
        label="System Density"
        min={100}
        max={300}
        step={5}
        value={p.systemDensityKWPerAcre}
        onChange={p.setSystemDensityKWPerAcre}
        suffix=" kW/acre"
      />

      <SliderField
        label="Degradation"
        min={0.0}
        max={1.0}
        step={0.1}
        value={round(p.degradationPct, 1)}
        onChange={p.setDegradationPct}
        suffix="% /yr"
      />
    </section>
  );
}

function round(n: number, dp: number) {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
