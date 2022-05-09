/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import moment from "moment";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { BoughtEventFilter } from "typechain-types/contracts/SigmaNFTMarketplace";
import { ArtworkCard } from "components/ArtworkCard";
import { Avatar } from "components/Avatar";
import { Button } from "components/Button";
import { MarketplaceContext } from "components/ContractProvider/MarketplaceProvider";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import { getUserById, getUserByUsername } from "pages/api/users/user";
import { IArtworkData, IArtworkProps, IUserData } from "lib/interfaces";
import { formatAvatarStyle } from "utils/formatAvatarStyle";
import getRandomAvatarColorFromAddress from "utils/getRandomAvatarColorFromAddress";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";
import { Icon } from "components/Icon";
import { Label } from "components/Label";
import { UserContext } from "components/UserProvider";
import { getArtworkById, getArtworksCreatedByUserId } from "pages/api/artworks/artwork";
import { NFTContext } from "components/ContractProvider/NFTProvider";
import { Footer } from "components/Footer";

interface IParams extends ParsedUrlQuery {
	owner_id: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { owner_id } = params as IParams;
	const username = owner_id.startsWith("@") && owner_id;

	const { data: userDataById } = await getUserById(owner_id);
	let userData = userDataById;

	let artworksCreatedData;
	if (username) {
		const { data: user } = await getUserByUsername(username);
		const { data: artworksCreatedDataByUserId } =
			user && (await getArtworksCreatedByUserId((user as IUserData).id as string));
		artworksCreatedData = artworksCreatedDataByUserId && artworksCreatedDataByUserId;
	} else {
		const { data: artworksCreatedDataByUserId } = await getArtworksCreatedByUserId(owner_id);
		artworksCreatedData = artworksCreatedDataByUserId && artworksCreatedDataByUserId;
	}

	if (username) {
		const { data: userDataByUsername } = await getUserByUsername(username);
		userData = userDataByUsername;
	}

	if (!userData) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			userData,
			artworksCreatedData: artworksCreatedData || [],
		},
	};
};

const ProfilePage = ({ userData, artworksCreatedData }: any) => {
	const user = userData as IUserData;
	const currentUser = useContext(UserContext);
	const artworksCreated = artworksCreatedData as IArtworkProps;
	const [artworksCollected, setArtworksCollected] = useState<IArtworkProps>();

	const { asPath } = useRouter();
	const profileBackground =
		user.id && JSON.stringify(getRandomAvatarColorFromAddress(`${user.id}${user.nonce as string}`));
	const [tabSelect, setTabSelect] = useState(0);

	const marketplace = useContext(MarketplaceContext);
	const nft = useContext(NFTContext);
	const [purchasedItemsLength, setPurchasedItemsLength] = useState(0);

	useEffect(() => {
		const getPurchase = async () => {
			const tempArtworkCollected: any[] = [];
			const filter = marketplace && marketplace.filters.Bought(null, null, null, null, null, user.id);
			const results = filter && (await marketplace?.queryFilter(filter));
			results && setPurchasedItemsLength(results.length);
			results?.map(async (item) => {
				const URI = nft && (await nft.tokenURI(item.args.tokenId));
				const boughtArtworkId = URI && URI.split("https://ipfs.infura.io/ipfs/")[1];
				const { data: boughtArtworkByUser } = await getArtworkById(boughtArtworkId as string);
				boughtArtworkByUser && tempArtworkCollected.push(boughtArtworkByUser);
			});
			results?.length !== tempArtworkCollected.length &&
				setArtworksCollected(tempArtworkCollected as unknown as IArtworkProps);
			results?.length === 0 && setArtworksCollected(null!);
		};

		marketplace && nft && typeof artworksCollected === "undefined" && void getPurchase();
	}, [marketplace, nft, user, artworksCollected]);

	return (
		<>
			<MetaTags
				title={`${user && user.username ? `${user.username}` : `${user.id as string}`} | SigmaNFT`}
				description={`${user.username ? `${user.username}` : `${user.id as string}`} on SigmaNFT`}
			/>
			<Header />
			<main>
				<div className="profile__container">
					<div
						style={{ background: formatAvatarStyle(profileBackground as string), opacity: 0.5 }}
						className="profile-cover"
					></div>
					{user ? (
						user.avatar_url?.includes("//") ? (
							<Avatar size="128" src={user.avatar_url} />
						) : (
							<Avatar size="128" src={""} style={formatAvatarStyle(user.avatar_url as string)} />
						)
					) : (
						<ClipLoader
							css={`
								width: 122px;
								height: 122px;
							`}
						/>
					)}
					<div className="profile__container--desktop">
						<div className="profile-info__desktop">
							<div className="profile-info__wrapper">
								<Button
									onClick={() =>
										toast.promise(navigator.clipboard.writeText(user.id as string), {
											loading: "Copying wallet address",
											success: "Wallet address copied",
											error: "Error copying wallet address",
										})
									}
									icon
									className="btn-secondary w-full"
								>
									<span>{handleLongWalletAddress(user.id as string, 7, 7)}</span>
									<Icon name="Copy" size="16" />
								</Button>
								{user.name && <p className="profile-name">{user.name}</p>}
								{user.username && <p className="profile-username">{user.username}</p>}
								<p className="profile-join">
									Joined on <span>{moment(user.joined_at).format("MMM DD, YYYY")}</span>
								</p>
							</div>
							<div className="profile-info__bio">
								<Label className="w-full" size="text-subtitle">
									Bio
								</Label>
								<hr />
								<span className={`profile-info__bio-content ${user.bio ? "" : "italic"}`}>
									{user.bio ? user.bio : "No bio added"}
								</span>
							</div>
							<div className="profile-info__social">
								<Label className="w-full" size="text-subtitle">
									Social
								</Label>
								<hr />
								{!user.social_facebook &&
								user.social_facebook === "" &&
								!user.social_twitter &&
								user.social_twitter === "" &&
								!user.social_website &&
								user.social_website === "" ? (
									<span className={"italic"}>No social link added</span>
								) : (
									<>
										{user.social_facebook && user.social_facebook !== "" && (
											<Link href={`https://facebook.com/${user.social_facebook}`}>
												<a>
													<div className="profile-info__social-link">
														<Icon name="Facebook" size="16" />
														<span>{user.social_facebook}</span>
													</div>
												</a>
											</Link>
										)}
										{user.social_twitter && user.social_twitter !== "" && (
											<Link href={`https://twitter.com/${user.social_twitter}`}>
												<a>
													<div className="profile-info__social-link">
														<Icon name="Twitter" size="16" />
														<span>{user.social_twitter}</span>
													</div>
												</a>
											</Link>
										)}
										{user.social_website && user.social_website !== "" && (
											<Link href={`https://${user.social_website}`}>
												<a>
													<div className="profile-info__social-link">
														<Icon name="Globe" size="16" />
														<span>{user.social_website}</span>
													</div>
												</a>
											</Link>
										)}
									</>
								)}
							</div>
							<div className="profile-info__action">
								{currentUser && user.id === currentUser.id && (
									<Link href={`${asPath}/edit`}>
										<a className="flex">
											<Button className="btn-secondary w-full" icon>
												<Icon size={16} name="Edit" />
												Edit profile
											</Button>
										</a>
									</Link>
								)}
								<Button
									icon
									onClick={() =>
										toast.promise(navigator.clipboard.writeText(window.location.href), {
											loading: "Copying profile link",
											success: "Profile link copied",
											error: "Error copying profile link",
										})
									}
									className={"btn-secondary xs:w-full"}
								>
									<Icon name="Share2" size="16" />
									Share profile
								</Button>
							</div>
						</div>
						<div className="profile__artworks">
							<Tabs className={"tab__container"} onSelect={(index) => setTabSelect(index)}>
								<TabList className={"tab__headers"}>
									<Tab className={"tab__headers--content"}>
										Created <span className="content-numbers">({(artworksCreated as unknown as []).length || 0})</span>
									</Tab>
									<Tab className={"tab__headers--content"}>
										Collected
										<span className="content-numbers">
											{typeof artworksCollected !== "undefined" ? (
												`(${purchasedItemsLength})`
											) : (
												<ClipLoader
													css={`
														width: 16px;
														height: 16px;
													`}
												/>
											)}
										</span>
									</Tab>
								</TabList>
								<TabPanel className={"tab__content"}>
									<div className="profile-detail__artworks-created">
										{artworksCreated && (artworksCreated as unknown as IArtworkData[]).length > 0 ? (
											(artworksCreated as unknown as []).map((artwork: IArtworkData) => (
												<ArtworkCard key={artwork.id} artworkData={artwork} />
											))
										) : (
											<div className="mt-6">No artworks found.</div>
										)}
									</div>
								</TabPanel>
								<TabPanel className={"tab__content"}>
									<div className="profile-detail__artworks-collected">
										{artworksCollected && (artworksCollected as unknown as IArtworkData[]).length > 0 ? (
											(artworksCollected as unknown as []).map((artwork: IArtworkData) => (
												<ArtworkCard key={artwork.id} artworkData={artwork} />
											))
										) : (
											<div className="mt-6">No artworks found.</div>
										)}
									</div>
								</TabPanel>
							</Tabs>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default ProfilePage;
