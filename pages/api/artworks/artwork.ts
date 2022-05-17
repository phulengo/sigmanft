/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IArtworkData } from "lib/interfaces";
import supabase from "lib/supabase";

export const getAllArtworks = async () => {
	const { data, error } = await supabase
		.from("artworks")
		.select("*, owner:artworks_owner_id_fkey(*)")
		.order("created_on", { ascending: false });
	return { data, error };
};

export const getFeaturedArtwork = async () => {
	const { data, error } = await supabase
		.from("artworks")
		.select("*, owner:artworks_owner_id_fkey(*)")
		.order("view_count", { ascending: false })
		.limit(1)
		.single();

	return { data, error };
};

export const getArtworkById = async (id: string) => {
	const { data, error } = await supabase
		.from("artworks")
		.select("*, owner:artworks_owner_id_fkey(*)")
		.match({ id: id })
		.single();
	return { data, error };
};

export const getArtworksCreatedByUserId = async (id: string) => {
	const { data, error } = await supabase
		.from("artworks")
		.select("*, owner:artworks_owner_id_fkey(*)")
		.match({ owner_id: id });
	return { data, error };
};

export const increaseArtworkViewCount = async (id: string, current: number) => {
	const { data, error } = await supabase
		.from("artworks")
		.update({ view_count: ++current })
		.match({ id: id });
	return { data, error };
};

export const updateTransaction = async (
	sold: boolean,
	id: string,
	transactionHash: string,
	fromAddress: string,
	toAddress: string
) => {
	const { data, error } = await supabase.from("artworks").update({ sold: sold }).match({ id: id });
	// const { data: newTransaction } = await supabase
	// 	.from("transactions")
	// 	.insert({ id: transactionHash, fromddress: fromAddress, toAddress: toAddress });
};

export const searchArtworksByName = async (keywords: string, sortBy?: string) => {
	const { data, error } = await supabase.rpc("search_artworks", { keywords: keywords });

	return { data, error };
};

export const sortArtworks = async (keywords?: string, sortBy?: string) => {
	const { data, error } = keywords
		? !sortBy
			? await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: "all-artworks" })
			: await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: sortBy })
		: await supabase.rpc("sort_artworks", { sort_by: sortBy });
	return { data, error };
};

export const filterArtworks = async (keywords?: string, sortBy?: string, filter?: string) => {
	const { data, error } = keywords
		? !sortBy
			? await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: "all-artworks" })
			: await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: sortBy })
		: await supabase.rpc("sort_artworks", { sort_by: sortBy });
	return { data, error };
};

export const filterAvailabilityArtworks = async (keywords?: string, sortBy?: string, availability?: string) => {
	const { data, error } =
		availability === "available"
			? keywords
				? sortBy
					? await supabase.rpc("filter_availability_artworks", {
							keywords: keywords,
							sort_by: sortBy,
							availability: false,
					  })
					: await supabase.rpc("filter_availability_artworks", {
							keywords: keywords,
							sort_by: "all-artworks",
							availability: false,
					  })
				: sortBy
				? await supabase.rpc("filter_availability_artworks_all", { sort_by: sortBy, availability: false })
				: await supabase.rpc("filter_availability_artworks_all", { sort_by: "all-artworks", availability: false })
			: availability === "sold"
			? keywords
				? sortBy
					? await supabase.rpc("filter_availability_artworks", {
							keywords: keywords,
							sort_by: sortBy,
							availability: true,
					  })
					: await supabase.rpc("filter_availability_artworks", {
							keywords: keywords,
							sort_by: "all-artworks",
							availability: true,
					  })
				: sortBy
				? await supabase.rpc("filter_availability_artworks_all", { sort_by: sortBy, availability: true })
				: await supabase.rpc("filter_availability_artworks_all", { sort_by: "all-artworks", availability: true })
			: keywords
			? sortBy
				? await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: sortBy })
				: await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: "all-artworks" })
			: sortBy
			? await supabase.rpc("sort_artworks", { sort_by: sortBy })
			: await supabase.rpc("sort_artworks", { sort_by: "all-artworks" });
	return { data, error };
};

export const filterTypeArtworks = async (keywords?: string, sortBy?: string, type?: string) => {
	console.log("🚀 ~ file: artwork.ts ~ line 132 ~ filterTypeArtworks ~ type", type);
	const { data, error } =
		type === "image"
			? keywords
				? sortBy
					? await supabase.rpc("filter_type_artworks", {
							keywords: keywords,
							sort_by: sortBy,
							type: "png",
					  })
					: await supabase.rpc("filter_type_artworks", {
							keywords: keywords,
							sort_by: "all-artworks",
							type: "png",
					  })
				: sortBy
				? await supabase.rpc("filter_type_artworks_all", { sort_by: sortBy, type: "png" })
				: await supabase.rpc("filter_type_artworks_all", { sort_by: "all-artworks", type: "png" })
			: type === "video"
			? keywords
				? sortBy
					? await supabase.rpc("filter_type_artworks", {
							keywords: keywords,
							sort_by: sortBy,
							type: "mp4",
					  })
					: await supabase.rpc("filter_type_artworks", {
							keywords: keywords,
							sort_by: "all-artworks",
							type: "mp4",
					  })
				: sortBy
				? await supabase.rpc("filter_type_artworks_all", { sort_by: sortBy, type: "mp4" })
				: await supabase.rpc("filter_type_artworks_all", { sort_by: "all-artworks", type: "mp4" })
			: keywords
			? sortBy
				? await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: sortBy })
				: await supabase.rpc("sort_search_artworks", { keywords: keywords, sort_by: "all-artworks" })
			: sortBy
			? await supabase.rpc("sort_artworks", { sort_by: sortBy })
			: await supabase.rpc("sort_artworks", { sort_by: "all-artworks" });
	return { data, error };
};
