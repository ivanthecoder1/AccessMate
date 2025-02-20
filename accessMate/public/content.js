// Function to analyze accessibility issues
function analyzeAccessibility() {
    let score = 100;
    let issueCounts = {};

    const addIssue = (issue, penalty) => {
        if (issueCounts[issue]) {
            issueCounts[issue] += 1;
        } else {
            issueCounts[issue] = 1;
        }
        score -= penalty;
    };

    // Check for missing alt text on images
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        addIssue("Missing alt attribute (-2)", 2);
        img.style.border = "4px solid red";
        img.alt = "Placeholder alt text";
    });

    // Check for low contrast
    document.querySelectorAll("*").forEach((el) => {
        const element = el;
        const color = window.getComputedStyle(element).color;
        const bgColor = window.getComputedStyle(element).backgroundColor;

        if (color === bgColor) {
            addIssue("Low contrast detected (-2)", 2);

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

    // Check for missing form labels
    document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach(() => {
        addIssue("Form input without a label detected (-2)", 2);
    });

    // Format issues with occurrence counts
    const formattedIssues = Object.entries(issueCounts).map(
        ([issue, count]) => `${issue}: ${count} Occurrences`
    );

    return { score: Math.max(score, 0), issues: formattedIssues };
}

// Listen for messages from the popup (App.tsx)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "runAccessibilityCheck") {
        const result = analyzeAccessibility();
        sendResponse(result);
    }
});
