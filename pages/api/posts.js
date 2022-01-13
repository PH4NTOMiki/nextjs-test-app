import { connectToDB } from "../../lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * 
 * @param {NextApiRequest} req 
 * @param {NextApiResponse} res 
 */
export default async function handler(req, res) {
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