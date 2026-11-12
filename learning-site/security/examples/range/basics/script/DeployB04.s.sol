// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {BootToken} from "../src/b04/BootToken.sol";
import {MiniVault} from "../src/b04/MiniVault.sol";

/// @notice 只部署到本地 anvil。使用 --unlocked，不需要私钥。
contract DeployB04 is Script {
    function run() external {
        require(block.chainid == 31337, "local anvil only");
        vm.startBroadcast();
        BootToken token = new BootToken(1_000 ether);
        MiniVault vault = new MiniVault(token);
        vm.stopBroadcast();
        console2.log("BootToken:", address(token));
        console2.log("MiniVault:", address(vault));
    }
}
