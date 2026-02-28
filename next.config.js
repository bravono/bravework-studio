const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing next.config.js content (if any)
  reactStrictMode: true,
  // Add other Next.js config options here
};

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during bundling
  silent: true,
  org: process.env.SENTRY_ORG || "bravework-studio",
  project: process.env.SENTRY_PROJECT || "bravework-studio",
};

const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for better stack traces (e.g. from node_modules)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Route browser requests to Sentry through a Next.js rewrite into the app
  // This can prevent ad-blockers from blocking Sentry's tracking
  tunnelRoute: "/monitoring",

  // Hides source maps from visitors
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryConfig, sentryOptions);

// Injected content via Sentry wizard below
