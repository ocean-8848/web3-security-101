// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CommonBase} from "forge-std/Base.sol";
import {StdCheats} from "forge-std/StdCheats.sol";
import {StdUtils} from "forge-std/StdUtils.sol";
import {IPerp} from "./Base.sol";
import {MockUSD} from "../src/mocks/MockUSD.sol";
import {MockOracle} from "../src/mocks/MockOracle.sol";

/// @dev 把随机输入约束成合法操作。每次开平仓都走完两步流程。
contract Handler is CommonBase, StdCheats, StdUtils {
    IPerp public perp;
    MockUSD public usd;
    MockOracle public oracle;
    address[] public actors;
    uint256 public opens;
    uint256 public liquidations;

    constructor(IPerp perp_, MockUSD usd_, MockOracle oracle_) {
        perp = perp_;
        usd = usd_;
        oracle = oracle_;
        vm.deal(address(this), 1_000_000 ether);
        for (uint256 i; i < 4; i++) {
            address a = address(uint160(0xA000 + i));
            actors.push(a);
            usd.mint(a, 1e15);
            vm.deal(a, 1_000 ether);
            vm.prank(a);
            usd.approve(address(perp), type(uint256).max);
        }
    }

    receive() external payable {}

    function actorCount() external view returns (uint256) {
        return actors.length;
    }

    function _tick(uint256 price) internal {
        vm.warp(block.timestamp + 1);
        oracle.push(price);
    }

    function _lastPrice() internal view returns (uint256 p) {
        (p, ) = oracle.latest();
    }

    function open(uint256 who, bool isLong, uint256 size, uint256 leverage) external {
        address a = actors[who % actors.length];
        size = bound(size, 100e6, 50_000e6);
        leverage = bound(leverage, 1, 9);
        vm.prank(a);
        perp.requestIncrease{value: 0.002 ether}(isLong, size, size / leverage, isLong ? type(uint256).max : 0);
        _tick(_lastPrice());
        perp.executeNext(oracle.latestRoundId());
        opens++;
    }

    function close(uint256 who, bool isLong) external {
        address a = actors[who % actors.length];
        vm.prank(a);
        perp.requestClose{value: 0.002 ether}(isLong, isLong ? 0 : type(uint256).max);
        _tick(_lastPrice());
        perp.executeNext(oracle.latestRoundId());
    }

    function movePrice(uint256 bps) external {
        bps = bound(bps, 7_000, 13_000);
        uint256 next = (_lastPrice() * bps) / 10_000;
        if (next < 100e8 || next > 100_000e8) return;
        _tick(next);
    }

    function removeCollateral(uint256 who, bool isLong, uint256 amount) external {
        address a = actors[who % actors.length];
        (, uint256 collateral, , ) = perp.positions(a, isLong);
        if (collateral == 0) return;
        amount = bound(amount, 1, collateral);
        vm.prank(a);
        perp.removeCollateral(isLong, amount);
    }

    function liquidate(uint256 who, bool isLong) external {
        address a = actors[who % actors.length];
        perp.liquidate(a, isLong);
        liquidations++;
    }

    function wait(uint256 secondsAhead) external {
        secondsAhead = bound(secondsAhead, 1, 30 minutes);
        vm.warp(block.timestamp + secondsAhead);
        oracle.push(_lastPrice());
    }

    function sumSize(bool isLong) external view returns (uint256 total) {
        for (uint256 i; i < actors.length; i++) {
            (uint256 size, , , ) = perp.positions(actors[i], isLong);
            total += size;
        }
    }

    function sumCollateral() external view returns (uint256 total) {
        for (uint256 i; i < actors.length; i++) {
            (, uint256 cl, , ) = perp.positions(actors[i], true);
            (, uint256 cs, , ) = perp.positions(actors[i], false);
            total += cl + cs;
        }
    }
}
