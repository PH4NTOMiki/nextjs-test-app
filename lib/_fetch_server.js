/**
 * 
 * @param {{originalHttpRequest: import('http').IncomingMessage, handler: import('next').NextApiHandler, fetchRequest: Request}} param0 
 */
export default async function fetchServer({originalHttpRequest, handler, fetchRequest}){
    class httpResponseClass {
        constructor() {
            this.statusCode = 200;
            this.body = null;
            this.headers = {};
            this.closed = false;
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
            this.headers[name] = this.headers[name] ? (this.headers[name] + ',' + value) : value;
            //console.log(`Header: ${name} = ${value}`);
            return this;
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

    const httpResponse = new httpResponseClass();
    
    const http = (await import("http")).default;
    /**
     * @type {import('http').IncomingMessage}
     */
    const httpRequest = Object.create(http.IncomingMessage.prototype);
    //console.log(originalHttpRequest);
    //console.log({handler:handler(originalHttpRequest)});
    httpRequest.httpVersion = '1.1';
    httpRequest.httpVersionMajor = 1;
    httpRequest.httpVersionMinor = 1;
    httpRequest.headers.host = originalHttpRequest.headers.host || '127.0.0.1';
    httpRequest.url = `/${fetchRequest.url.split('/').slice(3).join('/')}`;
    httpRequest.query = Object.fromEntries(new URL(fetchRequest.url).searchParams);
    httpRequest.cookies = originalHttpRequest.headers.cookie ? Object.fromEntries(originalHttpRequest.headers.cookie.split(";").map(c=>c.split("=").map(decodeURIComponent))) : {};
    httpRequest.method = fetchRequest.method;
    httpRequest.body = fetchRequest.body != undefined ? fetchRequest.body : '';
    httpRequest.headers['x-serverrequest'] = 'true';
    if(originalHttpRequest.headers['sec-ch-ua'])httpRequest.headers['sec-ch-ua'] = originalHttpRequest.headers['sec-ch-ua'];
    if(originalHttpRequest.headers['sec-ch-ua-mobile'])httpRequest.headers['sec-ch-ua-mobile'] = originalHttpRequest.headers['sec-ch-ua-mobile'];
    if(originalHttpRequest.headers['sec-ch-ua-platform'])httpRequest.headers['sec-ch-ua-platform'] = originalHttpRequest.headers['sec-ch-ua-platform'];
    if(originalHttpRequest.headers['user-agent'])httpRequest.headers['user-agent'] = originalHttpRequest.headers['user-agent'];
    if(originalHttpRequest.headers.cookie)httpRequest.headers['cookie'] = originalHttpRequest.headers.cookie;
    if(originalHttpRequest.headers.authorization)httpRequest.headers['authorization'] = originalHttpRequest.headers.authorization;
    if(originalHttpRequest.headers.referer)httpRequest.headers['referer'] = originalHttpRequest.headers.referer;
    if(originalHttpRequest.headers['accept-language'])httpRequest.headers['accept-language'] = originalHttpRequest.headers['accept-language'];
    httpRequest.rawHeaders = Object.entries(httpRequest.headers).flat();
    
    try{
        await handler(httpRequest, httpResponse);
        //console.log({httpResponse});
        return new Response(httpResponse.body,{status:httpResponse.statusCode,headers:httpResponse.headers});
    } catch(e){
        console.error(e);
        return new Response(`Internal Server Error`,{status:500,headers:{'content-type':'text/plain'}});
    }
}