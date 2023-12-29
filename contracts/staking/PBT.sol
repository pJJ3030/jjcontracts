/**
 * @title PBT Token
 * @dev The PBT token is an ERC-20 compliant token implemented on the Ethereum blockchain.
 * It inherits from the OpenZeppelin ERC20 contract, providing standard token functionality.
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PBT is ERC20 {
    /**
     * @dev Constructor function to initialize the PBT token with a name and symbol.
     * The total supply of 1,000,000,000 PBT tokens is minted and assigned to the deployer's address.
     */
    constructor() ERC20("PBT", "PBT") {
        _mint(msg.sender, 1000000000 * 10**18);
    }
}
