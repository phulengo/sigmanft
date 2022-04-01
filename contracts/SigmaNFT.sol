/**
 * contracts/NFT.sol
 * SPDX-License-Identifier: MIT
 */

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SigmaNFT is ERC721URIStorage {
	uint256 public tokenCount;

	constructor() ERC721("Sigma NFT", "SigmaNFT") {}

	function mint(string memory _tokenURI) external returns (uint256) {
		tokenCount++;
		_safeMint(msg.sender, tokenCount);
		_setTokenURI(tokenCount, _tokenURI);
		return (tokenCount);
	}
}