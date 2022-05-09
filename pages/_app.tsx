import "styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import ContractProvider from "components/ContractProvider";
import UserProvider from "components/UserProvider";

// API key for Ethereum node
// Two popular services are Infura (infura.io) and Alchemy (alchemy.com)
const infuraId = process.env.NEXT_PUBLIC_INFURA_KEY;

// Chains for connectors to support
const chains = defaultChains;

const connectors = ({ chainId }: any) => {
	const rpcUrl = chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0];
	return [
		new InjectedConnector({
			chains,
			options: { shimDisconnect: true },
		}),
		new WalletConnectConnector({
			options: {
				infuraId,
				qrcode: true,
			},
		}),
	];
};

const MyApp = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<Provider autoConnect connectors={connectors}>
				<ContractProvider>
					<UserProvider>
						<Component {...pageProps} />
						<Toaster position="bottom-right" />
					</UserProvider>
				</ContractProvider>
			</Provider>
		</>
	);
};

export default MyApp;
