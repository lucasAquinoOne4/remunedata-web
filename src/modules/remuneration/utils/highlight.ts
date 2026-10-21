export interface HighlightPart {
  text: string
  match: boolean
}

/** Remove acentos e coloca em minúsculas, mantendo o mapa de índices do texto original. */
function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = ''
  const map: number[] = []
  let i = 0
  for (const ch of text) {
    const base = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    for (let k = 0; k < base.length; k++) map.push(i)
    folded += base
    i += ch.length
  }
  return { folded, map }
}

export function foldText(text: string): string {
  return foldWithMap(text).folded
}

/**
 * Divide o texto em trechos, marcando os que contêm o termo buscado
 * (ignora acentos e caixa). Termos com várias palavras marcam cada palavra.
 */
export function highlightParts(text: string, term: string): HighlightPart[] {
  if (!text) return []
  const tokens = foldText(term)
    .split(/\s+/)
    .filter((t) => t.length >= 2)
  if (tokens.length === 0) return [{ text, match: false }]

  const { folded, map } = foldWithMap(text)
  const ranges: [number, number][] = []
  for (const token of tokens) {
    let from = 0
    while (from <= folded.length - token.length) {
      const idx = folded.indexOf(token, from)
      if (idx === -1) break
      const start = map[idx]
      const lastFolded = idx + token.length - 1
      const end = map[lastFolded] + (text.codePointAt(map[lastFolded])! > 0xffff ? 2 : 1)
      ranges.push([start, end])
      from = idx + 1
    }
  }
  if (ranges.length === 0) return [{ text, match: false }]

  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([r[0], r[1]])
  }

  const parts: HighlightPart[] = []
  let cursor = 0
  for (const [s, e] of merged) {
    if (s > cursor) parts.push({ text: text.slice(cursor, s), match: false })
    parts.push({ text: text.slice(s, e), match: true })
    cursor = e
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}
