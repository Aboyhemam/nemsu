import React, { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import '../../css/export.css'

// ─── API base — replace with your real URL ───────────────────
const API_BASE = 'https://nemsu-backend.onrender.com'  // e.g. https://nemsu-backend.onrender.com

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(n)

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtDateExcel = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

// ─── Export Logic ─────────────────────────────────────────────
function exportToExcel(records, filterType, dateFrom, dateTo) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: All Records ──
  const filtered = records.filter(r => {
    if (filterType !== 'All' && r.type !== filterType) return false
    if (dateFrom && new Date(r.date) < new Date(dateFrom)) return false
    if (dateTo   && new Date(r.date) > new Date(dateTo))   return false
    return true
  })

  const rows = filtered.map((r, i) => ({
    '#':           i + 1,
    'Date':        fmtDateExcel(r.date),
    'Title':       r.title,
    'Type':        r.type,
    'Amount (₹)':  r.amount,
    'Details':     r.detail || '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Column widths
  ws['!cols'] = [
    { wch: 4 },   // #
    { wch: 14 },  // Date
    { wch: 32 },  // Title
    { wch: 12 },  // Type
    { wch: 14 },  // Amount
    { wch: 36 },  // Details
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Finance Records')

  // ── Sheet 2: Summary ──
  const totalIn  = records.filter(r => r.type === 'Incoming').reduce((s, r) => s + r.amount, 0)
  const totalOut = records.filter(r => r.type === 'Outgoing').reduce((s, r) => s + r.amount, 0)
  const balance  = totalIn - totalOut

  const summaryRows = [
    { 'Metric': 'Total Records',         'Value': records.length },
    { 'Metric': 'Total Incoming (₹)',    'Value': totalIn },
    { 'Metric': 'Total Outgoing (₹)',    'Value': totalOut },
    { 'Metric': 'Net Balance (₹)',        'Value': balance },
    { 'Metric': 'Exported On',           'Value': new Date().toLocaleDateString('en-IN') },
    { 'Metric': 'Filter Applied',        'Value': filterType },
  ]

  const ws2 = XLSX.utils.json_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 24 }, { wch: 20 }]

  XLSX.utils.book_append_sheet(wb, ws2, 'Summary')

  // ── Download ──
  const timestamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `NEMSU_Finance_${timestamp}.xlsx`)
}

// ─── Main Page ────────────────────────────────────────────────
function ExportPage() {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported]   = useState(false)

  // Filters
  const [filterType, setFilterType] = useState('All')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [search, setSearch]         = useState('')

  // Fetch records on mount
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true); setError(null)
        const token = localStorage.getItem('nemsu_token')
        const res = await fetch(`${API_BASE}/finance/get`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setRecords(Array.isArray(data) ? data : data.data ?? data.records ?? [])
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally { setLoading(false) }
    }
    load()
    return () => controller.abort()
  }, [])

  // Filtered preview
  const preview = useMemo(() => {
    let list = [...records]
    if (filterType !== 'All') list = list.filter(r => r.type === filterType)
    if (dateFrom) list = list.filter(r => new Date(r.date) >= new Date(dateFrom))
    if (dateTo)   list = list.filter(r => new Date(r.date) <= new Date(dateTo))
    if (search.trim()) list = list.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.detail ?? '').toLowerCase().includes(search.toLowerCase())
    )
    return list.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [records, filterType, dateFrom, dateTo, search])

  // Summary stats of preview
  const totalIn  = preview.filter(r => r.type === 'Incoming').reduce((s, r) => s + r.amount, 0)
  const totalOut = preview.filter(r => r.type === 'Outgoing').reduce((s, r) => s + r.amount, 0)
  const balance  = totalIn - totalOut

  const handleExport = async () => {
    if (preview.length === 0) return
    setExporting(true)
    // Small delay for UX — gives the button animation time to play
    await new Promise(r => setTimeout(r, 600))
    exportToExcel(preview, filterType, dateFrom, dateTo)
    setExporting(false)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const clearFilters = () => {
    setFilterType('All')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  return (
    <div className="exportContainer">

      {/* ── Header ── */}
      <div className="exportHeader">
        <div className="exportHeaderLeft">
          <p className="exportLabel">Admin / Export</p>
          <h1 className="exportTitle">Export Datasheets</h1>
          <p className="exportSub">
            Filter records below, preview what will be exported, then download as an Excel file.
          </p>
        </div>

        {/* Export button */}
        <button
          className={`exportBtn ${exporting ? 'exportBtnLoading' : ''} ${exported ? 'exportBtnDone' : ''} ${preview.length === 0 ? 'exportBtnDisabled' : ''}`}
          onClick={handleExport}
          disabled={exporting || preview.length === 0}
        >
          {exporting ? (
            <><span className="exportSpinner" /> Generating…</>
          ) : exported ? (
            <><span className="exportCheckmark">✓</span> Downloaded!</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export {preview.length > 0 ? `(${preview.length})` : ''} to Excel
            </>
          )}
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="exportFilters">
        <div className="filterGroup">
          <label className="filterLabel">Search</label>
          <input className="filterInput" placeholder="Title or details…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Type</label>
          <div className="filterTypeBtns">
            {['All', 'Incoming', 'Outgoing'].map(t => (
              <button key={t}
                className={`filterTypeBtn ${filterType === t ? `filterTypeActive filterType${t}` : ''}`}
                onClick={() => setFilterType(t)}>
                {t === 'Incoming' ? '↑ ' : t === 'Outgoing' ? '↓ ' : ''}{t}
              </button>
            ))}
          </div>
        </div>

        <div className="filterGroup">
          <label className="filterLabel">From</label>
          <input className="filterInput filterDate" type="date"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>

        <div className="filterGroup">
          <label className="filterLabel">To</label>
          <input className="filterInput filterDate" type="date"
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        {(filterType !== 'All' || dateFrom || dateTo || search) && (
          <button className="clearFiltersBtn" onClick={clearFilters}>✕ Clear</button>
        )}
      </div>

      {/* ── Summary Strip ── */}
      {!loading && !error && (
        <div className="exportSummaryStrip">
          <div className="summaryChip">
            <span className="chipLabel">Records</span>
            <span className="chipValue">{preview.length}</span>
          </div>
          <div className="summaryChip chipIn">
            <span className="chipLabel">↑ Incoming</span>
            <span className="chipValue chipValueIn">{fmt(totalIn)}</span>
          </div>
          <div className="summaryChip chipOut">
            <span className="chipLabel">↓ Outgoing</span>
            <span className="chipValue chipValueOut">{fmt(totalOut)}</span>
          </div>
          <div className={`summaryChip ${balance >= 0 ? 'chipIn' : 'chipOut'}`}>
            <span className="chipLabel">Net Balance</span>
            <span className={`chipValue ${balance >= 0 ? 'chipValueIn' : 'chipValueOut'}`}>
              {fmt(balance)}
            </span>
          </div>
        </div>
      )}

      {/* ── Preview Table ── */}
      <div className="exportTableSection">
        <div className="exportTableHeader">
          <p className="exportTableTitle">
            Preview
            <span className="exportTableCount">{preview.length} records</span>
          </p>
          <p className="exportTableHint">This is exactly what will be exported to the Excel file.</p>
        </div>

        {loading && (
          <div className="exportTableWrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="exportSkeletonRow" style={{ '--i': i }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="exportStateBox">
            <span className="exportStateIcon exportStateErr">⚠</span>
            <h3 className="exportStateTitle">Failed to load records</h3>
            <p className="exportStateMsg">{error}</p>
            <button className="exportRetryBtn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && preview.length === 0 && (
          <div className="exportStateBox">
            <span className="exportStateIcon">◈</span>
            <h3 className="exportStateTitle">No records match</h3>
            <p className="exportStateMsg">Try adjusting your filters.</p>
          </div>
        )}

        {!loading && !error && preview.length > 0 && (
          <div className="exportTableWrap">
            <table className="exportTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th className="thRight">Amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((rec, i) => (
                  <tr key={rec._id ?? i} className="exportRow" style={{ '--i': i }}>
                    <td className="tdNum">{i + 1}</td>
                    <td className="tdDate">{fmtDate(rec.date)}</td>
                    <td className="tdTitle">{rec.title}</td>
                    <td>
                      <span className={`typePill ${rec.type === 'Incoming' ? 'pillIn' : 'pillOut'}`}>
                        {rec.type === 'Incoming' ? '↑' : '↓'} {rec.type}
                      </span>
                    </td>
                    <td className={`tdAmount ${rec.type === 'Incoming' ? 'amtIn' : 'amtOut'}`}>
                      {rec.type === 'Incoming' ? '+' : '−'}{fmt(rec.amount)}
                    </td>
                    <td className="tdDetail">{rec.detail || <span className="tdNone">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default ExportPage