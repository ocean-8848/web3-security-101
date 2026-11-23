#!/usr/bin/env python3
"""把 data/ 装载成 SQLite：python3 code/offchain-ops/lib/load_sqlite.py [--db 路径]"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mini  # noqa: E402

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument("--db", default=mini.DB_PATH)
a = ap.parse_args()
print("装载到", a.db)
mini.build_db(a.db)
