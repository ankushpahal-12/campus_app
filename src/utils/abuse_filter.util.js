/**
 * Simple regex-based abuse filter for community standards enforcement.
 */
const blockedKeywords = [
    /\bbsdk\b/i,
    /\bmc\b/i,
    /\bbc\b/i,
    /\bmadarchod\b/i,
    /\bbehenchod\b/i,
    /\bgali\b/i,
    /\bc*h*u*t*i*y*a\b/i, // Basic obfuscation check
    // Add more patterns as needed
];

exports.containsAbuse = (text) => {
    if (!text) return false;
    return blockedKeywords.some(pattern => pattern.test(text));
};
