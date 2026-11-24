module sui_move_lending::lending {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::object::{Self, ID, UID};
    use sui::tx_context::TxContext;

    const EWrongPool: u64 = 1;
    const EInsufficientRepayment: u64 = 2;
    const EShiftOverflow: u64 = 3;
    const EInvalidFee: u64 = 4;

    /// 借贷池对象
    public struct Pool<phantom T> has key {
        id: UID,
        vault: Balance<T>,
        fee_bps: u64,
    }

    /// 管理员权限对象（注意：故意不给 copy 能力，防止无限复制）
    public struct AdminCap has key, store {
        id: UID,
        pool_id: ID,
    }

    /// 热土豆（Hot Potato）闪电贷凭证：无 copy、无 drop、无 store、无 key
    /// 必须在同一笔交易结束前交回本模块销毁
    public struct FlashReceipt {
        pool_id: ID,
        repay_amount: u64,
    }

    public fun create_pool<T>(initial: Coin<T>, fee_bps: u64, ctx: &mut TxContext): (Pool<T>, AdminCap) {
        assert!(fee_bps <= 1000, EInvalidFee);
        let pool_uid = object::new(ctx);
        let pool_id = object::uid_to_inner(&pool_uid);
        let pool = Pool<T> {
            id: pool_uid,
            vault: coin::into_balance(initial),
            fee_bps,
        };
        let cap = AdminCap {
            id: object::new(ctx),
            pool_id,
        };
        (pool, cap)
    }

    public fun flash_loan<T>(pool: &mut Pool<T>, amount: u64, ctx: &mut TxContext): (Coin<T>, FlashReceipt) {
        let fee = (amount * pool.fee_bps + 9999) / 10000; // 向上取整，对协议有利
        let borrowed = coin::take(&mut pool.vault, amount, ctx);
        let receipt = FlashReceipt {
            pool_id: object::id(pool),
            repay_amount: amount + fee,
        };
        (borrowed, receipt)
    }

    // ❌ 漏洞：未校验 receipt.pool_id == object::id(pool)，攻击者可向低价值池/自建池还款销毁凭证
    public fun repay_vulnerable<T>(pool: &mut Pool<T>, payment: Coin<T>, receipt: FlashReceipt) {
        let FlashReceipt { pool_id: _, repay_amount } = receipt;
        assert!(coin::value(&payment) >= repay_amount, EInsufficientRepayment);
        balance::join(&mut pool.vault, coin::into_balance(payment));
    }

    // ✅ 修复：严格绑定 pool_id 与应还金额，杜绝跨池还款绕过
    public fun repay_safe<T>(pool: &mut Pool<T>, payment: Coin<T>, receipt: FlashReceipt) {
        let FlashReceipt { pool_id, repay_amount } = receipt;
        assert!(pool_id == object::id(pool), EWrongPool);
        assert!(coin::value(&payment) >= repay_amount, EInsufficientRepayment);
        balance::join(&mut pool.vault, coin::into_balance(payment));
    }

    // ❌ 漏洞：缺失 AdminCap 权限参数，任何人都能修改池子费率
    public fun set_fee_vulnerable<T>(pool: &mut Pool<T>, new_fee_bps: u64) {
        assert!(new_fee_bps <= 1000, EInvalidFee);
        pool.fee_bps = new_fee_bps;
    }

    // ✅ 修复：要求传入 AdminCap 且核对 cap.pool_id 归属当前池子
    public fun set_fee_safe<T>(pool: &mut Pool<T>, cap: &AdminCap, new_fee_bps: u64) {
        assert!(cap.pool_id == object::id(pool), EWrongPool);
        assert!(new_fee_bps <= 1000, EInvalidFee);
        pool.fee_bps = new_fee_bps;
    }

    // ❌ 漏洞：Move 位左移 `<<` 不会自动触发溢出中止，上界判断错误将导致高位静默截断
    public fun unsafe_shl64(x: u256): u256 {
        // 错误上界掩码：允许超过 2^192 - 1 的值进入左移并被静默截断
        x << 64
    }

    // ✅ 修复：在左移前严格检查上界 (1 << (256 - 64)) - 1
    public fun safe_shl64(x: u256): u256 {
        let max_safe: u256 = (1u256 << 192) - 1;
        assert!(x <= max_safe, EShiftOverflow);
        x << 64
    }

    public fun pool_balance<T>(pool: &Pool<T>): u64 {
        balance::value(&pool.vault)
    }

    public fun destroy_for_testing<T>(pool: Pool<T>, cap: AdminCap) {
        let Pool { id, vault, fee_bps: _ } = pool;
        object::delete(id);
        balance::destroy_for_testing(vault);
        let AdminCap { id: cap_id, pool_id: _ } = cap;
        object::delete(cap_id);
    }
}
