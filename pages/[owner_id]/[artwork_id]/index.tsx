/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BigNumberish, ethers } from "ethers";
import { getEthPriceNow } from "get-eth-price";
import moment from "moment";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import { Suspense, useContext, useEffect } from "react";
import { Icon } from "components/Icon";
import { Button } from "components/Button";
import { Label } from "components/Label";
import { UserContext } from "components/UserProvider";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import toast from "react-hot-toast";
import { useState } from "react";
import Logo from "components/Logo";
import Modal from "components/Modal";
import { MarketplaceContext } from "components/ContractProvider/MarketplaceProvider";
import { useAccount } from "wagmi";
import { BoughtEvent, BoughtEventFilter } from "typechain-types/contracts/SigmaNFTMarketplace";
import { NFTContext } from "components/ContractProvider/NFTProvider";
import { TypedEventFilter } from "typechain-types/common";
import { Avatar } from "components/Avatar";
import { Checkbox } from "components/Checkbox";
import { Footer } from "components/Footer";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import { getArtworkById, increaseArtworkViewCount, updateTransaction } from "pages/api/artworks/artwork";
import { getUserById } from "pages/api/users/user";
import { IArtworkData, IArtworkItemData, IUserData } from "lib/interfaces";
import { formatAvatarStyle } from "utils/formatAvatarStyle";

interface IParams extends ParsedUrlQuery {
	artwork_id: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { artwork_id } = params as IParams;

	const { data: artworkData } = await getArtworkById(artwork_id);

	if (!artworkData) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			artworkData,
		},
	};
};

interface IETHPrice {
	ETH: {
		USD: number;
	};
}

const ArtworkDetailPage = ({ artworkData }: any) => {
	const { asPath } = useRouter();
	const currentUser = useContext(UserContext);
	const artwork = artworkData as IArtworkData;
	const marketplace = useContext(MarketplaceContext);
	const nft = useContext(NFTContext);
	const [{ data: accountData }] = useAccount();

	const [showReviewTransactionModal, setShowReviewTransactionModal] = useState(false);
	const [showCheckoutModal, setShowCheckoutModal] = useState(false);
	const [isReviewTransactionValid, setIsReviewTransactionValid] = useState(false);
	const [isCheckoutValid, setIsCheckoutValid] = useState(true);
	const [isItemSold, setIsItemSold] = useState(false);

	const [ETHUSDRate, setETHUSDRate] = useState(0);
	const [loading, setLoading] = useState(true);
	const [itemBuyerId, setBuyerId] = useState("");
	const [buyer, setBuyer] = useState<IUserData>();
	const [sellerSaleAmount, setSellerSaleAmount] = useState(0);
	const router = useRouter();

	const handleBuyArtwork = () => {
		setShowReviewTransactionModal(true);
		setIsReviewTransactionValid(false);
	};

	const handleCheckout = async () => {
		setIsCheckoutValid(false);
		const nftItemData = (await marketplace?.items(
			artwork.etherscan_link.split("?a=")[1]
		)) as unknown as IArtworkItemData;
		const buyNft = async () => {
			const totalPrice = await marketplace?.getTotalPrice(nftItemData?.itemId as BigNumberish);

			const purchaseNft =
				marketplace &&
				nftItemData &&
				marketplace.signer &&
				(await (await marketplace.purchaseItem(nftItemData.itemId, { value: totalPrice })).wait());
			const updateDb =
				purchaseNft &&
				(await updateTransaction(
					true,
					artwork.id as string,
					purchaseNft.transactionHash,
					purchaseNft.from,
					purchaseNft.to
				));
			return purchaseNft;
		};

		const purchasedTransaction = await toast.promise(buyNft(), {
			loading: `Processing to purchase artwork ${artwork.artwork_name}.`,
			success: (data) => `Successfully bought artwork ${artwork.artwork_name}.`,
			error: (err) => `Error when buying artwork.`,
		});
		purchasedTransaction && setShowCheckoutModal(false);
		setShowReviewTransactionModal(false);
		router.reload();
	};

	useEffect(() => {
		const getETHRate = async () => {
			const data = (await getEthPriceNow()) as IETHPrice;
			const { ETH } = Object.values(data)[0] as IETHPrice;
			const { USD } = ETH;
			USD && setETHUSDRate(USD);
		};
		ETHUSDRate === 0 && void getETHRate();

		const getItemSoldData = async () => {
			const nftItemData = (await marketplace?.items(
				artwork.etherscan_link.split("?a=")[1]
			)) as unknown as IArtworkItemData;

			nftItemData && setIsItemSold(nftItemData.sold);

			const filter = marketplace && marketplace.filters.Bought(null, null, null, null, nftItemData.seller, null);
			const results = filter && (await marketplace?.queryFilter(filter));
			results ? setSellerSaleAmount(results?.length) : setSellerSaleAmount(null!);
			const data =
				results &&
				nftItemData &&
				nftItemData.itemId &&
				results.filter((item) => item.args.itemId.toNumber() === nftItemData.itemId.toNumber());

			const buyerId = data && data[0] && data[0].args.buyer;
			buyerId && setBuyerId(buyerId);
			results && setLoading(false);
		};

		loading && void getItemSoldData();

		const getBuyer = async () => {
			if (itemBuyerId) {
				const { data } = await getUserById(itemBuyerId);
				data && setBuyer(data as IUserData);
			}
		};

		isItemSold && getBuyer();

		artwork && artwork.id && void increaseArtworkViewCount(artwork.id, artwork.view_count);
	}, [loading, marketplace, artwork, itemBuyerId, isItemSold]);
	return (
		<>
			<MetaTags title={`${artwork.artwork_name} | SigmaNFT`} description={`${artwork.artwork_name} on SigmaNFT`} />
			<Header />
			<main>
				<div className="artwork-detail__container">
					<div className="artwork-detail__image-wrapper">
						{artwork.centralized_storage_url.includes(".mp4") || artwork.centralized_storage_url.includes(".mov") ? (
							<div className="artwork-detail__video-wrapper">
								<video loop autoPlay playsInline controls muted>
									<source src={artwork.centralized_storage_url} />
								</video>
							</div>
						) : (
							<Image
								className="artwork-detail__image"
								src={artwork.centralized_storage_url}
								alt={artwork.artwork_name}
								width={250}
								height={250}
								layout="responsive"
								objectFit="contain"
							/>
						)}
					</div>
					<div className="artwork-detail__info-wrapper">
						<div className="artwork-detail__desktop-group--top flex flex-col gap-6">
							<div className="artwork-detail__desktop--info">
								<p className="artwork-detail__name">{artwork.artwork_name}</p>
								<div className="artwork-detail__owner-info">
									<p className="text-sonic-silver font-semi-bold">Created on</p>
									<Link
										href={`https://${process.env.NEXT_PUBLIC_ETHERSCAN_TX_GATEWAY as string}/${
											artwork.transaction_hash
										}`}
										passHref
									>
										<a className="self-start">
											<div className="flex items-center gap-2 artwork-detail__created-date">
												<span>{moment(artwork.created_on).format("MMM DD, YYYY")}</span>
												<Icon name="ExternalLink" size="16" />
											</div>
										</a>
									</Link>
								</div>
								<div className="artwork-detail__owner-info">
									<p className="text-sonic-silver font-semi-bold">Created by</p>
									<Link
										href={`/${artwork.owner?.username ? `${artwork.owner.username}` : `${artwork.owner_id}`}`}
										passHref
									>
										<a className="self-start">
											<div className="flex items-center gap-1">
												{artwork && artwork.owner ? (
													artwork.owner.avatar_url?.includes("//") ? (
														<Avatar size="32" src={artwork.owner.avatar_url} />
													) : (
														<Avatar size="32" src={""} style={formatAvatarStyle(artwork.owner.avatar_url as string)} />
													)
												) : (
													<ClipLoader
														css={`
															width: 26px;
															height: 26px;
														`}
													/>
												)}
												<span className="artwork-detail__owner--name">
													{artwork.owner?.username || handleLongWalletAddress(artwork.owner?.id as string, 5, 4)}
												</span>
											</div>
										</a>
									</Link>
								</div>
							</div>
							<div className="artwork-detail__desktop--purchase flex flex-col gap-6">
								<div className="artwork-detail__price">
									<p className="text-sonic-silver font-semi-bold">Price</p>
									<div className="flex items-center gap-1">
										<Image
											className="artwork-detail__price-logo"
											src="/ethereum.svg"
											alt="ethereum's logo"
											width={32}
											height={32}
										/>
										<span className="artwork-detail__price-value">{artwork.price} (ETH)</span>
									</div>
								</div>
								{currentUser && currentUser.id !== artwork.owner_id ? (
									<div className="artwork-detail__action">
										<Button
											onClick={handleBuyArtwork}
											disabled={artwork.sold || isItemSold ? true : false}
											className={`${
												artwork.sold || isItemSold ? "btn-disabled text-body flex justify-center" : "btn-primary"
											} xs:w-full`}
										>
											{artwork.sold ? (
												<span className="flex gap-1 items-center">
													Sold to{" "}
													{buyer ? (
														buyer.username ? (
															buyer.username
														) : (
															handleLongWalletAddress((buyer && buyer.id && buyer?.id) as string, 5, 4)
														)
													) : (
														<ClipLoader
															css={`
																width: 16px;
																height: 16px;
															`}
														/>
													)}
												</span>
											) : (
												`Buy artwork`
											)}
										</Button>
										{showReviewTransactionModal && (
											<Modal
												onCancel={() => {
													setShowReviewTransactionModal(false);
													setShowCheckoutModal(false);
												}}
												headerText={`${showCheckoutModal ? "Checkout" : "Review Transaction"}`}
											>
												<>
													{showCheckoutModal ? (
														<div className="checkout__container">
															<Logo width="64" height="64" />
															<table className="table-auto w-full ">
																<thead className="border-b border-platinum ">
																	<th className="text-left text-subtitle pl-0">Item</th>
																	<th>{}</th>
																	<th className="text-right text-subtitle pr-0">Subtotal</th>
																</thead>
																<tbody>
																	<tr className="w-full py-16">
																		<td className="text-left pl-0">
																			{artwork.centralized_storage_url.includes(".mp4") ||
																			artwork.centralized_storage_url.includes(".mov") ? (
																				<div className="artwork-detail__video-wrapper">
																					<video loop autoPlay playsInline controls muted>
																						<source src={artwork.centralized_storage_url} />
																					</video>
																				</div>
																			) : (
																				<Image
																					className="artwork-detail__image"
																					src={artwork.centralized_storage_url}
																					alt={artwork.artwork_name}
																					width={250}
																					height={250}
																					layout="responsive"
																					objectFit="contain"
																				/>
																			)}
																		</td>
																		<td>
																			<div className="flex flex-col">
																				<span className="font-semi-bold">{artwork.artwork_name}</span>
																				<span>
																					{artwork.owner?.username ||
																						handleLongWalletAddress(artwork.owner?.id as string, 5, 4)}
																				</span>
																			</div>
																		</td>
																		<td className="text-right pr-0">
																			<div className="flex flex-col">
																				<span className="text-subtitle font-semi-bold">{artwork.price} ETH</span>
																				<span className="text-footer">
																					${Math.round(artwork.price * ETHUSDRate * 100) / 100}
																				</span>
																			</div>{" "}
																		</td>
																	</tr>
																	<tr className="border-t border-platinum">
																		<td className="text-left pl-0">Estimated service fee</td>
																		<td></td>
																		<td className="text-right pr-0">
																			<div className="flex flex-col">
																				<span className="text-subtitle font-semi-bold">1%</span>
																				<span className="text-footer">
																					${Math.round(((artwork.price * 1) / 100) * ETHUSDRate * 100) / 100}
																				</span>
																			</div>
																		</td>
																	</tr>
																	<tr className="w-full border-t border-platinum  ">
																		<td className="text-left text-subtitle font-semi-bold pl-0">Total</td>
																		<td></td>
																		<td className="text-right text-subtitle font-semi-bold pr-0">
																			<div className="flex flex-col">
																				<span className="text-subtitle font-semi-bold">
																					{artwork.price + (artwork.price * 1) / 100} ETH
																				</span>
																				<span className="text-footer font-normal">
																					$
																					{Math.round(
																						(Math.round(artwork.price * ETHUSDRate * 100) / 100 +
																							Math.round(((artwork.price * 1) / 100) * ETHUSDRate * 100) / 100) *
																							100
																					) / 100}
																				</span>
																			</div>
																		</td>
																	</tr>
																</tbody>
															</table>
															<div className="checkout__action flex flex-col gap-4">
																<Button
																	onClick={handleCheckout}
																	disabled={!isCheckoutValid ? true : false}
																	className={`${isCheckoutValid ? "btn-primary" : "btn-disabled text-body"}`}
																>
																	Confirm checkout
																</Button>
																<Button
																	onClick={() => {
																		setShowCheckoutModal(false);
																		setIsReviewTransactionValid(false);
																	}}
																	className="text-footer text-center text-sonic-silver hover:text-black"
																>
																	Back to Review Transaction
																</Button>
															</div>
														</div>
													) : (
														<div className="review-transaction__container">
															<Logo width="64" height="64" />
															<p>Review this information to ensure it’s what you want to buy.</p>
															<table className="flex flex-row text-left">
																<thead className="flex flex-col w-full">
																	<th>Creator</th>
																	<th>Total sales</th>
																	<th>Joined date</th>
																</thead>
																<tbody className="flex flex-col w-full">
																	<td>
																		{artwork.owner?.username ||
																			handleLongWalletAddress(artwork.owner?.id as string, 5, 4)}
																	</td>
																	<td className="flex gap-1">
																		<span className="flex items-center">
																			{sellerSaleAmount !== null ? (
																				sellerSaleAmount
																			) : (
																				<ClipLoader
																					css={`
																						width: 16px;
																						height: 16px;
																					`}
																				/>
																			)}
																		</span>{" "}
																		{sellerSaleAmount > 0 ? `sales` : `sale`}
																	</td>
																	<td>{moment(artwork.owner?.joined_at).fromNow()}</td>
																</tbody>
															</table>
															<Checkbox
																onChange={() => setIsReviewTransactionValid(!isReviewTransactionValid)}
																name="user-understood"
															>
																<span className="w-full">
																	I have checked information above and understood that blockchain transactions are
																	irreversible.
																</span>
															</Checkbox>
															<Button
																onClick={() => setShowCheckoutModal(true)}
																disabled={!isReviewTransactionValid ? true : false}
																className={`${
																	isReviewTransactionValid ? "btn-primary" : "btn-disabled "
																} text-body self-stretch`}
															>
																Go to checkout
															</Button>
														</div>
													)}
												</>
											</Modal>
										)}
									</div>
								) : (
									<>
										{(artwork.sold || isItemSold) && (
											<div className="artwork-detail__action">
												<Button
													disabled={artwork.sold || isItemSold ? true : false}
													className={`btn-disabled text-body flex justify-center xs:w-full`}
												>
													<span className="flex gap-1 items-center">
														Sold to{" "}
														{buyer ? (
															buyer.username ? (
																buyer.username
															) : (
																handleLongWalletAddress((buyer && buyer.id && buyer?.id) as string, 5, 4)
															)
														) : (
															<ClipLoader
																css={`
																	width: 16px;
																	height: 16px;
																`}
															/>
														)}
													</span>
												</Button>
											</div>
										)}
									</>
								)}
							</div>
						</div>
						<div className="artwork-detail__desktop-group--bottom flex flex-col gap-6">
							<div className="artwork-detail__desktop--info  flex flex-col gap-6">
								<div className="artwork-detail__description">
									<Label className="w-full" size="text-subtitle">
										Description
									</Label>
									<hr />
									<span
										className={`artwork-detail__description-content ${artwork.artwork_description ? "" : "italic"}`}
									>
										{artwork.artwork_description ? artwork.artwork_description : "No description added"}
									</span>
								</div>
								<div className="artwork-detail__details">
									<Label className="w-full" size="text-subtitle">
										Details
									</Label>
									<hr />
									<Link href={`https://${artwork.etherscan_link}`}>
										<a>
											<div className="artwork-detail__link">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
													<g clipPath="url(#clip0_680_19882)">
														<path
															d="M3.32525 7.6179C3.32523 7.52855 3.34287 7.44007 3.37713 7.35756C3.4114 7.27504 3.46163 7.20011 3.52493 7.13707C3.58823 7.07403 3.66336 7.02413 3.746 6.99022C3.82864 6.95631 3.91716 6.93907 4.00648 6.93948L5.13589 6.94319C5.31597 6.94319 5.48867 7.01475 5.61601 7.14213C5.74334 7.26951 5.81488 7.44228 5.81488 7.62242V11.8946C5.94211 11.8569 6.10528 11.8167 6.28403 11.7748C6.40814 11.7456 6.51875 11.6753 6.59792 11.5753C6.6771 11.4753 6.72019 11.3515 6.72023 11.224V5.92463C6.72022 5.83542 6.73778 5.74708 6.7719 5.66465C6.80602 5.58223 6.85604 5.50734 6.91909 5.44425C6.98215 5.38116 7.05701 5.33111 7.1394 5.29697C7.22179 5.26282 7.3101 5.24524 7.39928 5.24523H8.53092C8.71099 5.24526 8.88368 5.31683 9.01101 5.44421C9.13834 5.57159 9.20988 5.74433 9.20991 5.92447V10.8431C9.20991 10.8431 9.49312 10.7284 9.7692 10.6118C9.87171 10.5685 9.95919 10.4958 10.0207 10.4031C10.0823 10.3103 10.1151 10.2014 10.1152 10.0901V4.22624C10.1152 4.13705 10.1328 4.04872 10.1669 3.96631C10.201 3.88391 10.251 3.80903 10.314 3.74595C10.3771 3.68288 10.4519 3.63285 10.5343 3.59871C10.6167 3.56458 10.705 3.54701 10.7941 3.54701H11.9258C12.1059 3.54701 12.2786 3.61857 12.4059 3.74595C12.5333 3.87333 12.6048 4.04609 12.6048 4.22624V9.05478C13.5859 8.3435 14.5803 7.48796 15.3693 6.45927C15.4838 6.30995 15.5596 6.1346 15.5899 5.94887C15.6201 5.76314 15.604 5.57281 15.5428 5.39484C15.0089 3.83834 14.0075 2.48479 12.6754 1.51927C11.3433 0.553754 9.74556 0.0233994 8.10071 0.000725266C3.66526 -0.0588789 -0.000397328 3.56308 3.83791e-05 8.00064C-0.00431669 9.40483 0.362044 10.7853 1.06208 12.0024C1.15862 12.1689 1.30064 12.3043 1.47147 12.3929C1.6423 12.4814 1.83483 12.5193 2.02646 12.5022C2.24056 12.4833 2.5071 12.4567 2.82397 12.4195C2.96189 12.4038 3.08922 12.3379 3.1817 12.2343C3.27419 12.1308 3.32538 11.9968 3.32552 11.858V7.6179"
															fill="currentColor"
														/>
														<path
															d="M3.30059 14.4696C4.49345 15.3377 5.9031 15.8587 7.37361 15.9751C8.84412 16.0915 10.3182 15.7987 11.6326 15.1291C12.9471 14.4594 14.0508 13.4391 14.8216 12.181C15.5923 10.9228 16.0002 9.47588 15.9999 8.00025C15.9999 7.81605 15.9914 7.63391 15.9791 7.45276C13.0576 11.8114 7.66328 13.849 3.30054 14.4698"
															fill="currentColor"
														/>
													</g>
													<defs>
														<clipPath id="clip0_680_19882">
															<rect width="16" height="16" fill="white" />
														</clipPath>
													</defs>
												</svg>

												<span>View on Etherscan</span>
											</div>
										</a>
									</Link>
									<Link href={`https://${artwork.metadata_link}`}>
										<a>
											<div className="artwork-detail__link">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="currentColor"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M19.21 5.222 10.639.936a1.428 1.428 0 0 0-1.279 0L.789 5.222A1.431 1.431 0 0 0 0 6.5v10c0 .54.306 1.035.79 1.278l8.571 4.286a1.43 1.43 0 0 0 1.278 0l8.571-4.286A1.43 1.43 0 0 0 20 16.5v-10a1.43 1.43 0 0 0-.79-1.278ZM10 3.812 15.377 6.5 10 9.189 4.623 6.501 10 3.81Zm-7.143 5 5.714 2.857v6.806l-5.714-2.857V8.812Zm8.572 9.663v-6.806l5.714-2.857v6.806l-5.714 2.857Z"
														fill="currentColor"
													></path>
												</svg>
												<span>View on metadata</span>
											</div>
										</a>
									</Link>
									<Link href={`https://${artwork.ipfs_link}`}>
										<a>
											<div className="artwork-detail__link">
												<Icon name="Eye" size="16" />
												<span>View on IPFS</span>
											</div>
										</a>
									</Link>
								</div>
							</div>
						</div>
						<div className="artwork-detail__action">
							{currentUser && artwork.owner_id === currentUser.id && (!isItemSold || !artwork.sold) && (
								<Link href={`${asPath}/edit`}>
									<a className="flex">
										<Button className="btn-secondary w-full" icon>
											<Icon size={16} name="Edit" />
											Edit artwork
										</Button>
									</a>
								</Link>
							)}
							<Button
								icon
								onClick={() =>
									toast.promise(navigator.clipboard.writeText(window.location.href), {
										loading: "Copying artwork link",
										success: "Artwork link copied",
										error: "Error copying artwork link",
									})
								}
								className={"btn-secondary xs:w-full"}
							>
								<Icon name="Share2" size="16" />
								Share artwork
							</Button>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
};

export default ArtworkDetailPage;
