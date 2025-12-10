/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // enable static export (`next export`)
  images: {
    unoptimized: true,           // GitHub Pages can't do Next image optimization
  },
    typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If your site will be at https://<username>.github.io/<repo>
  basePath: '/rakenduste-programmeerimine-2025/ehitus-kontaktihaldur',
  assetPrefix: '/rakenduste-programmeerimine-2025/ehitus-kontaktihaldur/',
}

module.exports = nextConfig