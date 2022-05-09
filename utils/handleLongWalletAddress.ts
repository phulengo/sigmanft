export const handleLongWalletAddress = (walletAddress: string, head: number, tail: number) => {
	if (walletAddress.length > 35) {
		return (
			walletAddress.substring(0, head) +
			"..." +
			walletAddress.substring(walletAddress.length - tail, walletAddress.length)
		);
	}
	return walletAddress;
};
