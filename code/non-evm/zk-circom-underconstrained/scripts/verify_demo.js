// 本地原理演示：为什么欠约束电路（只有 <-- 没有 ===）会被恶意见证伪造证明
// 用法：node code/non-evm/zk-circom-underconstrained/scripts/verify_demo.js

function checkVulnerableCircuit(witness) {
  // vulnerable_multiplier.circom 中 R1CS 约束集合为空！
  const constraints = [];
  return constraints.every(fn => fn(witness));
}

function checkSafeCircuit(witness) {
  // safe_multiplier.circom 强制要求 a, b 在 [0, 65535] 且 out === a * b
  const constraints = [
    w => Number.isInteger(w.a) && w.a >= 0 && w.a < 65536,
    w => Number.isInteger(w.b) && w.b >= 0 && w.b < 65536,
    w => w.out === w.a * w.b,
  ];
  return constraints.every(fn => fn(witness));
}

const honestWitness = { a: 7, b: 9, out: 63 };
const forgedWitness = { a: 7, b: 9, out: 999999 }; // 攻击者篡改 witness 输出

console.log('=== 诚实见证 { a: 7, b: 9, out: 63 } ===');
console.log('Vulnerable circuit accepted:', checkVulnerableCircuit(honestWitness));
console.log('Safe circuit accepted:      ', checkSafeCircuit(honestWitness));

console.log('\n=== 恶意伪造见证 { a: 7, b: 9, out: 999999 } ===');
console.log('Vulnerable circuit accepted:', checkVulnerableCircuit(forgedWitness), ' <-- ❌ 欠约束被攻破！');
console.log('Safe circuit accepted:      ', checkSafeCircuit(forgedWitness), ' <-- ✅ 完整约束成功拦截');
