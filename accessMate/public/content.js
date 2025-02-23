// Function to analyze accessibility issues
function analyzeAccessibility() {
    let score = 100;
    let issueCounts = {
        "Missing alt attribute": { count: 0, fix: fixMissingAltText },
        "Low contrast detected": { count: 0, fix: fixLowContrast },
        "Form input without a label": { count: 0, fix: fixMissingFormLabels },
    };

    const addIssue = (issue, penalty) => {
        if (issueCounts[issue]) {
            issueCounts[issue].count += 1;
        } else {
            issueCounts[issue] = { count: 1, fix: null };
        }
        score -= penalty;
    };

    // Check for missing alt text on images
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        addIssue("Missing alt attribute", 2);
        img.style.border = "4px solid red";
    });

    // Check for low contrast
    document.querySelectorAll("*").forEach((el) => {
        const element = el;
        const color = window.getComputedStyle(element).color;
        const bgColor = window.getComputedStyle(element).backgroundColor;

        if (color === bgColor) {
            addIssue("Low contrast detected", 2);
        }
    });

    // Check for missing form labels
    document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach(() => {
        addIssue("Form input without a label", 2);
    });

    // Convert `issueCounts` into an array of objects with `{ type, count }`
    const formattedIssues = Object.keys(issueCounts).map((issue) => ({
        type: issue,
        count: issueCounts[issue].count,
    }));

    return { score: Math.max(score, 0), issues: formattedIssues };
}

// Function to fix missing alt attributes
function fixMissingAltText() {
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        img.alt = "Placeholder alt text";
        img.style.border = "none"; // Remove red border
    });
}

// Function to fix low contrast
function fixLowContrast() {
    document.querySelectorAll("*").forEach((el) => {
        const element = el;
        const color = window.getComputedStyle(element).color;
        const bgColor = window.getComputedStyle(element).backgroundColor;

        if (color === bgColor) {
            const parseRGB = (color) => {
                const match = color.match(/\d+/g);
                return match ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])] : null;
            };

            const bgRGB = parseRGB(bgColor);

            if (bgRGB) {
                const brightness = (bgRGB[0] * 0.299 + bgRGB[1] * 0.587 + bgRGB[2] * 0.114);
                element.style.color = brightness > 128 ? "#000000" : "#FFFFFF";
            }
        }
    });
}

// Function to fix missing form labels
// Use an api to generate descriptive input field or use context from nearby elements
function fixMissingFormLabels() {
    document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach((input) => {
        input.setAttribute("aria-label", "Unnamed Input Field");
    });
}

// Function to fix all issues
function fixAllIssues() {
    fixMissingAltText();
    fixLowContrast();
    fixMissingFormLabels();
}

// Create a mapping of issue types to fix functions
const issueFixFunctions = {
    "Missing alt attribute": fixMissingAltText,
    "Low contrast detected": fixLowContrast,
    "Form input without a label": fixMissingFormLabels,
};

// Listen for messages from the popup (App.tsx)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runAccessibilityCheck") {
        const result = analyzeAccessibility();
        sendResponse(result);
    } else if (request.action === "fixIssue" && request.issueType) {
        if (request.issueType === "Fix All") {
            fixAllIssues();
        } else if (issueFixFunctions[request.issueType]) {
            issueFixFunctions[request.issueType](); 
        }
    }
});
