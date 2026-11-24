pragma circom 2.1.6;

// ✅ 修复：使用 `<==` 同时完成赋值与 R1CS 二次约束，并限制输入在 16-bit 范围内防止有限域回绕
template RangeCheck16() {
    signal input in;
    signal bits[16];
    var lc = 0;
    var pow2 = 1;

    for (var i = 0; i < 16; i++) {
        bits[i] <-- (in >> i) & 1;
        // ✅ 约束每一位只能是 0 或 1
        bits[i] * (bits[i] - 1) === 0;
        lc += bits[i] * pow2;
        pow2 = pow2 * 2;
    }
    // ✅ 约束二进制展开之和必须等于原输入
    lc === in;
}

template SafeMultiplier() {
    signal input a;
    signal input b;
    signal output out;

    component rcA = RangeCheck16();
    rcA.in <== a;

    component rcB = RangeCheck16();
    rcB.in <== b;

    // ✅ 同时赋值并添加 R1CS 约束 out === a * b
    out <== a * b;
}

component main {public [out]} = SafeMultiplier();
