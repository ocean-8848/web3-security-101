// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Club {
    struct Member {
        string nickname;
        uint256 paid;
        bool active;
    }

    address public immutable owner;
    uint256 public immutable fee;
    string public name = "Book Club";
    uint256 public memberCount;
    mapping(address => Member) public members;

    event Joined(address indexed who, string nickname, uint256 paid);
    event Renamed(string newName);
    event Withdrawn(address indexed to, uint256 amount);

    error AlreadyMember(address who);
    error NotOwner(address caller);
    error WrongFee(uint256 sent, uint256 expected);
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _;
    }

    constructor(uint256 _fee) {  // 部署时传入会费金额（单位 wei）
        owner = msg.sender;
        fee = _fee;
    }

    // payable：调用时可以附带 ETH
    function join(string calldata nickname) external payable {
        if (members[msg.sender].active) revert AlreadyMember(msg.sender);
        // msg.value：本次附带的金额，单位 wei
        if (msg.value != fee) revert WrongFee(msg.value, fee);
        members[msg.sender] = Member(nickname, msg.value, true);
        memberCount = memberCount + 1;
        emit Joined(msg.sender, nickname, msg.value);
    }

    function rename(string calldata newName) external onlyOwner {
        name = newName;
        emit Renamed(newName);
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;  // 本合约当前持有的 ETH
        emit Withdrawn(owner, amount);  // 先发事件，再做外部调用
        // Interactions：转账，控制权交给接收方
        (bool ok, ) = owner.call{value: amount}("");
        if (!ok) revert TransferFailed();  // call 失败不自动回滚，必须自己检查
    }

    function isMember(address who) external view returns (bool) {
        return members[who].active;
    }
}