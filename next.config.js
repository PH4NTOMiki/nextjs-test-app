const { walkSync, parse, exec, devalue } = require('./config-helpers');
const webpack = require('webpack');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	reactStrictMode: true,
	"webpack": (config, { isServer, dev }) => {
		if(!isServer){
			config.plugins.push(new webpack.IgnorePlugin({
				resourceRegExp: /fetch_server/
			}));
		} else {
			const apiMap = [];
			const apiList = walkSync('./pages/api').filter(f => f.endsWith('.js')).map(f => f.split('pages/api')[1].replace('.js', '')).reverse().filter(e => {return e.includes('[')&&e.includes(']')?(apiMap.push([e, parse(e)]), false) : true;});
			console.log({apiMap:devalue(apiMap), apiList})
			config.plugins.push(new webpack.DefinePlugin({
				'process.env.API_DEV': JSON.stringify(dev),
				'process.env.API_LIST': JSON.stringify(apiList),
				'process.env.API_MAP': devalue(apiMap)
			}));
		}
		return config;
	}
};

module.exports = nextConfig;
