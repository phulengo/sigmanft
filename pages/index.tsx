import type { NextPage } from "next";
import { useState } from "react";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";

const Home: NextPage = () => {
	const [account, setAccount] = useState(null);

	return (
		<>
			<MetaTags title="Sigmanft" description="Sigma NFT Marketplace" />
			<Header />
			<main>
				<h1 className="text-heading-1">Hello world!</h1>
			</main>
		</>
	);
};

export default Home;
