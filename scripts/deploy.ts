import { Contract, ContractFactory } from 'ethers';
import * as fs from 'fs';
import { ethers, artifacts } from 'hardhat';

const main = async () => {
	const [deployer] = await ethers.getSigners();

	// Get the ContractFactories and Signers
	console.log('Deploying contracts with the account:', deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	// Deploy contracts
	const SigmaNFT = (await ethers.getContractFactory('SigmaNFT')) as ContractFactory;
	const nft = await SigmaNFT.deploy();

	console.log('SigmaNFT contract address', nft.address);

	// For each contract, save copies of abi and address to the frontend.
	saveFrontendFiles(SigmaNFT, 'SigmaNFT');
	saveFrontendFiles(nft, 'SigmaNFT');
};

const saveFrontendFiles = (contract: ContractFactory | Contract, name: string) => {
	const contractsDir = __dirname + '/contractsData';

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
