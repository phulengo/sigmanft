/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import toast from "react-hot-toast";
import { IUserData } from "lib/interfaces";
import supabase from "lib/supabase";

export const getUserById = async (id: string) => {
	const { data, error } = await supabase.from("users").select("*, artworks(*)").match({ id: id }).single();
	return { data, error };
};

export const getUserByUsername = async (username: string) => {
	const { data, error } = await supabase.from("users").select("*, artworks(*)").match({ username: username }).single();
	return { data, error };
};

export const checkUsernameExisted = async (username: string) => {
	const { data } = await supabase.from("users").select("id").match({
		username: username,
	});

	return data!.length !== 0;
};

export const uploadAvatar = async (avatarFile: File, id: string) => {
	const updateAvatar = async () => {
		const { error } = await supabase.storage.from("users").upload(`${id}/avatars/${id}-avatar`, avatarFile);
		if (error) {
			await supabase.storage.from("users").update(`${id}/avatars/${id}-avatar`, avatarFile, {
				cacheControl: "3600",
				upsert: false,
			});
		}
		return getAvatarFileUrl();
	};

	const getAvatarFileUrl = async () => {
		const { signedURL, error } = await supabase.storage
			.from("users")
			.createSignedUrl(`${id}/avatars/${id}-avatar`, 999999999999); // Expired time of signed URL of avatar
		if (signedURL) {
			const url = signedURL;
			return url;
		} else {
			throw error;
		}
	};

	try {
		let avatarUrl;
		// Check if users bucket exists
		const { data } = await supabase.storage.getBucket(`users`);

		if (data) {
			try {
				avatarUrl = await updateAvatar();
			} catch (error) {
				throw new Error("Avatar is not uploaded!");
			}
		} else {
			try {
				await supabase.storage.createBucket(`users`);
				avatarUrl = await updateAvatar();
			} catch (error) {
				throw new Error("Bucket is not created!");
			}
		}
		return avatarUrl;
	} catch (error) {
		throw new Error("Bucket does not exists on the db!");
	}
};

export const updateUserProfile = async (userData: IUserData) => {
	const updateProfile = async () => {
		const { data, error } = await supabase
			.from("users")
			.update({
				name: userData.name,
				username: userData.username,
				email: userData.email,
				bio: userData.bio,
				social_facebook: userData.social_facebook,
				social_twitter: userData.social_twitter,
				social_website: userData.social_website,
				avatar_url: userData.avatar_url,
			})
			.match({ id: userData.id });
	};
	await toast.promise(updateProfile(), {
		loading: "Updating user profile",
		success: "User profile updated",
		error: "Error updating user profile",
	});
};
