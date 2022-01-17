import { NextApiRequest } from 'next';

/**
 * 
 * @param {{req: import('http').IncomingMessage}} [param0] 
 * @param {RequestInfo} info 
 * @param {RequestInit} init 
 * @returns 
 */
export default async function _fetch({req:originalHttpRequest}={}, info, init){
	if(originalHttpRequest && typeof(info) === "string" && !info.startsWith("http")){
		info = `${originalHttpRequest.headers['x-forwarded-proto']||'http'}://${originalHttpRequest.headers.host||'127.0.0.1'}${info}`;
	}
	const fetchRequest = init ? new Request(info, init) : new Request(info);
	
	if(originalHttpRequest){
		const fetchServer = (await import('./_fetch_server')).default;
		return await fetchServer({originalHttpRequest, fetchRequest});
	}
	return fetch(fetchRequest);
}