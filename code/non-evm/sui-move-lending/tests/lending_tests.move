#[test_only]
module sui_move_lending::lending_tests {
    use sui::coin;
    use sui::test_scenario;
    use sui_move_lending::lending;

    public struct TEST_COIN has drop {}

    #[test]
    fun test_shift_truncation_vs_safe() {
        let huge: u256 = 1u256 << 200;
        // 漏洞版静默截断为 0，不报错
        assert!(lending::unsafe_shl64(huge) == 0, 100);
        // 安全版在合法范围内正常左移
        assert!(lending::safe_shl64(1u256) == (1u256 << 64), 101);
    }

    #[test]
    #[expected_failure(abort_code = 3, location = sui_move_lending::lending)]
    fun test_safe_shl64_aborts_on_overflow() {
        let huge: u256 = 1u256 << 200;
        let _ = lending::safe_shl64(huge);
    }

    #[test]
    #[expected_failure(abort_code = 1, location = sui_move_lending::lending)]
    fun test_cross_pool_repay_blocked_by_safe() {
        let admin = @0xA;
        let mut scenario = test_scenario::begin(admin);
        let ctx = test_scenario::ctx(&mut scenario);

        let (mut pool_a, cap_a) = lending::create_pool<TEST_COIN>(coin::mint_for_testing(10_000, ctx), 10, ctx);
        let (mut pool_b, cap_b) = lending::create_pool<TEST_COIN>(coin::mint_for_testing(10_000, ctx), 10, ctx);

        let (borrowed, receipt) = lending::flash_loan(&mut pool_a, 1_000, ctx);
        let fee_coin = coin::mint_for_testing(1, ctx);
        let mut payment = borrowed;
        coin::join(&mut payment, fee_coin);

        // 尝试把从 pool_a 借出的凭证还给 pool_b，修复版必须以 EWrongPool (1) 中止
        lending::repay_safe(&mut pool_b, payment, receipt);

        lending::destroy_for_testing(pool_a, cap_a);
        lending::destroy_for_testing(pool_b, cap_b);
        test_scenario::end(scenario);
    }
}
