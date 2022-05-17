import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import { IArtworkData } from "./interfaces";
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default supabase;

interface IMetadata {
	name: string;
	description: string;
	image: string;
}

export const handleSyncNewArtworkOnDatabase = async (
	path: string,
	file: File,
	metadata: string,
	price: number,
	ownerId: string,
	transactionHash: string,
	tokenId: number
) => {
	const centralizedStorageUrl = await uploadFileToSupabase("artworks", path, file);
	const metadataLink = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY as string}/ipfs/${metadata}/metadata.json`;
	const metadataRes = await axios
		.get(`https://${process.env.NEXT_PUBLIC_IPFS_GATEWAY as string}/ipfs/${metadata}/metadata.json`)
		.then((res) => res.data as IMetadata);
	const ipfsLink = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY as string}/ipfs/${metadataRes.image.replace("ipfs://", "")}`;
	const newItem =
		centralizedStorageUrl &&
		metadataLink &&
		metadataRes &&
		(await insertNewArtwork(
			path,
			metadataRes.name,
			metadataRes.description,
			price,
			centralizedStorageUrl,
			ipfsLink,
			metadataLink,
			ownerId,
			transactionHash,
			tokenId
		));

	return newItem as unknown as IArtworkData;
};

// TODO: Remove old file -> upload new file. Current version: Max = 2 file: 1 img + video
const uploadFileToSupabase = async (bucketName: string, path: string, file: File) => {
	let newFile: {
		Key: string;
	} | null;

	const { error: bucketExisted } = await supabase.storage.getBucket(bucketName);

	if (!bucketExisted) {
		const { data, error } = await supabase.storage
			.from(bucketName)
			.upload(
				`${
					path.includes(".png") &&
					path.includes(".jpeg") &&
					path.includes(".gif") &&
					path.includes(".jpb") &&
					path.includes(".mp4") &&
					path.includes(".mov")
						? `${path}/nft.${(file.name.substring(file.name.lastIndexOf(".") + 1), file.name.length)}`
						: `${path}/nft${file.type.includes("image") ? ".png" : file.type.includes("video") ? ".mp4" : ""}`
				}`,
				file
			);
		if (error) {
			const { data: updateFile, error } = await supabase.storage
				.from(bucketName)
				.update(
					`${
						path.includes(".png") &&
						path.includes(".jpeg") &&
						path.includes(".gif") &&
						path.includes(".jpb") &&
						path.includes(".mp4") &&
						path.includes(".mov")
							? `${path}/nft.${(file.name.substring(file.name.lastIndexOf(".") + 1), file.name.length)}`
							: `${path}/nft${file.type.includes("image") ? ".png" : file.type.includes("video") ? ".mp4" : ""}`
					}`,
					file,
					{
						cacheControl: "3600",
						upsert: false,
					}
				);
			newFile = updateFile && updateFile;
		} else {
			newFile = data && data;
		}
	} else {
		await supabase.storage.createBucket(bucketName);
		const { data, error } = await supabase.storage
			.from(bucketName)
			.upload(
				`${
					path.includes(".png") &&
					path.includes(".jpeg") &&
					path.includes(".gif") &&
					path.includes(".jpb") &&
					path.includes(".mp4") &&
					path.includes(".mov")
						? `${path}/nft.${(file.name.substring(file.name.lastIndexOf(".") + 1), file.name.length)}`
						: `${path}/nft${file.type.includes("image") ? ".png" : file.type.includes("video") ? ".mp4" : ""}`
				}`,
				file
			);
		if (error) {
			const { data: updateFile, error } = await supabase.storage
				.from(bucketName)
				.update(
					`${
						path.includes(".png") &&
						path.includes(".jpeg") &&
						path.includes(".gif") &&
						path.includes(".jpb") &&
						path.includes(".mp4") &&
						path.includes(".mov")
							? `${path}/nft.${(file.name.substring(file.name.lastIndexOf(".") + 1), file.name.length)}`
							: `${path}/nft${file.type.includes("image") ? ".png" : file.type.includes("video") ? ".mp4" : ""}`
					}`,
					file,
					{
						cacheControl: "3600",
						upsert: false,
					}
				);
			newFile = updateFile && updateFile;
		} else {
			newFile = data && data;
		}
	}

	const { signedURL, error } = await supabase.storage
		.from(bucketName)
		.createSignedUrl(`${newFile?.Key.replace("artworks/", "") as string}`, 999999999999); // Expired time of signed URL of avatar
	return signedURL;
};

const insertNewArtwork = async (
	id: string,
	artworkName: string,
	artworkDescription: string,
	price: number,
	centralizedStorageUrl: string,
	ipfsLink: string,
	metadataLink: string,
	ownerId: string,
	transactionHash: string,
	tokenId: number
) => {
	try {
		const { data, error } = await supabase.from("artworks").insert({
			id: id,
			artwork_name: artworkName,
			artwork_description: artworkDescription,
			price: price,
			centralized_storage_url: centralizedStorageUrl,
			etherscan_link: `${process.env.NEXT_PUBLIC_ETHERSCAN_ADDRESS_GATEWAY as string}/${
				process.env.NEXT_PUBLIC_SIGMANFT_CONTRACT_ADDRESS as string
			}?a=${tokenId + 7}`,
			ipfs_link: ipfsLink,
			metadata_link: metadataLink,
			owner_id: ownerId,
			transaction_hash: transactionHash,
		});
		return data;
	} catch (error) {
		throw error;
	}
};
