# @version ^0.3.10
# ✅ 修复：1) 升级到已修复重入锁统一槽位的 Vyper 版本；2) 严格遵循 CEI（先改状态再外部调用）

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
def withdraw_safe(amount: uint256):
    assert self.balances[msg.sender] >= amount, "insufficient"
    # ✅ 先更新全部状态变量（Effects）
    self.balances[msg.sender] -= amount
    self.total_supply -= amount
    # ✅ 最后发起外部 ETH 转账（Interactions）
    raw_call(msg.sender, b"", value=amount)
