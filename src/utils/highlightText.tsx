/**
 * Highlight matching text in search results
 *
 * @param text - The text to search in
 * @param highlight - The search term to highlight
 * @param className - Optional custom className for highlight
 * @returns React element with highlighted text
 */

export function highlightText(
    text: string | null | undefined,
    highlight: string | null | undefined,
    className?: string
): React.ReactNode {
    // Return original text if no highlight term or text
    if (!highlight || !highlight.trim() || !text) {
        return text || '';
    }

    const searchTerm = highlight.trim();

    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create case-insensitive regex
    const regex = new RegExp(`(${escapedTerm})`, 'gi');

    // Split text by matching term
    const parts = text.split(regex);

    // Return parts with highlighted matches
    return (
        <>
            {parts.map((part, index) => {
                // Check if this part matches the search term (case-insensitive)
                const isMatch = regex.test(part);

                // Reset regex lastIndex for next test
                regex.lastIndex = 0;

                if (isMatch) {
                    return (
                        <mark
                            key={index}
                            className={className || "bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded"}
                        >
                            {part}
                        </mark>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </>
    );
}

/**
 * Highlight multiple search terms
 * Useful for multi-word searches
 */
export function highlightMultipleTerms(
    text: string | null | undefined,
    highlights: string[],
    className?: string
): React.ReactNode {
    if (!text || !highlights || highlights.length === 0) {
        return text || '';
    }

    // Filter out empty terms
    const validTerms = highlights.filter(term => term && term.trim());

    if (validTerms.length === 0) {
        return text;
    }

    // Escape and join all terms with OR
    const escapedTerms = validTerms.map(term =>
        term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                const isMatch = regex.test(part);
                regex.lastIndex = 0;

                if (isMatch) {
                    return (
                        <mark
                            key={index}
                            className={className || "bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded"}
                        >
                            {part}
                        </mark>
                    );
                }

                return <span key={index}>{part}</span>;
            })}
        </>
    );
}
