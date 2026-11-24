// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Handler} from "./Handler.sol";
import {IPerp} from "./Base.sol";
import {MockUSD} from "../src/mocks/MockUSD.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";
import {PerpLiteFixed, IERC20Lite} from "../solution/PerpLiteFixed.sol";

contract InvariantFixed is Test {
    MockUSD internal usd;
    MockOracle internal oracle;
    IPerp internal perp;
    Handler internal handler;

    function setUp() public {
        vm.warp(1_700_000_000);
        usd = new MockUSD();
        oracle = new MockOracle();
        oracle.push(3000e8);
        perp = IPerp(payable(address(new PerpLiteFixed(IERC20Lite(address(usd)), oracle))));
        usd.mint(address(this), 2_000_000e6);
        usd.approve(address(perp), type(uint256).max);
        perp.deposit(2_000_000e6);
        handler = new Handler(perp, usd, oracle);
        targetContract(address(handler));
    }

    /// 偿付：合约持有的代币等于三本账之和
    function invariant_solvency() public view {
        assertEq(usd.balanceOf(address(perp)), perp.poolAmount() + perp.totalCollateral() + perp.pendingCollateral());
    }

    /// OI 账本等于所有仓位名义价值之和
    function invariant_openInterestMatchesPositions() public view {
        assertEq(perp.longOI(), handler.sumSize(true), "long");
        assertEq(perp.shortOI(), handler.sumSize(false), "short");
    }

    /// 保证金账本等于所有仓位保证金之和
    function invariant_collateralMatchesPositions() public view {
        assertEq(perp.totalCollateral(), handler.sumCollateral());
    }
}
