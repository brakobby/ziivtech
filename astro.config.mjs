// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// The Keystatic admin (/keystatic) runs on the dev server only, editing the
// content files on this machine. The production build stays fully static.
// To edit on the live site instead, switch keystatic.config.ts to GitHub
// storage and add a server adapter (see README).
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://ziivtech.com',
  integrations: [react(), ...(isDev ? [keystatic()] : [])],
});
