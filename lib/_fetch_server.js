/**
 * 
 * @param {{originalHttpRequest: import('http').IncomingMessage, fetchRequest: Request}} param0 
 */
export default async function fetchServer({originalHttpRequest, fetchRequest}){console.log(process.env.API_LIST);
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
	let slugPaths = [];
	let apiRequestPath = new URL(fetchRequest.url).pathname.replace('/api', '');
	if(process.env.API_LIST.includes(`${apiRequestPath}/index`)){
		handler = (await import(`../pages/api${apiRequestPath}/index`)).default;
	} else if(process.env.API_LIST.includes(`${apiRequestPath}`)){
		handler = (await import(`../pages/api${apiRequestPath}`)).default;
	} else {
		const reg = new RegExp(apiRequestPath.split('/').map(e=>`(\\[.*?\\]|${e})`).join('/'));
		const found = process.env.API_LIST.find(apiRoute => {
			const matches = apiRoute.match(reg);
			if(!matches)return;
			
		});
		if(found){
			handler = (await import(`../pages/api/${found}`)).default;
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
	httpRequest.query = Object.fromEntries(new URL(fetchRequest.url).searchParams);
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