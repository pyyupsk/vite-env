import { env } from 'virtual:env/client'

const styles = {
  body: {
    fontFamily: 'system-ui, sans-serif',
    background: '#0a0a0a',
    color: '#e5e5e5',
    minHeight: '100vh',
    padding: '2rem',
  },
  container: { maxWidth: 640, margin: '0 auto' },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: '#171717',
    border: '1px solid #262626',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  key: { color: '#a78bfa', fontFamily: 'monospace' },
  value: { color: '#34d399', fontFamily: 'monospace' },
} satisfies Record<string, React.CSSProperties>

export function App() {
  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1>{env.VITE_APP_NAME}</h1>
        <p style={{ color: '#737373' }}>
          Typed environment variables from virtual:env/client — fully inferred in JSX.
        </p>
        {Object.entries(env).map(([key, value]) => (
          <div key={key} style={styles.row}>
            <span style={styles.key}>{key}</span>
            <span style={styles.value}>
              {JSON.stringify(value)}
              {' '}
              <em style={{ color: '#737373' }}>{typeof value}</em>
            </span>
          </div>
        ))}
        {env.VITE_DEBUG && <p style={{ color: '#fbbf24' }}>Debug mode on (VITE_DEBUG is a real boolean, not "true").</p>}
      </div>
    </div>
  )
}
