import { useState, useRef, useEffect } from 'react'
import { useAccessibility } from '../hooks/useAccessibility'

export default function HomePage() {
  const { score, issues, checkAccessibility, fixIssue } = useAccessibility()
  const [showResults, setShowResults] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Whenever score or issues change, show the results and focus
  useEffect(() => {
    if (score !== null) {
      setShowResults(true)
      resultsRef.current?.focus()
    }
  }, [score, issues])

  return (
    <main>
      {/* Page title */}
      <h1 className="page-title">Welcome to AccessMate</h1>

      {/* Intro paragraph */}
      <p className="page-description">
        AccessMate is a web browser extension designed to evaluate the accessibility
        of web pages and give you a WCAG-based score. Run a scan, see your score,
        and apply suggested fixes right in your browser.
      </p>

      {/* Scan button */}
      <button
        className="scan-btn"
        onClick={checkAccessibility}
        aria-controls="results"
      >
        Check Accessibility
      </button>

      {/* Results section (only visible when showResults = true and score has data) */}
      {showResults && score !== null && (
        <section
          id="results"
          tabIndex={-1}
          ref={resultsRef}
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="content"
        >
          {/* Score heading */}
          <h2>Accessibility Score: {score}%</h2>

          {/* No-issues message */}
          {score === 100 && issues.length === 0 ? (
            <p>✅ No issues detected!</p>
          ) : (
            <>
              {/* Issues list */}
              <h3>Issues Detected</h3>
              <ul className="issues-list">
                {issues.map((issue, i) => (
                  <li key={i} className="issue-item">
                    <span className="issue-label">
                      {issue.type}: {issue.count}{issue.count !== 1 ? ' occurences' : ''}
                    </span>
                    <button
                      className="fix-btn"
                      onClick={() => fixIssue(issue.type)}
                      aria-label={`Fix ${issue.type}`}
                    >
                      Fix
                    </button>
                  </li>
                ))}
              </ul>

              {/* Fix All button: also hides results when clicked */}
              <button
                className="fix-all-btn"
                onClick={() => {
                  fixIssue('Fix All')
                  setShowResults(false)
                }}
                aria-label="Fix all issues"
              >
                Fix All
              </button>
            </>
          )}
        </section>
      )}
    </main>
  )
}
