/* eslint-disable jsx-a11y/media-has-caption */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Avatar } from "components/Avatar";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import Logo from "components/Logo";
import Modal from "components/Modal";
import { UserContext } from "components/UserProvider";
import { IArtworkData } from "lib/interfaces";
import { formatAvatarStyle } from "utils/formatAvatarStyle";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";

export const FeaturedArtwork = ({ artworkData }: any) => {
	const router = useRouter();
	const user = useContext(UserContext);
	const artwork = artworkData as IArtworkData;
	const [showReviewTransactionModal, setShowReviewTransactionModal] = useState(false);
	const [showCheckoutModal, setShowCheckoutModal] = useState(false);
	const [isReviewTransactionValid, setIsReviewTransactionValid] = useState(false);

	const handleBuyArtwork = async () => {
		await router.push(
			`/${(artwork.owner?.username ? artwork.owner.username : artwork.owner?.id) as string}/${artwork.id as string}`
		);
		// setShowReviewTransactionModal(true);
		// setIsReviewTransactionValid(false);
	};
	return (
		<div className="feature-artwork-card">
			{artwork ? (
				<>
					<Link
						href={`/${(artwork.owner?.username ? artwork.owner.username : artwork.owner?.id) as string}/${
							artwork.id as string
						}`}
						passHref
					>
						<a>
							<div className="artwork-card__image-wrapper">
								{artwork.centralized_storage_url.includes(".mp4") ||
								artwork.centralized_storage_url.includes(".mov") ? (
									<div className="artwork-detail__video-wrapper">
										<video loop autoPlay playsInline muted>
											<source src={artwork.centralized_storage_url}></source>
										</video>
									</div>
								) : (
									<Image
										className="artwork-card__image"
										src={artwork.centralized_storage_url}
										alt={artwork.artwork_name}
										width={250}
										height={250}
										layout="responsive"
										objectFit="cover"
									/>
								)}
							</div>
						</a>
					</Link>
					<div className="feature-artwork__group">
						<div className="artwork-card__info-wrapper">
							<p className="artwork-card__name">{artwork.artwork_name}</p>
							<div className="artwork__owner-info">
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
											<span className="artwork__owner--name">
												{artwork.owner?.username || handleLongWalletAddress(artwork.owner?.id as string, 5, 4)}
											</span>
										</div>
									</a>
								</Link>
							</div>
							<div className="artwork-card__price">
								<p className="text-sonic-silver font-semi-bold">Price</p>
								<div className="flex items-center gap-1">
									<Image
										className="artwork-card__price-logo"
										src="/ethereum.svg"
										alt="ethereum's logo"
										width={32}
										height={32}
									/>
									<span className="artwork-card__price-value">{artwork.price} (ETH)</span>
								</div>
							</div>
						</div>

						<div className="feature-artwork-card__action">
							{user && (
								<>
									{!artwork.sold && user.id !== artwork.owner_id && (
										<>
											<Button onClick={handleBuyArtwork} className="btn-primary">
												Buy artwork
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
																			<td className="text-left pl-0">150x150</td>
																			<td>Artwork name username</td>
																			<td className="text-right pr-0">1 ETH</td>
																		</tr>
																		<tr className="w-full border-t border-platinum  ">
																			<td className="text-left text-subtitle font-semi-bold pl-0">Total</td>
																			<td></td>
																			<td className="text-right text-subtitle font-semi-bold pr-0">1 ETH</td>
																		</tr>
																	</tbody>
																</table>
																<div className="checkout__action flex flex-col gap-4">
																	<Button className="btn-primary">Confirm checkout</Button>
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
																		<th>Created date</th>
																	</thead>
																	<tbody className="flex flex-col w-full">
																		<td>@username</td>
																		<td>999 sales</td>
																		<td>3 months ago</td>
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
										</>
									)}
								</>
							)}

							<Link
								href={`/${(artwork.owner?.username ? artwork.owner.username : artwork.owner?.id) as string}/${
									artwork.id as string
								}`}
								passHref
							>
								<a className="flex">
									<Button className="btn-secondary w-full">View artwork</Button>
								</a>
							</Link>
						</div>
					</div>
				</>
			) : (
				<div className="flex">No featured artwork</div>
			)}
		</div>
	);
};
