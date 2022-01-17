const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const walkSync = (dir, filelist = []) => {
	fs.readdirSync(dir).forEach(file => {
		filelist = fs.statSync(path.join(dir, file)).isDirectory()
		? walkSync(path.join(dir, file), filelist)
		: filelist.concat(path.join(dir, file));
	});
	return filelist;
}

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
	} else {
	  const API_LIST = JSON.stringify(walkSync('./pages/api').filter(f => f.endsWith('.js')).map(f => f.replace('pages/api/','').replace('.js', '')));
	  console.log({API_LIST});
	  config.plugins.push(new webpack.DefinePlugin({
		'process.env.API_LIST': API_LIST
	  }));
	}
	return config;
  }
};

module.exports = nextConfig;
