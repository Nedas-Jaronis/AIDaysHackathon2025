// Draggable slider for numerical range

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
        <span>{format(min, suffix)}</span>
        <span>{format(max, suffix)}</span>
      </div>
    </div>
  );
}

function format(n: number, suffix?: string) {
  return `${Number.isInteger(n) ? n : n.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}${suffix ?? ""}`;
}
