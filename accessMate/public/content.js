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

    // Check for heading hierarchy issues
    let headingIssues = analyzeHeadingHierarchy();
    headingIssues.forEach((issue) => addIssue("Heading hierarchy issues", 2));


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

// Function to check for improper heading hieracrhies
function analyzeHeadingHierarchy() {
    console.log("🔍 Checking heading hierarchy...");
    
    let issues = [];
    let headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let previousLevel = 0;
    let h1Count = 0;

    headings.forEach((heading, index) => {
        let level = parseInt(heading.tagName.replace("H", ""), 10);
        let text = heading.textContent.trim();

        // Detect multiple <h1> elements
        if (level === 1) {
            h1Count++;
            if (h1Count > 1) {
                issues.push("Multiple <h1> elements found.");
                heading.style.border = "3px solid orange"; // Highlight issue
            }
        }

        // Detect skipped heading levels
        if (previousLevel && level > previousLevel + 1) {
            issues.push(`Heading level skipped: <h${previousLevel}> → <h${level}>.`);
            heading.style.border = "3px solid red"; // Highlight issue
        }

        // Detect empty headings
        if (!text) {
            issues.push(`Empty heading <h${level}> found.`);
            heading.style.border = "3px solid purple";
        }

        previousLevel = level;
    });

    // Detect missing <h1>
    if (h1Count === 0) {
        issues.push("No <h1> element found on the page.");
    }

    return issues;
}

// Function to fix missing alt attributes
function fixMissingAltText() {
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        img.alt = "Placeholder alt text";
        img.style.border = "none"; // Remove red border
    });
}

function fixHeadingHierarchy() {
    console.log("🛠 Fixing Heading Hierarchy...");

    let headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let previousLevel = 0;
    let h1Count = 0;

    headings.forEach((heading, index) => {
        let level = parseInt(heading.tagName.replace("H", ""), 10);
        let text = heading.textContent.trim();

        // Fix multiple <h1> by converting extra ones to <h2>
        if (level === 1) {
            h1Count++;
            if (h1Count > 1) {
                console.log(`Fixing multiple <h1>: Converting to <h2> → ${text}`);
                let newHeading = document.createElement("h2");
                newHeading.innerHTML = heading.innerHTML;
                heading.replaceWith(newHeading);
            }
        }

        // Fix skipped heading levels by lowering it
        if (previousLevel && level > previousLevel + 1) {
            console.log(`Fixing skipped heading level: <h${level}> → <h${previousLevel + 1}>`);
            let newHeading = document.createElement(`h${previousLevel + 1}`);
            newHeading.innerHTML = heading.innerHTML;
            heading.replaceWith(newHeading);
        }

        // Fix empty headings by removing them
        if (!text) {
            console.log(`Removing empty <h${level}>.`);
            heading.remove();
        }

        previousLevel = level;
    });

    // Add an <h1> if missing
    if (h1Count === 0) {
        console.log("Adding missing <h1> to the document.");
        let newH1 = document.createElement("h1");
        newH1.textContent = "Untitled Page";
        document.body.insertBefore(newH1, document.body.firstChild);
    }
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
    fixHeadingHierarchy();
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

// Color blindness
// Check list - protanopia, deuteranopia, tritanopia, and monochromacy

// function fixProtanopiaColors() {
//     console.log("Fixing Protanopia Colors...");

//     document.querySelectorAll("*").forEach((el) => {
//         const element = el;
//         const color = window.getComputedStyle(element).color;
//         const bgColor = window.getComputedStyle(element).backgroundColor;

//         console.log(`Element:`, element);
//         console.log(`- Original Text Color: ${color}`);
//         console.log(`- Original Background Color: ${bgColor}`);

//         // Convert colors to a standard format
//         const rgbToStandard = (rgb) => rgb.replace(/\s/g, "").toLowerCase();

//         const standardColor = rgbToStandard(color);
//         const standardBgColor = rgbToStandard(bgColor);

//         // Color replacements for Protanopia (Red-Blindness)
//         const protanopiaColorMap = {
//             "rgb(255,0,0)": "rgb(0,0,255) !important", // Red → Blue
//             "rgb(255,69,0)": "rgb(0,128,0) !important", // Orange → Dark Green
//             "rgb(128,0,128)": "rgb(0,0,255) !important", // Purple → Bright Blue
//             "rgb(255,255,0)": "rgb(139,69,19) !important", // Yellow → Dark Brown
//         };

//         if (protanopiaColorMap[standardColor]) {
//             element.style.setProperty("color", protanopiaColorMap[standardColor], "important");
//             console.log(`✔ Changed Text Color to ${protanopiaColorMap[standardColor]}`);
//         }
//         if (protanopiaColorMap[standardBgColor]) {
//             element.style.setProperty("background-color", protanopiaColorMap[standardBgColor], "important");
//             console.log(`✔ Changed Background Color to ${protanopiaColorMap[standardBgColor]}`);
//         }
//     });
// }


// // Listen for messages from `App.tsx`
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "fixProtanopiaColors") {
//         fixProtanopiaColors();
//     }
// });


// Function to stop auto-playing videos & audio
function stopAutoPlayVideos() {
    console.log("🔇 Stopping all auto-playing videos and audio...");

    document.querySelectorAll("video, audio").forEach((media) => {
        if (!media.paused) {
            media.pause();
            media.autoplay = false;
            media.controls = true; // Allow users to play manually if needed
            console.log(`✔ Paused media:`, media);
        }
    });

    // Stop embedded iframes like YouTube, Vimeo
    document.querySelectorAll("iframe").forEach((iframe) => {
        let src = iframe.src;
        if (src.includes("youtube.com") || src.includes("vimeo.com")) {
            iframe.src = src; // Reset iframe to stop video
            console.log(`✔ Stopped iframe media:`, iframe);
        }
    });
}

// Run automatically when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", stopAutoPlayVideos);
