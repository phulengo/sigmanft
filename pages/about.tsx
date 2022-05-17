/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Markdown from "markdown-to-jsx";
import { GetStaticProps, NextPage } from "next";
import { useState } from "react";
import { Footer } from "components/Footer";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import "github-markdown-css";

export const getStaticProps: GetStaticProps = async () => {
	const data = await fetch("https://raw.githubusercontent.com/phulengo/sigmanft/main/README.md")
		.then((response) => response.text())
		.then((result) => result);
	return {
		props: {
			data,
		},
	};
};

const About: NextPage = (props) => {
	const { data }: any = props;
	const [content, setContent] = useState("");

	return (
		<>
			<MetaTags title="About Sigmanft Project" description="About Sigmanft Project" />
			<Header />
			<main className="important! markdown-body">
				<Markdown>{data}</Markdown>
			</main>
			<Footer />
		</>
	);
};

export default About;
