import Head from "next/head";

export const MetaTags = ({
	title = "IMS",
	description = "Idea Management System - COMP1640",
	image = "https://images.unsplash.com/photo-1480944657103-7fed22359e1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
}) => {
	return (
		<Head>
			<title>{title}</title>
			<meta name="twitter:card" content="SigmaNFT | SigmaNFT Marketplace" />
			<meta name="twitter:site" content="#sigmanft" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />

			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />
			<link rel="icon" href="/favicon.ico" />
		</Head>
	);
};
