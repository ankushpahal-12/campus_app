/**
 * Scan text for suspicious patterns (Links, Phone Numbers)
 */
exports.scanSuspicious = (text) => {
    const patterns = {
        url: /https?:\/\/\S+/gi,
        phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    };

    const matches = {
        hasUrl: patterns.url.test(text),
        hasPhone: patterns.phone.test(text),
        urls: text.match(patterns.url) || [],
        phones: text.match(patterns.phone) || []
    };

    return {
        isClean: !matches.hasUrl && !matches.hasPhone,
        matches
    };
};
