# B68 密码学实现风险：签名 nonce 与随机数种子

> 学习目标：做完本章，你能——
> 1. 用本地脚本证明"nonce 重用"和"弱种子"都能算出私钥，并用 `cast` 验证确定性签名。
> 2. 用一行 `uniq -d` 监控重复 r，并说明修好生成代码后为什么还要迁移已生成的弱私钥。
>
> 前置知识：完成阶段 0–1（[阶段 1 导读](B07-stage1-guide.md)），建议先完成链下赛道 L1（[L1 导读](B56-offchain-l1-guide.md)）；会运行 `cast` 和 `python3`；知道哈希和签名是什么（[B03](B03-blockchain-basics.md)）。
> 预计用时：约 1.5–2 小时。
> 关联章节：[02 密码学基础与实现风险](../chapters/02-cryptography-randomness.md)｜[T02 威胁建模模板](../templates/T02-threat-model.md)｜[B67 数据隐私与合规：聚类误伤、数据最小化与制裁筛查](B67-privacy-compliance-practice.md)｜[B69 ZK 与跨链实现风险：约束、绑定与门限](B69-zk-bridge-practice.md)
> 最后核对：2026-11-10（cast 1.5.1、Python 3.12、node 26、openssl 3.0.13 均在本机运行过；下文输出来自真实运行）

> ⚠️ 警告：法律与道德边界。本章的私钥都由 `cast wallet new` 在本机临时生成，只用于练习。本章的脚本只演示原理，不要拿它去扫描任何真实地址或真实签名。玩具签名代码不安全，不要用它保护任何资产。

---

## 开场：所有测试都通过了

一个团队请你看三样东西：自研的签名服务、一个 ZK 提款电路、一座 5 个验证者的桥。团队说："单元测试全过，签名都能验证，证明都能通过。"

<details class="predict"><summary>🤔 先猜再看：签名服务的每个签名都能通过验证。这能说明它的 nonce 是安全的吗？</summary>

不能。验证只检查"这个签名对这个公钥成立"。它不检查两次签名是否用了同一个 nonce。第 3 步里，两个都能通过验证的签名，会让你算出私钥。原理见 [02 章 3.2 节](../chapters/02-cryptography-randomness.md)。

</details>

> 🎯 打个比方：密码学算法是一把好锁。实现是装锁的工人。锁本身没人能撬开，但工人可能把同一把钥匙模具用了两次，可能在门框上少钉一颗钉子，也可能让门卫只看印章、不看盖章的人是谁。
>
> 比喻的局限：门框少钉子，路人看得出来。实现缺陷从外面看不出，签名、证明、消息在格式上全部正确。只有针对性的测试才能发现它们。

## 1. 本章练什么

| 第几步 | 你做什么 | 原理在哪里 | 检查项 |
|---|---|---|---|
| 1–2 | 准备工具；观察确定性签名 | [02 章 3.2 节](../chapters/02-cryptography-randomness.md) | CRY-2 |
| 3 | nonce 重用 → 解出私钥；监控重复 r | [02 章 3.2 节](../chapters/02-cryptography-randomness.md) | CRY-2、CRY-3 |
| 4 | 时间戳种子 → 爆破私钥 | [02 章 3.1 节](../chapters/02-cryptography-randomness.md) | CRY-1、CRY-7 |

> 💡 注意：检查项编号沿用主线章节，含义不变：CRY 来自 02 章。

ZK 电路和跨链桥两样放在下一篇 [B69](B69-zk-bridge-practice.md)。

## 2. 第 1 步：准备练习目录和玩具签名脚本

1. 新建目录，生成一把一次性私钥：

```bash
mkdir -p b53-lab && cd b53-lab  # 在任意空目录下新建
cast wallet new --json
```

输出示例（你的值不同）：

```json
[
  {
    "address": "0xDe46690840e808e9DD321bb98FEa15365a5B39d0",
    "private_key": "0xd1de39f7b0c8f84d6d6cf150ed7d7a831d4b92869df5cfd68c96f2dd5266eb7a"
  }
]
```

> ⚠️ 警告：这把私钥只用于本章。本页印出了它，所以它已经公开。你自己的那把也只用于练习。

2. 把下面的脚本存为 `b53-lab/ec_toy.py`。它只用 Python 标准库实现 secp256k1，并故意保留两个缺陷。

```python
# 练习用的 secp256k1 玩具实现，只用 Python 标准库。不要用它保护真实资产。
import hashlib, json, random, sys

P = 2**256 - 2**32 - 977                       # 曲线所在的素数域
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141  # 群的阶 n
G = (0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
     0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8)

def add(p, q):                                  # 椭圆曲线点加法
    if p is None: return q
    if q is None: return p
    if p[0] == q[0] and (p[1] + q[1]) % P == 0: return None
    if p == q: l = 3 * p[0] * p[0] * pow(2 * p[1], -1, P) % P
    else:      l = (q[1] - p[1]) * pow(q[0] - p[0], -1, P) % P
    x = (l * l - p[0] - q[0]) % P
    return (x, (l * (p[0] - x) - p[1]) % P)

def mul(k, p=G):                                # 标量乘法：k·G
    r = None
    while k:
        if k & 1: r = add(r, p)
        p, k = add(p, p), k >> 1
    return r

def z(msg):                                     # 消息哈希（演示用 SHA-256）
    return int.from_bytes(hashlib.sha256(msg.encode()).digest(), 'big') % N

def sign(d, msg, k):                            # ❌ 漏洞：k 由调用方传入，可能重复
    r = mul(k)[0] % N
    s = pow(k, -1, N) * (z(msg) + r * d) % N
    return r, s

cmd = sys.argv[1]
if cmd == 'sign-reuse':                         # 用同一个 k 签两条消息
    d, k = int(sys.argv[2], 16), 0xC0FFEE       # 固定的 k：模拟坏随机源
    out = []
    for m in ['pay 1 ETH to Bob', 'pay 2 ETH to Carol']:
        r, s = sign(d, m, k)
        out.append({'msg': m, 'r': hex(r), 's': hex(s)})
    print(json.dumps(out, indent=1))
elif cmd == 'recover':                          # 只用公开数据恢复私钥
    a, b = json.load(open(sys.argv[2]))
    r, s1, s2 = int(a['r'], 16), int(a['s'], 16), int(b['s'], 16)
    z1, z2 = z(a['msg']), z(b['msg'])
    assert a['r'] == b['r'], 'r 不同，k 没有重复'
    k = (z1 - z2) * pow(s1 - s2, -1, N) % N     # 先解出 k
    d = (s1 * k - z1) * pow(r, -1, N) % N       # 再解出私钥 d
    print('k =', hex(k)); print('d = 0x%064x' % d)
elif cmd == 'weak-gen':                         # ❌ 漏洞：用时间戳给 mt19937 播种
    random.seed(int(sys.argv[2]))
    d = random.getrandbits(256) % N
    print(json.dumps({'pubkey_x': hex(mul(d)[0])}))
elif cmd == 'weak-crack':                       # 攻击者只知道公钥和大致时间
    target = int(json.load(open(sys.argv[2]))['pubkey_x'], 16)
    start, end = int(sys.argv[3]), int(sys.argv[4])
    for t in range(start, end + 1):
        random.seed(t)
        d = random.getrandbits(256) % N
        if mul(d)[0] == target:
            print('种子 =', t, '尝试次数 =', t - start + 1); print('d = 0x%064x' % d); break
    else: print('窗口内没有找到')
```

## 3. 第 2 步：确定性签名长什么样（CRY-2）

`cast` 按 RFC 6979 由私钥和消息派生 nonce。把 `K` 换成你的私钥：

```bash
K=0xd1de39f7b0c8f84d6d6cf150ed7d7a831d4b92869df5cfd68c96f2dd5266eb7a
cast wallet sign "pay 1 ETH to Bob" --private-key $K
cast wallet sign "pay 1 ETH to Bob" --private-key $K
cast wallet sign "pay 2 ETH to Carol" --private-key $K
```

```text
0xeda4b8edaa150e288e9d89cc98a6494aba4ebcf7c7b8d0bc713c9207ffbb20ff359dfbef…1b
0xeda4b8edaa150e288e9d89cc98a6494aba4ebcf7c7b8d0bc713c9207ffbb20ff359dfbef…1b
0x5093c365ec07a6bf6d0288900d42e51dd95f069244154a139ffbe1a86811998c5aa708a7…1c
```

签名的前 32 字节是 r。观察两点：

1. 同一条消息签两次，签名完全相同。nonce 由消息决定，不依赖运行时的随机数。
2. 不同消息的 r 不同（`eda4…` 和 `5093…`），所以 nonce 不同。

## 4. 第 3 步：nonce 重用，私钥被算出（CRY-2、CRY-3）

1. 用玩具签名器，以同一个 k 签两条消息：

```bash
python3 -I ec_toy.py sign-reuse $K | tee sigs.json
```

```json
[
 {
  "msg": "pay 1 ETH to Bob",
  "r": "0x2a5bbcb0eede528e6abe5f2ec50ad7887eb5677af383a460b05ee23bf892dfe5",
  "s": "0xef251e5936a45750cb0ccd0c6015f6376c25752e7d76fd2566839e73763f7a7"
 },
 {
  "msg": "pay 2 ETH to Carol",
  "r": "0x2a5bbcb0eede528e6abe5f2ec50ad7887eb5677af383a460b05ee23bf892dfe5",
  "s": "0xcafa31128cff4a8c6aa85084acedb243b2fd472f5d4c057386bee477665fa81a"
 }
]
```

两个 r 完全相同。`sigs.json` 里只有公开数据：消息、r、s。

2. 只用 `sigs.json` 恢复私钥，再用 `cast` 从恢复的私钥算地址：

```bash
python3 -I ec_toy.py recover sigs.json
cast wallet address --private-key $(python3 -I ec_toy.py recover sigs.json | awk '/^d =/{print $3}')
```

```text
k = 0xc0ffee
d = 0xd1de39f7b0c8f84d6d6cf150ed7d7a831d4b92869df5cfd68c96f2dd5266eb7a
0xDe46690840e808e9DD321bb98FEa15365a5B39d0
```

恢复出的 d 等于你的私钥，地址也一致。攻击者只需要两笔公开签名。

3. 写一个最小的重复 r 监控（CRY-3）。好签名取 `cast` 的输出，坏签名取 `sigs.json`：

```bash
for m in "msg-1" "msg-2" "msg-3"; do cast wallet sign "$m" --private-key $K; done > good_sigs.txt
cut -c3-66 good_sigs.txt | sort | uniq -d   # 无输出 = 没有重复 r
jq -r '.[].r' sigs.json | sort | uniq -d    # 有输出 = 发现重复 r
```

```text
0x2a5bbcb0eede528e6abe5f2ec50ad7887eb5677af383a460b05ee23bf892dfe5
```

> 💡 注意：真实事件里，nonce 不一定"完全重复"。有偏置的 nonce 要收集很多签名、用格方法恢复；SecondFi（2026 年 6 月）的 nonce 可由公开数据算出，单个签名就够。见 [02 章 5.4 节](../chapters/02-cryptography-randomness.md)。

## 5. 第 4 步：时间戳种子，私钥被爆破（CRY-1）

Milk Sad 事件中，`bx seed` 用 32 位时间值给 mt19937 播种（[02 章 5.3 节](../chapters/02-cryptography-randomness.md)）。你来复现这类缺陷的缩小版。

<details class="predict"><summary>🤔 先猜再看：攻击者知道钱包在某 10 分钟内创建。用本章的 Python 脚本，爆破要多久？</summary>

几秒。10 分钟只有 601 个候选种子。下面的实测是 3.6 秒。私钥本身有 256 位，但生成它的熵只有"10 分钟里的哪一秒"。

</details>

1. 受害者在时间戳 `1794333421` 生成钱包，链上公开了公钥：

```bash
python3 -I ec_toy.py weak-gen 1794333421 | tee weak.json
```

```json
{"pubkey_x": "0x10549155754af4a683867442895591702b6042bafc1d567896b8aa8f1d4f0e97"}
```

2. 攻击者只知道公钥和"大约在这 10 分钟里"：

```bash
time python3 -I ec_toy.py weak-crack weak.json 1794333000 1794333600
```

```text
种子 = 1794333421 尝试次数 = 422
d = 0xc4bd167dede692fcd1a7c50caad7d2c2db33c455bcd6a04b02b06dc79d0f1177
… 3.606 total
```

3. 估算（示例）：每次尝试约 6 毫秒。一整天 86,400 个种子，单核 Python 约 9 分钟。GPU 快几个数量级，所以 32 位种子空间也不安全。

4. 对照安全的做法：私钥来自操作系统的 CSPRNG，有完整的 256 位熵。

```bash
openssl rand -hex 32   # 每次输出不同的 64 位十六进制串
```

> ⚠️ 警告：修好生成代码，修不好已经生成的弱私钥。厂商修复后必须强制用户迁移到新地址（CRY-7）。Trust Wallet 扩展事件就是这样处理的，见 [02 章 5.2 节](../chapters/02-cryptography-randomness.md)。

## 6. 检查清单

为 [T02](../templates/T02-threat-model.md) 附录 MiniBridge 的守护者签名库填写状态（通过 / 不通过 / 不适用）和证据。完整的评审笔记在 [B69](B69-zk-bridge-practice.md) 中完成。

| 检查项 | 内容（原文见主线章节） | 状态 | 证据 |
|---|---|---|---|
| **CRY-1** | 私钥来自 CSPRNG，256 位熵；没有时间戳种子 | | 第 4 步 |
| **CRY-2** | RFC 6979 或标准 EdDSA；封装层有已知答案测试 | | 第 2、3 步 |
| **CRY-3** | 对自家地址监控重复 r | | 第 3 步脚本 |

> 🪞 反思：你用过或写过的系统里，哪一处"签名能验证、测试全过"，但你没有检查 nonce 来源？如果明天要证明它安全，你会先写哪一个测试？

## 7. 如果出错

| 现象 | 原因 | 处理 |
|---|---|---|
| `pow()` 一行报 `ValueError` | Python 低于 3.8，不支持 `pow(x, -1, n)` 求逆元 | 升级到 Python 3.8 以上 |
| `recover` 报 `r 不同，k 没有重复` | `sigs.json` 来自 `cast` 而不是玩具签名器 | 用 `sign-reuse` 重新生成 |
| 恢复的地址和你的地址不同 | `K` 变量不是你生成的私钥 | 重新设置 `K` 后再签名 |
| `weak-crack` 显示"窗口内没有找到" | 窗口没有覆盖生成时的种子 | 确认起止时间包含 `1794333421` |

## 8. 过关标准

- [ ] 用两笔共享 r 的签名恢复私钥，并用 `cast wallet address` 证明地址一致。
- [ ] 重复 r 监控对好签名无输出，对坏签名输出 1 个 r。
- [ ] 在 10 分钟窗口内爆破出时间戳种子，并说出 32 位种子空间为什么不安全。

## 9. 思考题

1. 一个签名服务说"我们用 RFC 6979，所以不需要监控重复 r"。它说得对吗？监控还能发现什么问题？
2. 第 4 步的攻击者只知道"钱包在某一天创建"。如果种子是毫秒级时间戳，尝试次数会变成多少？这样算安全了吗？

- 下一篇：[B69 ZK 与跨链实现风险：约束、绑定与门限](B69-zk-bridge-practice.md)
