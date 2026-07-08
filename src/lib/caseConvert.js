function snakeToCamel(str) {
  return str.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
}

export function rowToCamel(row) {
  if (Array.isArray(row)) return row.map(rowToCamel)
  if (row === null || typeof row !== 'object') return row
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [snakeToCamel(k), v]))
}

export function toSnakeRow(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [camelToSnake(k), v]))
}
