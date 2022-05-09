/**
 * contracts/SigmaNFT.sol
 * SPDX-License-Identifier: MIT
 */

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "hardhat/console.sol";

contract SigmaNFT is ERC721URIStorage {
	uint256 public tokenCount;

	constructor() ERC721("Sigma NFT", "SigmaNFT") {}

	function mint(string memory _tokenURI) external returns (uint256) {
		tokenCount++;
		_safeMint(msg.sender, tokenCount);
		_setTokenURI(tokenCount, _tokenURI);
		return (tokenCount);
	}

	function burn(address _ownerAddress, uint256 _tokenId) external returns (uint256) {
		require(_isApprovedOrOwner(_ownerAddress, _tokenId), "ERC721: caller is not owner nor approved");
		--tokenCount;
		_burn(_tokenId);
		return (tokenCount);
	}

	function update(uint256 _tokenId, string memory _tokenURI) external returns (uint256) {
		_setTokenURI(_tokenId, _tokenURI);
		return tokenCount;
	}
}
