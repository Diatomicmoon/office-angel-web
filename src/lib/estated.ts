/**
 * Estated API Client Wrapper
 * Documentation: https://estated.com/developers/docs/v4
 */

const ESTATED_API_KEY = process.env.ESTATED_API_KEY;
const BASE_URL = 'https://apis.estated.com/v4';

export interface EstatedPropertyResponse {
  data: {
    address: {
      formatted_street_address: string;
      city: string;
      state: string;
      zip_code: string;
    };
    owner: {
      name: string;
      formatted_street_address: string;
      owner_occupied: "Yes" | "No";
    };
    parcel: {
      year_built: number;
    };
    deeds: Array<{
      recording_date: string;
      buyer_name: string;
    }>;
  };
  warnings?: string[];
}

/**
 * Look up a single property by address
 */
export async function getPropertyByAddress(address: string, city: string, state: string, zip?: string): Promise<EstatedPropertyResponse | null> {
  if (!ESTATED_API_KEY) {
    console.warn("ESTATED_API_KEY not set. Returning null.");
    return null;
  }

  try {
    const url = new URL(`${BASE_URL}/property`);
    url.searchParams.append('token', ESTATED_API_KEY);
    url.searchParams.append('street_address', address);
    url.searchParams.append('city', city);
    url.searchParams.append('state', state);
    if (zip) url.searchParams.append('zip_code', zip);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Estated API Error: ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Estated lookup failed:", err);
    return null;
  }
}
