// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title LunchPool
/// @notice A group pays for one lunch. See docs/lunchpool-spec.md.
contract LunchPool {
    uint256 public constant MIN_CONTRIBUTION = 0.001 ether;

    address public organizer;
    uint256 public immutable deadline;
    uint256 public total;
    address[] public eaters;
    mapping(address => uint256) public paidBy;

    event Contributed(address indexed eater, uint256 amount);
    event Refunded(address indexed eater, uint256 amount);
    event VendorPaid(address indexed vendor, uint256 amount);

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
        if (paidBy[msg.sender] == 0) eaters.push(msg.sender);
        paidBy[msg.sender] += msg.value;
        total += msg.value;
        emit Contributed(msg.sender, msg.value);
    }

    function refund() external {
        require(block.timestamp <= deadline, "closed");
        uint256 amount = paidBy[msg.sender];
        require(amount > 0, "nothing to refund");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
        paidBy[msg.sender] = 0;
        total -= amount;
        emit Refunded(msg.sender, amount);
    }

    function setOrganizer(address newOrganizer) external {
        organizer = newOrganizer;
    }

    function payVendor(address payable vendor) external onlyOrganizer {
        require(block.timestamp >= deadline, "still open");
        uint256 amount = address(this).balance;
        total = 0;
        (bool ok, ) = vendor.call{value: amount}("");
        require(ok, "transfer failed");
        emit VendorPaid(vendor, amount);
    }

    function cancelAll() external onlyOrganizer {
        require(block.timestamp >= deadline, "still open");
        for (uint256 i = 0; i < eaters.length; i++) {
            address eater = eaters[i];
            uint256 amount = paidBy[eater];
            paidBy[eater] = 0;
            total -= amount;
            if (amount > 0) {
                (bool ok, ) = eater.call{value: amount}("");
                require(ok, "transfer failed");
            }
        }
    }
}
