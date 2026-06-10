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

/** CR's GHL pipeline stage map — keyed by stage ID */
export const GHL_STAGE_MAP: Record<string, string> = {
  "9bd7829d-4606-441a-a0d4-6987d649b768": "New Lead",
  "822d8ae8-3066-471b-ad0a-d61f95ee6875": "Contacted",
  "34bc469b-0b21-4fba-8836-85c46050cd83": "Declined Appointment",
  "59331e3b-867b-4734-84e5-fcba24d129ef": "Appointment Set",
  "7b264dad-066b-4fd0-8479-a2ee693eb6cd": "Demo Ran",
  "d1863b31-ffc5-4394-8b38-a1c02307d1f0": "Limbo",
  "de233045-bbd2-49a1-a0a3-f3832603fd4f": "Closed",
  "b43070e0-920e-4601-8bdf-ada40cf8a1de": "Declined Offer",
  "5f248685-fa84-4aba-8895-4837b302a4b9": "Installed",
};

/** Stage pill color map */
export const GHL_STAGE_COLOR: Record<string, string> = {
  "New Lead": "bg-blue-50 text-blue-700 border-blue-200",
  "Contacted": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Declined Appointment": "bg-red-50 text-red-700 border-red-200",
  "Appointment Set": "bg-purple-50 text-purple-700 border-purple-200",
  "Demo Ran": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Limbo": "bg-gray-50 text-gray-600 border-gray-200",
  "Closed": "bg-green-50 text-green-700 border-green-200",
  "Declined Offer": "bg-orange-50 text-orange-700 border-orange-200",
  "Installed": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** GHL deep link to a contact's full profile */
export function ghlContactUrl(contactId: string) {
  return `https://app.gohighlevel.com/location/${GHL_LOCATION_ID}/contacts/detail/${contactId}`;
}

/** Fetch opportunities for a specific contact */
export async function getContactOpportunities(contactId: string) {
  const res = await fetch(
    `${GHL_BASE}/contacts/${contactId}/opportunities`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.opportunities || [];
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
