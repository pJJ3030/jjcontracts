// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ClaimValidator {

    IERC20 public immutable PBT;
    IERC721 public immutable NFT;
    uint256 public immutable pbtPerClaim;

    event Claimed(uint256 indexed tokenId, address indexed claimer);

    error NotOwner();
    error AlreadyClaimed();

    mapping(uint256 => bool) public hasClaimed;

    constructor(
        IERC20 _PBT,
        IERC721 _NFT,
        uint256 _pbtPerClaim
    ) {
        PBT = _PBT;
        NFT = _NFT;
        pbtPerClaim = _pbtPerClaim;
    }

    function calculatePBT(uint256[] memory tokenIds) external view returns (uint256) {
        uint256 amountPBT;
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];

            if(!hasClaimed[tokenId]) {
                amountPBT += pbtPerClaim;
            }
        }
        return amountPBT;
    }
    
    function claim(uint256 tokenId) external {
        if (hasClaimed[tokenId]) revert AlreadyClaimed();
        if (NFT.ownerOf(tokenId) != msg.sender) revert NotOwner();

        hasClaimed[tokenId] = true;
        emit Claimed(tokenId, msg.sender);

        PBT.transfer(msg.sender, pbtPerClaim);
    }

    function batchClaim(uint256[] memory tokenIds) external {

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];

            if (hasClaimed[tokenId]) revert AlreadyClaimed();
            if (NFT.ownerOf(tokenId) != msg.sender) revert NotOwner();

            hasClaimed[tokenId] = true;
            emit Claimed(tokenId, msg.sender);
        }
        PBT.transfer(msg.sender, pbtPerClaim * tokenIds.length);
    }
}
