// Interactive labs migrated from 《智能合约安全审计 101》.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LABS = {};
const LAB_META = {};
function labShell(el, key, title, hint) {
  el.innerHTML = `<div class="lab-head"><span class="k">LAB · ${key}</span><span class="t">${title}</span><span class="h">${hint}</span></div><div class="lab-body"></div>`;
  return el.querySelector('.lab-body');
}
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const fmt = (n, d = 2) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const LAB_TITLES = {};
function def(k, t, f) { LABS[k] = f; LAB_TITLES[k] = t; }
const H = (s) => s;
const K = (s) => (window.keccak256 ? keccak256(s) : '0'.repeat(64));
const el = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; };
function slider(id, label, min, max, val, step = 1, unit = '') {
  return `<label class="ctrl"><span>${label}<output id="${id}-o">${val}${unit}</output></span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></label>`;
}
function bindSliders(root, fn) {
  $$('input[type=range]', root).forEach(i => i.addEventListener('input', () => { const o = $('#' + i.id + '-o', root); if (o) o.textContent = i.value + (o.dataset.u || ''); fn(); }));
}
const val = (root, id) => Number($('#' + id, root).value);

/* ---- 1.1 hash chain ---- */
def('hashchain', '哈希链篡改实验', (host) => {
  const b = labShell(host, 'HASHCHAIN', '哈希链篡改实验', '编辑任意区块的数据，观察后续区块变红。点击"重新挖矿"修复该区块；后面的区块仍要逐个修复。有效区块的哈希必须以 00 开头（示例难度）。');
  const data = ['Alice → Bob 5 ETH', 'Bob → Carol 2 ETH', 'Carol → Dave 1 ETH', 'Dave → Eve 0.5 ETH'];
  const nonce = [0, 0, 0, 0];
  const hash = (i, prev) => K(i + '|' + prev + '|' + data[i] + '|' + nonce[i]);
  const mine = (i, prev) => { let n = 0; while (n < 300000) { nonce[i] = n; if (hash(i, prev).startsWith('00')) return; n++; } };
  let prev0 = '0'.repeat(64); let p = prev0;
  for (let i = 0; i < 4; i++) { mine(i, p); p = hash(i, p); }
  function render() {
    let prev = prev0; let broken = false; let html = '<div class="grid2">';
    for (let i = 0; i < 4; i++) {
      const h = hash(i, prev); const powOk = h.startsWith('00'); if (!powOk) broken = true; const valid = !broken;
      html += `<div class="out ${valid ? 'ok' : 'bad'}"><b>区块 #${i}</b> <span class="pill ${valid ? 'ok' : 'bad'}">${valid ? '有效' : '无效'}</span>
        <div class="mono" style="margin-top:6px">prev: ${prev.slice(0, 10)}…<br>nonce: ${nonce[i]}<br>hash: ${h.slice(0, 10)}…</div>
        <input type="text" data-i="${i}" value="${data[i]}" style="margin:6px 0" aria-label="区块 ${i} 数据">
        <button class="btn" data-mine="${i}">重新挖矿 #${i}</button></div>`;
      prev = h;
    }
    b.innerHTML = html + '</div><div class="out">规则：任何一个区块失效，它之后的所有区块都会失效，因为后者的 prev 字段变了。</div>';
    $$('input[data-i]', b).forEach(inp => inp.addEventListener('change', () => { data[inp.dataset.i] = inp.value; render(); }));
    $$('button[data-mine]', b).forEach(bt => bt.addEventListener('click', () => {
      const i = +bt.dataset.mine; let pv = prev0; for (let j = 0; j < i; j++) pv = hash(j, pv); mine(i, pv); render();
    }));
  }
  render();
});

/* ---- 1.1 EIP-1559 ---- */
def('fee1559', 'EIP-1559 手续费计算器', (host) => {
  const b = labShell(host, 'FEE', 'EIP-1559 手续费计算器', '拖动滑块。把 maxFee 调到低于 baseFee，观察交易状态。单位 gwei（示例值）。');
  b.innerHTML = `<div class="grid3">${slider('bf', 'baseFee', 1, 100, 20)}${slider('mf', 'maxFeePerGas', 1, 150, 40)}${slider('pf', 'maxPriorityFee', 0, 20, 2)}${slider('gu', 'gasUsed (千)', 21, 500, 150)}${slider('bp', 'ETH 价格 (USD)', 1000, 6000, 3000, 100)}</div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const run = () => {
    const bf = val(b, 'bf'), mf = val(b, 'mf'), pf = val(b, 'pf'), gu = val(b, 'gu') * 1000, px = val(b, 'bp');
    if (mf < bf) { $('#kv', b).innerHTML = ''; $('#st', b).className = 'out bad'; $('#st', b).textContent = `maxFee (${mf}) < baseFee (${bf})：交易留在内存池，不会被打包。用户不花钱，但交易不执行。`; return; }
    const eff = Math.min(mf, bf + pf), tip = eff - bf; const gwei = 1e-9;
    const cost = gu * eff * gwei;
    $('#kv', b).innerHTML = `<div><small>有效单价</small><b>${eff} gwei</b></div><div><small>用户支付</small><b>${cost.toFixed(5)} ETH</b></div><div><small>≈ USD</small><b>${fmt(cost * px)}</b></div><div><small>销毁 (baseFee)</small><b>${(gu * bf * gwei).toFixed(5)} ETH</b></div><div><small>提议者小费</small><b>${(gu * tip * gwei).toFixed(5)} ETH</b></div><div><small>退还用户</small><b>${(gu * (mf - eff) * gwei).toFixed(5)} ETH</b></div>`;
    $('#st', b).className = 'out ok'; $('#st', b).textContent = '交易可被打包。maxFee 超出有效单价的部分会退还。';
  };
  bindSliders(b, run); run();
});

/* ---- 1.2 call context ---- */
def('callctx', '调用上下文切换器', (host) => {
  const b = labShell(host, 'CALLCTX', '调用上下文切换器', '用户调用合约 A，A 再调用合约 B 的 setOwner()（B 的代码是 owner = msg.sender）。切换三种调用方式，看谁的存储变了、谁成了 owner。');
  b.innerHTML = `<div class="tabs" id="tb"><button class="btn" data-m="call" aria-pressed="true">call</button><button class="btn" data-m="delegatecall">delegatecall</button><button class="btn" data-m="staticcall">staticcall</button></div><div class="grid2"><div class="out" id="A"></div><div class="out" id="B"></div></div><div class="out" id="msg"></div>`;
  let m = 'call';
  const draw = () => {
    const U = '用户 0xU', A = '合约 A';
    let ownA = '0xAdmin', ownB = '0xBdev', note = '', ms = '', cls = 'out';
    if (m === 'call') { ownB = A; ms = 'msg.sender = 合约 A'; note = 'B 在自己的存储上执行：B.owner 变成 A。A 不受影响。'; }
    if (m === 'delegatecall') { ownA = U; ms = 'msg.sender = 用户（保持不变）'; note = 'B 的代码在 A 的存储上执行：A.owner 被改写成用户。若目标地址由用户控制，这就是接管漏洞。'; cls = 'out bad'; }
    if (m === 'staticcall') { ms = '禁止写状态'; note = '写入操作触发 revert，整个调用失败。两边存储都不变。'; cls = 'out warnp'; }
    $('#A', b).innerHTML = `<b>合约 A 存储</b><div class="mono">owner = ${ownA}</div>`;
    $('#B', b).innerHTML = `<b>合约 B 存储</b><div class="mono">owner = ${ownB}</div>`;
    const mg = $('#msg', b); mg.className = cls; mg.innerHTML = `<b>${m}</b> · ${ms}<br>${note}`;
  };
  $$('#tb button', b).forEach(bt => bt.onclick = () => { m = bt.dataset.m; $$('#tb button', b).forEach(x => x.setAttribute('aria-pressed', x === bt)); draw(); });
  draw();
});

/* ---- 1.3 ERC4626 ---- */
def('vault4626', 'ERC-4626 首存者通胀攻击', (host) => {
  const b = labShell(host, 'ERC4626', 'ERC-4626 首存者通胀攻击', '攻击者先存 1 wei，再向金库直接捐赠资产，使后来的存款人份额被取整为 0。打开"虚拟份额"防御，看攻击如何失效。');
  b.innerHTML = `<div class="grid3">${slider('dn', '攻击者捐赠 (wei, 10^x)', 0, 12, 6)}${slider('vd', '受害者存款 (wei, 10^x)', 0, 12, 5)}${slider('of', '虚拟偏移 offset', 0, 6, 3)}</div><div class="row"><label class="chk"><input type="checkbox" id="vs"> 启用虚拟份额与偏移（OpenZeppelin 防御）</label></div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const run = () => {
    const D = 10n ** BigInt(val(b, 'dn')), V = 10n ** BigInt(val(b, 'vd')), off = 10n ** BigInt(val(b, 'of')); const virt = $('#vs', b).checked;
    let sup = 1n, ast = 1n + D; // 攻击者 1 wei 存款 → 1 份额；捐赠 D
    const conv = (a, S, A) => virt ? a * (S + off) / (A + 1n) : (A === 0n || S === 0n ? a : a * S / A);
    const vs = conv(V, sup, ast); sup += vs; ast += V;
    const redeem = virt ? 1n * (ast + 1n) / (sup + off) : 1n * ast / sup;
    const cost = 1n + D; const profit = redeem - cost; const loss = V - (vs * (ast + 1n) / (sup + off));
    $('#kv', b).innerHTML = `<div><small>受害者得到份额</small><b>${vs}</b></div><div><small>攻击者赎回</small><b>${redeem}</b></div><div><small>攻击者成本</small><b>${cost}</b></div><div><small>攻击者净利润</small><b>${profit}</b></div>`;
    const st = $('#st', b);
    if (!virt) { if (vs === 0n) { st.className = 'out bad'; st.textContent = `受害者存入 ${V} 却得到 0 份额。他的资产被现有份额持有者（攻击者）吸收。攻击者净利润 ${profit}。`; } else if (profit > 0n) { st.className = 'out warnp'; st.textContent = '受害者得到的份额偏少，攻击者仍有利润。'; } else { st.className = 'out ok'; st.textContent = '捐赠太少，取整没有造成损失；攻击者亏本。'; } }
    else { st.className = profit > 0n ? 'out warnp' : 'out ok'; st.textContent = profit > 0n ? '攻击仍有利润，但需要的成本被放大了约 offset 倍，试试提高偏移。' : '虚拟份额让攻击者无利可图：受害者拿到合理份额。'; }
  };
  bindSliders(b, run); $('#vs', b).onchange = run; run();
});

/* ---- 1.3 approve ---- */
def('approve', 'approve 竞态时间线', (host) => {
  const b = labShell(host, 'APPROVE', 'approve 竞态时间线', 'Alice 把 Bob 的额度从 100 改成 50。点击"下一步"，按区块顺序观察。切换防御方式，对比结果。');
  b.innerHTML = `<div class="row"><label class="chk"><input type="checkbox" id="safe"> 使用 decreaseAllowance(50) 代替 approve(50)</label><button class="btn primary" id="nx">下一步</button><button class="btn" id="rs">重置</button></div><div class="log" id="lg"></div><div class="kv" id="kv"></div>`;
  let step = 0, allow = 100, bob = 0;
  const lines = [];
  const steps = () => {
    const safe = $('#safe', b).checked;
    return [
      () => { lines.push('区块 N：Alice → approve(Bob, 100) 已确认。额度 = 100'); },
      () => { lines.push('内存池：Alice 发出' + (safe ? ' decreaseAllowance(Bob, 50)' : ' approve(Bob, 50)') + '，等待打包。'); },
      () => { bob += 100; allow = 0; lines.push('区块 N+1：Bob 看到内存池，用更高小费抢先 transferFrom(Alice→Bob, 100)。Bob 累计 ' + bob + '，额度 = 0'); },
      () => { if (safe) { lines.push('区块 N+1：Alice 的 decreaseAllowance(50) 执行：额度 0 < 50 → revert。<span class="g">Alice 的意图没有变成新授权。</span>'); } else { allow = 50; lines.push('区块 N+1：Alice 的 approve(Bob, 50) 执行。额度 = 50'); } },
      () => { if (safe) { lines.push('Bob 无法再花费。Bob 总共拿到 ' + bob + '（等于旧额度，没有超出）。'); } else { bob += 50; allow = 0; lines.push('<span class="e">Bob 再次 transferFrom(…, 50)。Bob 累计 ' + bob + '，超过了 Alice 想给的任何一个额度。</span>'); } },
    ];
  };
  const draw = () => { $('#lg', b).innerHTML = lines.join('\n'); $('#kv', b).innerHTML = `<div><small>当前额度</small><b>${allow}</b></div><div><small>Bob 已拿走</small><b>${bob}</b></div>`; };
  $('#nx', b).onclick = () => { const s = steps(); if (step < s.length) { s[step](); step++; draw(); } };
  const reset = () => { step = 0; allow = 100; bob = 0; lines.length = 0; draw(); };
  $('#rs', b).onclick = reset; $('#safe', b).onchange = reset; reset();
});

/* ---- 1.4 storage slots ---- */
def('slots', '存储布局冲突检查器', (host) => {
  const b = labShell(host, 'SLOTS', '存储布局冲突检查器', 'V1 已上线并有数据。选择 V2 的修改方式，看每个变量读到的是不是原来的值。');
  b.innerHTML = `<div class="tabs" id="tb"><button class="btn" data-m="append" aria-pressed="true">在末尾追加变量</button><button class="btn" data-m="insert">在中间插入变量</button><button class="btn" data-m="retype">改变变量类型</button><button class="btn" data-m="reorder">调整声明顺序</button></div><div id="out"></div>`;
  const V1 = [{ n: 'owner', t: 'address', s: 20, v: '0xA11CE' }, { n: 'paused', t: 'bool', s: 1, v: 'true' }, { n: 'totalSupply', t: 'uint256', s: 32, v: '1000' }, { n: 'fee', t: 'uint256', s: 32, v: '30' }];
  const pack = vars => { let slot = 0, off = 0; return vars.map(x => { if (off + x.s > 32) { slot++; off = 0; } const r = { ...x, slot, off }; off += x.s; if (off >= 32) { slot++; off = 0; } return r; }); };
  const L1 = pack(V1);
  const variants = {
    append: [...V1, { n: 'cap', t: 'uint256', s: 32 }],
    insert: [V1[0], { n: 'cap', t: 'uint256', s: 32 }, V1[1], V1[2], V1[3]],
    retype: [V1[0], V1[1], { n: 'totalSupply', t: 'uint128', s: 16 }, { n: 'fee', t: 'uint256', s: 32 }],
    reorder: [V1[2], V1[0], V1[1], V1[3]],
  };
  const draw = (m) => {
    const L2 = pack(variants[m]); let bad = 0;
    const rows = L2.map(x => {
      const old = L1.find(o => o.slot === x.slot && o.off === x.off);
      let read, cls;
      if (!old) { read = '（空，新变量）'; cls = x.v === undefined && !V1.find(v => v.n === x.n) ? 'ok' : 'bad'; if (V1.find(v => v.n === x.n)) { read = '空 / 0'; bad++; } }
      else if (old.n === x.n && old.s === x.s) { read = old.v; cls = 'ok'; }
      else { read = `${old.n} 的数据 (${old.v})`; cls = 'bad'; bad++; }
      return `<tr><td class="mono">slot ${x.slot}+${x.off}</td><td class="mono">${x.t} ${x.n}</td><td><span class="pill ${cls}">${read}</span></td></tr>`;
    }).join('');
    $('#out', b).innerHTML = `<div class="table-wrap"><table><thead><tr><th>位置</th><th>V2 变量</th><th>读到的值</th></tr></thead><tbody>${rows}</tbody></table></div><div class="out ${bad ? 'bad' : 'ok'}">${bad ? `${bad} 个变量读到了错误数据。升级后会出现资金记账错误。` : '所有旧变量读到原值。仅追加是安全的。'}</div>`;
  };
  $$('#tb button', b).forEach(bt => bt.onclick = () => { $$('#tb button', b).forEach(x => x.setAttribute('aria-pressed', x === bt)); draw(bt.dataset.m); });
  draw('append');
});

/* ---- 1.6 reentrancy ---- */
def('reentrancy', '重入攻击单步调试器', (host) => {
  const b = labShell(host, 'REENTRANCY', '重入攻击单步调试器', '金库里有其他用户的 5 ETH。攻击者存入 1 ETH，然后提款。切换防御，观察调用栈与余额。这是教学模拟，不是真实合约。');
  b.innerHTML = `<div class="row"><label class="chk"><input type="checkbox" id="cei"> 先改状态再转账 (CEI)</label><label class="chk"><input type="checkbox" id="lock"> 重入锁 nonReentrant</label><button class="btn primary" id="go">运行提款</button></div><div class="kv" id="kv"></div><div class="log" id="lg"></div><div class="out" id="st"></div>`;
  const run = () => {
    const cei = $('#cei', b).checked, lock = $('#lock', b).checked; const log = [];
    let vault = 6, bal = 1, stolen = 0, locked = false, depth = 0;
    const withdraw = (d) => {
      const ind = '  '.repeat(d);
      log.push(`${ind}withdraw() 第 ${d + 1} 层，记账余额 = ${bal}`);
      if (lock && locked) { log.push(`${ind}<span class="g">✗ 重入锁拦截：revert</span>`); return false; }
      locked = true;
      if (bal < 1) { log.push(`${ind}<span class="g">✗ require(balance ≥ 1) 失败：revert</span>`); locked = false; return false; }
      if (vault < 1) { log.push(`${ind}金库已空`); locked = false; return false; }
      if (cei) { bal -= 1; log.push(`${ind}先把记账余额改为 ${bal}`); }
      vault -= 1; stolen += 1; log.push(`${ind}转出 1 ETH 给攻击者，触发 receive() 回调`);
      let ok = true;
      if (d < 8) ok = withdraw(d + 1) !== false; // 攻击者在回调里再次提款
      if (!cei) { bal = Math.max(bal - 1, bal - 1); log.push(`${ind}回调返回后才扣记账余额 → ${bal}`); }
      locked = false; return true;
    };
    withdraw(0);
    $('#lg', b).innerHTML = log.join('\n');
    $('#kv', b).innerHTML = `<div><small>金库 ETH</small><b>${vault}</b></div><div><small>攻击者拿走</small><b>${stolen}</b></div><div><small>攻击者本金</small><b>1</b></div>`;
    const st = $('#st', b); st.className = stolen > 1 ? 'out bad' : 'out ok';
    st.textContent = stolen > 1 ? `攻击者用 1 ETH 本金取走 ${stolen} ETH，其中 ${stolen - 1} ETH 是别人的钱。` : '攻击者只取回自己的 1 ETH。';
  };
  $('#go', b).onclick = run; run();
});

/* ---- 1.7 overflow ---- */
def('overflow', '整数溢出与精度实验', (host) => {
  const b = labShell(host, 'INTEGER', '整数溢出与精度实验', '选择整数位宽、编译模式和运算，看结果是回绕、回滚还是正常。下方是"先除后乘"的精度损失对比。');
  b.innerHTML = `<div class="grid3"><label class="ctrl"><span>位宽</span><select id="w"><option>8</option><option>16</option><option selected>32</option><option>256</option></select></label><label class="ctrl"><span>模式</span><select id="md"><option value="old">Solidity &lt; 0.8（回绕）</option><option value="new">Solidity ≥ 0.8（回滚）</option><option value="unc">0.8 + unchecked（回绕）</option></select></label><label class="ctrl"><span>运算</span><select id="op"><option>+</option><option>-</option><option>*</option></select></label><label class="ctrl"><span>a</span><input type="text" id="a" value="4294967295"></label><label class="ctrl"><span>b</span><input type="text" id="bb" value="2"></label></div><div class="out" id="r"></div><hr><div class="grid3"><label class="ctrl"><span>amount</span><input type="text" id="x" value="7"></label><label class="ctrl"><span>numerator</span><input type="text" id="n" value="3"></label><label class="ctrl"><span>denominator</span><input type="text" id="d" value="5"></label></div><div class="out" id="pr"></div>`;
  const run = () => {
    try {
      const w = BigInt($('#w', b).value), M = 1n << w, a = BigInt($('#a', b).value), c = BigInt($('#bb', b).value), op = $('#op', b).value, md = $('#md', b).value;
      let raw = op === '+' ? a + c : op === '-' ? a - c : a * c; const over = raw >= M || raw < 0n;
      const wrapped = ((raw % M) + M) % M; const r = $('#r', b);
      if (over && md === 'new') { r.className = 'out warnp'; r.innerHTML = `真实结果 ${raw} 超出 uint${w} 范围 → <b>Panic revert</b>，交易回滚。`; }
      else if (over) { r.className = 'out bad'; r.innerHTML = `真实结果 ${raw} 超出 uint${w} 范围 → 回绕为 <b>${wrapped}</b>。后续检查会基于错误的值。`; }
      else { r.className = 'out ok'; r.textContent = `结果 ${raw}，在范围内。`; }
    } catch (e) { $('#r', b).textContent = '请输入整数'; }
    try {
      const x = BigInt($('#x', b).value), n = BigInt($('#n', b).value), d = BigInt($('#d', b).value);
      $('#pr', b).innerHTML = `<b>amount × n / d</b> = ${x * n / d}（先乘后除，保留精度）<br><b>amount / d × n</b> = ${x / d * n}（先除后乘，丢精度）<br>差值 = ${(x * n / d) - (x / d * n)}。取整方向原则：给用户的向下取整，从用户收的向上取整。`;
    } catch (e) { $('#pr', b).textContent = ''; }
  };
  $$('select,input', b).forEach(i => i.addEventListener('input', run)); run();
});

/* ---- 1.7 signature replay ---- */
def('sigreplay', '签名重放防御实验', (host) => {
  const b = labShell(host, 'SIGNATURE', '签名重放防御实验', '勾选合约验证了哪些字段，再尝试五种重放。绿色表示被拒绝，红色表示被接受（有漏洞）。');
  b.innerHTML = `<div class="row"><label class="chk"><input type="checkbox" id="c-n"> nonce</label><label class="chk"><input type="checkbox" id="c-c"> chainId</label><label class="chk"><input type="checkbox" id="c-v"> verifyingContract</label><label class="chk"><input type="checkbox" id="c-d"> deadline</label><label class="chk"><input type="checkbox" id="c-s"> 限制 s 在低半区</label></div><div class="table-wrap"><table><thead><tr><th>重放方式</th><th>结果</th><th>需要的防御</th></tr></thead><tbody id="tb"></tbody></table></div><div class="out" id="sc"></div>`;
  const run = () => {
    const f = id => $('#' + id, b).checked;
    const cases = [
      ['同一合约再次提交', f('c-n'), 'nonce 或已使用标记'],
      ['在另一条链（或分叉链）提交', f('c-c'), 'chainId'],
      ['在同项目的另一个合约提交', f('c-v'), 'verifyingContract'],
      ['过期很久之后提交', f('c-d'), 'deadline'],
      ['翻转 s 得到"另一个有效签名"绕过按签名哈希去重', f('c-s') || f('c-n'), '低半区限制，或改用 nonce 去重'],
    ];
    $('#tb', b).innerHTML = cases.map(([a, ok, need]) => `<tr><td>${a}</td><td><span class="pill ${ok ? 'ok' : 'bad'}">${ok ? '拒绝' : '被接受'}</span></td><td>${need}</td></tr>`).join('');
    const n = cases.filter(c => !c[1]).length; const sc = $('#sc', b);
    sc.className = n ? 'out bad' : 'out ok'; sc.textContent = n ? `${n} 种重放仍然有效。` : '五种重放都被拒绝。还要检查 ecrecover 返回零地址的情况，以及合约钱包是否使用 ERC-1271。';
  };
  $$('input', b).forEach(i => i.onchange = run); run();
});

/* ---- 1.8 front-running ---- */
def('frontrun', '抢跑攻击模拟', (host) => {
  const b = labShell(host, 'FRONTRUN', '抢跑攻击模拟', '合约奖励第一个提交正确答案的人。机器人监听内存池。打开 commit-reveal，看防御如何改变结果。');
  b.innerHTML = `<div class="row"><label class="chk"><input type="checkbox" id="cr"> 启用 commit-reveal（哈希绑定提交者地址）</label><button class="btn primary" id="go">运行</button></div><div class="log" id="lg"></div><div class="out" id="st"></div>`;
  const run = () => {
    const cr = $('#cr', b).checked; const L = [];
    if (!cr) {
      L.push('Alice：提交 solve("答案X")，小费 2 gwei。交易进入公共内存池。');
      L.push('机器人：在内存池看到 Alice 的明文答案。');
      L.push('机器人：复制答案，提交 solve("答案X")，小费 50 gwei。');
      L.push('<span class="e">区块构建者按小费排序：机器人先执行，领走奖励。Alice 的交易 revert。</span>');
      $('#st', b).className = 'out bad'; $('#st', b).textContent = '结果：机器人赢。明文交易在被打包前对所有人可见。';
    } else {
      L.push('阶段 1 · Alice：commit(keccak256(答案X, salt, Alice地址))。内存池里只有哈希。');
      L.push('机器人：看到哈希，无法推出答案。它复制这个哈希并提交 commit。');
      L.push('阶段 2 · Alice：reveal(答案X, salt)。合约重新计算 keccak256(答案X, salt, msg.sender=Alice)。');
      L.push('机器人：即使它抢先 reveal，它的 msg.sender 是机器人地址，哈希与它复制的 commit 不匹配（它的 commit 是 Alice 的哈希，绑定的是 Alice）。');
      L.push('<span class="g">Alice 的 reveal 通过校验，领走奖励。</span>');
      $('#st', b).className = 'out ok'; $('#st', b).textContent = '结果：Alice 赢。两个关键点：先提交哈希；哈希里包含提交者地址。';
    }
    $('#lg', b).innerHTML = L.join('\n');
  };
  $('#go', b).onclick = run; $('#cr', b).onchange = run; run();
});
/* ---- 1.9 checklist ---- */
def('checklist', '审计自查清单', (host) => {
  const b = labShell(host, 'CHECKLIST', '审计自查清单', '审计时逐项勾选。进度保存在你的浏览器里。灵感来自 Solcurity、SCSVS 与 Secureum。');
  const groups = {
    '访问控制': ['每个 external/public 函数都列出了调用者限制', '初始化函数只能调用一次，实现合约已锁定', '特权角色的权限范围和时间锁已记录', '没有用 tx.origin 做鉴权'],
    '外部调用': ['每个外部调用后没有遗漏的状态写入 (CEI)', '底层 call 的返回值已检查', '回调类代币 (ERC777/721/1155) 的重入路径已分析', '没有对用户可控地址做 delegatecall'],
    '算术与精度': ['unchecked 与汇编块逐个验证了边界', '取整方向有利于协议', '不同小数位的资产换算已统一', '强转 (uint128 等) 已检查截断'],
    '代币与集成': ['怪代币行为 (收费、rebase、不返回 bool) 已考虑', '没有依赖 balanceOf(this) 做关键记账', '黑名单/暂停不会导致整体 DoS', '授权范围最小化'],
    '预言机与经济': ['价格源不可被单交易操纵', '陈旧、零值、异常价格有处理', '极端行情下清算仍可执行', '治理投票有快照和时间锁'],
    '签名与随机': ['签名含 nonce、chainId、合约地址、deadline', '检查 ecrecover 返回非零', '没有用区块变量做随机数'],
    '升级与部署': ['存储布局只追加', '部署与初始化在同一交易', '构造参数与部署脚本已审查'],
  };
  let saved = store.get('sca-check', {});
  const render = () => {
    let total = 0, n = 0;
    b.innerHTML = Object.entries(groups).map(([g, items]) => `<div><b>${g}</b>${items.map((t, i) => { total++; const k = g + i; const c = !!saved[k]; if (c) n++; return `<div><label class="chk"><input type="checkbox" data-k="${k}" ${c ? 'checked' : ''}> ${t}</label></div>`; }).join('')}</div>`).join('') + `<div class="out ${n === total ? 'ok' : ''}"><b>${n} / ${total}</b> 已完成</div><button class="btn" id="rs">清空</button>`;
    $$('input[data-k]', b).forEach(i => i.onchange = () => { saved[i.dataset.k] = i.checked; store.set('sca-check', saved); render(); });
    $('#rs', b).onclick = () => { saved = {}; store.set('sca-check', saved); render(); };
  };
  render();
});

/* ---- 2.1 APY / flash loan ---- */
def('apy', 'APR / APY 计算器与闪电贷原子性', (host) => {
  const b = labShell(host, 'APY', 'APR / APY 计算器与闪电贷原子性', '左：APR 与复利频率如何变成 APY。右：闪电贷的归还条件决定整笔交易成败。');
  b.innerHTML = `<div class="grid2"><div style="display:grid;gap:10px">${slider('ap', 'APR (%)', 1, 200, 10)}${slider('yr', '年数', 1, 10, 1)}<label class="ctrl"><span>每年复利次数</span><select id="n"><option value="1">1 (年)</option><option value="12">12 (月)</option><option value="365">365 (日)</option><option value="31536000">31,536,000 (秒)</option></select></label><div class="kv" id="kv"></div></div><div style="display:grid;gap:10px"><label class="ctrl"><span>借入 (万 USDC)</span><input type="text" id="ln" value="10000"></label><label class="ctrl"><span>操作后手上持有 (万 USDC)</span><input type="text" id="hold" value="10012"></label><div class="out" id="fl"></div><div class="mono">手续费率 0.05%（示例）。归还额 = 借入 × 1.0005</div></div></div>`;
  const run = () => {
    const apr = val(b, 'ap') / 100, y = val(b, 'yr'), n = Number($('#n', b).value);
    const apy = Math.pow(1 + apr / n, n) - 1; const cont = Math.exp(apr) - 1;
    $('#kv', b).innerHTML = `<div><small>APY</small><b>${(apy * 100).toFixed(2)}%</b></div><div><small>${y} 年后 (1 万本金)</small><b>${fmt(Math.pow(1 + apr / n, n * y) * 10000)}</b></div><div><small>连续复利上限</small><b>${(cont * 100).toFixed(2)}%</b></div>`;
    const ln = parseFloat($('#ln', b).value) || 0, hold = parseFloat($('#hold', b).value) || 0; const need = ln * 1.0005; const f = $('#fl', b);
    if (hold >= need) { f.className = 'out ok'; f.innerHTML = `需要归还 ${need.toFixed(2)}，持有 ${hold}。检查通过，交易成功，利润 ${(hold - need).toFixed(2)} 万。`; }
    else { f.className = 'out bad'; f.innerHTML = `需要归还 ${need.toFixed(2)}，持有 ${hold}，缺口 ${(need - hold).toFixed(2)}。<b>整笔交易回滚</b>，连借款本身也没发生。攻击者只损失 Gas。`; }
  };
  $$('input,select', b).forEach(i => i.addEventListener('input', run)); run();
});

/* ---- 2.2 AMM ---- */
def('amm', 'AMM 工作台', (host) => {
  const b = labShell(host, 'AMM', 'AMM 工作台', '四个标签：恒定乘积、夹击攻击成本、无常损失、StableSwap 曲线。');
  b.innerHTML = `<div class="tabs" id="tb"><button class="btn" data-t="cp" aria-pressed="true">恒定乘积</button><button class="btn" data-t="sw">夹击</button><button class="btn" data-t="il">无常损失</button><button class="btn" data-t="ss">StableSwap</button></div><div id="pane"></div>`;
  const out = (x, y, dx, fee = .003) => { const d = dx * (1 - fee); return y * d / (x + d); };
  const tabs = {
    cp(p) {
      p.innerHTML = `<div class="grid3">${slider('x', 'ETH 储备', 100, 10000, 1000, 100)}${slider('y', 'USDC 储备 (千)', 100, 30000, 3000, 100)}${slider('dx', '卖出 ETH', 1, 1000, 50)}</div><canvas class="plot" id="cv" width="640" height="260"></canvas><div class="kv" id="kv"></div>`;
      const run = () => {
        const x = val(p, 'x'), y = val(p, 'y') * 1000, dx = val(p, 'dx'); const dy = out(x, y, dx); const p0 = y / x, p1 = (y - dy) / (x + dx * .997), avg = dy / dx;
        $('#kv', p).innerHTML = `<div><small>得到 USDC</small><b>${fmt(dy, 0)}</b></div><div><small>成交均价</small><b>${fmt(avg)}</b></div><div><small>交易前价格</small><b>${fmt(p0)}</b></div><div><small>交易后价格</small><b>${fmt(p1)}</b></div><div><small>价格影响</small><b>${((p1 / p0 - 1) * 100).toFixed(2)}%</b></div>`;
        const c = $('#cv', p), g = c.getContext('2d'), cs = getComputedStyle(document.documentElement); g.clearRect(0, 0, 640, 260);
        const k = x * y, xm = x * 2.2, ym = y * 2.2, sx = v => 30 + v / xm * 590, sy = v => 240 - v / ym * 220;
        g.strokeStyle = cs.getPropertyValue('--ink-2'); g.beginPath(); g.moveTo(30, 20); g.lineTo(30, 240); g.lineTo(620, 240); g.stroke();
        g.strokeStyle = cs.getPropertyValue('--accent'); g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 200; i++) { const xv = x * .45 + (xm - x * .45) * i / 200; const yv = k / xv; if (yv > ym) continue; i ? g.lineTo(sx(xv), sy(yv)) : g.moveTo(sx(xv), sy(yv)); } g.stroke();
        g.fillStyle = cs.getPropertyValue('--ink'); g.beginPath(); g.arc(sx(x), sy(y), 5, 0, 7); g.fill();
        g.fillStyle = cs.getPropertyValue('--crit'); g.beginPath(); g.arc(sx(x + dx * .997), sy(y - dy), 5, 0, 7); g.fill();
        g.fillStyle = cs.getPropertyValue('--ink-2'); g.font = '12px sans-serif'; g.fillText('ETH 储备 →', 540, 256); g.fillText('USDC', 34, 16); g.fillText('黑点：交易前  红点：交易后', 340, 40);
      };
      bindSliders(p, run); run();
    },
    sw(p) {
      p.innerHTML = `<div class="grid3">${slider('x', '池子 ETH', 500, 20000, 5000, 100)}${slider('vt', '受害者买入 (万 USDC)', 1, 200, 30)}${slider('sl', '受害者滑点容忍 (%)', 0.1, 10, 3, .1)}${slider('af', '攻击者先买 (万 USDC)', 0, 300, 60)}</div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
      const run = () => {
        const X = val(p, 'x'), Y = X * 3000, V = val(p, 'vt') * 1e4, sl = val(p, 'sl') / 100, A = val(p, 'af') * 1e4;
        const buy = (x, y, usd) => { const d = usd * .997; const e = x * d / (y + d); return [x - e, y + usd, e]; };
        const [x0, y0, vNo] = buy(X, Y, V); const minOut = vNo * (1 - sl);
        const [x1, y1, aE] = buy(X, Y, A); const [x2, y2, vE] = buy(x1, y1, V);
        const ok = vE >= minOut; const sell = (x, y, eth) => { const d = eth * .997; return y * d / (x + d); };
        const back = ok ? sell(x2, y2, aE) : 0; const profit = ok ? back - A : -(A * .006);
        $('#kv', p).innerHTML = `<div><small>无攻击时受害者得到 ETH</small><b>${vNo.toFixed(2)}</b></div><div><small>被夹击后得到 ETH</small><b>${ok ? vE.toFixed(2) : '交易回滚'}</b></div><div><small>受害者最少可接受</small><b>${minOut.toFixed(2)}</b></div><div><small>攻击者净利润 USDC</small><b>${fmt(profit, 0)}</b></div>`;
        const st = $('#st', p); st.className = ok && profit > 0 ? 'out bad' : 'out ok';
        st.textContent = !ok ? '受害者的滑点保护生效：交易 revert，攻击者白付手续费和 Gas。' : profit > 0 ? `受害者少拿 ${(vNo - vE).toFixed(3)} ETH，攻击者获利。降低滑点容忍或使用私有交易通道可以压缩这个空间。` : '攻击者无利可图（手续费和价格影响吃掉了收益）。';
      };
      bindSliders(p, run); run();
    },
    il(p) {
      p.innerHTML = `<div class="grid3">${slider('r', '价格变化倍数 ×', 0.1, 10, 2, .1)}</div><div class="kv" id="kv"></div><canvas class="plot" id="cv" width="640" height="220"></canvas>`;
      const f = r => 2 * Math.sqrt(r) / (1 + r) - 1;
      const run = () => {
        const r = val(p, 'r'); $('#kv', p).innerHTML = `<div><small>价格变为</small><b>${r}×</b></div><div><small>无常损失</small><b>${(f(r) * 100).toFixed(2)}%</b></div><div><small>持有价值 / LP 价值（初始 100）</small><b>${((1 + r) / 2 * 100).toFixed(0)} / ${(Math.sqrt(r) * 100).toFixed(0)}</b></div>`;
        const c = $('#cv', p), g = c.getContext('2d'), cs = getComputedStyle(document.documentElement); g.clearRect(0, 0, 640, 220);
        g.strokeStyle = cs.getPropertyValue('--ink-2'); g.beginPath(); g.moveTo(30, 20); g.lineTo(30, 190); g.lineTo(620, 190); g.stroke();
        g.strokeStyle = cs.getPropertyValue('--crit'); g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 200; i++) { const rr = 0.1 + 9.9 * i / 200; const px = 30 + (rr / 10) * 590, py = 190 + f(rr) * 170 / 0.8; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
        g.fillStyle = cs.getPropertyValue('--ink'); const px = 30 + (r / 10) * 590, py = 190 + f(r) * 170 / 0.8; g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill();
        g.fillStyle = cs.getPropertyValue('--ink-2'); g.font = '12px sans-serif'; g.fillText('价格变化倍数 →  (0 到 10)', 440, 210);
      };
      bindSliders(p, run); run();
    },
    ss(p) {
      p.innerHTML = `<div class="grid3">${slider('A', '放大系数 A', 1, 2000, 100)}${slider('t', '卖出 token0 数量', 1, 190, 50)}</div><canvas class="plot" id="cv" width="640" height="260"></canvas><div class="kv" id="kv"></div>`;
      const getY = (x, D, A) => { // n = 2
        const Ann = A * 4; let c = D * D / (2 * x) * D / (Ann * 2), bb = x + D / Ann, y = D;
        for (let i = 0; i < 255; i++) { const yp = y; y = (y * y + c) / (2 * y + bb - D); if (Math.abs(y - yp) < 1e-9) break; } return y;
      };
      const run = () => {
        const A = val(p, 'A'), t = val(p, 't'); const D = 200; const y1 = getY(100 + t, D, A); const dy = 100 - y1; const cpDy = 100 - 10000 / (100 + t);
        $('#kv', p).innerHTML = `<div><small>StableSwap 得到</small><b>${dy.toFixed(2)}</b></div><div><small>恒定乘积 (同储备) 得到</small><b>${cpDy.toFixed(2)}</b></div><div><small>StableSwap 滑点</small><b>${((1 - dy / t) * 100).toFixed(2)}%</b></div>`;
        const c = $('#cv', p), g = c.getContext('2d'), cs = getComputedStyle(document.documentElement); g.clearRect(0, 0, 640, 260);
        const sx = v => 30 + v / 220 * 590, sy = v => 240 - v / 220 * 220;
        g.strokeStyle = cs.getPropertyValue('--ink-2'); g.beginPath(); g.moveTo(30, 20); g.lineTo(30, 240); g.lineTo(620, 240); g.stroke();
        const curve = (fn, color, w) => { g.strokeStyle = color; g.lineWidth = w; g.beginPath(); let s = false; for (let x = 8; x <= 210; x += 2) { const y = fn(x); if (y < 0 || y > 220) continue; s ? g.lineTo(sx(x), sy(y)) : g.moveTo(sx(x), sy(y)); s = true; } g.stroke(); };
        curve(x => 200 - x, cs.getPropertyValue('--ink-2'), 1); curve(x => 10000 / x, cs.getPropertyValue('--med'), 1.5); curve(x => getY(x, D, A), cs.getPropertyValue('--accent'), 2.5);
        g.fillStyle = cs.getPropertyValue('--ink-2'); g.font = '12px sans-serif'; g.fillText('灰：恒定和  黄：恒定乘积  绿：StableSwap', 250, 30); g.fillText('token0 储备 →', 540, 256);
      };
      bindSliders(p, run); run();
    },
  };
  const go = t => { $$('#tb button', b).forEach(x => x.setAttribute('aria-pressed', x.dataset.t === t)); tabs[t]($('#pane', b)); };
  $$('#tb button', b).forEach(bt => bt.onclick = () => go(bt.dataset.t)); go('cp');
});

/* ---- 2.3 lending ---- */
def('lending', '健康因子与利率模型', (host) => {
  const b = labShell(host, 'LENDING', '健康因子与利率模型', '调整抵押量、价格和借款，观察健康因子。HF < 1 时会被清算。下方是利率拐点模型。');
  b.innerHTML = `<div class="grid3">${slider('col', '抵押 ETH', 1, 100, 10)}${slider('px', 'ETH 价格 (USD)', 500, 5000, 3000, 50)}${slider('debt', '借款 (千 USD)', 1, 200, 20)}${slider('lt', '清算阈值 (%)', 50, 95, 80)}${slider('bn', '清算奖励 (%)', 1, 20, 5)}</div><div class="kv" id="kv"></div><div class="out" id="st"></div><hr><div class="grid3">${slider('u', '资金利用率 U (%)', 0, 100, 60)}${slider('uo', '拐点 U_opt (%)', 40, 95, 80)}${slider('s2', 'slope2 (%)', 20, 400, 100)}</div><div class="kv" id="ir"></div>`;
  const run = () => {
    const c = val(b, 'col'), p = val(b, 'px'), d = val(b, 'debt') * 1000, lt = val(b, 'lt') / 100, bn = val(b, 'bn') / 100;
    const hf = c * p * lt / d; const lp = d / (c * lt); const ltv = d / (c * p);
    $('#kv', b).innerHTML = `<div><small>健康因子 HF</small><b>${hf.toFixed(3)}</b></div><div><small>当前 LTV</small><b>${(ltv * 100).toFixed(1)}%</b></div><div><small>清算价格</small><b>${fmt(lp)}</b></div><div><small>距清算</small><b>${((1 - lp / p) * 100).toFixed(1)}%</b></div>`;
    const st = $('#st', b);
    if (hf >= 1.5) { st.className = 'out ok'; st.textContent = '安全。'; } else if (hf >= 1) { st.className = 'out warnp'; st.textContent = '接近清算线。价格再下跌就会触发。'; }
    else {
      const repay = d * 0.5, seize = repay * (1 + bn) / p, left = c - seize; const bad = left * p < d - repay;
      st.className = 'out bad'; st.innerHTML = `可被清算。清算人偿还 ${fmt(repay)} USD (50%)，获得 ${seize.toFixed(3)} ETH（含 ${(bn * 100).toFixed(0)}% 奖励）。` + (bad ? '<br><b>剩余抵押价值低于剩余债务：产生坏账。</b>' : '<br>剩余抵押仍覆盖剩余债务。');
    }
    const u = val(b, 'u') / 100, uo = val(b, 'uo') / 100, s2 = val(b, 's2') / 100, base = 0, s1 = 0.04;
    const br = u <= uo ? base + s1 * u / uo : base + s1 + s2 * (u - uo) / (1 - uo); const dr = br * u * 0.9;
    $('#ir', b).innerHTML = `<div><small>借款利率</small><b>${(br * 100).toFixed(2)}%</b></div><div><small>存款利率 (储备因子 10%)</small><b>${(dr * 100).toFixed(2)}%</b></div><div><small>区间</small><b>${u <= uo ? '拐点之前（平缓）' : '拐点之后（陡增）'}</b></div>`;
  };
  bindSliders(b, run); run();
});

/* ---- 2.4 oracle ---- */
def('oracle', '价格操纵模拟器', (host) => {
  const b = labShell(host, 'ORACLE', '价格操纵模拟器', '一个借贷协议用某种价格源给抵押物估值。看不同价格源下，操纵者能多借多少，以及操纵成本。教学模拟，参数均为示例。');
  b.innerHTML = `<div class="grid3">${slider('liq', '池子深度 (万 USD)', 10, 5000, 200, 10)}${slider('fl', '闪电贷买入 (万 USD)', 0, 5000, 300, 10)}${slider('w', 'TWAP 窗口 (区块)', 2, 300, 30)}${slider('ltv', '借款 LTV (%)', 30, 90, 70)}${slider('age', 'Chainlink 价格年龄 (分钟)', 0, 180, 20)}${slider('hb', '心跳 (分钟)', 10, 120, 60)}</div><div class="table-wrap"><table><thead><tr><th>价格源</th><th>被操纵后的估价</th><th>多借出</th><th>判断</th></tr></thead><tbody id="tb"></tbody></table></div><div class="out" id="st"></div>`;
  const run = () => {
    const L = val(b, 'liq') * 1e4, F = val(b, 'fl') * 1e4, W = val(b, 'w'), ltv = val(b, 'ltv') / 100, age = val(b, 'age'), hb = val(b, 'hb');
    const ratio = (L + F) / L; const spot = ratio * ratio; // 恒定乘积下买入后价格倍数 ≈ ((L+F)/L)^2
    const twap = ((W - 1) + spot) / W; const colVal = 1e6; const extra = m => Math.max(0, (m - 1) * colVal * ltv);
    const cost = F * (1 - 1 / ratio) * 0.5; // 近似：滑点损失的一部分，反向交易可回收一半（示例）
    const rows = [['AMM 现货价格', spot, '单交易可操纵，闪电贷成本接近 0（只付手续费）'], [`TWAP ${W} 区块`, twap, '需要跨多个区块维持，成本随窗口与深度上升'], ['Chainlink', 1, age > hb ? '价格已陈旧：必须拒绝使用，而不是继续估值' : '不受单个池子影响']];
    $('#tb', b).innerHTML = rows.map(([n, m, j]) => `<tr><td>${n}</td><td>${m.toFixed(2)}×</td><td>${fmt(extra(m) / 1e4, 1)} 万</td><td>${j}</td></tr>`).join('');
    const st = $('#st', b); st.className = spot > 1.3 ? 'out bad' : 'out ok';
    st.innerHTML = `现货价格被推高到 ${spot.toFixed(2)}×，单交易估算净成本约 ${fmt(cost / 1e4, 1)} 万 USD，可多借 ${fmt(extra(spot) / 1e4, 1)} 万。` + (age > hb ? `<br><span class="pill warnp">Chainlink 数据已超过心跳 ${hb} 分钟</span>：合约应 revert 或切换备用源。` : '');
  };
  bindSliders(b, run); run();
});

/* ---- 2.6 code walk ---- */
def('codewalk', '逐行源码讲解：UniswapV2Pair.swap（简化）', (host) => {
  const b = labShell(host, 'CODEWALK', '逐行源码讲解', '点击任意一行，右侧显示这一行的作用和安全设计。代码为教学用简化改写。');
  const code = [
    ['function swap(uint a0Out, uint a1Out, address to, bytes data) external lock {', '入口。lock 修饰器是重入锁：swap 里有外部调用（转账、回调），必须阻止重入。'],
    ['  require(a0Out > 0 || a1Out > 0, "INSUFFICIENT_OUTPUT");', '至少要取出一种代币。拒绝空操作。'],
    ['  (uint r0, uint r1,) = getReserves();', '读取记账用的储备（不是 balanceOf）。后面用它和真实余额比较。'],
    ['  require(a0Out < r0 && a1Out < r1, "INSUFFICIENT_LIQUIDITY");', '不允许取空池子。'],
    ['  require(to != token0 && to != token1, "INVALID_TO");', '禁止把代币转给代币合约自己，避免余额记账混乱。'],
    ['  if (a0Out > 0) safeTransfer(token0, to, a0Out);', '先转出（乐观转账）。这支持闪电兑换：对方可以先拿币。'],
    ['  if (a1Out > 0) safeTransfer(token1, to, a1Out);', '同上。safeTransfer 兼容不返回 bool 的代币。'],
    ['  if (data.length > 0) ICallee(to).call(msg.sender, a0Out, a1Out, data);', '可选回调。对方在这里用拿到的币做事，并必须把钱还回来。控制权交给了外部，所以后面的检查才是真正的防线。'],
    ['  uint b0 = balanceOf(token0); uint b1 = balanceOf(token1);', '读取真实余额，计算回调之后池子里实际有多少。'],
    ['  uint a0In = b0 > r0 - a0Out ? b0 - (r0 - a0Out) : 0;', '推算转入量 = 余额 − (储备 − 转出)。不信任调用者声明的数量。'],
    ['  uint b0Adj = b0 * 1000 - a0In * 3; uint b1Adj = b1 * 1000 - a1In * 3;', '扣除 0.3% 手续费。乘 1000 避免小数。'],
    ['  require(b0Adj * b1Adj >= r0 * r1 * 1000**2, "K");', '核心不变量：扣费后的乘积不能小于交易前。无论回调里发生了什么，这一行保证池子没有亏。'],
    ['  _update(b0, b1, r0, r1);', '同步储备并更新累积价格（TWAP 的数据来源）。'],
    ['}', '结束。注意：这个函数没有 minOut 参数——滑点保护由 Router 合约负责。直接调用 Pair 的集成方要自己保护。'],
  ];
  b.innerHTML = `<div class="grid2"><div class="code-wrap" style="margin:0"><pre id="cd" style="cursor:pointer"></pre></div><div class="out" id="ex" style="align-self:start">点击左侧一行代码。</div></div>`;
  const pre = $('#cd', b);
  pre.innerHTML = code.map((c, i) => `<div data-i="${i}" tabindex="0" style="padding:0 4px;border-radius:4px;white-space:pre">${c[0].replace(/</g, '&lt;')}</div>`).join('');
  const pick = i => { $$('#cd div', b).forEach(d => d.style.background = d.dataset.i == i ? 'var(--accent-soft)' : ''); $('#ex', b).innerHTML = `<b>第 ${+i + 1} 行</b><br>${code[i][1]}`; };
  $$('#cd div', b).forEach(d => { d.onclick = () => pick(d.dataset.i); d.onkeydown = e => { if (e.key === 'Enter') pick(d.dataset.i); }; });
});

/* ---- 2.7 incidents ---- */
def('incidents', '历史事件浏览器', (host) => {
  const b = labShell(host, 'INCIDENTS', '历史事件浏览器', '按根因类别筛选。损失为公开报道的大致数字（约），仅供比较量级。');
  const D = [
    [2016, 'The DAO', '约 6,000 万美元（当时）', '执行流', '提款先转账后记账，被递归提款。最终以太坊硬分叉。', '先更新状态再外部调用 (CEI)。'],
    [2017, 'Parity 多签钱包', '约 3,000 万美元 + 约 15 万 ETH 冻结', '权限', '库合约的初始化函数未保护，被人接管；钱包通过 delegatecall 依赖该库。', '初始化与权限必须在部署时锁定；谨慎使用共享库。'],
    [2018, 'BEC 代币', '代币价值归零', '算术', '批量转账里 count × value 溢出为 0，绕过余额检查。', '使用 SafeMath / 0.8+ 的检查；对乘法输入做上限。'],
    [2020, 'Lendf.Me', '约 2,500 万美元', '执行流', 'ERC777 转账钩子允许在借贷池更新状态之前重入。', '对回调类代币使用重入锁与 CEI。'],
    [2021, 'Poly Network', '约 6.1 亿美元（后归还）', '权限', '跨链管理合约可被诱导调用特权函数，替换了验证者公钥。', '特权函数不能被任意数据触发；限制可调用的目标与选择器。'],
    [2021, 'BadgerDAO', '约 1.2 亿美元', '前端/供应链', '前端被注入脚本，诱导用户签署恶意授权。', 'CSP、SRI、授权额度最小化、签名内容可读化。'],
    [2021, 'Cream Finance', '约 1.3 亿美元', '预言机', '价格源与份额汇率可被操纵，抬高抵押价值。', '多源价格、操纵成本评估、借款上限。'],
    [2022, 'Ronin 桥', '约 6.25 亿美元', '私钥/运维', '9 个验证者中 5 把私钥被控制，其中一个授权曾未撤销。', '验证者独立性、授权到期与撤销、监控大额提款。'],
    [2022, 'Wormhole', '约 3.25 亿美元', '验证逻辑', 'Solana 端签名验证依赖的系统账户没有被校验。', '每个传入账户都要校验类型与地址。'],
    [2022, 'Nomad 桥', '约 1.9 亿美元', '初始化/升级', '升级把可信根初始化为零值，导致未证明消息被接受。', '审计部署脚本与初始化参数；拒绝零值配置。'],
    [2022, 'Beanstalk', '约 1.8 亿美元（净利约 8,000 万）', '治理', '闪电贷借得投票权，紧急通道立即执行恶意提案。', '投票快照、时间锁、紧急通道权限。'],
    [2022, 'Mango Markets', '约 1.1 亿美元', '预言机/经济', '低流动性代币价格被推高，作为抵押借走其他资产。', '对低流动性资产设置抵押上限与折扣。'],
    [2023, 'Euler Finance', '约 1.97 亿美元（后归还）', '权限/逻辑', '捐赠函数缺少健康度检查，使账户进入可清算状态。', '每个改变抵押或债务的函数都要检查健康度。'],
    [2023, 'Curve / Vyper 编译器', '约 7,000 万美元', '编译器', '特定 Vyper 版本的重入锁实现有误，源码有锁字节码没有。', '关注编译器版本公告；测试字节码行为。'],
    [2023, 'KyberSwap Elastic', '约 4,800 万美元', '算术', 'tick 边界上的取整误差导致流动性被重复计入。', '边界条件 fuzz；取整方向统一。'],
    [2023, 'Hundred Finance', '约 700 万美元', '经济/ERC4626 类', '新上线的空市场汇率被捐赠抬高，取整被利用。', '新市场预先铸造死份额；汇率计算使用内部记账。'],
    [2025, 'Bybit', '约 14.6 亿美元', '前端/运维', '多签界面所在的开发环境被入侵，签名者批准了与界面显示不符的交易。', '独立校验交易内容；硬件签名展示；多签流程隔离。'],
    [2025, 'Cetus (Sui)', '约 2.2 亿美元', '算术', '数学库的位移溢出检查条件有误。', '数学库需要形式化或穷举边界测试。'],
  ];
  const cats = ['全部', ...new Set(D.map(d => d[3]))];
  b.innerHTML = `<div class="tabs" id="tb">${cats.map((c, i) => `<button class="btn" data-c="${c}" aria-pressed="${i === 0}">${c}</button>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>年</th><th>事件</th><th>损失（约）</th><th>类别</th><th>根因</th><th>教训</th></tr></thead><tbody id="rows"></tbody></table></div>`;
  const draw = c => { $('#rows', b).innerHTML = D.filter(d => c === '全部' || d[3] === c).map(d => `<tr><td>${d[0]}</td><td><b>${d[1]}</b></td><td>${d[2]}</td><td>${d[3]}</td><td>${d[4]}</td><td>${d[5]}</td></tr>`).join(''); };
  $$('#tb button', b).forEach(bt => bt.onclick = () => { $$('#tb button', b).forEach(x => x.setAttribute('aria-pressed', x === bt)); draw(bt.dataset.c); });
  draw('全部');
});

/* ---- 2.8 severity ---- */
def('severity', '严重性定级器与发现模板', (host) => {
  const b = labShell(host, 'SEVERITY', '严重性定级器与发现模板', '选择影响和可能性，得到建议等级。再填写模板，生成发现条目。各平台标准略有不同，以客户或平台规则为准。');
  b.innerHTML = `<div class="grid2"><div><b>影响</b><div class="tabs" id="im"></div><b style="display:block;margin-top:8px">可能性</b><div class="tabs" id="lk"></div><div class="row" style="margin-top:8px"><label class="chk"><input type="checkbox" id="priv"> 需要特权角色作恶</label><label class="chk"><input type="checkbox" id="usr"> 需要用户配合操作</label></div><div class="out" id="sv" style="margin-top:8px"></div></div><div style="display:grid;gap:8px"><label class="ctrl"><span>标题（写后果）</span><input type="text" id="ti" value="任何人可以调用 setOracle 并借空资金池"></label><label class="ctrl"><span>位置</span><input type="text" id="lo" value="MiniLend.sol#L42"></label><label class="ctrl"><span>根因</span><textarea id="rc" rows="2">setOracle 缺少访问控制修饰器。</textarea></label><label class="ctrl"><span>影响</span><textarea id="ip" rows="2">攻击者设置恶意价格源，以 1 wei 抵押借出全部 USD。</textarea></label><label class="ctrl"><span>建议</span><textarea id="fx" rows="2">添加 onlyOwner，并通过时间锁修改价格源。</textarea></label></div></div><label class="ctrl"><span>生成的发现 (Markdown)</span><textarea id="md" rows="9" readonly></textarea></label><button class="btn" id="cp">复制</button>`;
  const IM = ['无', '低', '中', '高'], LK = ['低', '中', '高']; let im = 3, lk = 2;
  const mk = (id, arr, get, set) => { $('#' + id, b).innerHTML = arr.map((a, i) => `<button class="btn" data-i="${i}" aria-pressed="${i === get()}">${a}</button>`).join(''); $$('#' + id + ' button', b).forEach(bt => bt.onclick = () => { set(+bt.dataset.i); mk(id, arr, get, set); run(); }); };
  const sev = () => {
    let s = im === 0 ? 0 : (im * 2 + lk); // 范围 3..11
    let lvl = im === 0 ? 'Info' : s >= 8 ? 'Critical' : s >= 7 ? 'High' : s >= 5 ? 'Medium' : 'Low';
    const order = ['Info', 'Low', 'Medium', 'High', 'Critical']; let i = order.indexOf(lvl);
    if ($('#priv', b).checked && i > 1) i = Math.max(1, i - 2); if ($('#usr', b).checked && i > 1) i -= 1; return order[i];
  };
  const cls = { Critical: 'sev-c', High: 'sev-h', Medium: 'sev-m', Low: 'sev-l', Info: 'sev-i' };
  const run = () => {
    const s = sev(); $('#sv', b).innerHTML = `建议等级：<span class="tag ${cls[s]}">${s}</span><br>影响=${IM[im]}，可能性=${LK[lk]}。特权前提会降级，用户配合会再降一级。`;
    $('#md', b).value = `### [${s}] ${$('#ti', b).value}\n\n**位置**：${$('#lo', b).value}\n\n**根因**：${$('#rc', b).value}\n\n**影响**：${$('#ip', b).value}\n\n**PoC**：见 test/Finding1.t.sol（forge test --mt test_Finding1 -vvvv）\n\n**建议**：${$('#fx', b).value}\n`;
  };
  mk('im', IM, () => im, v => im = v); mk('lk', LK, () => lk, v => lk = v);
  $$('input,textarea', b).forEach(i => i.addEventListener('input', run));
  $('#cp', b).onclick = async () => { const t = $('#md', b); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); } };
  run();
});
const hex2bytes = h => { h = h.replace(/^0x/, ''); if (h.length % 2) h = '0' + h; const a = []; for (let i = 0; i < h.length; i += 2) a.push(parseInt(h.substr(i, 2), 16)); return a; };
const pad32 = h => h.replace(/^0x/, '').toLowerCase().padStart(64, '0');

/* ---- 3.1 EVM stepper ---- */
def('evm', 'EVM 单步执行器', (host) => {
  const b = labShell(host, 'EVM', 'EVM 单步执行器', '选择示例程序，点"单步"。右侧是栈（顶在上）、内存、存储和累计 Gas。Gas 数值为简化示例。');
  const P = {
    '加法 2+3': 'PUSH1 0x02\nPUSH1 0x03\nADD\nSTOP',
    '写入并读取存储': 'PUSH1 0x2a\nPUSH1 0x00\nSSTORE\nPUSH1 0x00\nSLOAD\nSTOP',
    '选择器分发': 'PUSH1 0x00\nCALLDATALOAD\nPUSH1 0xe0\nSHR\nPUSH4 0xa9059cbb\nEQ\nPUSH1 @ok\nJUMPI\nPUSH1 0x00\nPUSH1 0x00\nREVERT\nJUMPDEST @ok\nPUSH1 0x01\nSTOP',
    '循环求和 1..5': 'PUSH1 0x00\nPUSH1 0x05\nJUMPDEST @loop\nDUP1\nISZERO\nPUSH1 @end\nJUMPI\nDUP1\nSWAP2\nADD\nSWAP1\nPUSH1 0x01\nSWAP1\nSUB\nPUSH1 @loop\nJUMP\nJUMPDEST @end\nPOP\nSTOP',
  };
  b.innerHTML = `<div class="row"><label class="ctrl" style="min-width:200px"><span>示例程序</span><select id="pg">${Object.keys(P).map(k => `<option>${k}</option>`).join('')}</select></label><label class="ctrl" style="min-width:260px"><span>calldata (十六进制)</span><input type="text" id="cd" value="a9059cbb000000000000000000000000ab5801a7d398351b8be11c439e05c5b3259aec9b"></label></div><div class="grid2"><div><textarea id="src" rows="12" class="mono"></textarea><div class="row" style="margin-top:6px"><button class="btn primary" id="st">单步</button><button class="btn" id="run">运行到结束</button><button class="btn" id="rs">重置</button></div></div><div><div class="kv" id="kv"></div><div class="out mono" id="stk" style="margin-top:8px"></div><div class="out mono" id="mem" style="margin-top:8px"></div><div class="out mono" id="sto" style="margin-top:8px"></div></div></div><div class="out" id="msg"></div>`;
  const GAS = { SSTORE: 20000, SLOAD: 2100, JUMPI: 10, JUMP: 8, JUMPDEST: 1, CALLDATALOAD: 3, MSTORE: 6, MLOAD: 6 };
  const M = (1n << 256n) - 1n; let ins, labels, S;
  const asm = () => {
    const lines = $('#src', b).value.split('\n').map(l => l.trim()).filter(Boolean); labels = {}; ins = [];
    lines.forEach(l => { const m = l.match(/^(\w+)(?:\s+(\S+))?(?:\s+@(\w+))?$/); const parts = l.split(/\s+/); const op = parts[0]; let arg = parts[1]; let lab = null; if (op === 'JUMPDEST' && parts[1] && parts[1][0] === '@') { lab = parts[1].slice(1); arg = null; } ins.push({ op, arg, lab }); if (lab) labels[lab] = ins.length - 1; });
  };
  const reset = () => { asm(); S = { pc: 0, stack: [], mem: {}, sto: {}, gas: 0, halted: false, reason: '' }; draw(); };
  const val1 = (a, i) => a[0] === '@' ? BigInt(labels[a.slice(1)]) : BigInt(a);
  const step = () => {
    if (S.halted) return; const i = ins[S.pc]; if (!i) { S.halted = true; S.reason = '程序结束'; return draw(); }
    const st = S.stack; const pop = () => { if (!st.length) throw new Error('栈下溢'); return st.pop(); };
    S.gas += GAS[i.op] ?? 3; let jumped = false;
    try {
      const op = i.op;
      if (/^PUSH\d*$/.test(op)) st.push(val1(i.arg) & M);
      else if (op === 'ADD') st.push((pop() + pop()) & M);
      else if (op === 'MUL') st.push((pop() * pop()) & M);
      else if (op === 'SUB') { const a = pop(), c = pop(); st.push((a - c) & M); }
      else if (op === 'POP') pop();
      else if (op === 'DUP1') { const a = pop(); st.push(a, a); }
      else if (op === 'SWAP1') { const a = pop(), c = pop(); st.push(a, c); }
      else if (op === 'SWAP2') { const a = pop(), c = pop(), d = pop(); st.push(a, c, d); }
      else if (op === 'EQ') st.push(pop() === pop() ? 1n : 0n);
      else if (op === 'LT') { const a = pop(), c = pop(); st.push(a < c ? 1n : 0n); }
      else if (op === 'ISZERO') st.push(pop() === 0n ? 1n : 0n);
      else if (op === 'SHR') { const sh = pop(), v = pop(); st.push(v >> sh); }
      else if (op === 'CALLDATALOAD') { const o = Number(pop()); const h = $('#cd', b).value.replace(/^0x/, '').padEnd(128, '0').slice(o * 2, o * 2 + 64).padEnd(64, '0'); st.push(BigInt('0x' + h)); }
      else if (op === 'MSTORE') { const o = pop(), v = pop(); S.mem[o] = v; }
      else if (op === 'MLOAD') { const o = pop(); st.push(S.mem[o] ?? 0n); }
      else if (op === 'SSTORE') { const k = pop(), v = pop(); if (S.sto[k] !== undefined) S.gas -= 15000; S.sto[k] = v; }
      else if (op === 'SLOAD') { const k = pop(); st.push(S.sto[k] ?? 0n); }
      else if (op === 'JUMPDEST') { }
      else if (op === 'JUMP') { S.pc = Number(pop()); jumped = true; }
      else if (op === 'JUMPI') { const d = pop(), c = pop(); if (c !== 0n) { S.pc = Number(d); jumped = true; } }
      else if (op === 'STOP') { S.halted = true; S.reason = 'STOP：正常结束'; }
      else if (op === 'REVERT') { S.halted = true; S.reason = 'REVERT：回滚，没有匹配的函数'; }
      else throw new Error('未支持的指令 ' + op);
    } catch (e) { S.halted = true; S.reason = '错误：' + e.message; }
    if (!jumped && !S.halted) S.pc++; draw();
  };
  const draw = () => {
    const hx = v => '0x' + v.toString(16);
    $('#kv', b).innerHTML = `<div><small>PC / 指令</small><b>${S.pc} / ${ins[S.pc] ? ins[S.pc].op : '—'}</b></div><div><small>累计 Gas</small><b>${S.gas}</b></div><div><small>栈深度</small><b>${S.stack.length}</b></div>`;
    $('#stk', b).innerHTML = '<b>栈 (顶在上)</b><br>' + ([...S.stack].reverse().map(hx).join('<br>') || '（空）');
    $('#mem', b).innerHTML = '<b>内存</b><br>' + (Object.entries(S.mem).map(([k, v]) => `[${k}] = ${hx(v)}`).join('<br>') || '（空）');
    $('#sto', b).innerHTML = '<b>存储</b><br>' + (Object.entries(S.sto).map(([k, v]) => `slot ${k} = ${hx(v)}`).join('<br>') || '（空）');
    const m = $('#msg', b); m.className = S.halted ? (S.reason.startsWith('REVERT') || S.reason.startsWith('错误') ? 'out bad' : 'out ok') : 'out'; m.textContent = S.halted ? S.reason : `下一条：${ins[S.pc] ? ins[S.pc].op + ' ' + (ins[S.pc].arg || '') : '—'}`;
    $$('#src', b).forEach(() => { });
  };
  const load = () => { $('#src', b).value = P[$('#pg', b).value]; reset(); };
  $('#pg', b).onchange = load; $('#st', b).onclick = step; $('#rs', b).onclick = reset; $('#src', b).oninput = reset; $('#cd', b).oninput = reset;
  $('#run', b).onclick = () => { let n = 0; while (!S.halted && n++ < 2000) step(); };
  load();
});

/* ---- 3.1 selector & slot calculator ---- */
def('abi', '选择器与槽位计算器', (host) => {
  const b = labShell(host, 'ABI', '选择器与槽位计算器', '输入函数签名得到 4 字节选择器；输入映射的槽位和键得到数据所在的存储槽。');
  b.innerHTML = `<div class="grid2"><div style="display:grid;gap:8px"><label class="ctrl"><span>函数签名</span><input type="text" id="sg" value="transfer(address,uint256)"></label><div class="row"><button class="btn" data-s="burn(uint256)">burn(uint256)</button><button class="btn" data-s="collate_propagate_storage(bytes16)">collate_propagate_storage(bytes16)</button></div><div class="out mono" id="sel"></div></div><div style="display:grid;gap:8px"><label class="ctrl"><span>mapping 所在槽 p</span><input type="text" id="p" value="1"></label><label class="ctrl"><span>键 (address 或 uint)</span><input type="text" id="k" value="0xab5801a7d398351b8be11c439e05c5b3259aec9b"></label><div class="out mono" id="slot"></div></div></div><div class="out mono" id="eip"></div>`;
  const run = () => {
    const sig = $('#sg', b).value.trim(); const s = K(Array.from(new TextEncoder().encode(sig))); $('#sel', b).innerHTML = `keccak256("${sig}")<br>= ${s.slice(0, 8)}…<br><b>选择器 0x${s.slice(0, 8)}</b>`;
    try { const p = BigInt($('#p', b).value).toString(16), k = BigInt($('#k', b).value.startsWith('0x') ? $('#k', b).value : BigInt($('#k', b).value)).toString(16); const h = K(hex2bytes(pad32(k) + pad32(p))); $('#slot', b).innerHTML = `keccak256(pad32(key) ‖ pad32(p))<br><b>0x${h}</b>`; } catch (e) { $('#slot', b).textContent = '输入有误'; }
    const e1 = BigInt('0x' + K(Array.from(new TextEncoder().encode('eip1967.proxy.implementation')))) - 1n; $('#eip', b).innerHTML = `ERC-1967 实现槽 = keccak256("eip1967.proxy.implementation") − 1<br>= 0x${e1.toString(16).padStart(64, '0')}`;
  };
  $$('input', b).forEach(i => i.oninput = run); $$('button[data-s]', b).forEach(bt => bt.onclick = () => { $('#sg', b).value = bt.dataset.s; run(); }); run();
});

/* ---- 3.2 gas ---- */
def('gas', 'Gas 优化对比器与 63/64 规则', (host) => {
  const b = labShell(host, 'GAS', 'Gas 优化对比器与 63/64 规则', '上：一个循环函数在不同优化组合下的 Gas。下：子调用能否拿到足够的 Gas。数值是简化估算。');
  b.innerHTML = `<div class="grid3">${slider('n', '循环次数', 1, 200, 50)}</div><div class="row"><label class="chk"><input type="checkbox" id="o1"> 缓存存储变量</label><label class="chk"><input type="checkbox" id="o2"> unchecked 自增</label><label class="chk"><input type="checkbox" id="o3"> 自定义错误代替字符串</label><label class="chk"><input type="checkbox" id="o4"> calldata 代替 memory</label></div><div class="kv" id="kv"></div><div class="out" id="ad"></div><hr><div class="grid3">${slider('av', '外层可用 Gas (千)', 10, 600, 200)}${slider('rq', '子调用需要 Gas (千)', 5, 500, 100)}</div><div class="out" id="ru"></div>`;
  const run = () => {
    const n = val(b, 'n'); const c1 = $('#o1', b).checked, c2 = $('#o2', b).checked, c3 = $('#o3', b).checked, c4 = $('#o4', b).checked;
    const base = 21000 + (c4 ? 300 : 900); const perIter = (c1 ? 100 + 3 : 100 + 2100 / n * 0 + 100) + (c2 ? 8 : 70) + 120; const first = c1 ? 2100 : 2100;
    const total = base + first + n * perIter + (c3 ? 120 : 900);
    const worst = 21000 + 900 + 2100 + n * (100 + 70 + 120) + 900;
    $('#kv', b).innerHTML = `<div><small>估算 Gas</small><b>${fmt(total, 0)}</b></div><div><small>未优化基线</small><b>${fmt(worst, 0)}</b></div><div><small>节省</small><b>${((1 - total / worst) * 100).toFixed(1)}%</b></div>`;
    const warn = []; if (c1) warn.push('缓存存储变量：如果循环里有外部调用，缓存值可能已过期。'); if (c2) warn.push('unchecked：必须证明循环变量不会溢出。'); $('#ad', b).className = warn.length ? 'out warnp' : 'out'; $('#ad', b).innerHTML = warn.length ? '<b>审计提示</b><br>' + warn.join('<br>') : '没有启用优化。';
    const av = val(b, 'av') * 1000, rq = val(b, 'rq') * 1000; const cap = av - Math.floor(av / 64); const given = Math.min(rq, cap); const ok = given >= rq; let need = Math.floor(rq * 64 / 63); while (need - Math.floor(need / 64) < rq) need++;
    $('#ru').className; const r = $('#ru', b); r.className = ok ? 'out ok' : 'out bad';
    r.innerHTML = `最多转发 ${fmt(cap, 0)} Gas (63/64)。子调用需要 ${fmt(rq, 0)}。` + (ok ? ' 子调用拿到足够 Gas。' : ` <b>子调用只拿到 ${fmt(given, 0)}，会因 Gas 不足失败，但外层还有 ${fmt(av - given, 0)} 可继续执行。</b>`) + `<br>要保证子调用成功，外层至少需要 ${fmt(need, 0)} Gas。`;
  };
  bindSliders(b, run); $$('input[type=checkbox]', b).forEach(i => i.onchange = run); run();
});

/* ---- 3.3 death spiral ---- */
def('spiral', '算法稳定币死亡螺旋', (host) => {
  const b = labShell(host, 'SPIRAL', '算法稳定币死亡螺旋', '稳定币可按 1 美元兑换成治理币。储备用完后靠增发治理币兑付。调整参数，看螺旋是否发生。模型高度简化。');
  b.innerHTML = `<div class="grid3">${slider('rs', '储备占供应 (%)', 0, 50, 5)}${slider('r0', '首轮赎回比例 (%)', 1, 30, 5)}${slider('pn', '恐慌放大系数 (%)', 0, 100, 40)}${slider('mc', '治理币市值 / 稳定币供应', 0.2, 3, 1, .1)}</div><canvas class="plot" id="cv" width="640" height="240"></canvas><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const run = () => {
    let S = 100, R = S * val(b, 'rs') / 100, r = val(b, 'r0') / 100, pn = val(b, 'pn') / 100, mcap = S * val(b, 'mc'); let gsup = 100, g = mcap / gsup; const g0 = g;
    const rows = [{ t: 0, peg: 1, g: 1 }]; let collapsed = -1;
    for (let t = 1; t <= 14; t++) {
      const red = Math.min(S, S * r); const fromR = Math.min(R, red); R -= fromR; const mint = (red - fromR) / g; S -= red;
      const newSup = gsup + mint; g = g * gsup / newSup * (1 - pn * r * 0.6); gsup = newSup; mcap = g * gsup;
      const peg = Math.max(0, Math.min(1, 1 - 0.8 * r - (R <= 0 ? 0.1 : 0)));
      if (peg < 0.9 && R <= 0) r = Math.min(0.6, r * (1 + pn)); rows.push({ t, peg, g: g / g0, sup: gsup / 100 });
      if (g / g0 < 0.05 && collapsed < 0) collapsed = t;
    }
    const c = $('#cv', b), x = c.getContext('2d'), cs = getComputedStyle(document.documentElement); x.clearRect(0, 0, 640, 240);
    x.strokeStyle = cs.getPropertyValue('--ink-2'); x.beginPath(); x.moveTo(30, 10); x.lineTo(30, 210); x.lineTo(620, 210); x.stroke();
    const line = (key, color, mx) => { x.strokeStyle = color; x.lineWidth = 2; x.beginPath(); rows.forEach((p, i) => { const px = 30 + i * 590 / 14, py = 210 - Math.min(1, p[key] / mx) * 190; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
    line('peg', cs.getPropertyValue('--accent'), 1); line('g', cs.getPropertyValue('--crit'), 1);
    x.fillStyle = cs.getPropertyValue('--ink-2'); x.font = '12px sans-serif'; x.fillText('绿：稳定币价格  红：治理币价格(相对初始)    横轴：赎回轮次 0–14', 40, 230);
    const last = rows[rows.length - 1];
    $('#kv', b).innerHTML = `<div><small>稳定币价格</small><b>$${last.peg.toFixed(2)}</b></div><div><small>治理币相对价格</small><b>${(last.g * 100).toFixed(1)}%</b></div><div><small>治理币供应倍数</small><b>${last.sup.toFixed(0)}×</b></div><div><small>剩余稳定币供应</small><b>${S.toFixed(1)}</b></div>`;
    const st = $('#st', b); st.className = collapsed > 0 ? 'out bad' : last.peg > 0.97 ? 'out ok' : 'out warnp';
    st.textContent = collapsed > 0 ? `第 ${collapsed} 轮治理币跌去 95% 以上：增发 → 价格下跌 → 恐慌赎回 → 再增发，螺旋形成。` : last.peg > 0.97 ? '储备和信心足够，赎回被吸收，锚定保持。' : '锚定受损，但螺旋尚未失控。';
  };
  bindSliders(b, run); run();
});

/* ---- 3.3 governance ---- */
def('governance', '闪电贷治理攻击与防御', (host) => {
  const b = labShell(host, 'GOVERNANCE', '闪电贷治理攻击与防御', '一个 DAO 的提案要获得足够票数才能执行。看三道防线如何影响"借来的票"。');
  b.innerHTML = `<div class="grid3">${slider('ts', '代币总量 (百万)', 10, 1000, 100, 10)}${slider('mine', '提案者自有 (百万)', 0, 50, 1)}${slider('fl', '闪电贷可借 (百万)', 0, 800, 40, 10)}${slider('q', '法定人数 (%)', 5, 60, 30)}</div><div class="row"><label class="chk"><input type="checkbox" id="snap"> 投票权按提案创建前的快照计算</label><label class="chk"><input type="checkbox" id="tl"> 通过后有 2 天时间锁</label><label class="chk"><input type="checkbox" id="gd"> 有守护者可否决可疑提案</label></div><div class="log" id="lg"></div><div class="out" id="st"></div>`;
  const run = () => {
    const T = val(b, 'ts'), mine = val(b, 'mine'), fl = val(b, 'fl'), q = val(b, 'q') / 100 * T; const snap = $('#snap', b).checked, tl = $('#tl', b).checked, gd = $('#gd', b).checked;
    const L = []; const power = snap ? mine : mine + fl;
    L.push(`步骤 1：攻击者${snap ? '' : '用闪电贷借入 ' + fl + ' 百万票，并'}创建/投票提案。`);
    L.push(snap ? `快照在提案创建之前取得，借来的代币不计票。有效票数 = ${mine}。` : `没有快照，当前余额即投票权。有效票数 = ${power}。`);
    const pass = power >= q; L.push(`法定人数需要 ${q.toFixed(1)}。${pass ? '<span class="e">达到</span>' : '<span class="g">未达到</span>'}。`);
    let exec = pass;
    if (pass && tl) { exec = false; L.push('时间锁：提案要等 2 天才能执行。闪电贷必须在同一交易内归还，无法在 2 天里持有票数；但提案已通过，社区需要在这段时间响应。'); if (gd) L.push('<span class="g">守护者在时间锁内否决提案。</span>'); else L.push('<span class="w">如果没有人审查，2 天后仍会执行。</span>'); }
    else if (pass && gd) { exec = false; L.push('<span class="g">守护者否决。</span>'); }
    else if (pass) L.push('<span class="e">没有时间锁：提案当场执行，资金被转走。闪电贷在同一交易内还清。</span>');
    $('#lg', b).innerHTML = L.join('\n'); const st = $('#st', b);
    st.className = pass && !tl && !gd ? 'out bad' : pass ? 'out warnp' : 'out ok';
    st.textContent = pass && !tl && !gd ? (snap ? '提案当场执行：自有票数已达到法定人数，快照挡不住真实持仓；缺少时间锁。' : '攻击成功：缺少快照也缺少时间锁。') : pass ? '提案通过但被延迟或否决：时间锁和守护者给了社区反应时间。' : '攻击失败：借来的票不足以达到法定人数。';
  };
  bindSliders(b, run); $$('input[type=checkbox]', b).forEach(i => i.onchange = run); run();
});

/* ---- 3.4 fuzz ---- */
def('fuzz', '不变量模糊测试器', (host) => {
  const b = labShell(host, 'FUZZ', '不变量模糊测试器', '玩具金库：存款按 shares = a·S/A 计算。有缺陷的版本向上取整。不变量：单次存款或取款不能让操作者的价值增加（别人捐赠带来的收益不计）。点击运行，让工具随机找反例。');
  b.innerHTML = `<div class="row"><label class="chk"><input type="radio" name="ver" value="bug" checked> 有缺陷版本（存款向上取整）</label><label class="chk"><input type="radio" name="ver" value="fix"> 修复版本（向下取整，0 份额回滚）</label><button class="btn primary" id="go">运行 2,000 个随机序列</button></div><div class="log" id="lg"></div><div class="out" id="st"></div>`;
  const rng = s => () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const sim = (ops, fixed) => {
    let A = 1000, S = 1000; const sh = [0, 0], dep = [0, 0], wd = [0, 0]; const trace = [];
    for (const o of ops) {
      const base = o.k === 'donate' ? 0 : sh[o.u] * A / S + wd[o.u] - dep[o.u];
      if (o.k === 'donate') { A += o.a; trace.push(`donate(${o.a})`); }
      else if (o.k === 'deposit') {
        const raw = o.a * S / A; const s = fixed ? Math.floor(raw) : Math.ceil(raw);
        if (s === 0) { trace.push(`deposit(u${o.u},${o.a}) → revert`); continue; }
        A += o.a; S += s; sh[o.u] += s; dep[o.u] += o.a; trace.push(`deposit(u${o.u},${o.a}) → ${s} 份额`);
      } else {
        const s = Math.min(sh[o.u], o.a); if (!s) continue; const out = Math.floor(s * A / S); A -= out; S -= s; sh[o.u] -= s; wd[o.u] += out; trace.push(`withdraw(u${o.u},${s}份额) → ${out}`);
      }
      if (o.k !== 'donate') { const v = sh[o.u] * A / S, gain = v + wd[o.u] - dep[o.u] - base; if (gain > 1e-9) return { fail: true, trace, msg: `不变量被打破：用户 u${o.u} 在这一步存取款后，价值凭空增加 ${gain.toFixed(2)}。` }; }
    }
    return { fail: false };
  };
  const gen = r => { const n = 2 + Math.floor(r() * 7); const ops = []; for (let i = 0; i < n; i++) { const t = r(); ops.push(t < .25 ? { k: 'donate', a: 1 + Math.floor(r() * 5000) } : t < .7 ? { k: 'deposit', u: Math.floor(r() * 2), a: 1 + Math.floor(r() * 30) } : { k: 'withdraw', u: Math.floor(r() * 2), a: 1 + Math.floor(r() * 40) }); } return ops; };
  const shrink = (ops, fixed) => { let cur = ops; let changed = true; while (changed) { changed = false; for (let i = 0; i < cur.length; i++) { const c = cur.filter((_, j) => j !== i); if (sim(c, fixed).fail) { cur = c; changed = true; break; } } } return cur; };
  const run = () => {
    const fixed = $('input[name=ver]:checked', b).value === 'fix'; const r = rng(7); let found = null, i = 0;
    for (; i < 2000; i++) { const ops = gen(r); if (sim(ops, fixed).fail) { found = ops; break; } }
    const lg = $('#lg', b), st = $('#st', b);
    if (!found) { lg.textContent = '2000 个序列全部通过。'; st.className = 'out ok'; st.textContent = '没有找到反例。这只说明"随机搜索没找到"，不是证明。需要更强的不变量和形式化验证来补充。'; return; }
    const small = shrink(found, fixed); const res = sim(small, fixed);
    lg.innerHTML = `第 ${i + 1} 个序列失败（${found.length} 步），缩减到 ${small.length} 步：\n` + res.trace.map(t => '  ' + t).join('\n');
    st.className = 'out bad'; st.textContent = res.msg + ' 根因：捐赠使每份额价值大于 1，向上取整让小额存款拿到价值更高的份额。';
  };
  $('#go', b).onclick = run; $$('input[name=ver]', b).forEach(i => i.onchange = run); run();
});

/* ---- 3.6 trace ---- */
def('trace', '攻击交易调用树分析', (host) => {
  const b = labShell(host, 'TRACE', '攻击交易调用树分析', '一笔（高度简化的）借贷协议攻击交易的调用树。逐层展开，然后点击你认为的"根因帧"。');
  const nodes = [
    ['d0', 0, 'Attacker.attack()', '攻击合约的入口，一笔交易内完成全部步骤。'],
    ['d1', 1, 'FlashLender.flashLoan(30M DAI)', '借入大额资金。这是放大器，不是根因：它让"需要大资金"的前提消失。'],
    ['d2', 2, 'Lending.deposit(20M DAI)', '正常存款。'],
    ['d3', 2, 'Lending.mint(200M) // 杠杆放大仓位', '正常借贷函数。放大了后续差异。'],
    ['d4', 2, 'Lending.donateToReserves(100M)  ← 此函数未检查调用者的健康度', '根因帧：该函数降低了调用者的抵押资产，使账户进入可清算状态，但没有像 borrow/withdraw 那样做健康度检查。破坏了"任何改变抵押或债务的函数都要检查健康度"的不变量。'],
    ['d5', 2, 'Lending.liquidate(attackerAccount2)  // 自己清算自己', '后果帧：不变量被打破后，清算按正常逻辑执行，清算折扣把价值转给清算者。清算函数本身没有 bug。'],
    ['d6', 2, 'Lending.withdraw(...)', '取出清算获得的资产。'],
    ['d7', 1, 'FlashLender 偿还 30M DAI + 手续费', '闪电贷归还，剩余即利润。'],
  ];
  b.innerHTML = `<div id="tr"></div><div class="out" id="fb">点击一个调用帧，作为你的"根因"判断。</div>`;
  $('#tr', b).innerHTML = nodes.map(n => `<div style="margin-left:${n[1] * 22}px"><button class="btn" data-id="${n[0]}" style="margin:3px 0;text-align:left"><span class="mono">${n[2].replace(/</g, '&lt;')}</span></button></div>`).join('');
  $$('#tr button', b).forEach(bt => bt.onclick = () => { const n = nodes.find(x => x[0] === bt.dataset.id); const fb = $('#fb', b); fb.className = n[0] === 'd4' ? 'out ok' : 'out warnp'; fb.innerHTML = (n[0] === 'd4' ? '<b>正确。</b> ' : '<b>不是根因。</b> ') + n[3]; });
});

/* ---- 4.1 chains ---- */
def('chains', '多链审计对照卡', (host) => {
  const b = labShell(host, 'CHAINS', '多链审计对照卡', '选择一个环境，查看"相同的风险在这里长什么样"。');
  const D = {
    'EVM': ['权限', '修饰器与角色表；初始化只一次', '数学', '0.8 检查 + unchecked 审查', '外部调用', 'CEI + 重入锁；回调代币', '预言机', 'Chainlink 校验；TWAP 窗口'],
    'Solana': ['权限', '每个账户的 Signer / Owner / 类型校验', '数学', 'Rust checked_* 运算；整数类型转换', '外部调用', 'CPI 目标程序固定；CPI 后重新加载账户', '预言机', 'Pyth 置信区间与时间戳'],
    'Move (Aptos/Sui)': ['权限', 'Capability 对象的发放与存放位置', '数学', '位移与乘除边界；数学库穷举测试', '外部调用', '共享对象并发；泛型类型校验', '预言机', '价格对象的新鲜度'],
    'Cairo (Starknet)': ['权限', 'get_caller_address；账户抽象校验', '数学', 'felt252 按素数取模，转换为整数类型要检查范围', '外部调用', 'L1→L2 消息的来源校验', '预言机', 'L2 排序器状态'],
    'TON': ['权限', '消息发送者校验', '数学', '大整数边界', '外部调用', '消息异步：发出后状态已变；bounce 处理', '预言机', '链下数据签名与时效'],
    'Cosmos SDK': ['权限', '模块账户与权限；Msg 签名者', '数学', 'sdk.Int / Dec 精度', '外部调用', 'IBC 超时与确认；BeginBlock 的 panic 与无界循环', '预言机', '投票扩展 / 价格 Feeder'],
  };
  b.innerHTML = `<div class="tabs" id="tb">${Object.keys(D).map((k, i) => `<button class="btn" data-k="${k}" aria-pressed="${i === 0}">${k}</button>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>风险</th><th>在这个环境里重点检查</th></tr></thead><tbody id="rw"></tbody></table></div>`;
  const draw = k => { const a = D[k]; let h = ''; for (let i = 0; i < a.length; i += 2) h += `<tr><td>${a[i]}</td><td>${a[i + 1]}</td></tr>`; $('#rw', b).innerHTML = h; };
  $$('#tb button', b).forEach(bt => bt.onclick = () => { $$('#tb button', b).forEach(x => x.setAttribute('aria-pressed', x === bt)); draw(bt.dataset.k); }); draw('EVM');
});

/* ---- 4.2 merkle + validators ---- */
def('merkle', 'Merkle 证明验证与验证者门限评估', (host) => {
  const b = labShell(host, 'MERKLE', 'Merkle 证明验证与验证者门限评估', '上：选择叶子，查看证明路径并验证；修改叶子数据看验证失败。下：评估桥的验证者门限与运营商集中度。');
  b.innerHTML = `<div class="grid2"><div><label class="ctrl"><span>选择叶子</span><select id="li"><option value="0">消息 A</option><option value="1">消息 B</option><option value="2">消息 C</option><option value="3">消息 D</option></select></label><label class="ctrl" style="margin-top:8px"><span>提交的叶子内容（可修改）</span><input type="text" id="lv"></label></div><div class="out mono" id="mp"></div></div><div class="out" id="mr"></div><div class="out" id="lint"></div><label class="ctrl"><span>桥合约配置的可信根（lint 检查）</span><input type="text" id="tr" value="0x0000000000000000000000000000000000000000000000000000000000000000"></label><hr><div class="grid3">${slider('nv', '验证者总数 N', 3, 15, 7)}${slider('th', '门限 M', 1, 15, 5)}${slider('op', '独立运营商数量', 1, 15, 4)}</div><div class="out" id="vt"></div>`;
  const leaves = ['消息 A', '消息 B', '消息 C', '消息 D']; const H2 = (a, c) => K(hex2bytes((a < c ? a + c : c + a)));
  const leafH = t => K(Array.from(new TextEncoder().encode('leaf:' + t)));
  const L = leaves.map(leafH); const n01 = H2(L[0], L[1]), n23 = H2(L[2], L[3]), root = H2(n01, n23);
  const run = () => {
    const i = +$('#li', b).value; const input = $('#lv', b); if (document.activeElement !== input && input.dataset.i != i) { input.value = leaves[i]; input.dataset.i = i; }
    const proof = [L[i ^ 1], i < 2 ? n23 : n01]; let h = leafH(input.value); h = H2(h, proof[0]); h = H2(h, proof[1]);
    $('#mp', b).innerHTML = `根 ${root.slice(0, 12)}…<br>证明路径：<br>① 兄弟叶子 ${proof[0].slice(0, 10)}…<br>② 上层兄弟节点 ${proof[1].slice(0, 10)}…`;
    const ok = h === root; const mr = $('#mr', b); mr.className = ok ? 'out ok' : 'out bad'; mr.textContent = ok ? '验证通过：叶子 + 证明路径 重新计算得到链上保存的根。' : `验证失败：重新计算的根 ${h.slice(0, 10)}… ≠ ${root.slice(0, 10)}…。叶子被改动。`;
    const tr = $('#tr', b).value.trim().toLowerCase(); const zero = /^0x0*$/.test(tr); const lint = $('#lint', b);
    lint.className = zero ? 'out bad' : 'out ok'; lint.innerHTML = zero ? '<b>配置 lint 失败</b>：可信根是零值。未证明的消息在映射里的默认值也是零，两者会混淆。部署脚本和升级脚本必须拒绝零值，并为"未证明"使用独立的状态位。' : '配置 lint 通过：可信根非零。';
    const N = val(b, 'nv'), M = Math.min(val(b, 'th'), N), O = Math.min(val(b, 'op'), N); const per = Math.ceil(N / O); const opsNeeded = Math.ceil(M / per);
    const v = $('#vt', b); v.className = opsNeeded <= 1 ? 'out bad' : opsNeeded <= 2 ? 'out warnp' : 'out ok';
    v.innerHTML = `${N} 个验证者分布在 ${O} 个独立运营商，每个运营商约 ${per} 个节点。门限 ${M}。<br>攻破 <b>${opsNeeded}</b> 个运营商（或其云账号/密钥管理系统）就足以达到门限。` + (opsNeeded <= 1 ? '<br>单点失败：一个运营商的故障或失陷就会让桥失效。' : '') + (M <= N / 2 ? '<br>门限不超过一半：两组不同验证者可以签署冲突消息。' : '');
  };
  $$('input,select', b).forEach(i => i.addEventListener('input', run)); run();
});

/* ---- J1 capstone ---- */
def('capstone', 'MiniLend 审计练习台', (host) => {
  const b = labShell(host, 'CAPSTONE', 'MiniLend 审计练习台', '点击你认为有问题的行（可多选），然后提交。');
  const code = [
    'contract MiniLend is UUPSUpgradeable, OwnableUpgradeable {',
    '    IERC20 public usd; AggregatorV3Interface public feed;',
    '    mapping(address => uint256) public collateral;',
    '    mapping(address => uint256) public debt;',
    '    uint256 constant LTV = 75;',
    '    function initialize(address _usd, address _feed) external {',
    '        usd = IERC20(_usd); feed = AggregatorV3Interface(_feed); __Ownable_init(msg.sender);',
    '    }',
    '    function _authorizeUpgrade(address) internal override {}',
    '    function price() public view returns (uint256) {',
    '        (, int256 p, , , ) = feed.latestRoundData(); return uint256(p);',
    '    }',
    '    function deposit() external payable { collateral[msg.sender] += msg.value; }',
    '    function borrow(uint256 amt) external {',
    '        uint256 maxB = collateral[msg.sender] * price() * LTV / 100 / 1e8;',
    '        require(debt[msg.sender] + amt <= maxB, "LTV");',
    '        debt[msg.sender] += amt;',
    '        usd.transfer(msg.sender, amt);',
    '    }',
    '    function repay(uint256 amt) external {',
    '        usd.transferFrom(msg.sender, address(this), amt);',
    '        debt[msg.sender] -= amt;',
    '    }',
    '    function withdraw(uint256 amt) external {',
    '        require(collateral[msg.sender] >= amt, "bal");',
    '        (bool ok, ) = msg.sender.call{value: amt}("");',
    '        require(ok, "send");',
    '        collateral[msg.sender] -= amt;',
    '    }',
    '    function liquidate(address u) external {',
    '        require(debt[u] * 1e8 * 100 > collateral[u] * price() * 80, "healthy");',
    '        usd.transferFrom(msg.sender, address(this), debt[u]);',
    '        uint256 c = collateral[u]; collateral[u] = 0; debt[u] = 0;',
    '        payable(msg.sender).transfer(c);',
    '    }',
    '}',
  ];
  const issues = [
    { id: 1, sev: 'Critical', lines: [6, 7], t: 'initialize 没有 initializer 修饰器，可被重复调用；实现合约也没有 _disableInitializers()', fix: '加 initializer；构造函数里调用 _disableInitializers()。' },
    { id: 2, sev: 'Critical', lines: [9], t: '_authorizeUpgrade 没有访问控制，任何人可以升级实现', fix: '加 onlyOwner（并由多签 + 时间锁持有）。' },
    { id: 3, sev: 'Critical', lines: [26, 27, 28], t: 'withdraw 先转 ETH 后扣减记账，存在重入', fix: '先扣减再转账 (CEI) + nonReentrant。' },
    { id: 4, sev: 'High', lines: [25], t: 'withdraw 之后没有检查健康度，有债务的用户可以取走抵押物', fix: '取款后检查 debt ≤ 最大可借额。' },
    { id: 5, sev: 'Medium', lines: [11], t: 'price() 没有检查 answer > 0、updatedAt 陈旧、L2 排序器状态', fix: '增加零值/陈旧检查与降级策略。' },
    { id: 6, sev: 'Medium', lines: [18, 21], t: '没有检查 ERC20 transfer / transferFrom 的返回值', fix: '使用 SafeERC20。' },
    { id: 7, sev: 'Low', lines: [33, 34], t: '清算人拿走全部抵押物而只需偿还债务：奖励没有上限，且 .transfer 对合约钱包不兼容', fix: '限制清算奖励比例与清算比例；用 call 并处理返回值。' },
  ];
  b.innerHTML = `<div class="code-wrap" style="margin:0"><pre id="cd"></pre></div><div class="row"><button class="btn primary" id="sub">提交审计</button><button class="btn" id="rs">清空</button></div><div id="res"></div>`;
  const sel = new Set();
  const draw = () => {
    $('#cd', b).innerHTML = code.map((l, i) => `<div data-n="${i + 1}" style="cursor:pointer;padding:0 4px;white-space:pre;${sel.has(i + 1) ? 'background:var(--med-soft)' : ''}"><span style="color:var(--ink-2)">${String(i + 1).padStart(2)} </span>${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div>`).join('');
    $$('#cd div', b).forEach(d => d.onclick = () => { const n = +d.dataset.n; sel.has(n) ? sel.delete(n) : sel.add(n); draw(); });
  };
  const cls = { Critical: 'sev-c', High: 'sev-h', Medium: 'sev-m', Low: 'sev-l' };
  $('#sub', b).onclick = () => {
    const hit = issues.filter(i => i.lines.some(l => sel.has(l))); const used = new Set(issues.flatMap(i => i.lines)); const fp = [...sel].filter(l => !used.has(l));
    $('#res', b).innerHTML = `<div class="out ${hit.length === issues.length ? 'ok' : 'warnp'}"><b>找到 ${hit.length} / ${issues.length} 个问题</b>，误标 ${fp.length} 行。</div>` + issues.map(i => `<div class="out" style="margin-top:6px">${hit.includes(i) ? '✓' : '✗'} <span class="tag ${cls[i.sev]}">${i.sev}</span> ${i.t}<br><span class="mono">位置：行 ${i.lines.join('、')}</span>${hit.includes(i) ? '' : ''}<br>建议：${i.fix}</div>`).join('');
  };
  $('#rs', b).onclick = () => { sel.clear(); $('#res', b).innerHTML = ''; draw(); };
  draw();
});
/* ---- C1 Uniswap V2 K check ---- */
def('v2k', 'K 值不变量检查器', (host) => {
  const b = labShell(host, 'V2-K', 'K 值不变量检查器', '模拟 Pair.swap 最后的校验：给定储备、转入量和请求的转出量，判断交易能否通过。修改手续费常数，看分叉不一致时会怎样。');
  b.innerHTML = `<div class="grid3"><label class="ctrl"><span>reserve0</span><input type="text" id="r0" value="1000000"></label><label class="ctrl"><span>reserve1</span><input type="text" id="r1" value="3000000000"></label><label class="ctrl"><span>转入 token0 (amountIn)</span><input type="text" id="ai" value="10000"></label><label class="ctrl"><span>请求转出 token1 (amountOut)</span><input type="text" id="ao" value="29613"></label><label class="ctrl"><span>Pair 中的手续费（千分之）</span><input type="text" id="fp" value="3"></label><label class="ctrl"><span>Library 报价用的手续费（千分之）</span><input type="text" id="fl" value="3"></label></div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const run = () => {
    try {
      const r0 = BigInt($('#r0', b).value), r1 = BigInt($('#r1', b).value), ai = BigInt($('#ai', b).value), ao = BigInt($('#ao', b).value), fp = BigInt($('#fp', b).value), fl = BigInt($('#fl', b).value);
      const quote = (ai * (1000n - fl) * r1) / (r0 * 1000n + ai * (1000n - fl));
      const maxOk = (ai * (1000n - fp) * r1) / (r0 * 1000n + ai * (1000n - fp));
      const b0 = r0 + ai, b1 = r1 - ao; const b0a = b0 * 1000n - ai * fp, b1a = b1 * 1000n; const ok = ao < r1 && b0a * b1a >= r0 * r1 * 1000000n;
      $('#kv', b).innerHTML = `<div><small>Library 报价 amountOut</small><b>${quote}</b></div><div><small>Pair 允许的最大转出</small><b>${maxOk}</b></div><div><small>交易后 K'(扣费)</small><b>${(b0a * b1a).toString().slice(0, 14)}…</b></div><div><small>交易前 K·10⁶</small><b>${(r0 * r1 * 1000000n).toString().slice(0, 14)}…</b></div>`;
      const st = $('#st', b);
      if (!ok) { st.className = 'out bad'; st.textContent = `revert "K"：请求转出 ${ao} 超过不变量允许的 ${maxOk}。`; }
      else { st.className = 'out ok'; st.textContent = `通过：扣费后乘积不小于交易前。`; }
      if (fp !== fl) { st.className = 'out warnp'; st.textContent += quote > maxOk ? ` 注意：Library 报价 ${quote} 高于 Pair 允许值 ${maxOk}。按报价交易的 Router 调用会全部 revert（DoS）。` : ` 注意：Library 报价 ${quote} 低于 Pair 允许值 ${maxOk}。用户少拿了 ${maxOk - quote}，差额留在池子里。`; }
    } catch (e) { $('#st', b).textContent = '请输入整数'; }
  };
  $$('input', b).forEach(i => i.oninput = run); run();
});

/* ---- C2 Aave entry x check matrix ---- */
def('hfmatrix', '入口 × 检查覆盖矩阵', (host) => {
  const b = labShell(host, 'COVERAGE', '入口 × 检查覆盖矩阵', '这是一个借贷分叉的入口表（示例）。逐行判断"是否增加风险"和"是否有健康度校验"。工具会列出缺口。初始状态模拟了一次审计开始时从代码中读出的事实。');
  const rows = [
    ['borrow', true, true, '债务增加'],
    ['withdraw', true, true, '抵押减少'],
    ['setUserUseReserveAsCollateral(false)', true, true, '抵押减少'],
    ['aToken.transfer', true, true, '抵押转移'],
    ['setUserEMode', true, true, '参数变化'],
    ['flashLoan（转为债务模式）', true, true, '债务增加'],
    ['donateToReserves（分叉新增）', true, false, '抵押减少'],
    ['repay', false, false, '债务减少'],
    ['supply', false, false, '抵押增加'],
    ['liquidationCall', false, true, '由清算校验负责'],
  ];
  const state = rows.map(r => ({ risk: r[1], check: r[2] }));
  const draw = () => {
    b.innerHTML = `<div class="table-wrap"><table><thead><tr><th>入口</th><th>说明</th><th>增加风险？</th><th>有 HF 校验？</th><th>结论</th></tr></thead><tbody>${rows.map((r, i) => { const s = state[i]; const gap = s.risk && !s.check; return `<tr><td class="mono">${r[0]}</td><td>${r[3]}</td><td><input type="checkbox" data-i="${i}" data-k="risk" ${s.risk ? 'checked' : ''} aria-label="风险"></td><td><input type="checkbox" data-i="${i}" data-k="check" ${s.check ? 'checked' : ''} aria-label="校验"></td><td>${gap ? '<span class="pill bad">缺口</span>' : '<span class="pill ok">OK</span>'}</td></tr>`; }).join('')}</tbody></table></div><div class="out" id="st"></div>`;
    $$('input[type=checkbox]', b).forEach(c => c.onchange = () => { state[c.dataset.i][c.dataset.k] = c.checked; draw(); });
    const gaps = rows.filter((r, i) => state[i].risk && !state[i].check).map(r => r[0]); const st = $('#st', b);
    st.className = gaps.length ? 'out bad' : 'out ok';
    st.innerHTML = gaps.length ? `<b>发现 ${gaps.length} 个缺口</b>：${gaps.join('、')}。<br>报告建议：在函数末尾调用与 withdraw 相同的健康度校验；并为"任何入口执行后 HF ≥ 1（除非账户本就可清算）"写不变量测试。` : '所有增加风险的入口都有校验。下一步：确认校验使用的是更新后的状态和价格。';
  };
  draw();
});

/* ---- C3 stETH shares ---- */
def('steth', '份额与余额换算器', (host) => {
  const b = labShell(host, 'STETH', '份额与余额换算器', 'stETH 按份额记账：转账金额先换成份额（向下取整），接收方余额再由份额换回（向下取整）。看取整损失和 rebase 的影响。数值为示例。');
  b.innerHTML = `<div class="grid3"><label class="ctrl"><span>totalPooledEther (wei)</span><input type="text" id="tp" value="9512345678901234567890123"></label><label class="ctrl"><span>totalShares</span><input type="text" id="ts" value="8123456789012345678901234"></label><label class="ctrl"><span>转账金额 (wei)</span><input type="text" id="am" value="1000000000000000000"></label>${slider('rb', '下一次 rebase (基点)', -50, 50, 3)}</div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const run = () => {
    try {
      const tp = BigInt($('#tp', b).value), ts = BigInt($('#ts', b).value), am = BigInt($('#am', b).value), rb = BigInt(val(b, 'rb'));
      const sh = am * ts / tp; const got = sh * ts === 0n ? 0n : sh * tp / ts; const loss = am - got;
      const tp2 = tp + tp * rb / 10000n; const after = sh * tp2 / ts;
      $('#kv', b).innerHTML = `<div><small>转移份额</small><b>${sh}</b></div><div><small>接收方余额增加</small><b>${got}</b></div><div><small>取整差额 (wei)</small><b>${loss}</b></div><div><small>rebase 后这笔余额</small><b>${after}</b></div>`;
      const st = $('#st', b); st.className = loss > 0n ? 'out warnp' : 'out ok';
      st.innerHTML = (loss > 0n ? `接收方少了 ${loss} wei。<code>require(after - before == amount)</code> 会失败。` : '本次没有取整差额，但换一个金额就可能出现。') + `<br>rebase ${Number(rb) / 100}% 后，同一笔份额对应的余额从 ${got} 变为 ${after}。按余额记账的合约，内部记录会与真实余额偏离 ${after - got} wei。`;
    } catch (e) { $('#st', b).textContent = '请输入整数'; }
  };
  $$('input', b).forEach(i => i.addEventListener('input', run)); bindSliders(b, run); run();
});

/* ---- C4 Safe tx review ---- */
def('safetx', '多签交易签前复核面板', (host) => {
  const b = labShell(host, 'SAFE-TX', '多签交易签前复核面板', '输入（或从发起者处拿到）交易原始字段。面板独立计算 EIP-712 safeTxHash，并列出风险标记。签名者应把这里的哈希与硬件钱包显示的哈希比对。');
  b.innerHTML = `<div class="grid3"><label class="ctrl"><span>chainId</span><input type="text" id="cid" value="1"></label><label class="ctrl"><span>Safe 地址</span><input type="text" id="safe" value="0x1111111111111111111111111111111111111111"></label><label class="ctrl"><span>to</span><input type="text" id="to" value="0xdac17f958d2ee523a2206206994597c13d831ec7"></label><label class="ctrl"><span>value (wei)</span><input type="text" id="val" value="0"></label><label class="ctrl"><span>data (hex)</span><input type="text" id="data" value="0xa9059cbb0000000000000000000000002222222222222222222222222222222222222222000000000000000000000000000000000000000000000000000000003b9aca00"></label><label class="ctrl"><span>operation</span><select id="op"><option value="0">0 · CALL</option><option value="1">1 · DELEGATECALL</option></select></label><label class="ctrl"><span>safeTxGas</span><input type="text" id="stg" value="0"></label><label class="ctrl"><span>baseGas</span><input type="text" id="bg" value="0"></label><label class="ctrl"><span>gasPrice</span><input type="text" id="gp" value="0"></label><label class="ctrl"><span>gasToken</span><input type="text" id="gt" value="0x0000000000000000000000000000000000000000"></label><label class="ctrl"><span>refundReceiver</span><input type="text" id="rr" value="0x0000000000000000000000000000000000000000"></label><label class="ctrl"><span>nonce</span><input type="text" id="nn" value="42"></label></div><label class="ctrl"><span>白名单目标（逗号分隔）</span><input type="text" id="wl" value="0xdac17f958d2ee523a2206206994597c13d831ec7,0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"></label><div class="out mono" id="hash"></div><div id="flags"></div>`;
  const tb = s => Array.from(new TextEncoder().encode(s));
  const SAFE_TX_TYPEHASH = K(tb('SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)'));
  const DOMAIN_TYPEHASH = K(tb('EIP712Domain(uint256 chainId,address verifyingContract)'));
  const u = v => pad32(BigInt(v).toString(16));
  const SEL = { 'a9059cbb': 'transfer(address,uint256)', '095ea7b3': 'approve(address,uint256)', '23b872dd': 'transferFrom(address,address,uint256)', '3659cfe6': 'upgradeTo(address)', '4f1ef286': 'upgradeToAndCall(address,bytes)', '0d582f13': 'addOwnerWithThreshold(address,uint256)', '694e80c3': 'changeThreshold(uint256)', '610b5925': 'enableModule(address)', 'e19a9dd9': 'setGuard(address)' };
  const run = () => {
    const g = id => $('#' + id, b).value.trim(); const flags = [];
    try {
      const data = g('data').replace(/^0x/, ''); const dh = K(hex2bytes(data || ''));
      const enc = SAFE_TX_TYPEHASH + pad32(g('to')) + u(g('val')) + dh + u(g('op')) + u(g('stg')) + u(g('bg')) + u(g('gp')) + pad32(g('gt')) + pad32(g('rr')) + u(g('nn'));
      const sh = K(hex2bytes(enc)); const ds = K(hex2bytes(DOMAIN_TYPEHASH + u(g('cid')) + pad32(g('safe'))));
      const h = K(hex2bytes('1901' + ds + sh));
      const sel = data.slice(0, 8); const name = data ? (SEL[sel] || '未知选择器 0x' + sel) : '（无 calldata，纯转账）';
      $('#hash', b).innerHTML = `domainSeparator 0x${ds}<br>safeTxHash <b>0x${h}</b><br>解码：${name}`;
      const wl = g('wl').toLowerCase().split(',').map(s => s.trim());
      if (g('op') === '1') flags.push(['bad', 'operation = 1（DELEGATECALL）：目标代码将在 Safe 自身存储上执行，可改写实现地址、owners、threshold。日常操作不应出现。']);
      if (!wl.includes(g('to').toLowerCase())) flags.push(['bad', '目标地址不在白名单内，需要逐字节核对地址来源。']);
      if (BigInt(g('gp')) > 0n) flags.push(['warnp', 'gasPrice 非零：Safe 会用自身资产支付 Gas 退款。确认 refundReceiver 是否可信。']);
      if (!/^0x0*$/.test(g('rr'))) flags.push(['warnp', 'refundReceiver 非零：退款发给指定地址。']);
      if (['3659cfe6', '4f1ef286', '0d582f13', '694e80c3', '610b5925', 'e19a9dd9'].includes(sel)) flags.push(['warnp', '这是权限或升级类调用：需要额外审批流程。']);
      if (sel === '095ea7b3') flags.push(['warnp', 'approve：核对被授权地址与额度，避免无限授权。']);
      if (BigInt(g('val')) > 0n) flags.push(['warnp', `附带 ${g('val')} wei ETH。`]);
    } catch (e) { $('#hash', b).textContent = '字段格式有误：' + e.message; }
    $('#flags', b).innerHTML = flags.length ? flags.map(f => `<div class="out ${f[0]}" style="margin-top:6px">${f[1]}</div>`).join('') : '<div class="out ok">未发现风险标记。仍需与硬件钱包上的哈希比对。</div>';
  };
  $$('input,select', b).forEach(i => i.addEventListener('input', run)); run();
});

/* ---- C5 rounding ---- */
def('rounding', '取整方向判定器', (host) => {
  const b = labShell(host, 'ROUNDING', '取整方向判定器', '金库当前每份额价值 1.5 资产。选择函数和取整方向，重复执行 1,000 次最小单位操作，看价值从其他持有人流向谁。');
  b.innerHTML = `<div class="row"><label class="ctrl" style="min-width:180px"><span>函数</span><select id="fn"><option value="deposit">deposit(1 资产)</option><option value="mint">mint(1 份额)</option><option value="withdraw">withdraw(1 资产)</option><option value="redeem">redeem(1 份额)</option></select></label><label class="ctrl" style="min-width:160px"><span>实现的取整方向</span><select id="dir"><option value="down">向下</option><option value="up">向上</option></select></label></div><div class="kv" id="kv"></div><div class="out" id="st"></div>`;
  const correct = { deposit: 'down', mint: 'up', withdraw: 'up', redeem: 'down' };
  const run = () => {
    const fn = $('#fn', b).value, dir = $('#dir', b).value; const R = x => dir === 'up' ? Math.ceil(x - 1e-12) : Math.floor(x + 1e-12);
    let A = 1500000, S = 1000000, userAssetsIn = 0, userAssetsOut = 0, userShares = fn === 'withdraw' || fn === 'redeem' ? 2000 : 0; S += userShares; A += userShares * 1.5;
    const startUserValue = userShares * A / S; let reverts = 0;
    for (let i = 0; i < 1000; i++) {
      if (fn === 'deposit') { const s = R(1 * S / A); if (s === 0) { reverts++; continue; } A += 1; S += s; userShares += s; userAssetsIn += 1; }
      if (fn === 'mint') { const a = R(1 * A / S); A += a; S += 1; userShares += 1; userAssetsIn += a; }
      if (fn === 'withdraw') { const s = R(1 * S / A); if (s > userShares) break; A -= 1; S -= s; userShares -= s; userAssetsOut += 1; }
      if (fn === 'redeem') { if (userShares < 1) break; const a = R(1 * A / S); A -= a; S -= 1; userShares -= 1; userAssetsOut += a; }
    }
    const userValueNow = userShares * A / S + userAssetsOut - userAssetsIn; const gain = userValueNow - startUserValue;
    $('#kv', b).innerHTML = `<div><small>用户净收益（资产单位）</small><b>${gain.toFixed(1)}</b></div><div><small>回滚次数</small><b>${reverts}</b></div><div><small>结束时每份额价值</small><b>${(A / S).toFixed(6)}</b></div>`;
    const ok = correct[fn] === dir; const st = $('#st', b); st.className = ok ? 'out ok' : 'out bad';
    st.innerHTML = ok ? `正确：${fn} 应${dir === 'up' ? '向上' : '向下'}取整。用户没有从取整中获利（误差留给金库）。${reverts ? '份额为 0 的存款被拒绝。' : ''}` : `错误：${fn} 应${correct[fn] === 'up' ? '向上' : '向下'}取整。1,000 次小额操作后，用户从其他持有人那里拿走约 ${gain.toFixed(0)} 资产单位。Gas 便宜的链上，这类误差可被批量放大。`;
  };
  $$('select', b).forEach(i => i.onchange = run); run();
});
(function(){const k=document.body.dataset.audit,e=document.querySelector('.lab');try{LABS[k](e);}catch(x){e.innerHTML='<div class="lab-body">实验加载失败：'+x.message+'</div>';}})();
