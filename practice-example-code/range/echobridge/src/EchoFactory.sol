// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {WrappedEcho} from "./EchoMinter.sol";

/// @title EchoFactory
/// @notice Deploys wrapped tokens at a deterministic address, the same on every supported chain.
contract EchoFactory {
    event Deployed(address indexed token, bytes32 indexed salt);

    function predict(string calldata name, address minter, bytes32 salt) public view returns (address) {
        bytes32 initHash = keccak256(_initCode(name, minter));
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, initHash)))));
    }

    function deploy(string calldata name, address minter, bytes32 salt) external returns (WrappedEcho token) {
        bytes memory init = _initCode(name, minter);
        address created;
        assembly {
            created := create2(0, add(init, 0x20), mload(init), salt)
        }
        require(created != address(0), "create2 failed");
        require(created == predict(name, minter, salt), "address mismatch");
        emit Deployed(created, salt);
        return WrappedEcho(created);
    }

    function _initCode(string calldata name, address minter) internal pure returns (bytes memory) {
        return abi.encodePacked(type(WrappedEcho).creationCode, abi.encode(name, minter));
    }
}
