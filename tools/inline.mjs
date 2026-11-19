import fs from 'fs'; import path from 'path'
const [dist, out] = process.argv.slice(2)
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, (_, src) => {
  const js = fs.readFileSync(path.join(dist, src), 'utf8').replace(/<\/script/g, '<\\/script')
  return `<script type="module">${js}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, (_, href) =>
  `<style>${fs.readFileSync(path.join(dist, href), 'utf8')}</style>`)
html = html.replace(/<link rel="icon"[^>]*>/, () => {
  const f = path.join(dist, 'favicon.svg'); if (!fs.existsSync(f)) return ''
  return `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${fs.readFileSync(f).toString('base64')}">`
})
html = html.replace(/^<!doctype html>/i, '<!DOCTYPE html>')
if (!html.startsWith('<!DOCTYPE html>')) html = '<!DOCTYPE html>\n' + html
if (/src="\/assets|href="\/assets/.test(html)) throw new Error('unresolved asset')
fs.writeFileSync(out, html)
