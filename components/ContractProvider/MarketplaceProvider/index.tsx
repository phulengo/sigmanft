import { ContractInterface, Signer, ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import { SigmaNFTMarketplace as ISigmaNFTMarketplace } from "typechain-types";
import { useAccount, useConnect } from "wagmi";
import SigmaNFTMarketplaceAddress from "scripts/contractsData/SigmaNFTMarketplace-address.json";
import SigmaNFTMarketplaceAbi from "scripts/contractsData/SigmaNFTMarketplace.json";

export const MarketplaceContext = createContext<ISigmaNFTMarketplace | undefined>(undefined);

const MarketplaceProvider = ({ children }: any) => {
	const [marketplace, setMarketplace] = useState<ISigmaNFTMarketplace>();
	const [loading, setLoading] = useState(true);
	const [{ data: connectorData }] = useConnect();
	const [{ data: accountData }] = useAccount();
	const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RINKEBY_URL as string);

	useEffect(() => {
		const loadMarketplace = (signer?: Signer) => {
			// Get deployed copies of contracts
			if (!signer) {
				const marketplace = new ethers.Contract(
					SigmaNFTMarketplaceAddress.address,
					SigmaNFTMarketplaceAbi.abi as unknown as ContractInterface,
					provider
				);
				marketplace && setMarketplace(marketplace as ISigmaNFTMarketplace);
			} else {
				const marketplace = new ethers.Contract(
					SigmaNFTMarketplaceAddress.address,
					SigmaNFTMarketplaceAbi.abi as unknown as ContractInterface,
					signer
				);
				marketplace && setMarketplace(marketplace as ISigmaNFTMarketplace);
			}
			setLoading(false);
		};

		const loadDataWithSigner = async () => {
			const signer = accountData && accountData?.connector && (await accountData.connector.getSigner());
			signer && void loadMarketplace(signer);
		};

		const loadDataWithProvider = () => {
			loadMarketplace();
		};

		if (!marketplace && loading) {
			setTimeout(() => {
				if (accountData) {
					void loadDataWithSigner();
				} else {
					loadDataWithProvider();
				}
			}, 50);
		}
	}, [connectorData, marketplace, loading, accountData]);

	return (
		<MarketplaceContext.Provider value={marketplace as ISigmaNFTMarketplace}>{children}</MarketplaceContext.Provider>
	);
};

export default MarketplaceProvider;
