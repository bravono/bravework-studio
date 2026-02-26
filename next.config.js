const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing next.config.js options here
  reactStrictMode: true,
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "bravework-studio",
    project: "bravework-studio",
  },
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-nextjs/blob/main/src/config/types.ts

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // (This can increase your server load as well as your hosting bill!)
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Jobs. (Does not apply to Quickstarts.)
    automaticVercelCronJobs: true,
  },
);
