pragma circom 2.1.6;

// ❌ 漏洞：使用 `<--` 只给 witness 赋值，但没有生成任何 R1CS 约束方程
// 攻击者修改 witness 生成器后，可以传入 a = 2, b = 3, out = 999999 并通过全部约束校验！
template VulnerableMultiplier() {
    signal input a;
    signal input b;
    signal output out;

    // ❌ 仅赋值，无约束！
    out <-- a * b;
}

component main {public [out]} = VulnerableMultiplier();
