import { useState } from "react";
import './App.css';

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
		// Future: call an API to generate an alt text for an image
		// 1. Detect image with no alt text
		// 2. Upload image to API route
		// 3. Retrieve generated alt text
		// 4. Store here 
		(img as HTMLImageElement).alt = "Placeholder alt text";
	});

	// Check for low contrast (simplified)
	document.querySelectorAll("*").forEach((el) => {
		const element = el as HTMLElement; // Ensure it's an HTMLElement
	
		const color = window.getComputedStyle(element).color;
		const bgColor = window.getComputedStyle(element).backgroundColor;
	
		if (color === bgColor) {
			addIssue("Low contrast detected (-2)", 2);
	
			// Convert background color to RGB
			const bgRGB = parseRGB(bgColor);
	
			if (bgRGB) {
				const brightness = (bgRGB[0] * 0.299 + bgRGB[1] * 0.587 + bgRGB[2] * 0.114);
				const newColor = brightness > 128 ? "#000000" : "#FFFFFF";
	
				console.log(`Fixing contrast for:`, element);
				console.log(`- Original Color: ${color}`);
				console.log(`- Background Color: ${bgColor}`);
				console.log(`- New Text Color: ${newColor}`);
	
				element.style.color = newColor;
			}
		}
	});
	

	// Convert RGB string to an array of numbers
	function parseRGB(color: string): [number, number, number] | null {
		const match = color.match(/\d+/g);
		return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : null;
	}
	

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

	const closeExtension = () => {
		window.close();
	};

	return (
		<div className="extension-container">
			{/* Top Bar */}
			<div className="top-bar">
				<img src="icons/logo.png" alt="AccessMate Logo" className="logo" />
				<span className="title">AccessMate</span>
				<button className="close-btn" onClick={closeExtension}>&times;</button>
			</div>

			{/* Main Content */}
			<div className="content">
				<button className="scan-btn" onClick={checkAccessibility}>Check Accessibility</button>

				{score !== null && (
					<div>
						<p className="score">Accessibility Score: <strong>{score}%</strong></p>

						{score === 100 && issues.length === 0 ? (
							<p className="no-issues">✅ No issues detected!</p>
						) : (
							<>
								<h4 className="issues-heading">❌ Issues Detected:</h4>
								<ul className="issues-list">
									{issues.map((issue, index) => (
										<li key={index}>{issue}</li>
									))}
								</ul>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default App;