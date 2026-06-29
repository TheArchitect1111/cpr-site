import type { MetadataRoute } from 'next';
import { getPwaConfig } from '@/lib/pwa/pwa-config';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const c = getPwaConfig();
  return {
    name: c.name,
    short_name: c.shortName,
    description: c.description,
    start_url: c.startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: c.backgroundColor,
    theme_color: c.themeColor,
    categories: ['sports', 'education', 'productivity'],
    icons: [
      { src: c.icon, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: c.icon, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: c.maskableIcon, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
