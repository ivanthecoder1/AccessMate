import { useColorBlindMode } from '../hooks/useColorBlindMode'

const modeDescriptions: Record<string, string> = {
  '': 'No filter applied.',
  fixProtanopiaColors:
    'Protanopia: Difficulty perceiving reds—this filter shifts red hues toward blues for better contrast.',
  fixDeuteranopiaColors:
    'Deuteranopia: Difficulty perceiving greens—this filter shifts green hues toward magenta for better contrast.',
  fixTritanopiaColors:
    'Tritanopia: Difficulty perceiving blues—this filter shifts blue hues toward green for better contrast.',
}

export default function ColorBlindnessModes() {
  const { mode, selectMode } = useColorBlindMode()

  return (
    <main>
      <h2>Color-Blindness Mode</h2>

      <label htmlFor="cb-mode-select" style={{ display: 'block', marginBottom: '8px' }}>
        Choose simulation mode:
      </label>
      <select
        id="cb-mode-select"
        value={mode}
        onChange={e => selectMode(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid var(--color-border)',
          marginBottom: '12px',
        }}
      >
        <option value="">None</option>
        <option value="fixProtanopiaColors">Protanopia</option>
        <option value="fixDeuteranopiaColors">Deuteranopia</option>
        <option value="fixTritanopiaColors">Tritanopia</option>
      </select>

      <p className="mode-description" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        {modeDescriptions[mode]}
      </p>
    </main>
  )
}
