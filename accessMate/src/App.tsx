import { useState } from "react";
import './App.css';

// Bugs to fix
// 1. When I check the score, it makes the top part of the extension get cut off
// 2. Instead of adding the same multiple times, count the instances so it isn't cluttering the extension
// 3. Make sure the issues are highlighted on screen, etc


function App() {
  const [score, setScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<string[]>([]);

  const checkAccessibility = () => {
    if (!chrome?.tabs) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: analyzeAccessibility,
          },
          (results) => {
            if (results && results[0].result) {
              setScore(results[0].result.score);
              setIssues(results[0].result.issues);
            }
          }
        );
      }
    });
  };

  return (
    <div style={{ padding: "10px", fontFamily: "Arial" }}>
      <h2>AccessMate</h2>
      <button onClick={checkAccessibility}>Check Accessibility</button>
      {score !== null && (
        <div>
          <p>Accessibility Score: <strong>{score} %</strong></p>
          <h4>Issues Detected:</h4>
          <ul>
            {issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Function that runs inside the webpage to check accessibility
function analyzeAccessibility() {
  let score = 100;
  let issues: string[] = [];

  // Check for missing alt text on images and highlight them in red
  document.querySelectorAll("img:not([alt])").forEach((img) => {
    issues.push("Missing alt attribute on an image (-2)");
    score -= 2;

    // Highlight the image with a red border
    (img as HTMLElement).style.border = "4px solid red";

    // Automatically add a placeholder alt text
    (img as HTMLImageElement).alt = "Placeholder alt text";
  });

  // Check for low contrast (simplified)
  document.querySelectorAll("*").forEach((el) => {
    const color = window.getComputedStyle(el).color;
    const bgColor = window.getComputedStyle(el).backgroundColor;
    if (color === bgColor) {
      issues.push("Low contrast detected (-2)");
      score -= 2;
    }
  });

  // Check for missing form labels
  document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach(() => {
    issues.push("Form input without a label detected (-2)");
    score -= 2;
  });

  return { score: Math.max(score, 0), issues };
}

export default App;