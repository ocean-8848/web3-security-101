// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {Club} from "../../src/b02/step8/Club.sol";

/// @notice 只读分叉练习：目标是读者自己在本地 anvil 上部署的 Club。
/// 设置 FORK_RPC_URL 和 CLUB_ADDRESS 后运行；没有设置时跳过。
contract ForkReadTest is Test {
    function test_ForkReadOwnClub() public {
        string memory url = vm.envOr("FORK_RPC_URL", string(""));
        if (bytes(url).length == 0) {
            vm.skip(true);
        }
        Club club = Club(payable(vm.envAddress("CLUB_ADDRESS")));

        vm.createSelectFork(url);
        uint256 countBefore = club.memberCount();
        console2.log("memberCount on fork before:", countBefore);

        // 这笔写入只发生在测试进程的内存里。
        address carol = makeAddr("carol");
        vm.deal(carol, 1 ether);
        uint256 fee = club.fee();
        vm.prank(carol);
        club.join{value: fee}("carol");

        console2.log("memberCount on fork after: ", club.memberCount());
        assertEq(club.memberCount(), countBefore + 1);
    }
}
