import type { MetadataRoute } from "next";
import { CITIES, PROVINCES, SITE_URL } from "@/lib/canada-locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/book`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/cart`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/checkout`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/locations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const provinces: MetadataRoute.Sitemap = PROVINCES.map((p) => ({
    url: `${SITE_URL}/locations/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.code === "MB" ? 0.9 : 0.7,
  }));

  const cities: MetadataRoute.Sitemap = CITIES.map((c) => {
    const province = PROVINCES.find((p) => p.code === c.provinceCode)!;
    return {
      url: `${SITE_URL}/locations/${province.slug}/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: c.priority ?? 0.5,
    };
  });

  return [...core, ...provinces, ...cities];
}
