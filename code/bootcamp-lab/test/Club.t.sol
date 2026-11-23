// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";  // forge-std 的测试基类
import {Club} from "../src/Club.sol";  // 导入要测试的合约

contract ClubSmokeTest is Test {  // is Test：继承测试工具
    function test_JoinWorks() public {  // test 开头的函数会被当作测试运行
        Club club = new Club(0.01 ether);  // new 部署合约，参数是会费
        address alice = makeAddr("alice");  // 生成一个带标签的测试地址
        vm.deal(alice, 1 ether);  // 作弊码：直接给 alice 1 ETH

        vm.prank(alice);  // 作弊码：下一次调用以 alice 身份发出
        // {value: …} 附带 ETH 调用 payable 函数
        club.join{value: 0.01 ether}("alice");

        assertTrue(club.isMember(alice));  // 断言为真，否则测试失败
        assertEq(club.memberCount(), 1);  // 断言两个值相等
    }
}