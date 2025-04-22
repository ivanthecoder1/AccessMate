import { useState, useEffect, useRef } from "react";
import "./App.css";

type Issue = { type: string; count: number };
const STORAGE_KEY = "accessMateAutoFix";

export default function App() {
  const [score, setScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [autoFix, setAutoFix] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.sync.get([STORAGE_KEY], (res) => {
      setAutoFix(res[STORAGE_KEY] ?? false);
    });
  }, []);

  const toggleAutoFix = () => {
    const next = !autoFix;
    setAutoFix(next);
    chrome.storage.sync.set({ [STORAGE_KEY]: next });
  };

  const checkAccessibility = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (typeof tabId === "number") {
        chrome.tabs.sendMessage(
          tabId,
          { action: "runAccessibilityCheck", autoFix },
          (response) => {
            if (response) {
              setScore(response.score);
              setIssues(response.issues);
              resultsRef.current?.focus();
            }
          }
        );
      }
    });
  };

  const fixIssue = (issueType: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (typeof tabId === "number") {
        chrome.tabs.sendMessage(tabId, { action: "fixIssue", issueType });
      }
    });
  };

  const closeExtension = () => window.close();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const selectMode = (mode: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (typeof tabId === "number") {
        chrome.tabs.sendMessage(tabId, { action: mode });
      }
    });
    setIsDropdownOpen(false);
  };

  return (
    <div
      className="extension-container"
      role="application"
      aria-label="AccessMate accessibility tool"
    >
      <header className="top-bar">
        <img src="icons/logo.png" alt="AccessMate Logo" className="logo" />
        <h1 className="title">AccessMate</h1>
        <button
          className="close-btn"
          onClick={closeExtension}
          aria-label="Close extension"
        >
          ×
        </button>
      </header>

      <div className="auto-fix-setting">
        <label htmlFor="autoFix">
          <input
            id="autoFix"
            type="checkbox"
            checked={autoFix}
            onChange={toggleAutoFix}
          />
          Auto-fix on page load
        </label>
      </div>

      <nav aria-label="Color blindness modes">
        <button
          id="color-toggle"
          className="dropdown-toggle"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
          aria-controls="color-menu"
          onClick={toggleDropdown}
        >
          Color Blindness Mode
        </button>
        {isDropdownOpen && (
          <ul
            id="color-menu"
            role="menu"
            aria-labelledby="color-toggle"
            className="dropdown-menu"
          >
            <li role="menuitem">
              <button onClick={() => selectMode("fixProtanopiaColors")}>Protanopia</button>
            </li>
            <li role="menuitem">
              <button onClick={() => selectMode("fixDeuteranopiaColors")}>Deuteranopia</button>
            </li>
            <li role="menuitem">
              <button onClick={() => selectMode("fixTritanopiaColors")}>Tritanopia</button>
            </li>
          </ul>
        )}
      </nav>

      <main>
        <button className="scan-btn" onClick={checkAccessibility} aria-controls="results">
          Check Accessibility
        </button>

        <section
          id="results"
          tabIndex={-1}
          ref={resultsRef}
          role="region"
          aria-live="polite"
          aria-atomic="true"
          className="content"
        >
          {score !== null && (
            <>
              <h2>Accessibility Score: {score}%</h2>
              {score === 100 && issues.length === 0 ? (
                <p>✅ No issues detected!</p>
              ) : (
                <>
                  <h3>Issues Detected:</h3>
                  <ul>
                    {issues.map((issue, i) => (
                      <li key={i} className="issue-item">
                        {issue.type}: {issue.count}{' '}
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
                  <button
                    className="fix-all-btn"
                    onClick={() => fixIssue("Fix All")}
                    aria-label="Fix all issues"
                  >
                    Fix All
                  </button>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
