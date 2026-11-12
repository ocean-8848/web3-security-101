#!/usr/bin/env python3
"""把 Markdown 审计报告转成 HTML 和 PDF。

用法：python build_report.py LunchPool-report.md
依赖：Python 包 markdown；本机安装 Chrome 或 Chromium。
"""
import pathlib
import re
import shutil
import subprocess
import sys

import markdown

HERE = pathlib.Path(__file__).resolve().parent
CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "chromium",
    "chromium-browser",
]


def find_chrome():
    for candidate in CHROME_CANDIDATES:
        path = shutil.which(candidate) or (candidate if pathlib.Path(candidate).exists() else None)
        if path:
            return path
    sys.exit("没有找到 Chrome 或 Chromium。HTML 已生成，可在浏览器中打印为 PDF。")


def check_summary(text):
    """核对摘要表的数量与正文的发现数量一致。"""
    found = re.findall(r"^### \[([HMLIG])-\d+\]", text, re.M)
    declared = dict(re.findall(r"^\| (高|中|低|信息|Gas) \| (\d+) \|", text, re.M))
    names = {"H": "高", "M": "中", "L": "低", "I": "信息", "G": "Gas"}
    errors = []
    for letter, name in names.items():
        actual = found.count(letter)
        if int(declared.get(name, -1)) != actual:
            errors.append(f"{name}: 摘要写 {declared.get(name)}，正文有 {actual}")
    if errors:
        sys.exit("摘要与正文不一致：" + "；".join(errors))
    return len(found)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = pathlib.Path(sys.argv[1]).resolve()
    text = source.read_text(encoding="utf-8")
    count = check_summary(text)

    title_match = re.search(r"^# (.+)$", text, re.M)
    title = title_match.group(1) if title_match else source.stem
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists"])
    page = (HERE / "template.html").read_text(encoding="utf-8")
    page = page.replace("{{title}}", title).replace("{{body}}", body)

    out_dir = HERE / "out"
    out_dir.mkdir(exist_ok=True)
    html_path = out_dir / f"{source.stem}.html"
    pdf_path = out_dir / f"{source.stem}.pdf"
    html_path.write_text(page, encoding="utf-8")

    subprocess.run(
        [find_chrome(), "--headless", "--disable-gpu", "--no-pdf-header-footer",
         f"--print-to-pdf={pdf_path}", html_path.as_uri()],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
    )
    print(f"findings: {count}")
    print(f"html: {html_path.relative_to(HERE)}")
    print(f"pdf:  {pdf_path.relative_to(HERE)} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
