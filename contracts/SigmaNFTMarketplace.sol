/**
 * contracts/SigmaNFTMarketplace.sol
 * SPDX-License-Identifier: MIT
 */

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "contracts/SigmaNFT.sol";

import "hardhat/console.sol";

contract SigmaNFTMarketplace is ReentrancyGuard {
	// About fees - state variables
	address payable public immutable feeAccount; // Account that receives fees
	uint256 public immutable feePercent; // Fee percentage on sales (2.5%)
	uint256 public itemCount;

	// Object in JS
	struct Item {
		uint256 itemId;
		SigmaNFT nft;
		uint256 tokenId;
		uint256 price;
		address payable seller;
		bool sold;
	}

	event Offered(uint256 itemId, address indexed nft, uint256 tokenId, uint256 price, address indexed seller);

	event Bought(
		uint256 itemId,
		address indexed nft,
		uint256 tokenId,
		uint256 price,
		address indexed seller,
		address indexed buyer
	);

	event Burn(uint256 itemId, address indexed nft, uint256 tokenId);

	// itemId -> Item
	mapping(uint256 => Item) public items;

	constructor(uint256 _feePercent) {
		feeAccount = payable(msg.sender);
		feePercent = _feePercent;
	}

	/**
	 * https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard
	 */
	function makeItem(
		SigmaNFT _nft,
		uint256 _tokenId,
		uint256 _price
	) external nonReentrant {
		require(_price > 0, "Price must be greater than zero");

		itemCount++; // increase itemCoutn after adding nft

		_nft.transferFrom(msg.sender, address(this), _tokenId); // transfer nft to minter

		items[itemCount] = Item(itemCount, _nft, _tokenId, _price, payable(msg.sender), false); // add new item to item lists mapping

		// emit an Offered event
		emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
	}

	function purchaseItem(uint256 _itemId) external payable nonReentrant {
		uint256 _totalPrice = getTotalPrice(_itemId);

		// Reading directly form storage mapping (line 31)
		Item storage item = items[_itemId];

		require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");

		require(msg.value >= _totalPrice, "Not enough ether to paid for item price and market fee");

		require(!item.sold, "Item already sold");

		// Pay seller and feeAccount
		item.seller.transfer(item.price);
		feeAccount.transfer(_totalPrice - item.price); // Market fee?

		item.sold = true; // Update item to sold

		item.nft.transferFrom(address(this), msg.sender, item.tokenId); // Transfer NFT to buyer

		emit Bought(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
	}

	function removeItem(uint256 _itemId) external nonReentrant {
		// Reading directly form storage mapping (line 31)
		Item storage item = items[_itemId];
		require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");

		// Check owner
		require((item.nft.ownerOf(item.tokenId) == msg.sender), "ERC721: burn caller is not owner nor approved");

		itemCount--;
		item.nft.burn(msg.sender, item.tokenId);

		delete items[_itemId];
	}

	function editItem(uint256 _itemId, string memory _tokenURI) external nonReentrant {
		// Reading directly form storage mapping (line 31)
		Item storage item = items[_itemId];
		require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");

		// Check owner
		require(item.seller == msg.sender, "ERC721: update caller is not owner nor approved");

		item.nft.update(item.tokenId, _tokenURI);
	}

	/**
	 * Return total price = item price + marketplace fee
	 */
	function getTotalPrice(uint256 _itemId) public view returns (uint256) {
		return ((items[_itemId].price * (100 + feePercent)) / 100);
	}
}
