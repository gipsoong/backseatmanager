// Screen check of the built page (npm run build:artifact first): node tools/audit.cjs [widths…]
// Loads the start screen at each width and lists horizontal scroll, touch targets under 40px and
// console errors. For deeper screens, script the clicks you need on top of `check`.
const { chromium } = require('playwright')
const http = require('http'), fs = require('fs'), path = require('path')
const page = path.join(__dirname, '..', 'matchday-build.html')
const widths = process.argv.slice(2).map(Number).filter(Boolean)
;(async () => {
  const server = http.createServer((_, res) => { res.setHeader('content-type', 'text/html'); res.end(fs.readFileSync(page)) }).listen(0)
  const url = `http://localhost:${server.address().port}/`
  const b = await chromium.launch()
  for (const w of widths.length ? widths : [390, 900, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } })
    const errs = []
    p.on('pageerror', (e) => errs.push(String(e)))
    p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    await p.goto(url); await p.waitForSelector('button')
    const r = await p.evaluate(() => {
      const small = []
      for (const el of document.querySelectorAll('button, a, select, input, [role=tab]')) {
        const b = el.getBoundingClientRect()
        if (b.width && b.height && b.height < 40 && b.width < 200) small.push((el.innerText || el.getAttribute('aria-label') || '').slice(0, 25) + ':' + Math.round(b.height))
      }
      return { scroll: document.documentElement.scrollWidth - innerWidth, small: [...new Set(small)].slice(0, 12) }
    })
    console.log(w, JSON.stringify({ ...r, errors: errs }))
    await p.close()
  }
  await b.close(); server.close()
})()
