// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ITokenReceiver} from "./Interfaces.sol";

/// @notice Plain ERC-20 with open minting for the local range.
contract SimpleToken {
    string public name;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory name_) {
        name = name_;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _move(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) {
            allowance[from][msg.sender] -= amount;
        }
        _move(from, to, amount);
        return true;
    }

    function _move(address from, address to, uint256 amount) internal virtual {
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
}

/// @notice Vault asset. Notifies contract recipients after each transfer.
contract HookToken is SimpleToken {
    constructor(string memory name_) SimpleToken(name_) {}

    function _move(address from, address to, uint256 amount) internal override {
        super._move(from, to, amount);
        if (to.code.length > 0) {
            try ITokenReceiver(to).onTokenReceived(from, amount) {} catch (bytes memory reason) {
                if (reason.length > 0) {
                    assembly {
                        revert(add(reason, 0x20), mload(reason))
                    }
                }
            }
        }
    }
}
