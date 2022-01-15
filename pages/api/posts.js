import { connectToDB } from "$lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * 
 * @param {NextApiRequest} req 
 * @param {NextApiResponse} res 
 */
export default async function handler(req, res) {
	//console.log({method: req.method, url: req.url, headers: req.headers, cookies: req.cookies, query: req.query, body: req.body});
	//console.log({res});
	//console.log(new URL(req.url, `${req.headers[`x-forwarded-proto`]===`https`?`https`:`http`}://${req.headers.host}`).toString());
	//console.log(req);
	//console.log(JSON.stringify({headers:req.headers}));
	//if(req.headers['x-serverrequest']){return res.json({"_id":"6177d2eccc757e9744ec5996","slug":"article5","title":"Article 5","txt":""});}
	const { all, slug } = req.query;
	const { db } = await connectToDB();
	if(all){
		const posts = await db.collection("blogposts").find().toArray();
		return res.status(200).json(posts);
	}
	
	if(!slug)return res.status(404).json({error: "Missing slug"});
	const post = await db.collection("blogposts").findOne({slug});
	if(!post)return res.status(404).json({error: "Post not found"});
	return res.status(200).json(post);
}