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
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /lib\/_fetch_server/
      }));
    }
    return config;
  }
};

module.exports = nextConfig;
