// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockUSD} from "../src/mocks/MockUSD.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";

interface IPerp {
    function deposit(uint256) external;
    function withdraw(uint256) external;
    function requestIncrease(bool, uint256, uint256, uint256) external payable returns (uint256);
    function requestClose(bool, uint256) external payable returns (uint256);
    function executeNext(uint256) external;
    function removeCollateral(bool, uint256) external;
    function liquidate(address, bool) external;
    function accrueFunding() external;
    function equityAt(address, bool, uint256) external view returns (int256);
    function positions(address, bool) external view returns (uint256, uint256, uint256, int256);
    function longOI() external view returns (uint256);
    function shortOI() external view returns (uint256);
    function poolAmount() external view returns (uint256);
    function totalCollateral() external view returns (uint256);
    function pendingCollateral() external view returns (uint256);
    function head() external view returns (uint256);
    function tail() external view returns (uint256);
}

/// @dev 收到 ETH 就回滚的交易者：用来测试 Keeper 被阻塞的场景
contract RevertingTrader {
    function open(IPerp perp, MockUSD usd, uint256 size, uint256 collateral) external payable {
        usd.approve(address(perp), type(uint256).max);
        perp.requestIncrease{value: msg.value}(true, size, collateral, type(uint256).max);
    }

    receive() external payable {
        revert("no refunds");
    }
}

abstract contract Base is Test {
    uint256 internal constant ETH_FEE = 0.002 ether;
    uint256 internal constant P3000 = 3000e8;

    MockUSD internal usd;
    MockOracle internal oracle;
    IPerp internal perp;

    address internal lp = makeAddr("lp");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal mallory = makeAddr("mallory");
    address internal sock = makeAddr("sock");
    address internal keeper = makeAddr("keeper");

    function _deploy() internal virtual returns (IPerp);

    function setUp() public virtual {
        vm.warp(1_700_000_000);
        usd = new MockUSD();
        oracle = new MockOracle();
        oracle.push(P3000);
        perp = _deploy();
        vm.deal(address(perp), 1 ether);

        address[6] memory all = [lp, alice, bob, mallory, sock, keeper];
        for (uint256 i; i < all.length; i++) {
            usd.mint(all[i], 2_000_000e6);
            vm.deal(all[i], 10 ether);
            vm.prank(all[i]);
            usd.approve(address(perp), type(uint256).max);
        }
        vm.prank(lp);
        perp.deposit(1_000_000e6);
    }

    /// @dev 时间前进 1 秒，预言机发布新价格
    function _mark(uint256 price) internal {
        vm.warp(block.timestamp + 1);
        oracle.push(price);
    }

    function _latestPrice() internal view returns (uint256 p) {
        (p, ) = oracle.latest();
    }

    function _execLatest() internal {
        uint256 round = oracle.latestRoundId();
        vm.prank(keeper);
        perp.executeNext(round);
    }

    function _open(address who, bool isLong, uint256 size, uint256 collateral) internal {
        vm.prank(who);
        perp.requestIncrease{value: ETH_FEE}(isLong, size, collateral, isLong ? type(uint256).max : 0);
        _mark(_latestPrice());
        _execLatest();
    }

    function _close(address who, bool isLong) internal {
        vm.prank(who);
        perp.requestClose{value: ETH_FEE}(isLong, isLong ? 0 : type(uint256).max);
        _mark(_latestPrice());
        _execLatest();
    }
}
