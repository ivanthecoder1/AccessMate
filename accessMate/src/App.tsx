import { useState } from "react";
import "./App.css";

type Issue = {
	type: string;
	count: number;
};

function App() {
	const [score, setScore] = useState<number | null>(null);
	const [issues, setIssues] = useState<Issue[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const checkAccessibility = () => {
		if (!chrome?.tabs) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "runAccessibilityCheck" }, (response) => {
					if (response) {
						setScore(response.score);
						setIssues(response.issues);
					}
				});
			}
		});
	};

	const fixIssue = (issueType: string) => {
		if (!chrome?.tabs) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "fixIssue", issueType });
			}
		});
	};

	const closeExtension = () => {
		window.close();
	};

	// Color blindness functions
	const fixProtanopia = () => {
		if (!chrome?.tabs) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "fixProtanopiaColors" });
			}
		});
		setIsDropdownOpen(false); // Close the dropdown if desired
	};

	const fixDeuteranopia = () => {
		if (!chrome?.tabs) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "fixDeuteranopiaColors" });
			}
		});
		setIsDropdownOpen(false);
	};

	const fixTritanopia = () => {
		if (!chrome?.tabs) return;
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "fixTritanopiaColors" });
			}
		});
		setIsDropdownOpen(false);
	};

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	return (
		<div className="extension-container">
			{/* Top Bar */}
			<div className="top-bar">
				<img src="icons/logo.png" alt="AccessMate Logo" className="logo" />
				<span className="title">AccessMate</span>
				<button className="close-btn" onClick={closeExtension}>&times;</button>
			</div>

			{/* Color Blindness Dropdown */}
			<div className="dropdown">
				<button className="dropdown-toggle" onClick={toggleDropdown}>
					Color Blindness Mode
				</button>
				{isDropdownOpen && (
					<div className="dropdown-menu">
						<button onClick={fixProtanopia}>Protanopia</button>
						<button onClick={fixDeuteranopia}>Deuteranopia</button>
						<button onClick={fixTritanopia}>Tritanopia</button>
					</div>
				)}
			</div>

			{/* Main Content */}
			<div className="content">
				<button className="scan-btn" onClick={checkAccessibility}>
					Check Accessibility
				</button>

				{score !== null && (
					<div>
						<p className="score">
							Accessibility Score: <strong>{score}%</strong>
						</p>

						{score === 100 && issues.length === 0 ? (
							<p className="no-issues">✅ No issues detected!</p>
						) : (
							<>
								<h4 className="issues-heading">❌ Issues Detected:</h4>
								<ul className="issues-list">
									{issues.map((issue, index) => (
										<li key={index} className="issue-item">
											{issue.type}: {issue.count} Occurrences
											<button className="fix-btn" onClick={() => fixIssue(issue.type)}>
												Fix
											</button>
										</li>
									))}
								</ul>
								<button className="fix-all-btn" onClick={() => fixIssue("Fix All")}>
									Fix All
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default App;