#!/bin/bash
# Builds the playable single-file page (matchday-build.html, git-ignored) that's published as the
# Claude Artifact: a copy of the repo with the sim worker inlined, a Vite build, then JS, CSS and the
# favicon inlined into one HTML file that starts with <!DOCTYPE html>.  npm run build:artifact
set -e
SRC=$(cd "$(dirname "$0")/.." && pwd)
B=$(mktemp -d)
trap 'rm -rf "$B"' EXIT
(cd "$SRC" && tar cf - --exclude=./node_modules --exclude=./.git --exclude=./dist --exclude=./matchday-build.html .) | (cd "$B" && tar xf -)
ln -s "$SRC/node_modules" "$B/node_modules"
cd "$B"
# Workers can't load a second file from an artifact: inline the sim worker into the bundle.
sed -i "s#new Worker(new URL('./simWorker.ts', import.meta.url), { type: 'module' })#new SimWorker()#" src/season/simulate.ts
sed -i "1i import SimWorker from './simWorker.ts?worker\&inline'" src/season/simulate.ts
grep -q "new SimWorker()" src/season/simulate.ts
npx vite build --logLevel warn
node "$SRC/tools/inline.mjs" "$B/dist" "$SRC/matchday-build.html"
ls -la "$SRC/matchday-build.html"
