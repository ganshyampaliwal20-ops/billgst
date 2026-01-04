import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://billgst.in';

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
