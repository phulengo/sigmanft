/* eslint-disable jsx-a11y/media-has-caption */
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { Avatar } from "components/Avatar";
import { IUserData } from "lib/interfaces";
import { formatAvatarStyle } from "utils/formatAvatarStyle";
import getRandomAvatarColorFromAddress from "utils/getRandomAvatarColorFromAddress";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";

export const ProfileCard = ({ profileData }: any) => {
	const profile = profileData as IUserData;
	const profileBackground =
		profile.id && JSON.stringify(getRandomAvatarColorFromAddress(`${profile.id}${profile.nonce as string}`));
	return (
		<div className="profile-card">
			<Link href={`/${profile.username || (profile.id as string)}`} passHref>
				<a>
					<div className="profile-card__wrapper">
						<div
							style={{ background: formatAvatarStyle(profileBackground as string), opacity: 0.5 }}
							className="profile-cover"
						></div>
						{profile ? (
							profile.avatar_url?.includes("//") ? (
								<Avatar size="128" src={profile.avatar_url} />
							) : (
								<Avatar size="128" src={""} style={formatAvatarStyle(profile.avatar_url as string)} />
							)
						) : (
							<ClipLoader
								css={`
									width: 122px;
									height: 122px;
								`}
							/>
						)}
						<div className="profile-card__info">
							{profile.name && <p className="profile-name">{profile.name}</p>}
							<p className="profile-username">
								{profile?.username || handleLongWalletAddress(profile?.id as string, 5, 4)}
							</p>
							{profile.bio && <p className="profile-bio">{profile.bio}</p>}
						</div>
					</div>
				</a>
			</Link>
		</div>
	);
};
