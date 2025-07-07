export function extractJson(text) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error("Could not find a valid JSON object in the response.");
    }
    return text.substring(firstBrace, lastBrace + 1);
}