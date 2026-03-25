// Scriptable Lock Screen Widget
// Accessory Rectangular
// 3-line compact version

const jsonUrl = "https://kurikazu2011.github.io/Mastercard-Currency-Opportunity-Checker-Kazu-K-/latest_rates.json"

// 表示したい通貨ペア
const targetPair = "USD/JPY"

async function loadData() {
  const req = new Request(jsonUrl)
  return await req.loadJSON()
}

function findPair(data, pair) {
  if (Array.isArray(data)) {
    return data.find(item => item.pair === pair)
  }
  if (data.rates && Array.isArray(data.rates)) {
    return data.rates.find(item => item.pair === pair)
  }
  if (data.pair === pair) {
    return data
  }
  return null
}

const raw = await loadData()
const item = findPair(raw, targetPair)

const w = new ListWidget()
w.backgroundColor = new Color("#111111")

if (!item) {
  const err = w.addText("Pair not found")
  err.font = Font.systemFont(12)
  err.textColor = Color.white()
  Script.setWidget(w)
  Script.complete()
  return
}

const pair = item.pair
const mc = Number(item.mastercard_rate).toFixed(2)
const mkt = Number(item.market_rate).toFixed(2)

// diff_percent があればそれを使う。なければ計算
let diffValue
if (item.diff_percent !== undefined) {
  diffValue = Number(item.diff_percent)
} else {
  diffValue = ((Number(item.mastercard_rate) - Number(item.market_rate)) / Number(item.market_rate)) * 100
}

const diff = `${diffValue >= 0 ? "+" : ""}${diffValue.toFixed(2)}%`

// better_rate があればそれを使う。なければ diff から判定
const better = item.better_rate !== undefined ? Boolean(item.better_rate) : diffValue < 0

if (config.runsInAccessoryWidget) {
  const title = w.addText(pair)
  title.font = Font.boldSystemFont(14)
  title.textColor = Color.white()

  w.addSpacer(2)

  const rates = w.addText(`MC ${mc}  MKT ${mkt}`)
  rates.font = Font.systemFont(11)
  rates.textColor = Color.white()

  w.addSpacer(2)

  const row = w.addStack()
  row.layoutHorizontally()

  const left = row.addText(diff)
  left.font = Font.mediumSystemFont(12)
  left.textColor = better ? new Color("#22c55e") : new Color("#9ca3af")

  row.addSpacer()

  const right = row.addText(better ? "YES" : "NO")
  right.font = better ? Font.boldSystemFont(12) : Font.systemFont(12)
  right.textColor = better ? new Color("#22c55e") : new Color("#9ca3af")
} else {
  const fallback = w.addText(`${pair}\nMC ${mc}  MKT ${mkt}\n${diff}   ${better ? "YES" : "NO"}`)
  fallback.font = Font.systemFont(12)
  fallback.textColor = Color.white()
}

Script.setWidget(w)
Script.complete()