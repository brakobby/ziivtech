// Resolves image paths stored by the CMS (e.g. "/src/assets/work/xbyt.png")
// to Astro image metadata, so they get the same optimisation as imports.
const ALL = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
});

export function resolveImage(path: string | null | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  const key = path.startsWith('/') ? path : `/${path}`;
  return ALL[key]?.default;
}

/** Like resolveImage, but falls back to a bundled image if the path is missing. */
export function imageOr(path: string | null | undefined, fallback: ImageMetadata): ImageMetadata {
  return resolveImage(path) ?? fallback;
}
