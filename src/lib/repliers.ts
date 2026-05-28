/**
 * Repliers API Client Wrapper
 * Documentation: https://docs.repliers.com/
 */

const REPLIERS_API_KEY = process.env.REPLIERS_API_KEY;
const BASE_URL = 'https://api.repliers.io';

export interface RepliersPropertyResponse {
  listings: Array<{
    mlsNumber: string;
    address: {
      streetNumber: string;
      streetName: string;
      city: string;
      state: string;
      zip: string;
    };
    details: {
      yearBuilt?: string;
      propertyType: string;
    };
    listPrice: string;
    soldPrice?: string;
    soldDate?: string;
    // Note: Repliers is an MLS aggregator. It may not provide raw county tax assessor data 
    // (like exact owner names) unless they explicitly support public records/tax data in their plan.
  }>;
}

/**
 * Look up recently sold properties or specific listings
 */
export async function getProperties(params: Record<string, string>): Promise<RepliersPropertyResponse | null> {
  if (!REPLIERS_API_KEY) {
    console.warn("REPLIERS_API_KEY not set. Returning null.");
    return null;
  }

  try {
    const url = new URL(`${BASE_URL}/listings`);
    
    // Add all query params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const res = await fetch(url.toString(), {
      headers: {
        'REPLIERS-API-KEY': REPLIERS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error(`Repliers API Error: ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Repliers lookup failed:", err);
    return null;
  }
}
