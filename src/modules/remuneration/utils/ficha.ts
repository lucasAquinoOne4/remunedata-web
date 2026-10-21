export interface FichaRow {
  label: string
  value: string
}

export interface FichaSection {
  title: string
  rows: FichaRow[]
}

export function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .toLowerCase()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
}

function formatValue(v: string | number | boolean): string {
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
  return String(v)
}

const MAX_SECTIONS = 12
const MAX_ARRAY_ITEMS = 10

function collectRows(obj: Record<string, unknown>): FichaRow[] {
  const rows: FichaRow[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (isPrimitive(v) && String(v).trim() !== '') {
      rows.push({ label: humanizeKey(k), value: formatValue(v) })
    } else if (Array.isArray(v) && v.length > 0 && v.every(isPrimitive)) {
      rows.push({ label: humanizeKey(k), value: v.map(formatValue).join(', ') })
    }
  }
  return rows
}

/**
 * Converte a ficha federal (estrutura livre) em seções legíveis: valores simples viram
 * "Dados gerais"; objetos e listas de objetos viram seções próprias. O restante é ignorado.
 */
export function buildFichaSections(ficha: Record<string, unknown> | null | undefined): FichaSection[] {
  if (!ficha || typeof ficha !== 'object') return []
  const sections: FichaSection[] = []

  const general = collectRows(ficha)
  if (general.length) sections.push({ title: 'Dados gerais', rows: general })

  for (const [k, v] of Object.entries(ficha)) {
    if (sections.length >= MAX_SECTIONS) break
    const title = humanizeKey(k)
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const rows = collectRows(v as Record<string, unknown>)
      if (rows.length) sections.push({ title, rows })
    } else if (Array.isArray(v) && v.length > 0 && v.every((x) => x && typeof x === 'object')) {
      v.slice(0, MAX_ARRAY_ITEMS).forEach((item, i) => {
        const rows = collectRows(item as Record<string, unknown>)
        if (rows.length && sections.length < MAX_SECTIONS) {
          sections.push({ title: v.length > 1 ? `${title} #${i + 1}` : title, rows })
        }
      })
    }
  }
  return sections
}
