import "styles/globals.css";
import type { AppProps } from "next/app";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

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

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<Provider autoConnect connectors={connectors}>
			<Component {...pageProps} />;
		</Provider>
	);
}

export default MyApp;
