// SPDX-License-Identifier: MIT
// 配套章节：07 外部调用与代币兼容性 ｜ 与 05-SafeTokenOps.sol 的 MultiChainVault 对照
// 仅用于学习。不要部署到主网。
pragma solidity ^0.8.20;

/// @notice ❌ 漏洞版：只看低级 call 是否成功，并按请求金额记账
contract NaiveTokenVault {
    address public immutable token;
    mapping(address => uint256) public deposits;

    constructor(address _token) {
        token = _token;
    }

    function deposit(uint256 amt) external {
        // ❌ 漏洞：忽略返回值；目标无代码时 call 也成功；不按实收金额记账
        (bool ok, ) = token.call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), amt));
        require(ok, "call failed");
        deposits[msg.sender] += amt;
    }

    function withdraw(uint256 amt) external {
        deposits[msg.sender] -= amt;
        (bool ok, ) = token.call(abi.encodeWithSignature("transfer(address,uint256)", msg.sender, amt));
        require(ok, "call failed");
    }
}
