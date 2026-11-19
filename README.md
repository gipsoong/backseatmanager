# Matchday

A snappy, lightweight web football management game. See `CLAUDE.md` for the design brief and
`PROGRESS.md` for where things stand.

```sh
npm install
npm run dev                   # app shell (Vite)
npm test                      # engine tests, incl. full headless matches through the consistency harness
npm run sim -- 42             # one headless match (seed 42): result, stats, invariant violations
npm run sim -- 42 --events    # ... plus key events
npm run typecheck && npm run lint
```
