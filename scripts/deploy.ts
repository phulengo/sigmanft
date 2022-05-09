import { Contract, ContractFactory } from "ethers";
import * as fs from "fs";
import { ethers, artifacts } from "hardhat";

const main = async () => {
	const [deployer] = await ethers.getSigners();

	// Get the ContractFactories and Signers
	console.log("Deploying contracts with the account:", deployer.address);
	console.log("Account balance:", (await deployer.getBalance()).toString());

	// Deploy contracts
	const SigmaNFT = await ethers.getContractFactory("SigmaNFT"); // NFT
	const nft = await SigmaNFT.deploy();

	const SigmaNFTMarketplace = await ethers.getContractFactory("SigmaNFTMarketplace"); // Marketplace
	const marketplace = await SigmaNFTMarketplace.deploy(1); // initialize 5 fee per sale

	console.log("SigmaNFT contract address", nft.address);
	console.log("SigmaNFT Marketplace contract address", marketplace.address);

	// For each contract, save copies of abi and address to the frontend.
	saveFrontendFiles(nft, "SigmaNFT");
	saveFrontendFiles(marketplace, "SigmaNFTMarketplace");
};

const saveFrontendFiles = (contract: ContractFactory | Contract, name: string) => {
	const contractsDir = __dirname + "/contractsData";

	if (!fs.existsSync(contractsDir)) {
		fs.mkdirSync(contractsDir);
	}

	fs.writeFileSync(
		contractsDir + `/${name}-address.json`,
		JSON.stringify({ address: (contract as Contract).address }, undefined, 2)
	);

	const contractArtifact = artifacts.readArtifactSync(name);

	fs.writeFileSync(contractsDir + `/${name}.json`, JSON.stringify(contractArtifact, null, 2));
};

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
