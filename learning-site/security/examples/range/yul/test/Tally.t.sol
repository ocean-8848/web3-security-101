// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {TallySol} from "../src/TallySol.sol";
import {TallyAsm} from "../src/TallyAsm.sol";

interface ITally {
    function get() external view returns (uint256);
    function add(uint256 amount) external;
}

contract TallyTest is Test {
    event Added(address indexed who, uint256 amount);

    ITally sol;
    ITally asmV;
    ITally yul;

    function setUp() public {
        sol = ITally(address(new TallySol()));
        asmV = ITally(address(new TallyAsm()));
        bytes memory init = vm.parseJsonBytes(vm.readFile("out/Tally.yul/Tally.json"), ".bytecode.object");
        address deployed;
        assembly {
            deployed := create(0, add(init, 0x20), mload(init))
        }
        require(deployed != address(0), "yul deploy failed");
        yul = ITally(deployed);
    }

    function _all() internal view returns (ITally[3] memory) {
        return [sol, asmV, yul];
    }

    function testFuzz_SameState(uint128 a, uint128 b) public {
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            all[i].add(a);
            all[i].add(b);
            assertEq(all[i].get(), uint256(a) + uint256(b));
        }
    }

    function test_SameEvent() public {
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            vm.expectEmit(true, false, false, true, address(all[i]));
            emit Added(address(this), 5);
            all[i].add(5);
        }
    }

    function test_AllRevertOnOverflow() public {
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            all[i].add(type(uint256).max);
            vm.expectRevert();
            all[i].add(1);
        }
    }

    function test_AllRevertOnUnknownSelector() public {
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            (bool ok,) = address(all[i]).call(hex"deadbeef");
            assertFalse(ok);
        }
    }

    function test_AllRevertOnShortCalldata() public {
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            (bool ok,) = address(all[i]).call(abi.encodePacked(ITally.add.selector, uint8(1)));
            assertFalse(ok);
        }
    }

    function test_GasReport() public {
        string[3] memory names = ["Solidity", "InlineAsm", "PureYul"];
        ITally[3] memory all = _all();
        for (uint256 i; i < 3; i++) {
            all[i].add(1); // 先把槽位写成非零
            uint256 g0 = gasleft();
            all[i].add(1);
            uint256 g1 = gasleft();
            all[i].get();
            uint256 g2 = gasleft();
            console.log(names[i]);
            console.log("  add gas :", g0 - g1);
            console.log("  get gas :", g1 - g2);
            console.log("  codesize:", address(all[i]).code.length);
        }
    }
}
