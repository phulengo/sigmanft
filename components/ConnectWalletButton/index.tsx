import { useState } from "react";
import { useConnect } from "wagmi";
import { Button } from "components/Button";
import { IconWallet } from "components/Icon";
import Modal from "components/Modal";

type ConnectWalletButtonProps = {
	className?: string;
};

export const ConnectWalletButton = ({ className }: ConnectWalletButtonProps) => {
	setTimeout(() => {
		if (typeof document !== "undefined") {
			const metamaskButtonEl = document.getElementsByClassName("wallet-style--metamask")[0];
			const walletConnectButtonEl = document.getElementsByClassName("wallet-style--walletconnect")[0];

			metamaskButtonEl && metamaskButtonEl.classList.add("wallet-style--metamask");
			walletConnectButtonEl && walletConnectButtonEl.classList.add("wallet-style--walletconnect");
		}
	}, 1);

	const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);

	const handleCloseConnectWalletModal = () => setShowConnectWalletModal(false);

	const handleConnectWallet = () => {
		setShowConnectWalletModal(true);
	};

	const [{ data, error }, connect] = useConnect();

	return (
		<>
			<Button onClick={handleConnectWallet} className={`${className as string} btn-primary`}>
				Connect Wallet
			</Button>
			{showConnectWalletModal && (
				<Modal onCancel={handleCloseConnectWalletModal} headerText="Connect Wallet">
					<div className="flex flex-col gap-6">
						<p className="text-center">
							By connecting your wallet, you agree to our <span className="text-link">Terms of Service</span> and our{" "}
							<span className="text-link">Privacy Policy</span>.
						</p>
						<div className="wallet-options__wrapper">
							{data.connectors.map(
								(connector) =>
									connector.name !== "Injected" && (
										<Button
											className={`wallet-options__button wallet-style--${connector.name.toLowerCase()}`}
											icon
											disabled={!connector.ready}
											key={connector.id}
											onClick={() => connect(connector)}
										>
											<IconWallet name={connector.name.toLowerCase()} size="32" />
											{connector.name}
											{!connector.ready && " (unsupported)"}
										</Button>
									)
							)}
							{error && <div>{error?.message ?? "Failed to connect"}</div>}

							{/* {error && <div>{error?.message ?? "Failed to connect"}</div>} */}
						</div>
						<div className="flex">
							<p className="text-link border-t border-t-platinum w-full pt-4 text-center">Learn more</p>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
};
