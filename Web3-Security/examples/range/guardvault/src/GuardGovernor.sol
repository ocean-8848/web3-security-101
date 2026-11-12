// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "./Interfaces.sol";

/// @title GuardGovernor
/// @notice Token-weighted governance for the protocol.
contract GuardGovernor {
    uint256 public constant QUORUM_BPS = 3_000;

    struct Proposal {
        address proposer;
        address[] targets;
        bytes[] payloads;
        uint256 votes;
        bool executed;
    }

    IERC20 public immutable guard;
    Proposal[] private proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event Proposed(uint256 indexed id, address indexed proposer);
    event Voted(uint256 indexed id, address indexed voter, uint256 weight);
    event Executed(uint256 indexed id);

    constructor(IERC20 guard_) {
        guard = guard_;
    }

    function propose(address[] calldata targets, bytes[] calldata payloads) external returns (uint256 id) {
        require(targets.length == payloads.length && targets.length > 0, "bad proposal");
        id = proposals.length;
        proposals.push(Proposal(msg.sender, targets, payloads, 0, false));
        emit Proposed(id, msg.sender);
    }

    function vote(uint256 id) external {
        require(!hasVoted[id][msg.sender], "already voted");
        hasVoted[id][msg.sender] = true;
        uint256 weight = guard.balanceOf(msg.sender);
        proposals[id].votes += weight;
        emit Voted(id, msg.sender, weight);
    }

    function execute(uint256 id) external {
        Proposal storage p = proposals[id];
        require(!p.executed, "executed");
        require(p.votes * 10_000 >= guard.totalSupply() * QUORUM_BPS, "quorum not met");
        p.executed = true;
        for (uint256 i = 0; i < p.targets.length; i++) {
            (bool ok, ) = p.targets[i].call(p.payloads[i]);
            require(ok, "action failed");
        }
        emit Executed(id);
    }
}
