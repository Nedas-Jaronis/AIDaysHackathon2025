type Props = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;         // e.g., "%", "$/kWh", "kW/acre"
  ariaLabel?: string;
};

export default function SliderField({
  label, min, max, step, value, onChange, suffix, ariaLabel
}: Props) {
  return (
    <div className="assump-field">
      <label className="assump-label">{label}</label>
      <div className="assump-input-row">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="assump-slider"
          aria-label={ariaLabel ?? label}
        />
        <div className="assump-value">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${label} numeric`}
          />
          {suffix ? <span className="assump-suffix">{suffix}</span> : null}
        </div>
      </div>
      <div className="assump-minmax">
        <span>{fmt(min, suffix)}</span>
        <span>{fmt(max, suffix)}</span>
      </div>
    </div>
  );
}

function fmt(n: number, suffix?: string) {
  const s = Number.isInteger(n) ? n.toString() : n.toFixed(3).replace(/0+$/,"").replace(/\.$/,"");
  return `${s}${suffix ?? ""}`;
}
