import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        ? process.env.NEXT_PUBLIC_APP_URL
        : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'https://billgst.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/blog', '/logo.png'],
                disallow: ['/api/', '/dashboard/'],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
