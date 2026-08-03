/**
 * Fawtara is deployed as a fully static, client-rendered SPA to GitHub Pages
 * at https://box-the-third.github.io/fawtara/ — hence `output: 'export'` and
 * a `/fawtara` base path. Keep BASE_PATH in sync with lib/site.ts.
 */
const BASE_PATH = "/fawtara";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  reactStrictMode: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  },
};

export default nextConfig;
