/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { getUserByWalletAddress } from "pages/api/auth/user";
import { IUserData } from "lib/interfaces";

type DataProps = {
	address: string;
};

export const useUserData = (data?: string) => {
	// const [currentAddress, setCurrentAddress] = useState("");

	const [user, setUser] = useState<IUserData>();

	const [{ data: accountData }] = useAccount();
	const [{ data: connectorData }] = useConnect();

	useEffect(() => {
		const getCurrentUser = async (walletAddress: string) => {
			const { data, error } = await getUserByWalletAddress(walletAddress);
			data && setUser(data as IUserData);
		};
		!user && accountData && void getCurrentUser(accountData?.address);

		user && !connectorData.connected && setUser(undefined);
	}, [accountData, user, connectorData]);

	return user;
};
