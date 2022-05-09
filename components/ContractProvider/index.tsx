import MarketplaceProvider from "./MarketplaceProvider";
import NFTProvider from "./NFTProvider";

const ContractProvider = ({ children }: any) => {
	return (
		<MarketplaceProvider>
			<NFTProvider>{children}</NFTProvider>
		</MarketplaceProvider>
	);
};

export default ContractProvider;
