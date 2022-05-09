import { useState } from "react";
import { Connector, ConnectorData, useAccount, useConnect } from "wagmi";
import { Button } from "components/Button";
import { IconWallet } from "components/Icon";
import Modal from "components/Modal";

type ConnectWalletButtonProps = {
	className?: string;
	handleConnectWalletState?: (
		state: boolean,
		options?: {
			res: {
				data?: ConnectorData<any> | undefined;
				error?: Error | undefined;
			};
			connector: object;
		}
	) => void;
	screenSize?: string;
};

export const ConnectWalletButton = ({ className, handleConnectWalletState, screenSize }: ConnectWalletButtonProps) => {
	setTimeout(() => {
		if (typeof document !== "undefined") {
			// Styling connector buttons
			const metamaskButtonEl = document.getElementsByClassName("wallet-style--metamask")[0];
			const walletConnectButtonEl = document.getElementsByClassName("wallet-style--walletconnect")[0];

			metamaskButtonEl && metamaskButtonEl.classList.add("wallet-style--metamask");
			walletConnectButtonEl && walletConnectButtonEl.classList.add("wallet-style--walletconnect");

			// Hide modal of different size
			const desktopConnectWalletModal = document.getElementsByClassName("connect-wallet-modal__container--desktop")[0];
			const mobileConnectWalletModal = document.getElementsByClassName("connect-wallet-modal__container--mobile")[0];

			desktopConnectWalletModal && desktopConnectWalletModal.classList.add("connect-wallet-modal__container--desktop");
			mobileConnectWalletModal && mobileConnectWalletModal.classList.add("onnect-wallet-modal__container--mobile");
		}
	}, 1);

	const [showConnectWalletModal, setShowConnectWalletModal] = useState(false);

	const handleCloseConnectWalletModal = () => setShowConnectWalletModal(false);

	const handleConnectWallet = () => {
		setShowConnectWalletModal(true);
	};

	const [{ data, error }, connect] = useConnect();
	const [, disconnect] = useAccount();

	const handleSignIn = async (connector: Connector) => {
		try {
			const res = await connect(connector);
			if (!res.data) throw res.error ?? new Error("Something went wrong");
			handleConnectWalletState && handleConnectWalletState(true, { res: res, connector: connector });
		} catch (error) {
			throw error;
		}
	};

	return (
		<>
			<Button onClick={handleConnectWallet} className={`${className as string} btn-primary text-heading-5`}>
				Connect Wallet
			</Button>
			{showConnectWalletModal && (
				<Modal
					className={`connect-wallet-modal__container--${screenSize as string}`}
					onCancel={handleCloseConnectWalletModal}
					headerText="Connect Wallet"
				>
					<div className="connect-wallet-modal">
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
											onClick={() => handleSignIn(connector)}
										>
											<IconWallet name={connector.name.toLowerCase()} size="32" />
											{connector.name}
											{!connector.ready && " (unsupported)"}
										</Button>
									)
							)}

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
