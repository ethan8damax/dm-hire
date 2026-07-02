import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './DataTable.css'

// columns: [{ key, label, sortable, render(row) }]
export default function DataTable({ columns, rows, keyField = 'id', onRowClick }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  function toggleSort(col) {
    if (!col.sortable) return
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col.key)
      setSortDir('asc')
    }
  }

  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av === bv) return 0
        const dir = sortDir === 'asc' ? 1 : -1
        return av > bv ? dir : -dir
      })
    : rows

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={col.sortable ? 'sortable' : ''}
              onClick={() => toggleSort(col)}
            >
              <span className="th-inner">
                {col.label}
                {col.sortable && sortKey === col.key && (
                  sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => (
          <tr key={row[keyField]} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => (
              <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
