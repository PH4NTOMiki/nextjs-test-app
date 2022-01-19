const { walkSync, parse, exec, devalue } = require('./config-helpers');
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
		} else {
			const apiMap = {};
			const apiList = walkSync('./pages/api').filter(f => f.endsWith('.js')).map(f => f.replace('pages/api','').replace('.js', '')).reverse().map(e => {return (e.includes('[')&&e.includes(']')&&(apiMap[e] = parse(e))), e;});
			console.log({apiMap:devalue(apiMap), apiList})
			config.plugins.push(new webpack.DefinePlugin({
				'process.env.API_LIST': JSON.stringify(apiList),
				'process.env.API_LIST_JSON': devalue(apiMap)
			}));
		}
		return config;
	}
};

module.exports = nextConfig;
