interface ProgressBarProps {
  value: number;
  max: number;
  /** Accessible name, e.g. "3 of 10 parts published". Show the same text beside the bar. */
  label: string;
}

/** Thin progress bar. The fill is rust; the number is always shown in words nearby. */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-1.5 overflow-hidden rounded-full bg-tint"
    >
      <div className="h-full bg-rust" style={{ width: `${percent}%` }} />
    </div>
  );
}
