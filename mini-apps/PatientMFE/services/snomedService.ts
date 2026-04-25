
import type { SnomedConcept } from '../types';

/**
 * SNOMED International Public Browser API (Snowstorm)
 * This service connects to the official public terminology server.
 * Note: In a production environment, you should use your own instance of Snowstorm 
 * or a licensed terminology service like Terminology.vic or Ontoserver.
 */
const SNOMED_API_BASE = 'https://browser.snomedtools.org/snowstorm/snomed-ct';
const BRANCH = 'MAIN';

export const snomedService = {
  /**
   * Searches for clinical concepts using the live SNOMED CT database.
   * Uses the 'descriptions' endpoint to find matches across synonyms and preferred terms.
   */
  async search(query: string): Promise<SnomedConcept[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    try {
      // Build search URL
      // active=true: Only return active descriptions
      // conceptActive=true: Only return active concepts
      // limit=15: Reasonable number for dropdown
      const url = new URL(`${SNOMED_API_BASE}/browser/${BRANCH}/descriptions`);
      url.searchParams.append('term', query);
      url.searchParams.append('active', 'true');
      url.searchParams.append('conceptActive', 'true');
      url.searchParams.append('limit', '15');
      url.searchParams.append('language', 'en');

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en'
        }
      });

      if (!response.ok) {
        throw new Error(`SNOMED API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || !Array.isArray(data.items)) {
        return [];
      }

      // Map API response to our SnomedConcept type
      // We use a Map to deduplicate results by Concept ID (since multiple descriptions can point to one concept)
      const uniqueConcepts = new Map<string, SnomedConcept>();

      data.items.forEach((item: any) => {
        const code = item.concept.conceptId || item.concept.id;
        if (!uniqueConcepts.has(code)) {
          uniqueConcepts.set(code, {
            code: code,
            // Use the matched term as display, or fall back to the concept's FSN
            display: item.term || item.concept.fsn.term
          });
        }
      });

      return Array.from(uniqueConcepts.values());
    } catch (error) {
      console.error("Live SNOMED search failed:", error);
      // Fallback to empty list so UI doesn't crash
      return [];
    }
  },
};
