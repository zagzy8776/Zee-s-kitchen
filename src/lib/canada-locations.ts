/**
 * Canada local SEO locations for Zee's Kitchen (Winnipeg, MB).
 *
 * Strategy:
 * - Real pages only (no empty doorway spam)
 * - All 13 provinces & territories
 * - Major cities + full Manitoba / Winnipeg metro focus
 * - Used by sitemap, location landing pages, and LocalBusiness schema
 */

export type Province = {
  code: string;
  name: string;
  slug: string;
};

export type City = {
  name: string;
  slug: string;
  provinceCode: string;
  /** Prioritize in sitemap / internal linking */
  priority?: number;
};

export const PROVINCES: Province[] = [
  { code: "AB", name: "Alberta", slug: "alberta" },
  { code: "BC", name: "British Columbia", slug: "british-columbia" },
  { code: "MB", name: "Manitoba", slug: "manitoba" },
  { code: "NB", name: "New Brunswick", slug: "new-brunswick" },
  { code: "NL", name: "Newfoundland and Labrador", slug: "newfoundland-and-labrador" },
  { code: "NS", name: "Nova Scotia", slug: "nova-scotia" },
  { code: "NT", name: "Northwest Territories", slug: "northwest-territories" },
  { code: "NU", name: "Nunavut", slug: "nunavut" },
  { code: "ON", name: "Ontario", slug: "ontario" },
  { code: "PE", name: "Prince Edward Island", slug: "prince-edward-island" },
  { code: "QC", name: "Quebec", slug: "quebec" },
  { code: "SK", name: "Saskatchewan", slug: "saskatchewan" },
  { code: "YT", name: "Yukon", slug: "yukon" },
];

/** Major cities + complete Winnipeg metro / Manitoba coverage */
export const CITIES: City[] = [
  { name: "Winnipeg", slug: "winnipeg", provinceCode: "MB", priority: 1 },
  { name: "Brandon", slug: "brandon", provinceCode: "MB", priority: 0.9 },
  { name: "Steinbach", slug: "steinbach", provinceCode: "MB", priority: 0.85 },
  { name: "Thompson", slug: "thompson", provinceCode: "MB", priority: 0.8 },
  { name: "Portage la Prairie", slug: "portage-la-prairie", provinceCode: "MB", priority: 0.85 },
  { name: "Winkler", slug: "winkler", provinceCode: "MB", priority: 0.8 },
  { name: "Selkirk", slug: "selkirk", provinceCode: "MB", priority: 0.85 },
  { name: "Dauphin", slug: "dauphin", provinceCode: "MB", priority: 0.75 },
  { name: "Morden", slug: "morden", provinceCode: "MB", priority: 0.75 },
  { name: "The Pas", slug: "the-pas", provinceCode: "MB", priority: 0.7 },
  { name: "Flin Flon", slug: "flin-flon", provinceCode: "MB", priority: 0.7 },
  { name: "Gimli", slug: "gimli", provinceCode: "MB", priority: 0.75 },
  { name: "Stonewall", slug: "stonewall", provinceCode: "MB", priority: 0.8 },
  { name: "Oakbank", slug: "oakbank", provinceCode: "MB", priority: 0.8 },
  { name: "Niverville", slug: "niverville", provinceCode: "MB", priority: 0.8 },
  { name: "St. Andrews", slug: "st-andrews", provinceCode: "MB", priority: 0.75 },
  { name: "Beausejour", slug: "beausejour", provinceCode: "MB", priority: 0.75 },
  { name: "Carman", slug: "carman", provinceCode: "MB", priority: 0.7 },
  { name: "Neepawa", slug: "neepawa", provinceCode: "MB", priority: 0.7 },
  { name: "Swan River", slug: "swan-river", provinceCode: "MB", priority: 0.7 },
  { name: "St. Boniface", slug: "st-boniface", provinceCode: "MB", priority: 0.9 },
  { name: "Transcona", slug: "transcona", provinceCode: "MB", priority: 0.85 },
  { name: "St. Vital", slug: "st-vital", provinceCode: "MB", priority: 0.85 },
  { name: "Fort Garry", slug: "fort-garry", provinceCode: "MB", priority: 0.85 },
  { name: "Charleswood", slug: "charleswood", provinceCode: "MB", priority: 0.8 },
  { name: "Tuxedo", slug: "tuxedo", provinceCode: "MB", priority: 0.8 },
  { name: "River Heights", slug: "river-heights", provinceCode: "MB", priority: 0.8 },
  { name: "East Kildonan", slug: "east-kildonan", provinceCode: "MB", priority: 0.8 },
  { name: "West Kildonan", slug: "west-kildonan", provinceCode: "MB", priority: 0.8 },
  { name: "St. James", slug: "st-james", provinceCode: "MB", priority: 0.85 },
  { name: "Garden City", slug: "garden-city", provinceCode: "MB", priority: 0.8 },
  { name: "North Kildonan", slug: "north-kildonan", provinceCode: "MB", priority: 0.8 },
  { name: "Toronto", slug: "toronto", provinceCode: "ON", priority: 0.7 },
  { name: "Ottawa", slug: "ottawa", provinceCode: "ON", priority: 0.65 },
  { name: "Mississauga", slug: "mississauga", provinceCode: "ON", priority: 0.6 },
  { name: "Brampton", slug: "brampton", provinceCode: "ON", priority: 0.6 },
  { name: "Hamilton", slug: "hamilton", provinceCode: "ON", priority: 0.6 },
  { name: "London", slug: "london", provinceCode: "ON", priority: 0.55 },
  { name: "Markham", slug: "markham", provinceCode: "ON", priority: 0.55 },
  { name: "Vaughan", slug: "vaughan", provinceCode: "ON", priority: 0.55 },
  { name: "Kitchener", slug: "kitchener", provinceCode: "ON", priority: 0.55 },
  { name: "Windsor", slug: "windsor", provinceCode: "ON", priority: 0.55 },
  { name: "Richmond Hill", slug: "richmond-hill", provinceCode: "ON", priority: 0.5 },
  { name: "Oakville", slug: "oakville", provinceCode: "ON", priority: 0.5 },
  { name: "Burlington", slug: "burlington", provinceCode: "ON", priority: 0.5 },
  { name: "Oshawa", slug: "oshawa", provinceCode: "ON", priority: 0.5 },
  { name: "Barrie", slug: "barrie", provinceCode: "ON", priority: 0.5 },
  { name: "Kingston", slug: "kingston", provinceCode: "ON", priority: 0.5 },
  { name: "Guelph", slug: "guelph", provinceCode: "ON", priority: 0.5 },
  { name: "Cambridge", slug: "cambridge", provinceCode: "ON", priority: 0.5 },
  { name: "Waterloo", slug: "waterloo", provinceCode: "ON", priority: 0.5 },
  { name: "Thunder Bay", slug: "thunder-bay", provinceCode: "ON", priority: 0.55 },
  { name: "Sudbury", slug: "sudbury", provinceCode: "ON", priority: 0.5 },
  { name: "St. Catharines", slug: "st-catharines", provinceCode: "ON", priority: 0.5 },
  { name: "Calgary", slug: "calgary", provinceCode: "AB", priority: 0.65 },
  { name: "Edmonton", slug: "edmonton", provinceCode: "AB", priority: 0.65 },
  { name: "Red Deer", slug: "red-deer", provinceCode: "AB", priority: 0.5 },
  { name: "Lethbridge", slug: "lethbridge", provinceCode: "AB", priority: 0.5 },
  { name: "St. Albert", slug: "st-albert", provinceCode: "AB", priority: 0.5 },
  { name: "Medicine Hat", slug: "medicine-hat", provinceCode: "AB", priority: 0.5 },
  { name: "Grande Prairie", slug: "grande-prairie", provinceCode: "AB", priority: 0.5 },
  { name: "Airdrie", slug: "airdrie", provinceCode: "AB", priority: 0.5 },
  { name: "Fort McMurray", slug: "fort-mcmurray", provinceCode: "AB", priority: 0.5 },
  { name: "Vancouver", slug: "vancouver", provinceCode: "BC", priority: 0.65 },
  { name: "Surrey", slug: "surrey", provinceCode: "BC", priority: 0.55 },
  { name: "Burnaby", slug: "burnaby", provinceCode: "BC", priority: 0.55 },
  { name: "Richmond", slug: "richmond", provinceCode: "BC", priority: 0.55 },
  { name: "Victoria", slug: "victoria", provinceCode: "BC", priority: 0.55 },
  { name: "Abbotsford", slug: "abbotsford", provinceCode: "BC", priority: 0.5 },
  { name: "Coquitlam", slug: "coquitlam", provinceCode: "BC", priority: 0.5 },
  { name: "Kelowna", slug: "kelowna", provinceCode: "BC", priority: 0.5 },
  { name: "Langley", slug: "langley", provinceCode: "BC", priority: 0.5 },
  { name: "Saanich", slug: "saanich", provinceCode: "BC", priority: 0.5 },
  { name: "Delta", slug: "delta", provinceCode: "BC", priority: 0.5 },
  { name: "Kamloops", slug: "kamloops", provinceCode: "BC", priority: 0.5 },
  { name: "Nanaimo", slug: "nanaimo", provinceCode: "BC", priority: 0.5 },
  { name: "Prince George", slug: "prince-george", provinceCode: "BC", priority: 0.5 },
  { name: "Montreal", slug: "montreal", provinceCode: "QC", priority: 0.65 },
  { name: "Quebec City", slug: "quebec-city", provinceCode: "QC", priority: 0.55 },
  { name: "Laval", slug: "laval", provinceCode: "QC", priority: 0.5 },
  { name: "Gatineau", slug: "gatineau", provinceCode: "QC", priority: 0.5 },
  { name: "Longueuil", slug: "longueuil", provinceCode: "QC", priority: 0.5 },
  { name: "Sherbrooke", slug: "sherbrooke", provinceCode: "QC", priority: 0.5 },
  { name: "Saguenay", slug: "saguenay", provinceCode: "QC", priority: 0.45 },
  { name: "Levis", slug: "levis", provinceCode: "QC", priority: 0.45 },
  { name: "Trois-Rivieres", slug: "trois-rivieres", provinceCode: "QC", priority: 0.45 },
  { name: "Saskatoon", slug: "saskatoon", provinceCode: "SK", priority: 0.6 },
  { name: "Regina", slug: "regina", provinceCode: "SK", priority: 0.6 },
  { name: "Prince Albert", slug: "prince-albert", provinceCode: "SK", priority: 0.5 },
  { name: "Moose Jaw", slug: "moose-jaw", provinceCode: "SK", priority: 0.5 },
  { name: "Swift Current", slug: "swift-current", provinceCode: "SK", priority: 0.45 },
  { name: "Yorkton", slug: "yorkton", provinceCode: "SK", priority: 0.45 },
  { name: "Halifax", slug: "halifax", provinceCode: "NS", priority: 0.55 },
  { name: "Sydney", slug: "sydney", provinceCode: "NS", priority: 0.45 },
  { name: "Dartmouth", slug: "dartmouth", provinceCode: "NS", priority: 0.5 },
  { name: "Moncton", slug: "moncton", provinceCode: "NB", priority: 0.5 },
  { name: "Saint John", slug: "saint-john", provinceCode: "NB", priority: 0.5 },
  { name: "Fredericton", slug: "fredericton", provinceCode: "NB", priority: 0.5 },
  { name: "Charlottetown", slug: "charlottetown", provinceCode: "PE", priority: 0.5 },
  { name: "Summerside", slug: "summerside", provinceCode: "PE", priority: 0.45 },
  { name: "St. John's", slug: "st-johns", provinceCode: "NL", priority: 0.5 },
  { name: "Corner Brook", slug: "corner-brook", provinceCode: "NL", priority: 0.45 },
  { name: "Mount Pearl", slug: "mount-pearl", provinceCode: "NL", priority: 0.45 },
  { name: "Whitehorse", slug: "whitehorse", provinceCode: "YT", priority: 0.45 },
  { name: "Yellowknife", slug: "yellowknife", provinceCode: "NT", priority: 0.45 },
  { name: "Iqaluit", slug: "iqaluit", provinceCode: "NU", priority: 0.4 },
];

export function getProvince(codeOrSlug: string) {
  const key = codeOrSlug.toLowerCase();
  return PROVINCES.find(
    (p) => p.code.toLowerCase() === key || p.slug === key,
  );
}

export function getCity(provinceSlug: string, citySlug: string) {
  const province = getProvince(provinceSlug);
  if (!province) return null;
  const city = CITIES.find(
    (c) => c.provinceCode === province.code && c.slug === citySlug,
  );
  if (!city) return null;
  return { province, city };
}

export function citiesByProvince(code: string) {
  return CITIES.filter((c) => c.provinceCode === code);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://zee-s-kitchen.vercel.app";

export const BUSINESS = {
  name: "Zee's Comfort Kitchen",
  legalName: "Zee's Kitchen",
  description:
    "Comfort food made with love in Winnipeg, Manitoba. Order ahead for pickup or delivery. 24–48 hour notice for freshly prepared meals.",
  phone: "+1-204-963-5748",
  whatsapp: "https://wa.me/12049635748",
  email: "",
  city: "Winnipeg",
  region: "MB",
  postalCode: "",
  country: "CA",
  priceRange: "$$",
  cuisine: ["Comfort Food", "African", "West African", "Canadian"],
  sameAs: [
    "https://www.tiktok.com/@zeescomfortkitchen",
    "https://www.snapchat.com/add/monkele_1",
  ],
};
