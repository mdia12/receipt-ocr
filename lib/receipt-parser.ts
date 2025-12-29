
/**
 * Helper to parse a string into a float, handling various formats.
 * Supports:
 * - 123.45
 * - 123,45
 * - 1 234.45
 * - 1.234,45
 */
export function parseEuroNumberToFloat(str: string): number | null {
    if (!str) return null;
    
    // Remove spaces
    let clean = str.replace(/\s/g, '');
    
    // Handle 1.234,56 (European with thousand dot)
    // If both dot and comma exist
    if (clean.includes('.') && clean.includes(',')) {
        const lastDot = clean.lastIndexOf('.');
        const lastComma = clean.lastIndexOf(',');
        
        if (lastDot < lastComma) {
            // Format: 1.234,56 -> Remove dots, replace comma with dot
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
            // Format: 1,234.56 -> Remove commas
            clean = clean.replace(/,/g, '');
        }
    } else if (clean.includes(',')) {
        // Format: 123,45 -> Replace comma with dot
        clean = clean.replace(',', '.');
    }
    
    const val = parseFloat(clean);
    return isNaN(val) ? null : val;
}

interface AmountCandidate {
    val: number;
    lineIndex: number;
    score: number;
    raw: string;
    context: string;
}

export function extractAmount(lines: string[], debug = false): { amount: number | null, currency: string } {
    const candidates: AmountCandidate[] = [];
    const currency = "EUR"; // Default

    // 1. Normalization & Blacklist
    // Hard blacklist: always exclude these lines
    const hardBlacklist = [
        'iban', 'bic', 'siret', 'siren', 'intracom', 'rcs', 'immatriculation', 
        'téléphone', 'tel:', 'tel ', 'fax'
    ];
    
    // Context blacklist: exclude unless it looks like a total line
    // "tva" is tricky. Usually we want to exclude "Dont TVA" lines.
    // But "Total TTC (incl TVA)" should be kept.
    // We'll handle "tva" via scoring penalty instead of hard exclusion if "total" is present.
    const softBlacklist = [
        'ref', 'référence', 'facture n', ' n°', 'numéro'
    ];

    // Regex for finding price-like patterns
    // Captures: 123,45 | 123.45 | 1 234,56 | 1.234,56
    // We look for a number with at least one decimal or thousand separator, or just a float.
    // \d{1,3} followed by groups
    const priceRegex = /\b\d{1,3}(?:[\s.]\d{3})*(?:[.,]\d{2})?\b|\b\d+[.,]\d{2}\b/g;

    lines.forEach((line, idx) => {
        const lower = line.trim().toLowerCase().replace(/\s+/g, ' ');
        if (!lower) return;

        // Check Hard Blacklist
        if (hardBlacklist.some(w => lower.includes(w))) {
            if (debug) console.log(`[Parser] Line ${idx} ignored (hard blacklist): ${lower}`);
            return;
        }

        // Check Soft Blacklist (skip if present, unless "total" or "ttc" or "payer" is there)
        const hasTotalKeyword = lower.includes('total') || lower.includes('ttc') || lower.includes('payer') || lower.includes('montant');
        if (!hasTotalKeyword && softBlacklist.some(w => lower.includes(w))) {
             if (debug) console.log(`[Parser] Line ${idx} ignored (soft blacklist): ${lower}`);
             return;
        }
        
        // Special case for TVA: if line has "tva" and NO "total"/"ttc"/"payer", ignore it (it's likely a tax line)
        if (lower.includes('tva') && !hasTotalKeyword) {
            if (debug) console.log(`[Parser] Line ${idx} ignored (TVA line): ${lower}`);
            return;
        }

        // Extract numbers
        const matches = line.match(priceRegex);
        if (!matches) return;

        matches.forEach(match => {
            const val = parseEuroNumberToFloat(match);
            if (val === null) return;

            // Filter implausible values
            if (val > 100000) return; // Too high
            if (val === 0) return; // Zero is rarely the total to pay

            // Filter IBAN-like segments (e.g. 4 digits exactly, often year or code)
            // But be careful, 12.00 is 4 digits/chars.
            // If it's an integer and looks like a year (1990-2030), skip it
            if (Number.isInteger(val) && val >= 1990 && val <= 2030) return;

            // Scoring
            let score = 0;

            // Positive keywords
            if (lower.includes('total ttc') || lower.includes('montant total') || lower.includes('total à payer') || lower.includes('net à payer')) score += 5;
            else if (lower.includes('total') || lower.includes('a payer') || lower.includes('à payer')) score += 4;
            
            if (lower.includes('ttc')) score += 3;
            if (lower.includes('€') || lower.includes('eur')) score += 2;

            // Negative keywords
            if (lower.includes('tva')) score -= 4;
            if (lower.includes('ht')) score -= 4;
            if (lower.includes('hors taxe')) score -= 4;
            if (lower.includes('acompte')) score -= 4;
            if (lower.includes('remise')) score -= 4;
            if (lower.includes('frais')) score -= 2;
            
            // Position bias: totals are often at the end
            // Normalize position 0..1
            const pos = idx / lines.length;
            if (pos > 0.6) score += 1;
            if (pos > 0.8) score += 1;

            candidates.push({
                val,
                lineIndex: idx,
                score,
                raw: match,
                context: lower
            });
        });
    });

    if (candidates.length === 0) {
        return { amount: null, currency };
    }

    // Sort candidates
    // 1. Score DESC
    // 2. Value DESC (if scores equal, prefer higher amount - usually Total > HT)
    candidates.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.val - a.val;
    });

    if (debug) {
        console.log("[Parser] Candidates:", candidates.slice(0, 5));
    }

    // Return best candidate
    // If best candidate has negative score, we might want to be careful, but usually it's still the best guess.
    // However, if we have a tie in score, we took the max value.
    
    return { amount: candidates[0].val, currency };
}

export function extractVAT(lines: string[], totalTTC: number | null = null, debug = false): number | null {
    let vatAmount = 0;
    let vatLinesFound = 0;
    
    const hardBlacklist = [
        'iban', 'bic', 'siret', 'siren', 'intracom', 'rcs', 'immatriculation', 
        'téléphone', 'tel:', 'tel ', 'fax', 'facture n', 'ref', 'référence', 'numéro',
        'capital', 'social'
    ];

    const vatKeywordsRegex = /\b(tva|vat|taxe|t\.v\.a\.?)\b/i;
    // Regex for EU amounts: 123,45 | 1 234,56 | 1.234,56 | 1234.56
    const priceRegex = /\b\d{1,3}(?:[\s.]\d{3})*(?:[.,]\d{2})?\b|\b\d+[.,]\d{2}\b/g;

    if (debug) console.log(`[VAT] Starting extraction on ${lines.length} lines. TotalTTC: ${totalTTC}`);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.trim().toLowerCase().replace(/\s+/g, ' ');
        if (!lower) continue;

        // 1. Check Blacklist
        if (hardBlacklist.some(w => lower.includes(w))) {
            if (debug) console.log(`[VAT] Line ${i} ignored (blacklist): ${lower}`);
            continue;
        }

        // 2. Check Keywords
        if (!vatKeywordsRegex.test(lower)) {
            continue;
        }

        // 3. Exclude if "HT" is present WITHOUT "TVA"
        // If we are here, "TVA" IS in the line (checked by vatKeywordsRegex).
        
        // 4. Extract numbers
        let matches = line.match(priceRegex);
        let validCandidatesOnLine: number[] = [];

        // Helper to process matches and return valid ones
        const processMatches = (matches: RegExpMatchArray | null, currentLine: string): number[] => {
            if (!matches) return [];
            const candidates: number[] = [];
            for (const match of matches) {
                const val = parseEuroNumberToFloat(match);
                if (val === null) continue;
                if (val === 0) continue;
                
                // Ignore if it looks like a percentage (e.g. 20% or 20.00 %)
                // Escape match for regex
                const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const percentRegex = new RegExp(`${escapedMatch}\\s*%`);
                if (percentRegex.test(currentLine)) {
                    if (debug) console.log(`[VAT] Ignored percentage value: ${val} on line: ${currentLine}`);
                    continue;
                }

                // Ignore if value is equal to TotalTTC (it's likely the total line repeated with "TVA incluse")
                if (totalTTC && Math.abs(val - totalTTC) < 0.05) {
                     if (debug) console.log(`[VAT] Ignored value equal to TotalTTC: ${val}`);
                     continue;
                }

                // Ignore if value is greater than TotalTTC (VAT cannot be > Total)
                if (totalTTC && val > totalTTC) {
                     if (debug) console.log(`[VAT] Ignored value > TotalTTC: ${val}`);
                     continue;
                }

                candidates.push(val);
            }
            return candidates;
        };

        // Process current line matches
        validCandidatesOnLine = processMatches(matches, line);

        // If no valid candidates on current line, check next line
        if (validCandidatesOnLine.length === 0 && i + 1 < lines.length) {
             const nextLine = lines[i+1];
             const nextMatches = nextLine.match(priceRegex);
             if (nextMatches) {
                 const nextCandidates = processMatches(nextMatches, nextLine);
                 if (nextCandidates.length > 0) {
                     validCandidatesOnLine = nextCandidates;
                     if (debug) console.log(`[VAT] Found keyword on line ${i} ("${line}") but no valid number. Using number from line ${i+1} ("${nextLine}")`);
                 }
             }
        }

        if (validCandidatesOnLine.length > 0) {
            // Heuristic: 
            // If multiple numbers, usually the VAT amount is the smaller one (if HT is also there).
            // Example: "Base 100.00 TVA 20.00" -> 20.00 is smaller.
            validCandidatesOnLine.sort((a, b) => a - b);
            
            const bestCandidate = validCandidatesOnLine[0];
            
            vatAmount += bestCandidate;
            vatLinesFound++;
            if (debug) console.log(`[VAT] Found VAT line: "${line}" -> ${bestCandidate}`);
        }
    }

    if (vatLinesFound > 0) {
        return parseFloat(vatAmount.toFixed(2));
    }
    
    if (debug) console.log("[VAT] No explicit VAT lines found. Trying fallback.");

    // 2. Fallback: TTC - HT
    if (totalTTC) {
        const totalHT = extractHT(lines, totalTTC);
        if (totalHT) {
            const calculatedVAT = totalTTC - totalHT;
            // Sanity check: VAT is usually between 1% and 30% of HT
            // But let's just check it's positive and < TTC
            if (calculatedVAT > 0 && calculatedVAT < totalTTC) {
                if (debug) console.log(`[VAT] Calculated from TTC (${totalTTC}) - HT (${totalHT}) = ${calculatedVAT}`);
                return parseFloat(calculatedVAT.toFixed(2));
            }
        }
    }

    if (debug) {
        console.log("[VAT] VAT_NOT_FOUND");
        // Log context around potential candidates
        lines.forEach((line, idx) => {
            if (vatKeywordsRegex.test(line)) {
                console.log(`[VAT] Context line ${idx}: ${line}`);
            }
        });
    }
    return null;
}

function extractHT(lines: string[], totalTTC: number): number | null {
    let bestHT = 0;
    const htRegex = /\b(total ht|montant ht|hors taxe|total net ht|sous-total ht|h\.t\.?|ht)\b/i;
    const priceRegex = /\b\d{1,3}(?:[\s.]\d{3})*(?:[.,]\d{2})?\b|\b\d+[.,]\d{2}\b/g;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lower = line.trim().toLowerCase().replace(/\s+/g, ' ');
        
        if (!htRegex.test(lower) && !lower.includes('hors taxe')) continue;
        
        let matches = line.match(priceRegex);
        
        // NEW: Multiline support for HT
        if (!matches && i + 1 < lines.length) {
             const nextLine = lines[i+1];
             const nextMatches = nextLine.match(priceRegex);
             if (nextMatches) {
                 matches = nextMatches;
             }
        }

        if (!matches) continue;

        for (const match of matches) {
            const val = parseEuroNumberToFloat(match);
            if (val === null) continue;
            if (val >= totalTTC) continue; // HT must be < TTC
            
            // We take the largest number that is < TTC found on an HT line
            if (val > bestHT) bestHT = val;
        }
    }
    
    return bestHT > 0 ? bestHT : null;
}