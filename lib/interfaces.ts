import { BigNumber } from "ethers";

export interface IMetaData {
	name: string;
	description: string;
	image: string;
}

export interface IFileData {
	created_at: string;
	id: string;
	last_accessed_at: string;
	metadata: {
		[key: string]: any;
		size: number;
	};
	name: string;
	updated_at: string;
}

export interface IUserData {
	id?: string;
	name?: string;
	username?: string;
	email?: string;
	bio?: string;
	social_facebook?: string;
	social_twitter?: string;
	social_website?: string;
	avatar_url?: string;
	nonce?: string;
	joined_at: string;
}

export interface IUserProps {
	data: IUserData[];
}

export interface IArtworkData {
	id?: string;
	artwork_name: string;
	artwork_description?: string;
	tags?: string[];
	price: number;
	centralized_storage_url: string;
	etherscan_link: string;
	ipfs_link: string;
	metadata_link: string;
	owner_id: string;
	view_count: number;
	artwork_nonce?: string;
	transaction_hash: string;
	sold: boolean;
	created_on: string;
	owner?: IUserData;
}

export interface IArtworkProps {
	data: IArtworkData[];
}

export interface IArtworkItemData {
	itemId: BigNumber;
	contractAddress: string;
	seller: string;
	name: string;
	description: string;
	image: string;
	price: BigNumber;
	totalPrice: BigNumber;
	sold: boolean;
	tokenId: BigNumber;
}

export interface IArtworkItemProps {
	data: IArtworkItemData[];
}
