// content.js – Accessibility Analysis & Enhancement Script

/*
  This script provides functions to:
    1. Analyze accessibility issues on a web page (WCAG-based checks).
    2. Offer visual cues for detected issues.
    3. Automatically apply fixes for missing attributes, poor contrast, etc.
    4. Support color-blindness simulation modes (Protanopia, Deuteranopia, Tritanopia).
    5. Prevent auto-playing media for improved user control and accessibility.

  Integration:
    • Listens for messages from the extension popup (App.tsx) via chrome.runtime.
    • Responds to actions: 'runAccessibilityCheck', 'fixIssue', and color‑blindness toggles.
*/

// =========================
// Accessibility Analysis
// =========================

function analyzeAccessibility() {
    let score = 100;
    // Map issue type to count and corresponding fix function
    let issueCounts = {
        "Missing alt attribute": { count: 0, fix: fixMissingAltText },
        "Low contrast detected": { count: 0, fix: fixLowContrast },
        "Form input without a label": { count: 0, fix: fixMissingFormLabels },
        "Small font size": { count: 0, fix: fixSmallFonts },
        "Missing PDF description": { count: 0, fix: fixMissingPdfDescriptions },
        "Missing link label": { count: 0, fix: fixMissingLinkLabels }
    };

    // Helper to record an issue, increment count, and penalize score
    const addIssue = (issue, penalty) => {
        if (issueCounts[issue]) {
            issueCounts[issue].count += 1;
        } else {
            issueCounts[issue] = { count: 1, fix: null };
        }
        score -= penalty;
    };

    // 1. Heading hierarchy validation
    let headingIssues = analyzeHeadingHierarchy();
    headingIssues.forEach((issue) => addIssue("Heading hierarchy issues", 2));

    // 2. Image alt text check
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        addIssue("Missing alt attribute", 2);
        img.style.border = "4px solid red";
    });

    // 3. Small font detection (<12px is considered too small)
    document.querySelectorAll("*").forEach((el) => {
        let size = parseFloat(window.getComputedStyle(el).fontSize) || 0;
        if (size > 0 && size < 12) addIssue("Small font size", 2);
    });

    // 4. Low contrast detection (text color identical to background)
    document.querySelectorAll("*").forEach((el) => {
        let style = window.getComputedStyle(el);
        if (style.color === style.backgroundColor) addIssue("Low contrast detected", 2);
    });

    // 5. Form fields missing labels
    document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach(() => {
        addIssue("Form input without a label", 2);
    });

    // 6. PDF link descriptions (anchor tags pointing to .pdf with no text or aria-label)
    document.querySelectorAll('a[href$=".pdf"]').forEach((link) => {
        let text = link.textContent.trim();
        let ariaLabel = link.getAttribute("aria-label");
        if (!text && !ariaLabel) {
            addIssue("Missing PDF description", 2);
            link.style.border = "4px dashed red";
        }
    });

    // 7. General links missing labels (non-PDF)
    document.querySelectorAll("a:not([href$='.pdf'])").forEach((link) => {
        let text = link.textContent.trim();
        let ariaLabel = link.getAttribute("aria-label");
        if (!text && !ariaLabel) {
            addIssue("Missing link label", 2);
            link.style.border = "4px dashed blue";
        }
    });

    // Format results: array of { type, count }
    let issues = Object.keys(issueCounts).map((type) => ({ type, count: issueCounts[type].count }));
    return { score: Math.max(score, 0), issues };
}

// ================================
// Heading Hierarchy Analysis / Fix
// ================================

function analyzeHeadingHierarchy() {
    console.log("🔍 Checking heading hierarchy...");
    let issues = [];
    let headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let prevLevel = 0;
    let h1Count = 0;

    headings.forEach((hdg) => {
        let lvl = parseInt(hdg.tagName.charAt(1), 10);
        let text = hdg.textContent.trim();

        if (lvl === 1) {
            h1Count++;
            if (h1Count > 1) {
                issues.push("Multiple <h1> elements found.");
                hdg.style.border = "3px solid orange";
            }
        }
        if (prevLevel && lvl > prevLevel + 1) {
            issues.push(`Skipped heading level: h${prevLevel} → h${lvl}`);
            hdg.style.border = "3px solid red";
        }
        if (!text) {
            issues.push(`Empty heading h${lvl} found.`);
            hdg.style.border = "3px solid purple";
        }
        prevLevel = lvl;
    });
    if (h1Count === 0) issues.push("No <h1> element found on page.");
    return issues;
}

function fixHeadingHierarchy() {
    console.log("🛠 Fixing heading hierarchy...");
    let headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    let prevLevel = 0;
    let h1Count = 0;

    headings.forEach((hdg) => {
        let lvl = parseInt(hdg.tagName.charAt(1), 10);
        let text = hdg.textContent.trim();

        // Consolidate extra <h1> to <h2>
        if (lvl === 1) {
            h1Count++;
            if (h1Count > 1) {
                let replacement = document.createElement("h2");
                replacement.innerHTML = hdg.innerHTML;
                hdg.replaceWith(replacement);
            }
        }
        // Normalize skipped levels
        if (prevLevel && lvl > prevLevel + 1) {
            let newLevel = prevLevel + 1;
            let repl = document.createElement(`h${newLevel}`);
            repl.innerHTML = hdg.innerHTML;
            hdg.replaceWith(repl);
        }
        // Remove empty
        if (!text) hdg.remove();

        prevLevel = lvl;
    });

    if (h1Count === 0) {
        let h1 = document.createElement("h1");
        h1.textContent = "Untitled Page";
        document.body.insertBefore(h1, document.body.firstChild);
    }
}

// =========================
// Issue Fix Functions
// =========================

// Alt text fallback
function fixMissingAltText() {
    document.querySelectorAll("img:not([alt])").forEach((img) => {
        img.alt = "Image description missing";
        img.style.border = "none";
    });
}

// Link labels fallback
function fixMissingLinkLabels() {
    console.log("🔧 Fixing missing link labels...");
    document.querySelectorAll("a").forEach((link) => {
        if (!link.href.endsWith('.pdf') && !link.textContent.trim() && !link.getAttribute('aria-label')) {
            link.textContent = "Link";
            link.setAttribute('aria-label', 'Link');
            link.style.border = "none";
        }
    });
}

// Low contrast auto-adjust
function fixLowContrast() {
    document.querySelectorAll("*").forEach((el) => {
        let style = window.getComputedStyle(el);
        if (style.color === style.backgroundColor) {
            let rgb = style.backgroundColor.match(/\d+/g).map(Number);
            let brightness = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
            el.style.color = brightness > 128 ? '#000' : '#fff';
        }
    });
}

// Form label fallback
function fixMissingFormLabels() {
    document.querySelectorAll("input:not([aria-label]):not([aria-labelledby]):not([id])").forEach((input) => {
        input.setAttribute('aria-label', 'Form field');
    });
}

// Minimum font size enforcement
function fixSmallFonts() {
    console.log("🔧 Fixing small fonts to minimum 12px...");
    document.querySelectorAll("*").forEach((el) => {
        let size = parseFloat(window.getComputedStyle(el).fontSize) || 0;
        if (size > 0 && size < 12) el.style.fontSize = "12px";
    });
}

// PDF description fixes for links/embeds
function fixMissingPdfDescriptions() {
    document.querySelectorAll('a[href$=".pdf"]').forEach((link) => {
        if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
            link.textContent = 'PDF Document';
            link.setAttribute('aria-label', 'PDF Document');
            link.style.border = 'none';
        }
    });
    document.querySelectorAll('object[data$=".pdf"], embed[src$=".pdf"]').forEach((embed) => {
        if (!embed.getAttribute('aria-label')) {
            embed.setAttribute('aria-label', 'Embedded PDF Document');
            embed.style.border = 'none';
        }
    });
}

// Fix all detected issues with one call
function fixAllIssues() {
    fixMissingAltText();
    fixLowContrast();
    fixMissingFormLabels();
    fixHeadingHierarchy();
    fixSmallFonts();
    fixMissingPdfDescriptions();
    fixMissingLinkLabels();
}

// Mapping issue types to their fix functions
const issueFixFunctions = {
    "Missing alt attribute": fixMissingAltText,
    "Low contrast detected": fixLowContrast,
    "Form input without a label": fixMissingFormLabels,
    "Small font size": fixSmallFonts,
    "Missing PDF description": fixMissingPdfDescriptions,
    "Missing link label": fixMissingLinkLabels
};

// =========================
// Runtime Message Listener
// =========================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'runAccessibilityCheck') {
        const { autoFix } = request;
        if (autoFix) {
            fixAllIssues();
        }
        const result = analyzeAccessibility();
        sendResponse(result);
    }
    else if (request.action === 'fixIssue') {
        if (request.issueType === 'Fix All') fixAllIssues();
        else if (issueFixFunctions[request.issueType]) {
            issueFixFunctions[request.issueType]();
        }
    }
});

// =========================
// Media Autoplay Prevention
// =========================

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("video, audio").forEach((media) => {
        if (!media.paused) { media.pause(); media.autoplay = false; media.controls = true; }
    });
    document.querySelectorAll("iframe").forEach((iframe) => {
        if (/youtube\.com|vimeo\.com/.test(iframe.src)) iframe.src = iframe.src;
    });
});

// ====================================
// Color‑Blindness Simulation Modes
// ====================================

// Utility to parse CSS rgb/rgba strings
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

const PROTANOPIA_FILTER = "grayscale(30%) brightness(90%) sepia(20%) ...";
const DEUTERANOPIA_FILTER = "grayscale(20%) brightness(90%) sepia(30%) ...";
const TRITANOPIA_FILTER = "grayscale(20%) brightness(90%) sepia(10%) ...";

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

chrome.runtime.onMessage.addListener((req, snd, resp) => {
    if (req.action === "fixProtanopiaColors") fixProtanopiaColors();
    if (req.action === "fixDeuteranopiaColors") fixDeuteranopiaColors();
    if (req.action === "fixTritanopiaColors") fixTritanopiaColors();
});
