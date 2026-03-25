// Scriptable Lock Screen Widget
// Accessory Rectangular
// Auto refresh enabled

const jsonUrl = "https://kurikazu2011.github.io/Mastercard-Currency-Opportunity-Checker-Kazu-K-/latest_rates.json"
const targetPair = "USD/JPY"

async function loadData() {
  const req = new Request(jsonUrl)
  return await req.loadJSON()
}

function findPair(data, pair) {
  if (Array.isArray(data)) return data.find(item => item.pair === pair)
  if (data.rates && Array.isArray(data.rates)) return data.rates.find(item => item.pair === pair)
  if (data.pair === pair) return data
  return null
}

const raw = await loadData()
const item = findPair(raw, targetPair)

const w = new ListWidget()
w.backgroundColor = new Color("#111111")

// 🔥 自動更新（5分後に再取得リクエスト）
w.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000)

if (!item) {
  const err = w.addText("Pair not found")
  err.font = Font.systemFont(16)
  err.textColor = Color.white()
  Script.setWidget(w)
  Script.complete()
  return
}

const pair = item.pair
const mc = Number(item.mastercard_rate).toFixed(2)
const mkt = Number(item.market_rate).toFixed(2)

let diffValue
if (item.diff_percent !== undefined) {
  diffValue = Number(item.diff_percent)
} else {
  diffValue = ((Number(item.mastercard_rate) - Number(item.market_rate)) / Number(item.market_rate)) * 100
}

const diff = `${diffValue >= 0 ? "+" : ""}${diffValue.toFixed(2)}%`
const better = item.better_rate !== undefined ? Boolean(item.better_rate) : diffValue < 0

const goodColor = new Color("#22c55e")
const neutralColor = new Color("#9ca3af")
const white = Color.white()

if (config.runsInAccessoryWidget) {

  // ===== 1行目 =====
  const row1 = w.addStack()
  row1.layoutHorizontally()
  row1.centerAlignContent()

  const pairText = row1.addText(pair)
  pairText.font = Font.boldSystemFont(18)
  pairText.textColor = white

  row1.addSpacer()

  const statusText = row1.addText(better ? "YES" : "NO")
  statusText.font = better ? Font.boldSystemFont(18) : Font.systemFont(18)
  statusText.textColor = better ? goodColor : neutralColor

  w.addSpacer(4)

  // ===== 2行目 =====
  const row2 = w.addStack()
  row2.layoutHorizontally()
  row2.centerAlignContent()

  const mcLabel = row2.addText("MC:")
  mcLabel.font = Font.mediumSystemFont(15)
  mcLabel.textColor = white

  row2.addSpacer(6)

  const mcValue = row2.addText(mc)
  mcValue.font = Font.mediumSystemFont(15)
  mcValue.textColor = white

  row2.addSpacer(10)

  const diffText = row2.addText(`(${diff})`)
  diffText.font = Font.mediumSystemFont(15)
  diffText.textColor = better ? goodColor : neutralColor

  w.addSpacer(2)

  // ===== 3行目 =====
  const row3 = w.addStack()
  row3.layoutHorizontally()
  row3.centerAlignContent()

  const mktLabel = row3.addText("MKT:")
  mktLabel.font = Font.mediumSystemFont(15)
  mktLabel.textColor = white

  row3.addSpacer(2)

  const mktValue = row3.addText(mkt)
  mktValue.font = Font.mediumSystemFont(15)
  mktValue.textColor = white

} else {
  const fallback = w.addText(
    `${pair}   ${better ? "YES" : "NO"}\nMC: ${mc} (${diff})\nMKT:${mkt}`
  )
  fallback.font = Font.systemFont(15)
  fallback.textColor = white
}

Script.setWidget(w)
Script.complete()