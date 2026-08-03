// Deploy config. BASE_PATH must match `basePath` in next.config.mjs.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/fawtara";

/** Absolute URL within the app, honouring the GitHub Pages base path. */
export function appUrl(path = "/"): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${BASE_PATH}${clean}`;
}
