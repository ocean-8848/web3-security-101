// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Handler} from "../test/Handler.sol";
import {IPerp} from "../test/Base.sol";
import {MockUSD} from "../src/mocks/MockUSD.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";
import {PerpLite, IERC20Lite} from "../src/PerpLite.sol";

/// @notice 同一个 Handler 跑在有漏洞的版本上。运行：FOUNDRY_PROFILE=vuln forge test
contract InvariantVuln is Test {
    MockUSD internal usd;
    MockOracle internal oracle;
    IPerp internal perp;
    Handler internal handler;

    function setUp() public {
        vm.warp(1_700_000_000);
        usd = new MockUSD();
        oracle = new MockOracle();
        oracle.push(3000e8);
        perp = IPerp(payable(address(new PerpLite(IERC20Lite(address(usd)), oracle))));
        usd.mint(address(this), 2_000_000e6);
        usd.approve(address(perp), type(uint256).max);
        perp.deposit(2_000_000e6);
        handler = new Handler(perp, usd, oracle);
        targetContract(address(handler));
    }

    function invariant_openInterestMatchesPositions() public view {
        assertEq(perp.longOI(), handler.sumSize(true), "long");
        assertEq(perp.shortOI(), handler.sumSize(false), "short");
    }
}
