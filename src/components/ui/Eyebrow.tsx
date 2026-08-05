// Numbered section label (e.g. "(01) — WHY STRETCH"). Matches the mockup
// eyebrow pattern. `num` is optional; when omitted, renders just the rule+label.
type EyebrowProps = {
  num?: string;
  label: string;
  /** Visual variant for dark sections. */
  tone?: 'light' | 'dark';
};

export default function Eyebrow({ num, label, tone = 'light' }: EyebrowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        marginBottom: 18,
      }}
    >
      {num ? (
        <span
          style={{
            color: 'var(--red)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '.16em',
          }}
        >
          ({num})
        </span>
      ) : (
        <span
          style={{ width: 34, height: 2, background: 'var(--red)', display: 'inline-block' }}
        />
      )}
      <span
        style={{
          fontSize: 'var(--fs-eyebrow)',
          fontWeight: 700,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: tone === 'dark' ? 'var(--on-dark-faint)' : 'var(--text-faint-2)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
