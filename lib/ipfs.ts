import { ethers } from "ethers";
import * as ipfsClient from "ipfs-http-client";
import { NFTStorage } from "nft.storage";
import toast from "react-hot-toast";
import { SigmaNFT as ISigmaNFT, SigmaNFTMarketplace as ISigmaNFTMarketplace } from "typechain-types";
import { IArtworkData } from "./interfaces";
import { handleSyncNewArtworkOnDatabase } from "./supabase";

const auth =
	"Basic " +
	Buffer.from(
		`${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID as string}:${
			process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET_KEY as string
		}`
	).toString("base64");

// const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

const client = ipfsClient.create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
	apiPath: "/api/v0",
	headers: {
		authorization: auth,
	},
});

const uploadFileToInfuraIPFS = async (file: File) => {
	const uploaded = await client.add(file);
	const path = uploaded && uploaded.path;
	return path;
};

let newItem: IArtworkData;
export const createNewArtwork = async (
	marketplace: ISigmaNFTMarketplace,
	nft: ISigmaNFT,
	imageFile: File,
	name: string,
	description: string,
	price: number,
	tokenId: number,
	tags?: string
) => {
	try {
		const loadingCreateNewArtwork = async () => {
			const image = await uploadFileToInfuraIPFS(imageFile);

			const metadata = await saveMetaDataToNFTStorage(imageFile, name, description);

			const newArtwork = image && (await client.add(JSON.stringify({ name, description, image })));

			const newNFTItem = newArtwork && (await mintThenList(marketplace, nft, newArtwork.path, price));

			const newItemData =
				newArtwork &&
				(await handleSyncNewArtworkOnDatabase(
					newArtwork.path,
					imageFile,
					metadata.ipnft,
					price,
					(newNFTItem as ethers.ContractReceipt).from,
					(newNFTItem as ethers.ContractReceipt).transactionHash,
					tokenId
				));
			newItem = newItemData as IArtworkData;
		};

		await toast.promise(loadingCreateNewArtwork(), {
			loading: "Creating artwork on the Interplanetary File System.",
			success: (data) => `Your artwork has been successfully minted and listed on SigmaNFT.`,
			error: (err) => `Unexpected error: ${err as string}.`,
		});
	} catch (error) {
		throw error;
	}
	return newItem && newItem;
};

const mintThenList = async (
	marketplace: ISigmaNFTMarketplace,
	nft: ISigmaNFT,
	newArtworkPath: string,
	price: number
) => {
	const URI = `https://ipfs.infura.io/ipfs/${newArtworkPath}`;

	// Mint NFT
	await (await nft.mint(URI)).wait();

	// Get tokenId of new NFT
	const id = await nft.tokenCount();

	// Approve the marketplace to spend NFT
	await (await nft.setApprovalForAll(marketplace.address, true)).wait();

	// Add NFT to marketplace
	const listingPrice = ethers.utils.parseEther(price.toString());
	const newNFT = await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
	return newNFT;
};

const saveMetaDataToNFTStorage = async (imageFile: File, name: string, description: string) => {
	const file = new File(
		[imageFile as Blob],
		`${
			imageFile.name.includes(".png") &&
			imageFile.name.includes(".jpeg") &&
			imageFile.name.includes(".gif") &&
			imageFile.name.includes(".jpb") &&
			imageFile.name.includes(".mp4") &&
			imageFile.name.includes(".mov")
				? `nft.${(imageFile.name.substring(imageFile.name.lastIndexOf(".") + 1), imageFile.name.length)}`
				: `nft${imageFile.type.includes("image") ? ".png" : imageFile.type.includes("video") ? ".mp4" : ""}`
		}`,
		{ type: imageFile.type }
	);
	const nftStorageClient = new NFTStorage({ token: process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN as string });
	const metadata = await nftStorageClient.store({ name: name, description: description, image: file });
	return metadata;
};
