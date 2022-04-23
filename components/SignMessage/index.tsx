/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { FormEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { SiweMessage } from "siwe";
import { Connector, ConnectorData, useAccount } from "wagmi";
import { Button } from "components/Button";

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

	const [, disconnect] = useAccount({
		fetchEns: true,
	});

	const handleSignMessage = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		const signMessageSigmanft = async () => {
			try {
				const nonceRes = await fetch("/api/nonce");
				const message = new SiweMessage({
					domain: window.location.host,
					address: res && res.data && res.data.account,
					statement: "Please sign this message to connect to Sigmanft.",
					uri: window.location.origin,
					version: "1",
					chainId: res && res.data && res.data.chain?.id,
					nonce: await nonceRes.text(),
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
				if (!verifyRes.ok) {
					throw new Error("Error verifying message");
				} else {
					setLoadingSignMessage(false);
					setShowSignMessageModal && setShowSignMessageModal(false);
				}
			} catch (error) {
				throw error;
			}
		};

		await toast.promise(signMessageSigmanft(), {
			loading: "Opening Signature Request",
			success: (data) => `Successfully signed to Sigmanft `,
			error: (err) => `Error: ${err as string}}`,
		});
	};

	useEffect(() => {
		const handler = async () => {
			try {
				const res = await fetch("/api/user");
				const json = await res.json();
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
				<Button className="btn-primary" disabled={loadingSignMessage}>
					{loadingSignMessage ? "Signing message in wallet" : "Sign Message"}
				</Button>
				<Button onClick={disconnect} className="text-link">
					Disconnect
				</Button>
			</div>
			{/* {error && <div>{error?.message ?? "Error signing message"}</div>} */}
		</form>
	);
};
