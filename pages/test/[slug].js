import _fetch from '$lib/_fetch';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import _ from '$lib/cachestore';

/**
 * 
 * @param {{_post: {slug: string, title: string, txt: string, _id: string}, cache: boolean}}} param0 
 * @returns 
 */
function TestPage({_post, cache = false}) {
	const [post, setPost] = useState(_post);
	const router = useRouter();
	useEffect(() => {
		async function fetchPosts(){
			
		}
		fetchPosts();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	
	return (
	<>
	<Head>
		<title>{post.title}</title>
	</Head>
	
	<h1>{post.title}</h1>
	<p>{post.txt}</p>
	<Link href="/"><a>Back</a></Link>
	</>
  );
}

/**
 * 
 * @param {import('next').NextPageContext} ctx 
 * @returns 
 */
TestPage.getInitialProps = async (ctx) => {
	console.log(ctx.query.slug);
    const data = await _fetch({req:ctx.req}, `/api/test/${ctx.query.slug}`);
	const {ok} = data;
	if(ok){
		const json = await data.json();
		return {_post: json};
	} else {
		//console.log("Failed to fetch post", data);
	}
};

export default TestPage;
