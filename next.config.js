/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "webpack-glsl-loader",
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
