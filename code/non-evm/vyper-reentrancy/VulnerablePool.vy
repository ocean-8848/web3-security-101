# @version 0.2.15
# ❌ 漏洞历史演示：Vyper 0.2.15 - 0.3.0 编译器会给不同函数上的 @nonreentrant("lock")
# 分配不同的存储槽位！因此 remove_liquidity 触发回调时，攻击者可以重入 deposit/swap。

balances: public(HashMap[address, uint256])
total_supply: public(uint256)

@external
@payable
@nonreentrant("lock")
def deposit():
    self.balances[msg.sender] += msg.value
    self.total_supply += msg.value

@external
@nonreentrant("lock")
def withdraw_vulnerable(amount: uint256):
    assert self.balances[msg.sender] >= amount, "insufficient"
    # ❌ 未遵守 CEI：先发外部调用，后改状态
    # 在受影响的 Vyper 编译器版本下，回调中可以重入其他带 @nonreentrant("lock") 的函数
    raw_call(msg.sender, b"", value=amount)
    self.balances[msg.sender] -= amount
    self.total_supply -= amount
