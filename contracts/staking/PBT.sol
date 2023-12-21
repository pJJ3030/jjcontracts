// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PBT is ERC20 {
    constructor() ERC20("PBT", "PBT") {
        _mint(msg.sender, 1000000000 * 10**18);
    }
}