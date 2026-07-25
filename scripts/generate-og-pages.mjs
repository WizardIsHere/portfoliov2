// Runs after `vite build`. This is a client-only SPA — Vercel's Vite preset
// serves one index.html for every route, which means link-preview crawlers
// (they don't execute JS) see the exact same title/description/image no
// matter which project you share. Vercel serves a literal static file match
// before falling back to the SPA rewrite, so writing a real
// dist/services/<id>/index.html per project — same JS/CSS bundle, different
// <head> — gives each case study its own preview without a server.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services } from '../src/content/services.js';

const root = dirname(fileURLToPath(import.meta.url));
const distIndex = resolve(root, '../dist/index.html');
const SITE_URL = 'https://shushant.dev';

const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OG_IMAGE_BY_ID = {
    shortlistai: '/images/og/shortlistai.png',
    nile: '/images/og/nile.png',
    'admin-dashboard': '/images/og/admin-dashboard.png',
};

const patchHead = (html, { title, description, url, image }) =>
    html
        .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
        .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
        .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`)
        .replace(/<meta property="og:type" content=".*?" \/>/, '<meta property="og:type" content="article" />')
        .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
        .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`);

const run = async () => {
    const template = await readFile(distIndex, 'utf-8');

    for (const service of services) {
        const title = `${service.name} — Shushant M`;
        const description = escapeHtml(service.pitch);
        const url = `${SITE_URL}/services/${service.id}`;
        const imagePath = OG_IMAGE_BY_ID[service.id] || '/og-image.png';
        const image = `${SITE_URL}${imagePath}`;

        const html = patchHead(template, { title, description, url, image });

        const outDir = resolve(root, `../dist/services/${service.id}`);
        await mkdir(outDir, { recursive: true });
        await writeFile(resolve(outDir, 'index.html'), html);
        console.log(`  ✓ dist/services/${service.id}/index.html`);
    }
};

run();
