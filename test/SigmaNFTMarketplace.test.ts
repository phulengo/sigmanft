import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BaseContract, BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

/**
 *
 * @param toWei
 * @returns string
 * 1 ether == 10**18 wei
 */
const toWei = (num: number | BigNumber) => ethers.utils.parseEther(num.toString());
const fromWei = (num: number | BigNumber) => ethers.utils.formatEther(num);

describe("SigmaNFTMarketplace", () => {
	/**
	 * https://github.com/ethers-io/ethers.js/issues/263#issuecomment-919556272
	 */
	let deployer: SignerWithAddress,
		address1: SignerWithAddress,
		address2: SignerWithAddress,
		nft: Contract,
		marketplace: Contract;
	let feePercent = 1;
	let URI = "Test URI";

	beforeEach(async () => {
		// Get contract factories
		const SigmaNFT = await ethers.getContractFactory("SigmaNFT");

		const SigmaNFTMarketplace = await ethers.getContractFactory("SigmaNFTMarketplace");

		// Get signers
		[deployer, address1, address2] = await ethers.getSigners();

		// Deploy contracts
		nft = await SigmaNFT.deploy();
		marketplace = await SigmaNFTMarketplace.deploy(feePercent);
	});

	describe("Deployment", () => {
		it("Should track name and symbol of the NFT collection", async () => {
			expect(await nft.name()).to.equal("Sigma NFT");
			expect(await nft.symbol()).to.equal("SigmaNFT");
		});
		it("Should track feeAccount and feePercent of the marketplace", async () => {
			expect(await marketplace.feeAccount()).to.equal(deployer.address);
			expect(await marketplace.feePercent()).to.equal(feePercent);
		});
	});

	describe("Minting NFT", () => {
		it("Should track each minted NFT", async () => {
			await nft.connect(address1).mint(URI); // address1 mints an NFT
			expect(await nft.tokenCount()).to.equal(1);
			expect(await nft.balanceOf(address1.address)).to.equal(1);
			expect(await nft.tokenURI(1)).to.equal(URI);
		});
	});

	describe("Making marketplace items", () => {
		beforeEach(async () => {
			// address1 mint an NFT
			await nft.connect(address1).mint(URI);

			// address1 approves marketplace to spend NFT
			await nft.connect(address1).setApprovalForAll(marketplace.address, true);
		});

		it("Should track new created item, transfer it from seller to marketplace and emit Offered event", async () => {
			await expect(marketplace.connect(address1).makeItem(nft.address, 1, toWei(1))) // can only represent integer, not decimal;
				.to.emit(marketplace, "Offered")
				.withArgs(1, nft.address, 1, toWei(1), address1.address);

			// owner of nft should be the sigma nft marketplace
			expect(await nft.ownerOf(1)).to.equal(marketplace.address);

			// item count should be equal to 1
			expect(await marketplace.itemCount()).to.equal(1);

			// Get item from items mapping then checking fields to ensure they are correct
			const item = await marketplace.items(1);
			expect(item.itemId).to.equal(1);
			expect(item.nft).to.equal(nft.address);
			expect(item.tokenId).to.equal(1);
			expect(item.price).to.equal(toWei(1));
			expect(item.sold).to.equal(false);
		});

		it("Should failed if price is set to zero", async () => {
			await expect(marketplace.connect(address1).makeItem(nft.address, 1, 0)).to.be.revertedWith(
				"Price must be greater than zero"
			);
		});
	});

	describe("Purchasing marketplace items", () => {
		let price = 2;
		beforeEach(async () => {
			// address1 mint an NFT
			await nft.connect(address1).mint(URI);

			// address1 approves marketplace to spend NFT
			await nft.connect(address1).setApprovalForAll(marketplace.address, true);

			// address1 make their NFT a marketplace item
			await marketplace.connect(address1).makeItem(nft.address, 1, toWei(2));
		});

		it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async () => {
			const sellerInitialEthBalance = await address1.getBalance();
			const feeAccountInitialBalance = await deployer.getBalance();

			// Fetch items total price (market fees + item price)
			let totalPriceInWei = await marketplace.getTotalPrice(1);

			// address 2 purchase the item of address 1
			await expect(marketplace.connect(address2).purchaseItem(1, { value: totalPriceInWei }))
				.to.emit(marketplace, "Bought")
				.withArgs(1, nft.address, 1, toWei(price), address1.address, address2.address);

			const sellerFinalEthBalance = await address1.getBalance();
			const feeAccountFinalBalance = await deployer.getBalance();

			// Seller should receive payment for the price of the NFT sold
			expect(+fromWei(sellerFinalEthBalance)).to.equal(+price + +fromWei(sellerInitialEthBalance));

			// Calculate fee
			const fee = (feePercent / 100) * price;

			// feeAccount should receive the fee
			expect(+fromWei(feeAccountFinalBalance)).to.equal(+fee + +fromWei(feeAccountInitialBalance));

			// The buyer should own the NFT
			expect(await nft.ownerOf(1)).to.equal(address2.address);

			// Item should be marked as sold
			expect((await marketplace.items(1)).sold).to.equal(true);
		});

		it("Should fail for invalid item ids, sold items, and when not enough ether is paid", async () => {
			// Fetch items total price (market fees + item price)
			let totalPriceInWei = await marketplace.getTotalPrice(1);
			// invalid item ids
			await expect(marketplace.connect(address2).purchaseItem(0, { value: totalPriceInWei })).to.be.revertedWith(
				"Item doesn't exist"
			);
			await expect(marketplace.connect(address2).purchaseItem(2, { value: totalPriceInWei })).to.be.revertedWith(
				"Item doesn't exist"
			);

			// address2 purchase item 1 and  deployer try to purchase item 1 after being solved
			await expect(marketplace.connect(address2).purchaseItem(1, { value: totalPriceInWei }));
			await expect(marketplace.connect(address2).purchaseItem(1, { value: totalPriceInWei })).to.be.revertedWith(
				"Item already sold"
			);

			// not enough ethers to buy
			await expect(marketplace.connect(address2).purchaseItem(1, { value: toWei(price) })).to.be.revertedWith(
				"Not enough ether to paid for item price and market fee"
			);
		});
	});

	describe("Burning NFT", () => {
		beforeEach(async () => {
			// address1 mint an NFT
			await nft.connect(address1).mint(URI);

			// address1 approves marketplace to spend NFT
			await nft.connect(address1).setApprovalForAll(marketplace.address, true);

			// address1 make their NFT a marketplace item
			await marketplace.connect(address1).makeItem(nft.address, 1, toWei(2));

			// address 2 buy address 1's item
			let totalPriceInWei = await marketplace.getTotalPrice(1);
			await marketplace.connect(address2).purchaseItem(1, { value: totalPriceInWei });
		});
		it("Should burned the specific NFT", async () => {
			// Remove/burn NFT
			await marketplace.connect(address2).removeItem(1);

			expect(await marketplace.itemCount()).to.equal(0);
		});

		it("Should fail when non-owner of NFT trying to burn", async () => {
			// Remove/burn NFT
			await expect(marketplace.connect(address1).removeItem(1)).to.be.revertedWith(
				"ERC721: burn caller is not owner nor approved"
			);

			expect(await marketplace.itemCount()).to.equal(1);
		});
	});

	describe("Updating NFT", () => {
		let oldData: BaseContract;
		beforeEach(async () => {
			// address1 mint an NFT
			oldData = await nft.connect(address1).mint(URI);

			// address1 approves marketplace to spend NFT
			await nft.connect(address1).setApprovalForAll(marketplace.address, true);

			// address1 make their NFT a marketplace item
			await marketplace.connect(address1).makeItem(nft.address, 1, toWei(2));
		});
		let newURI = "New URI Updated";
		it("Should update the specific NFT", async () => {
			// Update NFT
			await expect(await marketplace.connect(address1).editItem(1, newURI)).to.not.equal(oldData);
			await expect(await marketplace.itemCount()).to.equal(1);
		});

		it("Should fail when non-owner trying to update the specific NFT", async () => {
			await expect(marketplace.connect(address2).editItem(1, newURI)).to.be.revertedWith(
				"ERC721: update caller is not owner nor approved"
			);
		});
	});
});
