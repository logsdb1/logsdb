import { MetadataRoute } from "next";
import { technologies, logTypes } from "@/data";
import fs from "fs";
import path from "path";

interface UploadMetadata {
  id: string;
  uploadedAt: string;
}

interface MetadataFile {
  uploads: UploadMetadata[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://logsdb.com";
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/logs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/regex`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/parser`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/generator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/export`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contributors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/uploads`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Technology pages
  const technologyPages: MetadataRoute.Sitemap = Object.keys(technologies).map(
    (techId) => ({
      url: `${baseUrl}/logs/${techId}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Log type pages (highest priority content)
  const logTypePages: MetadataRoute.Sitemap = Object.keys(logTypes).map(
    (key) => {
      const [techId, logTypeId] = key.split("/");
      return {
        url: `${baseUrl}/logs/${techId}/${logTypeId}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      };
    }
  );

  // Individual upload pages
  let uploadPages: MetadataRoute.Sitemap = [];
  try {
    const metadataPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "logs-metadata.json"
    );
    if (fs.existsSync(metadataPath)) {
      const metadataContent = fs.readFileSync(metadataPath, "utf-8");
      const metadata: MetadataFile = JSON.parse(metadataContent);
      uploadPages = metadata.uploads.map((upload) => ({
        url: `${baseUrl}/uploads/${upload.id}`,
        lastModified: new Date(upload.uploadedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // If metadata file doesn't exist or is invalid, skip upload pages
  }

  return [...staticPages, ...technologyPages, ...logTypePages, ...uploadPages];
}
