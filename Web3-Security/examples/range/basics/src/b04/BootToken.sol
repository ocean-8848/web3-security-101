// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice 训练币。部署者一次性获得全部供应量。
contract BootToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Boot Token", "BOOT") {
        _mint(msg.sender, initialSupply);
    }
}
