/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.jsx',
  defaultShowCopyCode: true,
  docsRepositoryBase: 'https://github.com/emilkowalski/sonner',
});

module.exports = withNextra(nextConfig);
