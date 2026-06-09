/**
 * GHL (GoHighLevel) shared client utility
 * All GHL API calls route through here so keys/base URL are in one place.
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function headers() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
  };
}

export const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || "";

/** Fetch a paginated list of contacts */
export async function getContacts(opts: {
  limit?: number;
  query?: string;
  startAfter?: string;
  startAfterId?: string;
} = {}) {
  const params = new URLSearchParams({
    locationId: GHL_LOCATION_ID,
    limit: String(opts.limit ?? 20),
    ...(opts.query ? { query: opts.query } : {}),
    ...(opts.startAfter ? { startAfter: opts.startAfter } : {}),
    ...(opts.startAfterId ? { startAfterId: opts.startAfterId } : {}),
  });

  const res = await fetch(`${GHL_BASE}/contacts/?${params}`, {
    headers: headers(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`GHL contacts error: ${res.status}`);
  return res.json();
}

/** Fetch a single contact by ID */
export async function getContact(id: string) {
  const res = await fetch(`${GHL_BASE}/contacts/${id}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GHL contact error: ${res.status}`);
  return res.json();
}

/** Normalize a raw GHL contact to a clean shape used across the app */
export function normalizeContact(c: any) {
  return {
    id: c.id,
    name: c.contactName || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unknown",
    firstName: c.firstName || "",
    lastName: c.lastName || "",
    email: c.email || null,
    phone: c.phone || null,
    address: [c.address1, c.city, c.state, c.postalCode].filter(Boolean).join(", ") || null,
    city: c.city || null,
    state: c.state || null,
    zip: c.postalCode || null,
    tags: c.tags || [],
    type: c.type || "lead",
    source: c.attributions?.[0]?.utmSessionSource || c.source || null,
    dateAdded: c.dateAdded || null,
    dateUpdated: c.dateUpdated || null,
  };
}
