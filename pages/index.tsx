/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BigNumber, BigNumberish, ethers } from "ethers";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { SigmaNFT as ISigmaNFT, SigmaNFTMarketplace as ISigmaNFTMarketplace } from "typechain-types";
import { ArtworkCard } from "components/ArtworkCard";
import { MarketplaceContext } from "components/ContractProvider/MarketplaceProvider";
import { NFTContext } from "components/ContractProvider/NFTProvider";
import { FeaturedArtwork } from "components/FeaturedArtwork";
import { Footer } from "components/Footer";
import Header from "components/Header";
import { Label } from "components/Label";
import { MetaTags } from "components/MetaTags";
import { IArtworkData, IArtworkItemData, IArtworkProps, IMetaData } from "lib/interfaces";
import { getAllArtworks, getFeaturedArtwork } from "./api/artworks/artwork";

export const getServerSideProps: GetServerSideProps = async (props) => {
	const { data: artworksData } = await getAllArtworks();
	const { data: featuredArtworkData } = await getFeaturedArtwork();

	return {
		props: {
			artworksData,
			featuredArtworkData,
		},
	};
};

const Home: NextPage = ({ artworksData, featuredArtworkData }: any) => {
	const artworks = artworksData as IArtworkProps;
	const [items, setItems] = useState<IArtworkItemData[]>();
	const featuredArtwork = featuredArtworkData as IArtworkData;

	const marketplace = useContext(MarketplaceContext);
	const nft = useContext(NFTContext);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getData = async () => {
			const itemCount = (await marketplace?.itemCount())?.toNumber() || 0;
			const items = [];
			if (itemCount) {
				for (let i = 1; i <= itemCount; i++) {
					const item = await marketplace?.items(i);
					if (!item?.sold) {
						// Get URI URL from NFT contract
						const URI = await nft?.tokenURI(item?.tokenId as BigNumberish);

						// Use URI to fetch the NFT metadata store on IPFS
						const response = await fetch(URI as RequestInfo);
						const metadata = (await response.json()) as IMetaData;

						// Get total price of item (price + fee)
						const totalPrice = await marketplace?.getTotalPrice(item?.itemId as BigNumberish);

						// Push item to items list
						items.push({
							itemId: item?.itemId as BigNumber,
							contractAddress: item?.nft,
							seller: item?.seller as string,
							name: metadata?.name,
							description: metadata.description,
							image: metadata.image,
							price: item?.price,
							totalPrice: totalPrice as BigNumber,
							sold: item?.sold,
						});
					}
				}
				setItems(items as unknown as IArtworkItemData[]);
				setLoading(false);
			}
		};

		!items && void getData();
	}, [marketplace, nft, items]);

	return (
		<>
			<MetaTags title="Sigmanft" description="Sigma NFT Marketplace" />
			<Header />
			<main>
				{/* {console.log(items)} */}
				<FeaturedArtwork artworkData={featuredArtwork} />
				<div className="artwork-list__container">
					<div className="label-group">
						<Label size="text-subtitle">Latest artwork</Label>
						<Link href={"/explore"} passHref>
							<a>
								<span className="label-link">View all artworks</span>
							</a>
						</Link>
					</div>
					<hr />
					<div className="artwork-list">
						{artworks && (artworks as unknown as IArtworkData[]).length > 0 ? (
							(artworks as unknown as []).map((artwork: IArtworkData) => (
								<ArtworkCard key={artwork.id} artworkData={artwork} />
							))
						) : (
							<div>No assets</div>
						)}
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default Home;
