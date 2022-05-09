/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import gradient from "random-gradient";

const getRandomAvatarColorFromAddress = (walletAddress: string) => {
	const randomGradientCSSCode = { background: gradient(walletAddress) };
	return randomGradientCSSCode;
};

export default getRandomAvatarColorFromAddress;
