#!/usr/bin/env bash
# Radix / セマンティックトークン前提: border 系を文字色や「塗りで線」に流用しない（CLAUDE.md 参照）
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

bad=0
while IFS= read -r -d '' f; do
  if grep -nE 'text-border-' "$f" 2>/dev/null; then
    echo >&2 "check-color-semantics: text-border-* in $f (use text-fg-* / text-accent for text)"
    bad=1
  fi
  if grep -nE 'bg-border-' "$f" 2>/dev/null; then
    echo >&2 "check-color-semantics: bg-border-* in $f (use border / border-* for hairlines)"
    bad=1
  fi
done < <(find src \( -name '*.astro' -o -name '*.css' \) -print0)

if [[ "$bad" -ne 0 ]]; then
  exit 1
fi

echo "check-color-semantics: OK"
