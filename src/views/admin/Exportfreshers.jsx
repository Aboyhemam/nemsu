import React, { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import './../../css/exportFreshers.css'

// ─── API base ─────────────────────────────────────────────────
const API_BASE = 'https://nemsu-backend.onrender.com'

// ─── Helpers ──────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmtDateExcel = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

const ENTRY_OPTIONS = [
  'All',
  'NEE I',
  'NEE II (BBA)',
  'NEE II(PCB Forestry)',
  'NEE II(PCM Science)',
  'NEE II(PCM E&T)',
  'JEE',
  'QUET',
  'NEE III',
  'NEPTGET',
]

const STATUS_OPTIONS = ['All', 'Selected', 'Waiting', 'Unset']

// ─── Export Logic ──────────────────────────────────────────────
function exportToExcel(records, filterEntry, filterStatus, dateFrom, dateTo) {
  const wb = XLSX.utils.book_new()

  // ── Sheet 1: Records ──
  const rows = records.map((r, i) => ({
    '#':              i + 1,
    'Registered On':  fmtDateExcel(r.createdAt),
    'Name':           r.name || '',
    'Parent Name':    r.parentName || '',
    'Phone No':       r.phoneNo || '',
    'Parent No':      r.parentNo || '',
    'Email':          r.email || '',
    'Address':        r.address || '',
    'Entry Type':     r.entry || '—',
    'Status':         r.status || 'Unset',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 4 },   // #
    { wch: 16 },  // Registered On
    { wch: 24 },  // Name
    { wch: 24 },  // Parent Name
    { wch: 14 },  // Phone No
    { wch: 14 },  // Parent No
    { wch: 28 },  // Email
    { wch: 32 },  // Address
    { wch: 24 },  // Entry Type
    { wch: 12 },  // Status
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Freshers')

  // ── Sheet 2: Summary ──
  const total    = records.length
  const selected = records.filter(r => r.status === 'Selected').length
  const waiting  = records.filter(r => r.status === 'Waiting').length
  const unset    = records.filter(r => !r.status).length

  const entryBreakdown = ENTRY_OPTIONS.filter(e => e !== 'All').map(e => ({
    'Metric': `Entry — ${e}`,
    'Value':  records.filter(r => r.entry === e).length,
  }))

  const summaryRows = [
    { 'Metric': 'Total Freshers',   'Value': total },
    { 'Metric': 'Selected',         'Value': selected },
    { 'Metric': 'Waiting',          'Value': waiting },
    { 'Metric': 'Status Unset',     'Value': unset },
    { 'Metric': '──────────────',   'Value': '' },
    ...entryBreakdown,
    { 'Metric': '──────────────',   'Value': '' },
    { 'Metric': 'Exported On',      'Value': new Date().toLocaleDateString('en-IN') },
    { 'Metric': 'Entry Filter',     'Value': filterEntry },
    { 'Metric': 'Status Filter',    'Value': filterStatus },
  ]

  const ws2 = XLSX.utils.json_to_sheet(summaryRows)
  ws2['!cols'] = [{ wch: 28 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary')

  const timestamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `NEMSU_Freshers_${timestamp}.xlsx`)
}

// ─── Main Page ────────────────────────────────────────────────
function ExportFreshersPage() {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported]   = useState(false)

  // Filters
  const [filterEntry,  setFilterEntry]  = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo,   setDateTo]           = useState('')
  const [search,   setSearch]           = useState('')

  // Fetch on mount
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true); setError(null)
        const token = localStorage.getItem('nemsu_token')
        const res = await fetch(`${API_BASE}/fresher/get`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        setRecords(Array.isArray(data) ? data : data.data ?? data.freshers ?? [])
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
    if (filterEntry !== 'All')  list = list.filter(r => r.entry === filterEntry)
    if (filterStatus !== 'All') {
      if (filterStatus === 'Unset') list = list.filter(r => !r.status)
      else list = list.filter(r => r.status === filterStatus)
    }
    if (dateFrom) list = list.filter(r => new Date(r.createdAt) >= new Date(dateFrom))
    if (dateTo)   list = list.filter(r => new Date(r.createdAt) <= new Date(dateTo))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        (r.name ?? '').toLowerCase().includes(q) ||
        (r.email ?? '').toLowerCase().includes(q) ||
        (r.phoneNo ?? '').toLowerCase().includes(q) ||
        (r.address ?? '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [records, filterEntry, filterStatus, dateFrom, dateTo, search])

  // Summary stats
  const totalSelected = preview.filter(r => r.status === 'Selected').length
  const totalWaiting  = preview.filter(r => r.status === 'Waiting').length
  const totalUnset    = preview.filter(r => !r.status).length

  const handleExport = async () => {
    if (preview.length === 0) return
    setExporting(true)
    await new Promise(r => setTimeout(r, 600))
    exportToExcel(preview, filterEntry, filterStatus, dateFrom, dateTo)
    setExporting(false)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const clearFilters = () => {
    setFilterEntry('All')
    setFilterStatus('All')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  const hasActiveFilter = filterEntry !== 'All' || filterStatus !== 'All' || dateFrom || dateTo || search

  return (
    <div className="exportContainer">

      {/* ── Header ── */}
      <div className="exportHeader">
        <div className="exportHeaderLeft">
          <p className="exportLabel">Admin / Export</p>
          <h1 className="exportTitle">Export Freshers</h1>
          <p className="exportSub">
            Filter student records below, preview what will be exported, then download as an Excel file.
          </p>
        </div>

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
          <input
            className="filterInput"
            placeholder="Name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Entry Type</label>
          <select
            className="filterInput filterSelect"
            value={filterEntry}
            onChange={e => setFilterEntry(e.target.value)}
          >
            {ENTRY_OPTIONS.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Status</label>
          <div className="filterTypeBtns">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                className={`filterTypeBtn ${filterStatus === s ? `filterTypeActive filterType${s}` : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'Selected' ? '✓ ' : s === 'Waiting' ? '⏳ ' : s === 'Unset' ? '— ' : ''}{s}
              </button>
            ))}
          </div>
        </div>

        <div className="filterGroup">
          <label className="filterLabel">Registered From</label>
          <input className="filterInput filterDate" type="date"
            value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>

        <div className="filterGroup">
          <label className="filterLabel">To</label>
          <input className="filterInput filterDate" type="date"
            value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        {hasActiveFilter && (
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
            <span className="chipLabel">✓ Selected</span>
            <span className="chipValue chipValueIn">{totalSelected}</span>
          </div>
          <div className="summaryChip chipOut">
            <span className="chipLabel">⏳ Waiting</span>
            <span className="chipValue chipValueOut">{totalWaiting}</span>
          </div>
          <div className="summaryChip">
            <span className="chipLabel">— Unset</span>
            <span className="chipValue">{totalUnset}</span>
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
                  <th>Registered</th>
                  <th>Name</th>
                  <th>Parent</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Entry Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((rec, i) => (
                  <tr key={rec._id ?? i} className="exportRow" style={{ '--i': i }}>
                    <td className="tdNum">{i + 1}</td>
                    <td className="tdDate">{fmtDate(rec.createdAt)}</td>
                    <td className="tdTitle">{rec.name || <span className="tdNone">—</span>}</td>
                    <td className="tdDetail">{rec.parentName || <span className="tdNone">—</span>}</td>
                    <td className="tdDetail">{rec.phoneNo || <span className="tdNone">—</span>}</td>
                    <td className="tdDetail">{rec.email || <span className="tdNone">—</span>}</td>
                    <td>
                      {rec.entry
                        ? <span className="typePill pillEntry">{rec.entry}</span>
                        : <span className="tdNone">—</span>}
                    </td>
                    <td>
                      {rec.status === 'Selected' ? (
                        <span className="typePill pillIn">✓ Selected</span>
                      ) : rec.status === 'Waiting' ? (
                        <span className="typePill pillWaiting">⏳ Waiting</span>
                      ) : (
                        <span className="tdNone">—</span>
                      )}
                    </td>
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

export default ExportFreshersPage