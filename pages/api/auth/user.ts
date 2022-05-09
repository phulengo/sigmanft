/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { generateNonce } from "siwe";
import supabase from "lib/supabase";
import getRandomAvatarColorFromAddress from "utils/getRandomAvatarColorFromAddress";

export const signInWithWalletAddress = async (walletAddress: string) => {
	const avatarGradientCode = getRandomAvatarColorFromAddress(walletAddress);

	// Check user existed?
	const { data: userExisted, error } = await supabase.from("users").select().match({ id: walletAddress }).single();

	if (userExisted) {
		return false;
	} else {
		const { data: user, error } = await supabase.from("users").insert({
			id: walletAddress,
			avatar_url: avatarGradientCode,
			nonce: generateNonce(),
		});
		return user && true;
	}
};

export const getUserByUsername = async (username: string) => {
	const { data, error } = await supabase.from("users").select().match({ username: username }).single();

	return { data, error };
};

export const getUserByWalletAddress = async (walletAddress: string) => {
	const { data, error } = await supabase.from("users").select().match({ id: walletAddress }).single();

	return { data, error };
};

export const getAllUsers = async () => {
	const { data, error } = await supabase.from("users").select();

	return { data, error };
};

export const searchProfilesByNameOrUsername = async (keywords: string) => {
	const { data, error } = await supabase.rpc("search_profiles", { keywords: keywords });

	return { data, error };
};

export const sortProfiles = async (keywords?: string, sortBy?: string) => {
	const { data, error } = keywords
		? !sortBy
			? await supabase.rpc("sort_search_profiles", { keywords: keywords, sort_by: "all-profiles" })
			: await supabase.rpc("sort_search_profiles", { keywords: keywords, sort_by: sortBy })
		: await supabase.rpc("sort_profiles", { sort_by: sortBy });

	return { data, error };
};
