// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MiniSwap, IERC20Minimal} from "../../src/MiniSwap.sol";
import {MiniSwapFixed, IERC20Minimal as FixedERC20} from "../../solution/MiniSwapFixed.sol";
import {MockToken} from "../mocks/MockTokens.sol";

/// Echidna deploys this harness and calls its public functions in random sequences.
abstract contract EchidnaBase {
    MockToken internal immutable token0 = new MockToken("A");
    MockToken internal immutable token1 = new MockToken("B");
    address internal pool;

    function _setUpPool(address p) internal {
        pool = p;
        token0.approve(p, type(uint256).max);
        token1.approve(p, type(uint256).max);
        token0.mint(address(this), 1_000e18);
        token1.mint(address(this), 1_000e18);
        (bool ok, ) = p.call(
            abi.encodeWithSignature("addLiquidity(uint256,uint256,uint256,uint256)", 1_000e18, 1_000e18, 0, type(uint256).max)
        );
        require(ok);
    }

    function swap0For1(uint256 amount) public {
        amount = (amount % 100e18) + 1e6;
        token0.mint(address(this), amount);
        (bool ok, ) = pool.call(
            abi.encodeWithSignature(
                "swapExactIn(address,uint256,uint256,address,uint256)", address(token0), amount, 0, address(this), type(uint256).max
            )
        );
        require(ok);
    }

    function collect() public {
        (bool ok, ) = pool.call(abi.encodeWithSignature("collectProtocolFees()"));
        require(ok);
    }

    function _reserve0() internal view returns (uint256 value) {
        (, bytes memory data) = pool.staticcall(abi.encodeWithSignature("reserve0()"));
        value = abi.decode(data, (uint256));
    }

    function echidna_balance_covers_reserve0() public view returns (bool) {
        return token0.balanceOf(pool) >= _reserve0();
    }
}

contract EchidnaMiniSwap is EchidnaBase {
    constructor() {
        _setUpPool(address(new MiniSwap(IERC20Minimal(address(token0)), IERC20Minimal(address(token1)), address(this))));
    }
}

contract EchidnaMiniSwapFixed is EchidnaBase {
    constructor() {
        _setUpPool(address(new MiniSwapFixed(FixedERC20(address(token0)), FixedERC20(address(token1)), address(this))));
    }
}
