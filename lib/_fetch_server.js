import fs from 'fs';
import path from 'path';

/**
 * 
 * @param {{originalHttpRequest: import('http').IncomingMessage, fetchRequest: Request}} param0 
 */
export default async function fetchServer({originalHttpRequest, fetchRequest}){
	/**
	 * @type {[string, {pattern: RegExp, keys: string[]}][]}
	 */
	const apiMap = !process.env.API_DEV ? process.env.API_MAP : [];
	 /**
	 * @type {string[]}
	 */
	const apiList = !process.env.API_DEV ? process.env.API_LIST : walkSync(path.join(__dirname, '../../pages/api')).filter(f => f.endsWith('.js')).map(f => f.split('pages/api')[1].replace('.js', '')).reverse().filter(e => {return e.includes('[')&&e.includes(']')?(apiMap.push([e, parse(e)]), false) : true;});
	class httpResponseClass {
		constructor() {
			this.statusCode = 200;
			this.body = null;
			this.headers = {};
			this.trailers = {};
			this.closed = false;
			this.headersSent = false;
		}
		flushHeaders() {
			this.headers = {};
		}
		status(statusCode) {
			this.statusCode = statusCode;
			//console.log(`Status: ${_status}`);
			return this;
		}
		json(body) {
			if(!this.closed){
				this.body = JSON.stringify(body);
				this.header('Content-Type', 'application/json');
			}
			//console.log(`JSON: ${this.body}`);
			//return this;
		}
		header(name, value) {
			name = name.toLowerCase();
			this.headers[name] = this.headers[name] ? (this.headers[name] + ',' + value) : value;
			//console.log(`Header: ${name} = ${value}`);
			return this;
		}
		setHeader(name, value) {
			name = name.toLowerCase();
			this.headers[name] = value;
			return this;
		}
		getHeader(name) {
			name = name.toLowerCase();
			return this.headers[name];
		}
		getHeaderNames() {
			return Object.keys(this.headers);
		}
		getHeaders() {
			return this.headers;
		}
		hasHeader(name) {
			name = name.toLowerCase();
			return this.headers[name] !== undefined;
		}
		removeHeader(name) {
			name = name.toLowerCase();
			delete this.headers[name];
		}
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
			//console.log(`WriteHead: ${statusCode}`);
			return this;
		}
		addTrailers(trailers) {
			this.trailers = trailers;
			//console.log(`AddTrailers: ${trailers}`);
		}
		redirect(url, _url) {
			this.statusCode = typeof (url) === 'number' ? url : 307;
			const _url2 = _url || url;
			this.header('Location', _url2);
			//console.log(`Redirect: ${_url2}`);
			//return this;
		}
		send(body) {
			if(!this.closed)this.body = body;
			//console.log(`Send: ${body}`);
			//return this;
		}
		write(body) {
			if(!this.closed)this.body = this.body ? (this.body + body) : body;
			//console.log(`Write: ${body}`);
			return this;
		}
		end(body) {
			if(!this.closed)this.body = this.body ? (this.body + body) : body;
			//console.log(`End: ${body}`);
			this.closed = true;
			return this;
		}
	}
	
	/**
	 * @type {import('next').NextApiHandler}
	 */
	let handler;
	let slugPaths = {};
	let apiRequestPath = new URL(fetchRequest.url).pathname.split('/api')[1];
	if(apiList.includes(`${apiRequestPath}/index`)){
		handler = (await import(`../pages/api${apiRequestPath}/index`)).default;
	} else if(apiList.includes(`${apiRequestPath}`)){
		handler = (await import(`../pages/api${apiRequestPath}`)).default;
	} else {
		const found = apiMap.find(apiRoute => {
			const matches = exec(apiRequestPath, apiRoute[1]);
			//console.log({apiRequestPath, matches, apiRoute, keys:apiRoute[1].keys});
			if(!matches)return;
			slugPaths = matches;
			return true;
		});
		if(found){
			handler = (await import(`../pages/api${found[0]}`)).default;
		} else {
			return new Response(`404: This page could not be found`, {status: 404});
		}
	}
	
	/**
	 * @type {import('next').NextApiResponse}
	 */
	const httpResponse = new httpResponseClass();
	
	const http = (await import("http")).default;
	/**
	 * @type {import('next').NextApiRequest}
	 */
	const httpRequest = Object.create(http.IncomingMessage.prototype);
	//console.log(originalHttpRequest);
	//console.log({handler:handler(originalHttpRequest)});
	httpRequest.httpVersion = '1.1';
	httpRequest.httpVersionMajor = Number(httpRequest.httpVersion.split('.')[0]);
	httpRequest.httpVersionMinor = Number(httpRequest.httpVersion.split('.')[1]);
	httpRequest.url = `/${fetchRequest.url.split('/').slice(3).join('/')}`;
	httpRequest.query = {...Object.fromEntries(new URL(fetchRequest.url).searchParams), ...slugPaths};
	httpRequest.cookies = originalHttpRequest.headers.cookie ? Object.fromEntries(originalHttpRequest.headers.cookie.split(";").map(c=>c.split("=").map(decodeURIComponent))) : {};
	httpRequest.method = fetchRequest.method;
	httpRequest.body = fetchRequest.body != undefined ? fetchRequest.body : '';
	if(!httpRequest.headers)httpRequest.headers = {};
	httpRequest.headers.host = originalHttpRequest.headers.host || '127.0.0.1';
	httpRequest.headers['x-serverrequest'] = 'true';
	const allowedHeaders = ['x-forwarded-proto', 'x-forwarded-host', 'x-forwarded-port', 'x-forwarded-for', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform', 'user-agent', 'referer', 'accept-language'];
	allowedHeaders.forEach(header=>{
		if(originalHttpRequest.headers[header])httpRequest.headers[header] = originalHttpRequest.headers[header];
	});
	if(fetchRequest.credentials !== 'omit' && originalHttpRequest.headers.cookie)httpRequest.headers['cookie'] = originalHttpRequest.headers.cookie;
	if(fetchRequest.credentials !== 'omit' && originalHttpRequest.headers.authorization)httpRequest.headers['authorization'] = originalHttpRequest.headers.authorization;
	httpRequest.rawHeaders = Object.entries(httpRequest.headers).flat();
	
	try{
		await handler(httpRequest, httpResponse);
		//console.log({httpResponse});
		return new Response(httpResponse.body,{status:httpResponse.statusCode,headers:{...httpResponse.headers,...httpResponse.trailers}});
	} catch(e){
		console.error(e);
		return new Response(`Internal Server Error`,{status:500,headers:{'content-type':'text/plain'}});
	}
}

/**
 * 
 * @param {string} path 
 * @param {{pattern: RegExp, keys: string[]}} result 
 * @returns 
 */
function exec(path, result) {
	let i=0, out={};
	let matches = result.pattern.exec(path);
	if(!matches)return null;
	while (i < result.keys.length) {
		const currentMatches = matches[++i] || null;
		out[ result.keys[i - 1] ] = currentMatches ? (currentMatches.split('/').length > 1 ? currentMatches.split('/') : currentMatches) : null;
	}
	return out;
}

/**
 * 
 * @param {string} dir 
 * @param {string[]} [filelist] 
 */
function walkSync(dir, filelist = []) {
	fs.readdirSync(dir).forEach(file => {
		filelist = fs.statSync(path.join(dir, file)).isDirectory()
		? walkSync(path.join(dir, file), filelist)
		: filelist.concat(path.join(dir, file));
	});
	return filelist;
}

// modified from regexparam package (https://npm.im/regexparam) by Luke Edwards (https://twitter.com/lukeed05) to support optional wildcard parameters and named wildcards
// link: https://unpkg.com/regexparam@2.0.0/dist/index.mjs
function parse(str, loose) {
	if (str instanceof RegExp) return { keys:false, pattern:str };
	str = str.replace(new RegExp('\\]\\]', 'g'), '?').replace(new RegExp('\\]', 'g'), '').replace(new RegExp('\\[\\[\\.\\.\\.', 'g'), '*').replace(new RegExp('\\[\\.\\.\\.', 'g'), '*').replace(new RegExp('\\[', 'g'), ':');
	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
	arr[0] || arr.shift();

	while (tmp = arr.shift()) {
		c = tmp[0];
        if (c === '*' && tmp[tmp.length - 1] === '?') {
            keys.push( tmp.substring(1, tmp.length - 1) );
            pattern += '/?(.*)';
        } else if (c === '*') {
			keys.push( tmp.substring(1) );
			pattern += '/(.*)';
		} else if (c === ':') {
			o = tmp.indexOf('?', 1);
			ext = tmp.indexOf('.', 1);
			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		keys: keys,
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'))
	};
}
