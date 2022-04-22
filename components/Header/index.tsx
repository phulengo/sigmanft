import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { Button } from "components/Button";
import { ConnectWalletButton } from "components/ConnectWalletButton";
import { Icon } from "components/Icon";
import Logo from "components/Logo";
import { SearchBar } from "components/SearchBar";

const Header = () => {
	const [openNavigationBar, setOpenNavigationBar] = useState(false);

	const [{ data: connectData, error: connectError }, connect] = useConnect();
	const [{ data: accountData }, disconnect] = useAccount({
		fetchEns: true,
	});

	return (
		<header>
			<nav className={`navigation-bar`}>
				<Logo width="48" height="48" />
				<div className="nav-search-menu--mobile">
					<div className="flex flex-row gap-4">
						<Icon name="Search" hasPadding size={"32"} color="black" />
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
								<h1 className="nav-bar__link">Explore</h1>
							</div>
							<div className="flex flex-col gap-6 items-center">
								<ConnectWalletButton className="xs:self-stretch sm:self-stretch md:self-stretch" />{" "}
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
						<div className="nav-bar__link">Explore</div>
						<div className="nav-bar__link">About</div>

						{accountData ? (
							<div>
								<div>
									{accountData.ens?.name ? `${accountData.ens?.name} (${accountData.address})` : accountData.address}
								</div>
								<button onClick={disconnect}>Disconnect</button>
							</div>
						) : (
							<ConnectWalletButton />
						)}
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Header;
