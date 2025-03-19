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

// Function to make small font sizes larger for visually impaired users
// Find all font size lower than 12, and increase to 12


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

// ====== Color Blindness Helpers & Modes ====== //

// Utility to parse "rgb(255, 0, 0)" or "rgba(255, 0, 0, 1)" into [r, g, b]
function parseRGBString(rgbString) {
    const match = rgbString.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return null;
}

// Approximate matching using Euclidean distance
function isCloseToRed(r, g, b, threshold = 80) {
    const distance = Math.sqrt((r - 255) ** 2 + g ** 2 + b ** 2);
    return distance < threshold;
}
function isCloseToGreen(r, g, b, threshold = 80) {
    const distance = Math.sqrt(r ** 2 + (g - 255) ** 2 + b ** 2);
    return distance < threshold;
}
function isCloseToBlue(r, g, b, threshold = 80) {
    const distance = Math.sqrt(r ** 2 + g ** 2 + (b - 255) ** 2);
    return distance < threshold;
}

// ===== Image Overlay Helper =====
// Wraps an image in a container (if not already) and adds an overlay
function overlayImageFilter(img, overlayColor) {
    // Wrap image in a container if not already wrapped
    if (!img.parentElement.classList.contains("image-filter-container")) {
        const container = document.createElement("div");
        container.classList.add("image-filter-container");
        container.style.position = "relative";
        container.style.display = "inline-block";
        // Insert container before the image and then move the image inside it
        img.parentElement.insertBefore(container, img);
        container.appendChild(img);
    }
    // Ensure the image is positioned beneath the overlay
    img.style.position = "relative";
    img.style.zIndex = "1";

    // Look for an existing overlay element; if not found, create one
    let overlay = img.parentElement.querySelector(".image-filter-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.classList.add("image-filter-overlay");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.pointerEvents = "none"; // allow interactions to pass through
        overlay.style.background = overlayColor; // e.g., "rgba(255,0,0,0.3)"
        overlay.style.zIndex = "2"; // ensure overlay is on top
        img.parentElement.appendChild(overlay);
    } else {
        // Update overlay color if it already exists
        overlay.style.background = overlayColor;
    }
}


// ===== Color-Blindness Modes ===== //

// Define CSS filter strings for images in each mode

// Blue Filter
const PROTANOPIA_FILTER = "grayscale(30%) brightness(90%) sepia(20%) hue-rotate(200deg) saturate(300%) contrast(1.2)";

// Magenta filter 
const DEUTERANOPIA_FILTER = "grayscale(20%) brightness(90%) sepia(30%) hue-rotate(300deg) saturate(400%) contrast(1.2)";

// Green filter
const TRITANOPIA_FILTER = "grayscale(20%) brightness(90%) sepia(10%) hue-rotate(90deg) saturate(400%) contrast(1.2)";

// Protanopia: red → blue for text/background; for images, apply a CSS filter
function fixProtanopiaColors() {
    console.log("Fixing Protanopia Colors");

    // Process text and background colors
    document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        const parsedColor = parseRGBString(color);
        const parsedBgColor = parseRGBString(bgColor);

        if (parsedColor) {
            const [r, g, b] = parsedColor;
            if (isCloseToRed(r, g, b)) {
                el.style.setProperty("color", "rgb(0,0,255)", "important");
            }
        }
        if (parsedBgColor) {
            const [r, g, b] = parsedBgColor;
            if (isCloseToRed(r, g, b)) {
                el.style.setProperty("background-color", "rgb(0,0,255)", "important");
            }
        }
    });

    // Process images: apply CSS filter
    document.querySelectorAll("img").forEach((img) => {
        img.style.filter = PROTANOPIA_FILTER;
    });
}

// Deuteranopia: green → magenta for text/background; for images, apply a CSS filter
function fixDeuteranopiaColors() {
    console.log("Fixing Deuteranopia Colors");

    document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        const parsedColor = parseRGBString(color);
        const parsedBgColor = parseRGBString(bgColor);

        if (parsedColor) {
            const [r, g, b] = parsedColor;
            if (isCloseToGreen(r, g, b)) {
                el.style.setProperty("color", "rgb(255,0,255)", "important");
            }
        }
        if (parsedBgColor) {
            const [r, g, b] = parsedBgColor;
            if (isCloseToGreen(r, g, b)) {
                el.style.setProperty("background-color", "rgb(255,0,255)", "important");
            }
        }
    });

    // Process images: apply CSS filter
    document.querySelectorAll("img").forEach((img) => {
        img.style.filter = DEUTERANOPIA_FILTER;
    });
}

// Tritanopia: blue → green for text/background; for images, apply a CSS filter
function fixTritanopiaColors() {
    console.log("Fixing Tritanopia Colors");

    document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        const parsedColor = parseRGBString(color);
        const parsedBgColor = parseRGBString(bgColor);

        if (parsedColor) {
            const [r, g, b] = parsedColor;
            if (isCloseToBlue(r, g, b)) {
                el.style.setProperty("color", "rgb(0,255,0)", "important");
            }
        }
        if (parsedBgColor) {
            const [r, g, b] = parsedBgColor;
            if (isCloseToBlue(r, g, b)) {
                el.style.setProperty("background-color", "rgb(0,255,0)", "important");
            }
        }
    });

    // Process images: apply CSS filter
    document.querySelectorAll("img").forEach((img) => {
        img.style.filter = TRITANOPIA_FILTER;
    });
}

// Listen for messages from `App.tsx` for color-blindness modes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fixProtanopiaColors") {
        fixProtanopiaColors();
    } else if (request.action === "fixDeuteranopiaColors") {
        fixDeuteranopiaColors();
    } else if (request.action === "fixTritanopiaColors") {
        fixTritanopiaColors();
    }
});


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
