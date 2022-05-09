/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { verifyMessage } from "ethers/lib/utils";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { SiweMessage } from "siwe";
import { Connector, ConnectorData, useAccount, useSignMessage } from "wagmi";
import { Button } from "components/Button";
import { signInWithWalletAddress } from "pages/api/auth/user";
import { setWithExpiry } from "utils/localStorage";

type SignMessProps = {
	res?: {
		data?: ConnectorData<any> | undefined;
		error?: Error | undefined;
	};
	connector: Connector;
	setShowSignMessageModal?: (value: React.SetStateAction<boolean>) => void;
};

export const SignMessage = ({ res, connector, setShowSignMessageModal }: SignMessProps) => {
	const [loadingSignMessage, setLoadingSignMessage] = useState(false);
	const recoveredAddress = React.useRef<string>();
	const router = useRouter();

	const [{ data: accountData }, disconnect] = useAccount({
		fetchEns: true,
	});

	// const { data, error, isLoading, signMessage } = useSignMessage({
	//   onSuccess(data, variables) {
	// 	// Verify signature when sign message succeeds
	// 	const address = verifyMessage(variables.message, data)
	// 	recoveredAddress.current = address
	//   },
	// })

	const handleSignMessage = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();

		const signMessageSigmanft = async () => {
			try {
				const nonceRes = await fetch("/api/nonce");
				const nonceText = await nonceRes.text();
				const message = new SiweMessage({
					domain: window.location.host,
					address: res && res.data && res.data.account,
					statement: `Welcome to Sigmanft!\n\nClick to sign in and accept the Sigmanft Terms of Service: https://sigmanft.vercel.app/tos\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will reset after 24 hours.\n\nWallet address:\n${
						(res && res.data && res.data.account) as string
					}\n\nNonce:\n${nonceText}`,
					uri: window.location.origin,
					version: "1",
					chainId: res && res.data && res.data.chain?.id,
					nonce: nonceText,
				});

				const signer = await connector.getSigner();
				const signature = await signer.signMessage(message.prepareMessage());
				setLoadingSignMessage(true);

				const verifyRes = await fetch("/api/verify", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ message, signature }),
				});
				verifyRes;

				if (!verifyRes.ok) {
					throw new Error("Error verifying message");
				} else {
					setLoadingSignMessage(false);
					setShowSignMessageModal && setShowSignMessageModal(false);
					setWithExpiry("session_signature", signature, 8.64e7); // 24 hours
				}
			} catch (error) {
				throw error;
			}
		};

		await toast.promise(signMessageSigmanft(), {
			loading: "Opening Signature Request",
			success: (data) => `Successfully signed to Sigmanft.`,
			error: (err) => `You denied message signature.`,
		});

		const isNewUser = await signInWithWalletAddress(accountData?.address as string);
		// TODO: Refresh user state instead of reload
		isNewUser && router.reload();
	};

	const handleDisconnect = () => {
		disconnect();
		setShowSignMessageModal && setShowSignMessageModal(false);
	};

	useEffect(() => {
		const handler = async () => {
			try {
				const res = await fetch("/api/siwe");
				await res.json();
			} catch (error) {
				throw error;
			}
		};
		// 1. page loads
		(async () => await handler())();
		// 2. window is focused (in case user logs out of another window)
		window.addEventListener("focus", handler);
		return () => window.removeEventListener("focus", handler);
	}, []);

	return (
		<form onSubmit={handleSignMessage} className="sign-message-form">
			<h1>Sign the message in your wallet to continue</h1>
			<p>Sigmanft uses this signature to verify that you’re the owner of this Ethereum address.</p>
			<div className="flex flex-col gap-4">
				<Button type="submit" className="btn-primary" disabled={loadingSignMessage}>
					{loadingSignMessage ? "Signing message in wallet" : "Sign Message"}
				</Button>
				<Button type="button" onClick={handleDisconnect} className="text-link">
					Disconnect
				</Button>
			</div>
			{/* {error && <div>{error?.message ?? "Error signing message"}</div>} */}
		</form>
	);
};
