import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/profile/',
          '/settings/',
          '/xadmin/',
          '/xb49k-ctrl/',
          '/test-env/',
          '/admin-login/',
          '/forgot-password/',
          '/reset-password/',
        ],
      },
    ],
    sitemap: 'https://baytino.com/sitemap.xml',
  }
}
