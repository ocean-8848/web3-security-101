// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ITokenReceiver {
    function onTokenReceived(uint256 amount) external;
}

/// @notice 转账后回调接收方的玩具代币。ERC-777 等标准有类似的钩子。
contract HookToken is ERC20 {
    constructor(uint256 supply) ERC20("Hook Token", "HOOK") {
        _mint(msg.sender, supply);
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (from != address(0) && to.code.length > 0) {
            // 接收方没有实现钩子时，调用失败，这里忽略失败。
            (bool ok, ) = to.call(abi.encodeCall(ITokenReceiver.onTokenReceived, (value)));
            ok;
        }
    }
}
