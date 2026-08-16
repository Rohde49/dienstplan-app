#!/usr/bin/env bash
# Stop-Hook: erinnert an /doku-pflege, wenn seit der letzten Doku-Aenderung
# Code unter src/ oder e2e/ angefasst wurde, docs/ aber nicht.
#
# Blockiert NIE. Im Zweifel schweigt er und endet mit 0 — ein Hook, der das
# Beenden verhindert, wird nach dem dritten Mal umgangen.
#
# Regeln und Ablauf: docs/workflow/doku-pflege.md
set -uo pipefail

# stdin (Hook-Payload) verwerfen, wird hier nicht gebraucht
cat >/dev/null 2>&1 || true

projekt="${CLAUDE_PROJECT_DIR:-.}"
cd "$projekt" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# Der letzte Commit, der docs/ angefasst hat. Alles danach ist ungepflegt —
# sobald docs/ committet wird, leert sich der Bereich von selbst.
letzter_docs_commit=$(git log -1 --format=%H -- docs/ 2>/dev/null)

geaendert=$(
  {
    if [ -n "$letzter_docs_commit" ]; then
      git diff --name-only "$letzter_docs_commit"..HEAD 2>/dev/null
    fi
    git status --porcelain 2>/dev/null | cut -c4-
  } | sort -u
)

# Kein Code angefasst -> nichts zu melden
printf '%s\n' "$geaendert" | grep -qE '^(src/|e2e/)' || exit 0

# Doku wurde mitgezogen -> nichts zu melden
printf '%s\n' "$geaendert" | grep -qE '^docs/' && exit 0

anzahl=$(printf '%s\n' "$geaendert" | grep -cE '^(src/|e2e/)')

printf '{"continue":true,"systemMessage":"Doku-Erinnerung: %s Datei(en) unter src/ bzw. e2e/ geaendert, unter docs/ nichts. Falls die Aenderung dokumentationsrelevant ist: /doku-pflege aufrufen. Sonst ignorieren — dieser Hinweis blockiert nichts."}\n' "$anzahl"
exit 0
