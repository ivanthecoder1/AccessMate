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
