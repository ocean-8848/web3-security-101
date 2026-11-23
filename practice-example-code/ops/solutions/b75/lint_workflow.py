#!/usr/bin/env python3
"""B75 参考实现：GitHub Actions workflow 静态 linter（只用标准库）。

用法（从 web3-security-handbook/ 根出发）：
  python3 practice-example-code/ops/solutions/b75/lint_workflow.py FILE [FILE ...] [--json] [--lockfile LOCK]
退出码：有 HIGH 发现 -> 1；否则 0。

说明：这不是完整的 YAML 解析器，只按缩进与正则读 workflow。它够用在本靶场的三份文件上；
真实项目请改用 zizmor 等成熟工具，本脚本的价值是让你看清每条规则在查什么。
"""
import argparse, json, re, sys

SHA = re.compile(r"^[0-9a-f]{40}$")
OFFICIAL = {"actions", "github"}
MUTABLE = {"main", "master", "latest", "head", "dev", "develop"}
PRIV_TRIGGERS = {"pull_request_target", "workflow_run"}
INJECT = re.compile(
    r"\$\{\{\s*(github\.event\.(?!repository\b)[\w.\[\]*-]+|github\.head_ref|inputs\.[\w-]+)\s*\}\}")
SAFE_TAIL = ("sha", "number", "id")
SIGN = re.compile(r"cosign\s+sign|sigstore/|attest|slsa|provenance|--provenance", re.I)
VERIFY = re.compile(r"cosign\s+verify|attestation\s+verify|npm\s+audit\s+signatures", re.I)
PUBLISH = re.compile(r"publish|deploy", re.I)


def clean(line):
    return re.sub(r"\s+#.*$", "", line.rstrip("\n")).rstrip()


def indent(s):
    return len(s) - len(s.lstrip(" "))


def load(path):
    out = []
    for i, raw in enumerate(open(path, encoding="utf-8"), 1):
        s = clean(raw)
        if s.strip() and not s.lstrip().startswith("#"):
            out.append((i, s))
    return out


def jobs_of(lines):
    """返回 {job名: (起始索引, 结束索引)}。"""
    res, cur, in_jobs = {}, None, False
    for k, (_, s) in enumerate(lines):
        if indent(s) == 0:
            if cur:
                res[cur[0]] = (cur[1], k)
                cur = None
            in_jobs = s.startswith("jobs:")
            continue
        if in_jobs and indent(s) == 2 and s.strip().endswith(":"):
            if cur:
                res[cur[0]] = (cur[1], k)
            cur = (s.strip()[:-1], k)
    if cur:
        res[cur[0]] = (cur[1], len(lines))
    return res


def run_texts(lines):
    """产出 (行号, 命令文本)，支持单行与 | 块。"""
    k = 0
    while k < len(lines):
        no, s = lines[k]
        m = re.match(r"^(\s*)(?:-\s+)?run:\s*(.*)$", s)
        if m:
            val = m.group(2).strip()
            if val in ("|", ">", "|-", ">-"):
                base = indent(s)
                k += 1
                while k < len(lines) and indent(lines[k][1]) > base:
                    yield lines[k][0], lines[k][1].strip()
                    k += 1
                continue
            yield no, val
        k += 1


def lint(path):
    lines = load(path)
    F = []
    def add(rule, sev, no, msg):
        F.append({"file": path, "line": no, "rule": rule, "severity": sev, "msg": msg})

    text = "\n".join(s for _, s in lines)
    triggers = {t for t in PRIV_TRIGGERS if re.search(r"\b%s\b" % t, text)}

    # R01 高权限触发器
    for no, s in lines:
        if re.search(r"\bpull_request_target\b", s):
            add("R01", "HIGH", no, "pull_request_target：在带密钥的上下文里运行外部 PR 触发的流程")

    # R02 权限
    has_perm = False
    for no, s in lines:
        if re.match(r"^\s*permissions:\s*write-all\s*$", s):
            add("R02", "HIGH", no, "permissions: write-all，权限过大；改为 contents: read 起步，按 job 加权限")
            has_perm = True
        elif re.match(r"^\s*permissions:", s):
            has_perm = True
    if not has_perm:
        add("R02", "MEDIUM", 1, "没有声明 permissions，令牌权限取决于仓库默认设置")

    jobs = jobs_of(lines)
    # R03 环境审批、R09 签名与验证：只查会发布的 job
    publishing = False
    for name, (a, b) in jobs.items():
        body = lines[a:b]
        pub = any(PUBLISH.search(t) for _, t in run_texts(body))
        if not pub:
            continue
        publishing = True
        env = [s for _, s in body if re.match(r"^\s{4}environment:", s)]
        if not env or re.match(r"^\s{4}environment:\s*(\"\"|''|)\s*$", env[0]):
            add("R03", "HIGH", lines[a][0], "job %s 会发布，但没有绑定带审批的 environment" % name)
    if publishing:
        has_sign, has_verify = bool(SIGN.search(text)), bool(VERIFY.search(text))
        if not has_sign and not has_verify:
            add("R09", "HIGH", 1, "发布流程里没有签名 / 来源证明，也没有发布前的验证")
        elif not has_verify:
            add("R09", "MEDIUM", 1, "有签名但没有发布前验证")

    # R04 Action 固定
    for no, s in lines:
        m = re.match(r"^\s*(?:-\s+)?uses:\s*([^\s@]+)@(\S+)\s*$", s)
        if not m or m.group(1).startswith("./"):
            continue
        action, ref = m.groups()
        if SHA.match(ref):
            continue
        owner = action.split("/")[0]
        if ref.lower() in MUTABLE:
            add("R04", "HIGH", no, "%s@%s：分支引用，随时可被改写" % (action, ref))
        elif owner in OFFICIAL:
            add("R04", "LOW", no, "%s@%s：官方 Action 用标签引用，标签可被移动" % (action, ref))
        else:
            add("R04", "HIGH", no, "%s@%s：第三方 Action 没有固定到 40 位提交哈希" % (action, ref))

    # R05 在高权限触发器里检出不可信代码
    for no, s in lines:
        if triggers and re.match(
                r"^\s*ref:\s*\$\{\{\s*github\.(event\.pull_request\.head\.(sha|ref)|head_ref)", s):
            add("R05", "HIGH", no, "高权限触发器下检出 PR 提交，外部代码会和密钥同处一个 job")

    # R06 安装方式、R07 脚本注入
    for no, t in run_texts(lines):
        if re.search(r"\b(npm\s+(install|i)|yarn\s+install|pnpm\s+install)\b", t) \
                and "--ignore-scripts" not in t and "--frozen-lockfile" not in t:
            add("R06", "HIGH", no, "`%s`：不按 lockfile 安装，且会执行依赖的安装脚本；改用 npm ci --ignore-scripts" % t)
        elif re.search(r"\bnpm\s+ci\b", t) and "--ignore-scripts" not in t:
            add("R06", "LOW", no, "`%s`：npm ci 没有加 --ignore-scripts，安装脚本会执行" % t)
        for m in INJECT.finditer(t):
            expr = m.group(1)
            if expr.endswith(SAFE_TAIL):
                continue
            add("R07", "HIGH", no, "run 里直接展开 ${{ %s }}；先放进 env 再引用" % expr)

    # R08 长期凭证
    oidc = re.search(r"id-token:\s*write", text) is not None
    for no, s in lines:
        m = re.search(r"secrets\.([A-Z0-9_]+)", s)
        if m and re.search(r"TOKEN|KEY|PASSWORD|SECRET", m.group(1)) and m.group(1) != "GITHUB_TOKEN":
            add("R08", "MEDIUM" if oidc else "HIGH", no,
                "长期凭证 secrets.%s；改用 OIDC 换短期身份（permissions: id-token: write）" % m.group(1))
    return sorted(F, key=lambda x: (x["line"], x["rule"]))


def lint_lockfile(path):
    F = []
    pk = json.load(open(path)).get("packages", {})
    for name, v in pk.items():
        integ = v.get("integrity", "")
        if not v.get("version") or not re.match(r"^sha(256|384|512)-", integ):
            F.append({"file": path, "line": 0, "rule": "L01", "severity": "HIGH",
                      "msg": "%s 缺少版本或 integrity" % name})
    return F, len(pk)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--lockfile")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    allf = []
    for f in a.files:
        r = lint(f)
        allf += r
        if not a.json:
            for x in r:
                print("%s:%d %s %-6s %s" % (x["file"].split("/")[-1], x["line"], x["rule"], x["severity"], x["msg"]))
            rules = sorted({x["rule"] for x in r})
            print("== %s：%d 条发现，覆盖规则 %d 个 %s\n" % (f.split("/")[-1], len(r), len(rules), rules))
    if a.lockfile:
        r, n = lint_lockfile(a.lockfile)
        allf += r
        if not a.json:
            print("== lockfile：%d 个依赖，%d 条发现" % (n, len(r)))
    if a.json:
        print(json.dumps(allf, ensure_ascii=False, indent=1))
    sys.exit(1 if any(x["severity"] == "HIGH" for x in allf) else 0)


if __name__ == "__main__":
    main()
