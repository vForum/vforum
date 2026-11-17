const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
module.exports = {
  output: "export", // static site, works on GitHub Pages
  basePath,
  images: { unoptimized: true },
};
