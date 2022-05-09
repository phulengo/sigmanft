import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Connector, useAccount, useConnect } from "wagmi";
import { Avatar } from "components/Avatar";
import { Button } from "components/Button";
import { ConnectWalletButton } from "components/ConnectWalletButton";
import { Icon } from "components/Icon";
import Logo from "components/Logo";
import { MoreMenu } from "components/Menu";
import Modal from "components/Modal";
import { SearchBar } from "components/SearchBar";
import { SignMessage } from "components/SignMessage";
import { UserContext } from "components/UserProvider";
import { formatAvatarStyle } from "utils/formatAvatarStyle";
import { getWithExpiry } from "utils/localStorage";

const Header = () => {
	const [openNavigationBar, setOpenNavigationBar] = useState(false);
	const [showMoreMenu, setShowMoreMenu] = useState(false);

	const [{ data: accountData }, disconnect] = useAccount({
		fetchEns: true,
	});
	const [{ data: connectorData }] = useConnect();

	const [showSignMessageModal, setShowSignMessageModal] = useState(false);
	const [signMessageOptions, setSignMessageOptions] = useState({ res: {}, connector: {} });
	const [showSearchBarMobile, setShowSearchBarMobile] = useState(false);

	const handleConnectWalletState = (state: boolean, options?: { res: object; connector: object }) => {
		setShowSignMessageModal(state);
		options && setSignMessageOptions({ res: options.res, connector: options.connector });
	};

	const handleDisconnect = async () => {
		disconnect();
		await fetch("/api/logout");
		localStorage.removeItem("session_signature");
	};

	const handleClickMoreMenu = () => {
		setShowMoreMenu(!showMoreMenu);
	};

	const handleCloseMoreMenu = () => {
		setShowMoreMenu(false);
	};

	const currentUser = useContext(UserContext);

	useEffect(() => {
		const verifiedSignature = getWithExpiry("session_signature");
		!verifiedSignature && accountData && setShowSignMessageModal(true);

		if (typeof document !== "undefined") {
			if (openNavigationBar) {
				document.getElementsByTagName("html")[0].classList.add("h-full", "overflow-y-hidden", "overflow-x-hidden");
				document
					.getElementsByTagName("body")[0]
					.classList.add("h-full", "overflow-y-hidden", "overflow-x-hidden", "relative");
				document.getElementsByClassName("profile-cover")[0] &&
					document.getElementsByClassName("profile-cover")[0].classList.add("bg-white--important");
			} else {
				document.getElementsByTagName("html")[0].classList.remove("h-full", "overflow-y-hidden", "overflow-x-hidden");
				document
					.getElementsByTagName("body")[0]
					.classList.remove("h-full", "overflow-y-hidden", "overflow-x-hidden", "relative");
				document.getElementsByClassName("profile-cover")[0] &&
					document.getElementsByClassName("profile-cover")[0].classList.remove("bg-white--important");
			}
		}
	}),
		[accountData];

	return (
		<header>
			<nav className={`navigation-bar`}>
				<Link href={"/"} passHref>
					<a className="w-auto">
						<Logo
							onClick={() => {
								setOpenNavigationBar(false);
							}}
							width="48"
							height="48"
						/>
					</a>
				</Link>
				<div className="nav-search-menu--mobile">
					<div className="flex flex-row gap-4 items-center">
						{accountData && (
							<>
								<div
									role={"button"}
									tabIndex={0}
									onClick={handleClickMoreMenu}
									onKeyDown={() => true}
									className="btn-avatar"
								>
									{currentUser ? (
										currentUser.avatar_url?.includes("//") ? (
											<Avatar size="64" src={currentUser.avatar_url} />
										) : (
											<Avatar size="64" src={""} style={formatAvatarStyle(currentUser.avatar_url as string)} />
										)
									) : (
										<ClipLoader
											css={`
												width: 58px;
												height: 58px;
											`}
										/>
									)}
									{showMoreMenu && (
										<MoreMenu onCancel={handleCloseMoreMenu}>
											<div className="flex flex-col gap-2 flex-auto">
												<Link
													href={`/${currentUser.username ? currentUser.username : (currentUser.id as string)}`}
													passHref
												>
													<a className="flex w-full">
														<Button icon className="btn-menu btn-avatar--more">
															<span className="flex items-center gap-4">
																<Icon name="User" size="32" />
																<span className="btn-menu__text">View My Profile</span>
															</span>
															<Icon name="ChevronRight" size="32" />
														</Button>
													</a>
												</Link>
												<Button icon className="btn-menu btn-avatar--more">
													<span className="flex items-center gap-4">
														<Icon name="List" size="32" />
														<span className="btn-menu__text">Activity</span>
													</span>
													<Icon name="ChevronRight" size="32" />
												</Button>
												<Button onClick={handleDisconnect} icon className="btn-menu btn-avatar--more">
													<span className="flex items-center gap-4">
														<Icon name="LogOut" size="32" />
														<span className="btn-menu__text">Disconnect</span>
													</span>
													<Icon name="ChevronRight" size="32" />
												</Button>
											</div>
										</MoreMenu>
									)}
								</div>
							</>
						)}
						{/* Search mobile */}
						{!showSearchBarMobile ? (
							<Button onClick={() => setShowSearchBarMobile(true)} icon>
								<Icon name="Search" hasPadding size={"32"} color="black" />
							</Button>
						) : (
							<Button onClick={() => setShowSearchBarMobile(false)} icon>
								<Icon name="X" hasPadding size={"32"} color="black" />
							</Button>
						)}

						{showSearchBarMobile && (
							<div className={`absolute search-bar__modal--mobile ${accountData ? "" : "right-[184px]"}`}>
								<SearchBar />
							</div>
						)}
						<Button
							icon
							onClick={() => {
								setOpenNavigationBar(!openNavigationBar);
							}}
						>
							{openNavigationBar ? (
								<Icon name="X" hasPadding size={"32"} color="black" />
							) : (
								<Icon name="Menu" hasPadding size={"32"} color="black" />
							)}
						</Button>
					</div>
					<div className={`${openNavigationBar ? "navigation-bar--open" : "navigation-bar--close"}`}>
						<div className="flex flex-col justify-between h-full">
							<div className="flex flex-col gap-4">
								<h1 className="nav-bar__link">About</h1>
								<Link href={`/explore`} passHref>
									<a>
										<h1 className="nav-bar__link">Explore</h1>
									</a>
								</Link>
							</div>
							<div className="flex flex-col gap-6 items-center">
								{accountData ? (
									<Link href={"/create"} passHref>
										<a>
											<Button
												onClick={() => setOpenNavigationBar(false)}
												className="btn-primary text-heading-5  xs:self-stretch sm:self-stretch md:self-stretch"
											>
												Create Artwork
											</Button>
										</a>
									</Link>
								) : (
									<ConnectWalletButton
										screenSize="mobile"
										className="xs:self-stretch sm:self-stretch md:self-stretch"
										handleConnectWalletState={handleConnectWalletState}
									/>
								)}
								<div className="social-icons">
									<Icon name="Facebook" size={32} color="black" />
									<Icon name="Twitter" size={32} color="black" />
									<Icon name="Instagram" size={32} color="black" />
									<Icon name="Linkedin" size={32} color="black" />
									<Icon name="Slack" size={32} color="black" />
								</div>
								<div className="terms-privacy">
									<div className="terms-privacy__link">Terms of Service</div>
									<div className="terms-privacy__link">Privacy</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="nav-search-menu--desktop">
					<SearchBar />
					<div className="nav-search-menu__action">
						<Link href={`/explore`} passHref>
							<a>
								<div className="nav-bar__link">Explore</div>
							</a>
						</Link>
						<div className="nav-bar__link">About</div>

						{accountData ? (
							<>
								<div
									role={"button"}
									tabIndex={0}
									onClick={handleClickMoreMenu}
									onKeyDown={() => true}
									className="btn-avatar"
								>
									{currentUser ? (
										currentUser.avatar_url?.includes("//") ? (
											<Avatar size="64" src={currentUser.avatar_url} />
										) : (
											<Avatar size="64" src={""} style={formatAvatarStyle(currentUser.avatar_url as string)} />
										)
									) : (
										<ClipLoader
											css={`
												width: 58px;
												height: 58px;
											`}
										/>
									)}
									{showMoreMenu && (
										<MoreMenu onCancel={handleCloseMoreMenu}>
											<div className="flex flex-col gap-2 flex-auto">
												<Link
													href={`/${currentUser.username ? currentUser.username : (currentUser.id as string)}`}
													passHref
												>
													<a>
														<Button icon className="btn-menu btn-avatar--more">
															<span className="flex items-center gap-4">
																<Icon name="User" size="32" />
																<span className="btn-menu__text">View My Profile</span>
															</span>
															<Icon name="ChevronRight" size="32" />
														</Button>
													</a>
												</Link>
												<Button icon className="btn-menu btn-avatar--more">
													<span className="flex items-center gap-4">
														<Icon name="List" size="32" />
														<span className="btn-menu__text">Activity</span>
													</span>
													<Icon name="ChevronRight" size="32" />
												</Button>
												<Button onClick={handleDisconnect} icon className="btn-menu btn-avatar--more">
													<span className="flex items-center gap-4">
														<Icon name="LogOut" size="32" />
														<span className="btn-menu__text">Disconnect</span>
													</span>
													<Icon name="ChevronRight" size="32" />
												</Button>
											</div>
										</MoreMenu>
									)}
								</div>
								<Link href={"/create"} passHref>
									<a>
										<Button className="btn-primary text-heading-5 xs:self-stretch sm:self-stretch md:self-stretch">
											Create Artwork
										</Button>
									</a>
								</Link>
							</>
						) : (
							<ConnectWalletButton screenSize="desktop" handleConnectWalletState={handleConnectWalletState} />
						)}
					</div>
				</div>
			</nav>
			{showSignMessageModal && (
				<Modal
					onCancel={() => {
						setShowSignMessageModal(false);
						void handleDisconnect();
					}}
				>
					<SignMessage
						setShowSignMessageModal={setShowSignMessageModal}
						res={signMessageOptions?.res}
						connector={
							(signMessageOptions?.connector as Connector) &&
							Object.keys(signMessageOptions?.connector as Connector).length !== 0
								? (signMessageOptions?.connector as Connector)
								: connectorData && (connectorData.connector as Connector)
						}
					/>
				</Modal>
			)}
		</header>
	);
};

export default Header;
