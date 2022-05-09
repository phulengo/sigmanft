/* eslint-disable jsx-a11y/media-has-caption */
import Image from "next/image";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { Avatar } from "components/Avatar";
import { IArtworkData } from "lib/interfaces";
import { formatAvatarStyle } from "utils/formatAvatarStyle";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";

export const ArtworkCard = ({ artworkData }: any) => {
	const artwork = artworkData as IArtworkData;
	return (
		<div className="artwork-card">
			<div className="artwork-card__image-wrapper">
				<Link
					href={`/${(artwork.owner?.username ? artwork.owner.username : artwork.owner?.id) as string}/${
						artwork.id as string
					}`}
					passHref
				>
					<a>
						<div className="artwork-card__image-wrapper">
							{artwork.centralized_storage_url.includes(".mp4") || artwork.centralized_storage_url.includes(".mov") ? (
								<div className="artwork-card__video-wrapper">
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
			</div>
			<div className="artwork-card__info-wrapper">
				<p className="artwork-card__name">{artwork.artwork_name}</p>
				<Link href={`/${artwork.owner?.username ? `${artwork.owner.username}` : `${artwork.owner_id}`}`} passHref>
					<a>
						<div className="artwork__owner-info">
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
				<div className="artwork-card__price">
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
	);
};
