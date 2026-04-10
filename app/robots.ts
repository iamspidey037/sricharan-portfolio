// app/robots.ts
import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://sricharan.dev';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/admin/', '/api/auth/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
