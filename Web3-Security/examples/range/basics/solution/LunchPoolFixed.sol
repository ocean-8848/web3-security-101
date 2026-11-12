// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice LunchPool 的修复版。B06 的报告引用这份代码。
contract LunchPoolFixed {
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether;

    address public organizer;
    uint256 public immutable deadline;
    uint256 public total;
    bool public cancelled;
    mapping(address => uint256) public paidBy;

    event Contributed(address indexed eater, uint256 amount);
    event Refunded(address indexed eater, uint256 amount);
    event VendorPaid(address indexed vendor, uint256 amount);
    event OrganizerChanged(address indexed oldOrganizer, address indexed newOrganizer);
    event Cancelled();

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "not organizer");
        _;
    }

    constructor(uint256 _deadline) {
        organizer = msg.sender;
        deadline = _deadline;
    }

    function contribute() external payable {
        require(msg.value >= MIN_CONTRIBUTION, "too small");
        require(block.timestamp < deadline, "closed");
        paidBy[msg.sender] += msg.value;
        total += msg.value;
        emit Contributed(msg.sender, msg.value);
    }

    /// @notice 截止前自助退款；取消后也从这里领取。
    function refund() external {
        require(block.timestamp < deadline || cancelled, "closed"); // ✅ 修复 L-01、M-01
        uint256 amount = paidBy[msg.sender];
        require(amount > 0, "nothing to refund");
        paidBy[msg.sender] = 0; // ✅ 修复 H-02：先记账
        total -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
        emit Refunded(msg.sender, amount);
    }

    function setOrganizer(address newOrganizer) external onlyOrganizer { // ✅ 修复 H-01
        require(newOrganizer != address(0), "zero address");
        emit OrganizerChanged(organizer, newOrganizer);
        organizer = newOrganizer;
    }

    function payVendor(address payable vendor) external onlyOrganizer {
        require(block.timestamp >= deadline, "still open");
        require(!cancelled, "cancelled");
        uint256 amount = total;
        total = 0;
        (bool ok, ) = vendor.call{value: amount}("");
        require(ok, "transfer failed");
        emit VendorPaid(vendor, amount);
    }

    /// @notice ✅ 修复 M-01：只改状态，不循环转账。每人自己领取。
    function cancelAll() external onlyOrganizer {
        require(block.timestamp >= deadline, "still open");
        cancelled = true;
        emit Cancelled();
    }
}
