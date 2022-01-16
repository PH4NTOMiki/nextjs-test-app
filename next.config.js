const webpack = require('webpack');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracing: false,
  "webpack": (config, { isServer, dev }) => {
    if(!isServer){
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /api\//
      }));
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /^https?$/
      }));
    }
    return config;
  }
};

module.exports = nextConfig;
