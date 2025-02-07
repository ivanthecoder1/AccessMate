import { useState } from "react";
import './App.css';

// Bugs to fix
// 1. When I check the score, it makes the top part of the extension get cut off
// 3. Make sure the issues are highlighted on screen, etc

// Function that runs inside the webpage to check accessibility
function analyzeAccessibility() {
	let score = 100;
	let issueCounts: Record<string, number> = {};

	const addIssue = (issue: string, penalty: number) => {
		if (issueCounts[issue]) {
			issueCounts[issue] += 1;
		} else {
			issueCounts[issue] = 1;
		}
		score -= penalty;
	};

	// Check for missing alt text on images and highlight them in red
	document.querySelectorAll("img:not([alt])").forEach((img) => {
		addIssue("Missing alt attribute (-2)", 2);

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
			addIssue("Low contrast detected (-2)", 2);
		}
	});

	// Check for missing form labels
	document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach(() => {
		addIssue("Form input without a label detected (-2)", 2);
	});

	// Format issues to include occurrences
	const formattedIssues = Object.entries(issueCounts).map(
		([issue, count]) => `${issue}: ${count} Occurrences`
	);

	return { score: Math.max(score, 0), issues: formattedIssues };
}

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
					<p>Accessibility Score: <strong>{score}%</strong></p>
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

export default App;