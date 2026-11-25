// Build the published handbook: dist/index.html (+ dist/preview.html for local viewing).
// Usage: node tools/build.mjs   (run from anywhere; needs `npm i` in tools/ once)
import fs from 'node:fs';
import path from 'node:path';
import { convert, titleOf } from './md2data.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// 示例代码在仓库根目录 code/（与 handbook/ 同级）；文档里仍用逻辑路径 code/…
const EXAMPLES = path.resolve(ROOT, '..', 'code');
const MEDIA = path.resolve(ROOT, '..', 'media');
const abs = p => p.startsWith('code/') ? path.join(EXAMPLES, p.slice('code/'.length)) : path.join(ROOT, p);
const rd = p => fs.readFileSync(abs(p), 'utf8');

const NAV = [
  ['start', '开始', ['README.md', 'docs/WRITING-GUIDE.md']],
  ['bcr', '', ['bootcamp/B00-roadmap.md']], // 训练营总览：不属于任何阶段，直接挂在父目录下
  ['bc0', '阶段 0 整装待发', ['bootcamp/B01-stage0-guide.md', 'bootcamp/B02-study-method.md', 'bootcamp/B03-blockchain-basics.md', 'bootcamp/B04-setup.md', 'bootcamp/B05-first-contract.md', 'bootcamp/B06-foundry-basics.md']],
  ['bc1', '阶段 1 初窥门径', ['bootcamp/B07-stage1-guide.md', 'bootcamp/B08-tokens-and-vault.md', 'bootcamp/B09-reading-code-mindset.md', 'bootcamp/B10-ctf-practice.md']],
  ['bc2', '阶段 2 小试牛刀', ['bootcamp/B11-stage2-guide.md', 'bootcamp/B12-foundry-advanced.md', 'bootcamp/B13-audit-1-notebox.md', 'bootcamp/B14-writing-findings.md', 'bootcamp/B15-audit-2-luckypot.md']],
  ['bc3', '阶段 3 渐入佳境', ['bootcamp/B16-stage3-guide.md', 'bootcamp/B17-defi-basics.md', 'bootcamp/B18-dex-amm.md', 'bootcamp/B19-audit-3-miniswap.md', 'bootcamp/B20-lending-cdp.md', 'bootcamp/B21-audit-4-flashdesk.md', 'bootcamp/B22-economics-governance.md', 'bootcamp/B23-complex-protocols.md', 'bootcamp/B24-defi-ctf.md', 'bootcamp/B25-capstone-minilend.md']],
  ['bc4', '阶段 4 独当一面', ['bootcamp/B26-stage4-guide.md', 'bootcamp/B27-what-is-audit.md', 'bootcamp/B28-bug-patterns.md', 'bootcamp/B29-why-audits-miss.md', 'bootcamp/B30-think-aloud.md', 'bootcamp/B31-automation-tools.md', 'bootcamp/B32-audit-5-echobridge.md', 'bootcamp/B33-audit-6-guardvault.md']],
  ['bc5', '阶段 5 庖丁解牛', ['bootcamp/B34-stage5-guide.md', 'bootcamp/B35-case-method.md', 'bootcamp/B36-case-uniswap-v2.md', 'bootcamp/B37-clamm-v4.md', 'bootcamp/B38-case-aave-v3.md', 'bootcamp/B39-case-lido.md', 'bootcamp/B40-case-safe.md', 'bootcamp/B41-case-erc4626.md', 'bootcamp/B42-perps.md', 'bootcamp/B43-audit-7-perplite.md']],
  ['bc6', '阶段 6 追本溯源', ['bootcamp/B44-stage6-guide.md', 'bootcamp/B45-yul-opcodes.md', 'bootcamp/B46-calldata-memory.md', 'bootcamp/B47-gas.md', 'bootcamp/B48-formal-verification.md']],
  ['bc7', '阶段 7 登堂入室', ['bootcamp/B49-stage7-guide.md', 'bootcamp/B50-solana-audit.md', 'bootcamp/B51-move-audit.md', 'bootcamp/B52-ai-assisted-audit.md', 'bootcamp/B53-contests-and-habits.md', 'bootcamp/B54-expert.md', 'bootcamp/B55-interview.md']],
  ['bl1', '链下 L1 守好家门', ['bootcamp/B56-offchain-l1-guide.md', 'bootcamp/B57-wallet-key-practice.md', 'bootcamp/B58-signing-phishing-practice.md', 'bootcamp/B59-social-engineering-practice.md', 'bootcamp/B60-account-access-security.md']],
  ['bl2', '链下 L2 固若金汤', ['bootcamp/B61-offchain-l2-guide.md', 'bootcamp/B62-frontend-supply-chain-practice.md', 'bootcamp/B63-node-rpc-practice.md', 'bootcamp/B64-custody-ops-ir-practice.md', 'bootcamp/B65-incident-response-practice.md', 'bootcamp/B66-tracing-privacy-practice.md', 'bootcamp/B67-privacy-compliance-practice.md', 'bootcamp/B68-crypto-zk-bridge-practice.md', 'bootcamp/B69-zk-bridge-practice.md']],
['bl3', '链下 L3 运筹帷幄', ['bootcamp/B70-offchain-l3-guide.md', 'bootcamp/B71-control-matrix-practice.md', 'bootcamp/B72-withdrawal-risk-rules-practice.md', 'bootcamp/B73-detection-engineering-practice.md', 'bootcamp/B74-signing-policy-practice.md', 'bootcamp/B75-release-gate-practice.md', 'bootcamp/B76-tabletop-postmortem-practice.md', 'bootcamp/B77-security-architecture-capstone.md']],
['bl4', '链下 L3 纵深验收', ['bootcamp/B79-trading-replay-practice.md', 'bootcamp/B80-resumption-recovery-practice.md', 'bootcamp/B81-wallet-channel-recon-practice.md', 'bootcamp/B82-reserves-solvency-practice.md', 'bootcamp/B83-fraud-rules-casework-practice.md']],
  ['bax', '附录 · 与同道者行', ['bootcamp/B78-glossary-resources.md']],
  ['p1', '第一篇 · 全景与基础', ['01', '02', '03']],
  ['p2', '第二篇 · 合约代码层', ['04', '05', '06', '07']],
  ['p3', '第三篇 · DeFi 与协议层', ['08', '09', '10', '11', '12']],
  ['p4', '第四篇 · 非 EVM 与新范式', ['13', '14', '15']],
  ['p5', '第五篇 · 链与基础设施', ['16', '17', '30', '31']],
  ['p6', '第六篇 · 钱包、用户与运营', ['18', '19', '20', '21', '22', '23', '24', '25', '32']],
  ['p7', '第七篇 · AI 与前沿', ['26', '33']],
  ['p8', '第八篇 · 工程与复盘', ['27', '28', '29']],
  ['chain', '链专题 · 主流公链与 Rollup', 'chains'],
  ['asm', '评估篇 · 交易所 / DeFi / 上币尽调', 'assessment'],
  ['tpl', '评估模板', 'templates'],
  ['code', '示例合约', ['code/README.md']],
  ['xa', '01 · 通用底座', ['architecture/X00-coverage-map.md', 'architecture/X01-security-program-controls.md', 'architecture/X02-standards-compliance-map.md', 'architecture/X03-production-infra-security.md', 'architecture/X04-delivery-supply-chain.md', 'architecture/X05-detection-response-engineering.md', 'architecture/X06-resilience-validation.md', 'architecture/X07-threat-intel-ops.md', 'architecture/X08-people-security.md', 'architecture/X09-security-team-management.md']],
  ['xb', '02 · 交易所', ['architecture/X10-cex-architecture-overview.md', 'architecture/X11-cex-identity-account-access.md', 'architecture/X12-cex-asset-listing-market-access.md', 'architecture/X13-cex-trading-settlement-credit.md', 'architecture/X14-cex-wallet-treasury-payment.md', 'architecture/X15-cex-production-data.md', 'architecture/X16-cex-fraud-compliance-secops.md', 'architecture/X17-cex-identity-verification.md', 'architecture/X18-cex-identity-recovery-ops.md', 'architecture/X19-cex-listing-verification.md', 'architecture/X20-cex-listing-recovery-ops.md', 'architecture/X21-cex-trading-verification.md', 'architecture/X22-cex-trading-recovery-ops.md', 'architecture/X23-cex-treasury-verification.md', 'architecture/X24-cex-treasury-recovery-ops.md', 'architecture/X25-cex-production-verification.md', 'architecture/X26-cex-production-recovery-ops.md', 'architecture/X27-cex-fraud-verification.md', 'architecture/X28-cex-fraud-recovery-ops.md', 'architecture/X29-cex-ledger-wallet-handoff.md', 'architecture/X30-cex-reserves-solvency.md']],
  ['xc', '03 · 公链与项目方', ['architecture/X31-chain-foundation-client-ops.md', 'architecture/X32-l2-bridge-oracle-ops.md', 'architecture/X33-defi-project-ops.md', 'architecture/X34-stablecoin-rwa-issuer-ops.md', 'architecture/X35-staking-validator-ops.md', 'architecture/X36-disclosure-bounty-ops.md']],
  ['xd', '04 · 其他应用场景', ['architecture/X37-wallet-vendor-security.md', 'architecture/X38-custodian-security.md', 'architecture/X39-mobile-client-security.md', 'architecture/X40-tee-hsm-key-ceremony.md', 'architecture/X41-payment-otc-fiat-security.md', 'architecture/X42-market-maker-security.md', 'architecture/X43-agent-platform-security.md', 'architecture/X44-nft-gamefi-ops.md', 'architecture/X45-prediction-derivatives-ops.md', 'architecture/X46-restaking-lst-ops.md', 'architecture/X47-dao-governance-ops.md', 'architecture/X48-privacy-protocol-ops.md']],
];
// Old 合约安全学习手册 anchors -> new ids (old links keep working).
// Old anchors -> current ids (c..: 合约手册; r..: 第九篇, folded 2026-11-10; b..: bootcamp before sequential renumbering 2026-11-11). Targets must never be alias keys.
const ALIASES = { c01: 's01', c02: 's03', c03: 's04', c04: 's05', c05: 's06', c06: 's07', c07: 's08', c08: 's09', c09: 's10', c10: 's11', c11: 's12', c12: 's27', c13: 's28', r00: 'w00', r01: 'w00', r02: 'w03', r03: 'w06', r04: 'w14', r05: 'w10', r06: 'w17', r07: 'w18', r08: 'w20', r09: 'w17', r10: 'w36', r11: 'w10', r12: 'w46', r13: 'w49', r14: 'w22', r15: 'w23', r16: 'w55', r17: 'w28', r18: 'w32', r19: 'w36', r20: 'w37', r21: 'w39', r22: 'w40', r23: 'w41', r24: 'w42', r25: 'w25', r26: 'w56', r27: 'w57', r28: 'w75', r29: 'w52', r30: 'w53', r31: 'w54', b00: 'w00', b70: 'w01', b00b: 'w02', b24: 'w03', b01: 'w04', b02: 'w05', b03: 'w06', b71: 'w07', b04: 'w08', b05x: 'w09', b25: 'w10', b72: 'w11', b03b: 'w12', b07: 'w13', b06: 'w14', b08: 'w15', b73: 'w16', b26: 'w17', b27: 'w18', b09: 'w19', b28: 'w20', b10: 'w21', b30: 'w22', b31: 'w23', b25b: 'w24', b32: 'w25', b32b: 'w25', b74: 'w27', b05: 'w28', b20: 'w29', b21: 'w30', b23: 'w31', b33: 'w32', b11: 'w33', b12: 'w34', b75: 'w35', b34: 'w36', b35: 'w37', b19: 'w38', b36: 'w39', b37: 'w40', b38: 'w41', b39: 'w42', b17: 'w43', b18: 'w44', b76: 'w45', b13: 'w46', b13b: 'w46', b22: 'w48', b40: 'w49', b14: 'w50', b77: 'w51', b42: 'w52', b43: 'w53', b44: 'w54', b15: 'w55', b16: 'w56', b41: 'w57', b78: 'w58', b46: 'w59', b47: 'w60', b47b: 'w60', b50: 'w62', b50b: 'w63', b79: 'w64', b48: 'w65', b48b: 'w65', b49: 'w67', b49b: 'w67', b51: 'w69', b51b: 'w70', b52: 'w71', b52b: 'w72', b53: 'w73', b53b: 'w74', b45: 'w75', b05b: 'w09', b29: 'w17', s16b: 's16', s17b: 's17', s23b: 's23', s29b: 's29', s30b: 's30', k00b: 'k00', w26: 'w25', w47: 'w46', w61: 'w60', w66: 'w65', w68: 'w67' , x07: 'y10', x08: 'y11', x09: 'y12', x10: 'y13', x11: 'y14', x12: 'y15', x13: 'y16', x14: 'y17', x15: 'y18', x16: 'y19', x17: 'y20', x18: 'y21', x19: 'y22', x20: 'y23', x21: 'y24', x22: 'y25', x23: 'y26', x24: 'y27', x25: 'y28', x26: 'y29', x27: 'y30', x28: 'y31', x29: 'y32', x30: 'y33', x31: 'y34', x32: 'y35', x33: 'y36', x34: 'y37', x35: 'y38', x36: 'y41', x37: 'y42', x38: 'y43', x39: 'y44', x40: 'y45', x41: 'y46', x42: 'y47', x43: 'y48', x44: 'y39', x45: 'y40', x46: 'y07', x47: 'y08', x48: 'y09' };
// Bootcamp ids are stable per file slug, so display numbers (B00, B01...) can be renumbered without moving progress. New chapters: add slug -> new unused id.
const BOOT_IDS = { 'trading-replay-practice': 'w84', 'resumption-recovery-practice': 'w85', 'wallet-channel-recon-practice': 'w86', 'reserves-solvency-practice': 'w87', 'fraud-rules-casework-practice': 'w88', 'offchain-l3-guide': 'w76', 'control-matrix-practice': 'w77', 'withdrawal-risk-rules-practice': 'w78', 'detection-engineering-practice': 'w79', 'signing-policy-practice': 'w80', 'release-gate-practice': 'w81', 'tabletop-postmortem-practice': 'w82', 'security-architecture-capstone': 'w83', 'account-access-security': 'w63', 'incident-response-practice': 'w70', 'privacy-compliance-practice': 'w72', 'zk-bridge-practice': 'w74', 'roadmap': 'w00', 'stage0-guide': 'w01', 'study-method': 'w02', 'blockchain-basics': 'w03', 'setup': 'w04', 'first-contract': 'w05', 'foundry-basics': 'w06', 'stage1-guide': 'w07', 'tokens-and-vault': 'w08', 'reading-code-mindset': 'w09', 'ctf-practice': 'w10', 'stage2-guide': 'w11', 'foundry-advanced': 'w12', 'audit-1-notebox': 'w13', 'writing-findings': 'w14', 'audit-2-luckypot': 'w15', 'stage3-guide': 'w16', 'defi-basics': 'w17', 'dex-amm': 'w18', 'audit-3-miniswap': 'w19', 'lending-cdp': 'w20', 'audit-4-flashdesk': 'w21', 'economics-governance': 'w22', 'complex-protocols': 'w23', 'defi-ctf': 'w24', 'capstone-minilend': 'w25', 'stage4-guide': 'w27', 'what-is-audit': 'w28', 'bug-patterns': 'w29', 'why-audits-miss': 'w30', 'think-aloud': 'w31', 'automation-tools': 'w32', 'audit-5-echobridge': 'w33', 'audit-6-guardvault': 'w34', 'stage5-guide': 'w35', 'case-method': 'w36', 'case-uniswap-v2': 'w37', 'clamm-v4': 'w38', 'case-aave-v3': 'w39', 'case-lido': 'w40', 'case-safe': 'w41', 'case-erc4626': 'w42', 'perps': 'w43', 'audit-7-perplite': 'w44', 'stage6-guide': 'w45', 'yul-opcodes': 'w46', 'calldata-memory': 'w48', 'gas': 'w49', 'formal-verification': 'w50', 'stage7-guide': 'w51', 'solana-audit': 'w52', 'move-audit': 'w53', 'ai-assisted-audit': 'w54', 'contests-and-habits': 'w55', 'expert': 'w56', 'interview': 'w57', 'offchain-l1-guide': 'w58', 'wallet-key-practice': 'w59', 'signing-phishing-practice': 'w60', 'social-engineering-practice': 'w62', 'offchain-l2-guide': 'w64', 'frontend-supply-chain-practice': 'w65', 'node-rpc-practice': 'w67', 'custody-ops-ir-practice': 'w69', 'tracing-privacy-practice': 'w71', 'crypto-zk-bridge-practice': 'w73', 'glossary-resources': 'w75' };
const OLD_FILES = {
  'chapters/02-evm-solidity-basics.md': 's03', 'chapters/03-reentrancy.md': 's04', 'chapters/04-access-control.md': 's05', 'chapters/05-arithmetic-precision.md': 's06',
  'chapters/06-external-calls-tokens.md': 's07', 'chapters/07-oracle-flashloan.md': 's08', 'chapters/08-mev-signatures.md': 's09', 'chapters/09-upgradeable-proxy.md': 's10',
  'chapters/10-defi-economic-security.md': 's11', 'chapters/11-cross-chain-bridges.md': 's12', 'chapters/12-audit-testing-workflow.md': 's27', 'chapters/13-incident-casebook.md': 's28',
  'architecture/X07-cex-architecture-overview.md': 'y10',
  'architecture/X08-cex-identity-account-access.md': 'y11',
  'architecture/X09-cex-asset-listing-market-access.md': 'y12',
  'architecture/X10-cex-trading-settlement-credit.md': 'y13',
  'architecture/X11-cex-wallet-treasury-payment.md': 'y14',
  'architecture/X12-cex-production-data.md': 'y15',
  'architecture/X13-cex-fraud-compliance-secops.md': 'y16',
  'architecture/X14-cex-identity-verification.md': 'y17',
  'architecture/X15-cex-identity-recovery-ops.md': 'y18',
  'architecture/X16-cex-listing-verification.md': 'y19',
  'architecture/X17-cex-listing-recovery-ops.md': 'y20',
  'architecture/X18-cex-trading-verification.md': 'y21',
  'architecture/X19-cex-trading-recovery-ops.md': 'y22',
  'architecture/X20-cex-treasury-verification.md': 'y23',
  'architecture/X21-cex-treasury-recovery-ops.md': 'y24',
  'architecture/X22-cex-production-verification.md': 'y25',
  'architecture/X23-cex-production-recovery-ops.md': 'y26',
  'architecture/X24-cex-fraud-verification.md': 'y27',
  'architecture/X25-cex-fraud-recovery-ops.md': 'y28',
  'architecture/X26-cex-ledger-wallet-handoff.md': 'y29',
  'architecture/X27-cex-reserves-solvency.md': 'y30',
  'architecture/X28-chain-foundation-client-ops.md': 'y31',
  'architecture/X29-l2-bridge-oracle-ops.md': 'y32',
  'architecture/X30-defi-project-ops.md': 'y33',
  'architecture/X31-stablecoin-rwa-issuer-ops.md': 'y34',
  'architecture/X32-staking-validator-ops.md': 'y35',
  'architecture/X33-disclosure-bounty-ops.md': 'y36',
  'architecture/X34-wallet-vendor-security.md': 'y37',
  'architecture/X35-custodian-security.md': 'y38',
  'architecture/X36-payment-otc-fiat-security.md': 'y41',
  'architecture/X37-market-maker-security.md': 'y42',
  'architecture/X38-agent-platform-security.md': 'y43',
  'architecture/X39-nft-gamefi-ops.md': 'y44',
  'architecture/X40-prediction-derivatives-ops.md': 'y45',
  'architecture/X41-restaking-lst-ops.md': 'y46',
  'architecture/X42-dao-governance-ops.md': 'y47',
  'architecture/X43-privacy-protocol-ops.md': 'y48',
  'architecture/X44-mobile-client-security.md': 'y39',
  'architecture/X45-tee-hsm-key-ceremony.md': 'y40',
  'architecture/X46-threat-intel-ops.md': 'y07',
  'architecture/X47-people-security.md': 'y08',
  'architecture/X48-security-team-management.md': 'y09',
};
const LABS = [
  ['storage-proxy-lab', '存储布局与 delegatecall'], ['reentrancy-lab', '重入攻击单步模拟器'], ['vault-inflation-lab', '金库通胀攻击'],
  ['oracle-manipulation-lab', '闪电贷操纵预言机'], ['signature-replay-lab', '签名与重放'], ['chain-porting-lab', '链迁移风险检查器'],
  ['phishing-signature-lab', '钓鱼签名识别'], ['address-poisoning-lab', '地址投毒比对'], ['wallet-scheme-lab', '钱包方案对比器'],
  ['incident-explorer', '事故浏览器'], ['severity-calculator', '风险评级计算器'], ['listing-scorecard', '上币尽调评分卡'],
  ['bootcamp-quiz', '训练营阶段测验'], ['perp-lab', '永续合约计算器'], ['severity-drill', '漏洞定级训练'], ['threat-model-lab', '威胁建模工作台'], ['certification-mock-exam', '综合自测与结业任务'],
  ['learning-paths', '学习路径导航'], ['zk-constraint-lab', 'ZK 约束不足实验'], ['confirmation-depth-lab', '确认深度实验'], ['rpc-quorum-lab', 'RPC 多源仲裁实验'], ['social-engineering-lab', '社工场景判断'], ['personal-risk-lab', '关键人员风险自评'], ['deanonymization-lab', '链上去匿名化实验'], ['incident-response-sim', 'Binance 式应急沙盘'], ['multisig-review-lab', '多签签前复核'],
  ['audit-hashchain', '哈希链篡改实验'], ['audit-fee1559', 'EIP-1559 手续费计算器'], ['audit-approve', 'approve 竞态时间线'], ['audit-overflow', '整数溢出与精度实验'], ['audit-frontrun', '抢跑攻击模拟'], ['audit-checklist', '审计自查清单'], ['audit-apy', 'APR / APY 计算器'], ['audit-amm', 'AMM 工作台'], ['audit-lending', '健康因子与利率模型'], ['audit-codewalk', '逐行源码讲解 UniswapV2Pair.swap'], ['audit-evm', 'EVM 单步执行器'], ['audit-abi', '选择器与槽位计算器'], ['audit-gas', 'Gas 优化对比器'], ['audit-spiral', '算法稳定币死亡螺旋'], ['audit-governance', '闪电贷治理攻击与防御'], ['audit-fuzz', '不变量模糊测试器'], ['audit-trace', '攻击交易调用树分析'], ['audit-merkle', 'Merkle 证明与验证者门限'], ['audit-capstone', 'MiniLend 审计练习台'], ['audit-v2k', 'K 值不变量检查器'], ['audit-hfmatrix', '入口 × 检查覆盖矩阵'], ['audit-steth', '份额与余额换算器'], ['audit-safetx', '多签交易签前复核面板'], ['audit-rounding', '取整方向判定器'],
  ['control-matrix-lab', '控制矩阵覆盖率'], ['risk-rule-tuning-lab', '风控规则调参'], ['signing-policy-lab', '签名请求独立校验'],
].filter(([f]) => fs.existsSync(path.join(ROOT, 'interactive', f + '.html')));

const idOf = file => {
  if (file === 'README.md') return 'home';
  if (file === 'docs/WRITING-GUIDE.md') return 'guide';
  if (file === 'code/README.md') return 'examples';
  let m;
  if ((m = file.match(/^chapters\/(\d\d[a-z]?)-/))) return 's' + m[1];
  if ((m = file.match(/^audit\/R(\d\d)-/))) return 'r' + m[1];
  if ((m = file.match(/^bootcamp\/B\d\d-(.+)\.md$/))) { if (!BOOT_IDS[m[1]]) throw new Error('add ' + m[1] + ' to BOOT_IDS'); return BOOT_IDS[m[1]]; }
  if ((m = file.match(/^architecture\/X(\d\d)-/))) return (+m[1] <= 6 ? 'x' : 'y') + m[1];
  if ((m = file.match(/^chains\/C(\d\d[a-z]?)-/))) return 'k' + m[1];
  if ((m = file.match(/^assessment\/A(\d\d)-/))) return 'a' + m[1];
  if ((m = file.match(/^templates\/T(\d\d)-/))) return 't' + m[1];
  throw new Error('no id for ' + file);
};
const top = fs.readdirSync(path.join(ROOT, 'chapters')).filter(f => /^\d\d[a-z]?-.*\.md$/.test(f)).map(f => 'chapters/' + f);
const filesFor = spec => typeof spec === 'string'
  ? fs.readdirSync(path.join(ROOT, spec)).filter(f => f.endsWith('.md')).sort().map(f => spec + '/' + f)
  : spec.map(x => /^\d\d[a-z]?$/.test(x) ? top.find(f => f.startsWith('chapters/' + x + '-')) : x).map(f => { if (!f) throw new Error('missing chapter in ' + spec); return f; });

// 目录的两个父分类
const NAV_PARTS = { camp: 'Web3 安全训练营', know: 'Web3 安全知识', arch: 'Web3 安全架构与运营' };
const nav = [], order = [];
for (const [key, name, spec] of NAV) {
  const files = filesFor(spec);
  const part = key === 'start' ? null : /^(bcr|bc\d|bl\d|bax)$/.test(key) ? 'camp' : /^x[a-e]$/.test(key) ? 'arch' : 'know';
  nav.push({ key, name, part, full: part ? NAV_PARTS[part] + (name ? ' · ' + name : '') : name, items: files.map(idOf) });
  for (const f of files) order.push([f, key]);
}
const mdMap = {};
for (const [f] of order) mdMap[f] = idOf(f);
mdMap['chains/'] = 'k00';
const linkMap = { ...mdMap };
for (const [old, id] of Object.entries(OLD_FILES)) mdMap[old] = id;

const docs = {};
for (const [file, group] of order) {
  let md = rd(file);
  if (file === 'code/README.md') {
    md += '\n\n## 源码\n';
    for (const f of fs.readdirSync(path.join(EXAMPLES, 'snippets')).filter(f => f.endsWith('.sol')).sort())
      md += `\n### ${f}\n\n\`\`\`solidity\n${rd('code/snippets/' + f).trimEnd()}\n\`\`\`\n`;
    for (const sub of ['foundry-demos/src', 'foundry-demos/test'].concat(fs.existsSync(path.join(EXAMPLES, 'ranges')) ? fs.readdirSync(path.join(EXAMPLES, 'ranges')).flatMap(p => ['ranges/' + p + '/src', 'ranges/' + p + '/test']) : [])) {
      if (!fs.existsSync(path.join(EXAMPLES, sub))) continue;
      for (const f of fs.readdirSync(path.join(EXAMPLES, sub)).filter(f => f.endsWith('.sol')).sort())
        md += `\n### ${sub}/${f}\n\n\`\`\`solidity\n${rd('code/' + sub + '/' + f).trimEnd()}\n\`\`\`\n`;
    }
  }
  const id = idOf(file);
  docs[id] = { id, file, title: titleOf(md), group, html: convert(md, file, linkMap) };
  if (/🚧 本(章|模板)编写中/.test(md)) docs[id].draft = true;
}
// Topic graph: every chapter in a topic gets a generated learning-loop card (tools/topics.json).
if (fs.existsSync(path.join(ROOT, 'tools/topics.json'))) {
  const T = JSON.parse(rd('tools/topics.json'));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const short = id => (docs[id] ? docs[id].title.replace(/[：:].*$/, '') : id);
  const a = id => { if (!docs[id] && !/^lab-/.test(id)) throw new Error('topics.json: unknown doc ' + id); return `<a href="#${id}" data-nav="${id}">${esc(short(id))}</a>`; };
  const labA = id => { const f = id.replace(/^lab-/, ''); if (!LABS.find(([x]) => x === f)) throw new Error('topics.json: unknown lab ' + id); return `<a href="#${id}" data-nav="${id}" class="lab-link">${esc(LABS.find(([x]) => x === f)[1])}</a>`; };
  const ext = c => `<a href="${c.url}" target="_blank" rel="noopener">${esc(c.name)}</a>`;
  for (const t of T.topics) {
    const row = (k, v) => v ? `<dt>${k}</dt><dd>${v}</dd>` : '';
    for (const id of t.chapters) {
      if (!docs[id]) throw new Error('topics.json: unknown chapter ' + id);
      const others = t.chapters.filter(x => x !== id);
      docs[id].html += `<aside class="loop-card"><h3>学习闭环 · ${esc(t.title)}</h3><dl>` +
        row('相关讲解', others.map(a).join('')) +
        row('动手实验', (t.labs || []).map(labA).join('')) +
        row('代码靶场', (t.code || []).length ? `<a href="#examples" data-nav="examples">${(t.code).map(esc).join('、')}</a>` : '') +
        row('真实案例', (t.cases || []).map(c => c.url ? ext(c) : a(c.id)).join('')) +
        row('审计落地', (t.audit || []).map(a).join('')) + '</dl></aside>';
    }
  }
}
// 知识讲解幻灯：media/decks/skeuo/chNN/（拟物化）和 media/decks/3b1b/chNN.html（3b1b 风格）由视频工程生成
// （media/video/{skeuo,3b1b}/tools/make_deck.py）。顶栏右上角「▶ Slides」打开全屏幻灯播放器（shell-tail.html 的 slides），
// 两套风格用标签切换。旧的独立页 vNN / dNN 经 ALIASES 跳回章节并打开播放器。
const DECKS = [];
{
  const skeuo = fs.existsSync(path.join(MEDIA, 'decks/skeuo')) ? fs.readdirSync(path.join(MEDIA, 'decks/skeuo')).filter(d => /^ch\d\d$/.test(d)).map(d => d.slice(2)) : [];
  const b3 = fs.existsSync(path.join(MEDIA, 'decks/3b1b')) ? fs.readdirSync(path.join(MEDIA, 'decks/3b1b')).filter(f => /^ch\d\d\.html$/.test(f)).map(f => f.slice(2, 4)) : [];
  for (const n of [...new Set([...skeuo, ...b3])].sort()) {
    const sid = 's' + n, ch = docs[sid];
    if (!ch) throw new Error('deck ch' + n + ' has no chapter ' + sid);
    const d = { id: sid };
    if (skeuo.includes(n)) { d.skeuo = `decks/skeuo/ch${n}/index.html`; ALIASES['v' + n] = sid; }
    if (b3.includes(n)) { d['3b1b'] = `decks/3b1b/ch${n}.html`; ALIASES['d' + n] = sid; }
    DECKS.push(d);
  }
}
const DATA = { parts: NAV_PARTS,
  docs, nav,
  labs: LABS.map(([f, title]) => ({ id: 'lab-' + f, file: f + '.html', title })),
  mdMap: Object.fromEntries(Object.entries(mdMap).map(([k, v]) => ['../' + k, v])),
  aliases: ALIASES,
  decks: DECKS,
};
const json = JSON.stringify(DATA).replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
const page = fs.readFileSync(path.join(ROOT, 'tools/shell-head.html'), 'utf8') + 'const DATA = ' + json + fs.readFileSync(path.join(ROOT, 'tools/shell-tail.html'), 'utf8');
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), page);
const skel = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n';
fs.writeFileSync(path.join(ROOT, 'preview.html'), skel + page.replace(/src=\\"decks\//g, 'src=\\"../media/decks/'));  // 预览页在 handbook/ 下，幻灯在 media/decks/
console.log(`docs ${Object.keys(docs).length} (draft ${Object.values(docs).filter(d => d.draft).length}), labs ${DATA.labs.length}, ${(page.length / 1024).toFixed(0)} KB`);
