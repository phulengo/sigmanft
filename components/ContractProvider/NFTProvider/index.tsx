import { ContractInterface, Signer, ethers } from "ethers";
import { createContext, useEffect, useState } from "react";
import { SigmaNFT as ISigmaNFT } from "typechain-types";
import { useAccount, useConnect } from "wagmi";
import SigmaNFTAddress from "scripts/contractsData/SigmaNFT-address.json";
import SigmaNFTAbi from "scripts/contractsData/SigmaNFT.json";

export const NFTContext = createContext<ISigmaNFT | undefined>(undefined);

const NFTProvider = ({ children }: any) => {
	const [nft, setNft] = useState<ISigmaNFT>();
	const [loading, setLoading] = useState(true);

	const [{ data: connectorData }] = useConnect();
	const [{ data: accountData }] = useAccount();
	const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RINKEBY_URL as string);

	useEffect(() => {
		const loadContracts = (signer?: Signer) => {
			// Get deployed copies of contracts
			if (!signer) {
				const nft = new ethers.Contract(
					SigmaNFTAddress.address,
					SigmaNFTAbi.abi as unknown as ContractInterface,
					provider
				);
				nft && setNft(nft as ISigmaNFT);
			} else {
				const nft = new ethers.Contract(
					SigmaNFTAddress.address,
					SigmaNFTAbi.abi as unknown as ContractInterface,
					signer
				);
				nft && setNft(nft as ISigmaNFT);
			}
			setLoading(false);
		};

		const loadDataWithSigner = async () => {
			const signer = accountData && accountData?.connector && (await accountData.connector.getSigner());
			signer && void loadContracts(signer);
		};

		const loadDataWithProvider = () => {
			loadContracts();
		};

		if (!nft && loading) {
			setTimeout(() => {
				if (accountData) {
					void loadDataWithSigner();
				} else {
					loadDataWithProvider();
				}
			}, 5);
		}
	}, [connectorData, nft, loading, accountData]);

	return <NFTContext.Provider value={nft as ISigmaNFT}>{children}</NFTContext.Provider>;
};

export default NFTProvider;
