/*
 * Fanalytics - Next.js Configuration
 *
 * This file contains the Next.js configuration for the Fanalytics application,
 * including image domains, development origins, and build settings.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["*.preview.same-app.com"],
    images: {
      unoptimized: true,
      domains: [
        "source.unsplash.com",
        "images.unsplash.com",
        "ext.same-assets.com",
        "ugc.same-assets.com",
      ],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "source.unsplash.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "ext.same-assets.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "ugc.same-assets.com",
          pathname: "/**",
        },
      ],
    },
  };
  
  module.exports = nextConfig;
  