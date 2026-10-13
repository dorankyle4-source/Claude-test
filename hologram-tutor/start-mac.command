#!/bin/bash
# Double-click this file in Finder to launch Hologram Tutor.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install it with:  brew install node"
  read -r -p "Press Enter to close."
  exit 1
fi

[ -d node_modules ] || npm install
[ -f .env ] || { cp .env.example .env; echo "Created .env - add your ANTHROPIC_API_KEY to it, then relaunch."; }

PORT=$(grep -E '^PORT=' .env | cut -d= -f2)
(sleep 1.5 && open "http://localhost:${PORT:-3000}") &
npm start
