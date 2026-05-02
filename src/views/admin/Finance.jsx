import React, { useState, useEffect, useMemo } from 'react'
import '../../css/finance.css'

// ─── API base — swap in your real URL ───────────────────────
const API_BASE = 'https://nemsu-backend.onrender.com'   // e.g. https://nemsu-backend.onrender.com

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const EMPTY_FORM = { title: '', type: 'Outgoing', date: '', amount: '', detail: '' }

// ─── Add / Edit Modal ────────────────────────────────────────
function RecordModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => { const n={...e}; delete n[k]; return n }) }

  const validate = () => {
    const e = {}
    if (!form.title.trim())          e.title  = 'Title is required.'
    if (!form.date)                  e.date   = 'Date is required.'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
                                     e.amount = 'Enter a valid positive amount.'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <p className="modalLabel">{initial?._id ? 'Edit' : 'New'} Record</p>
            <h2 className="modalTitle">Finance Entry</h2>
          </div>
          <button className="modalClose" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modalBody">
          {/* Type toggle */}
          <div className="modalField">
            <label className="modalFieldLabel">Type</label>
            <div className="typeToggle">
              {['Incoming', 'Outgoing'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`typeBtn typBtn${t} ${form.type === t ? 'active' : ''}`}
                  onClick={() => set('type', t)}
                >
                  {t === 'Incoming' ? '↑' : '↓'} {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className={`modalField ${errors.title ? 'fieldError' : ''}`}>
            <label className="modalFieldLabel" htmlFor="f-title">Title *</label>
            <input id="f-title" className="modalInput" placeholder="e.g. Membership dues" value={form.title}
              onChange={e => set('title', e.target.value)} />
            {errors.title && <p className="fieldErrMsg">{errors.title}</p>}
          </div>

          {/* Amount + Date row */}
          <div className="modalRow">
            <div className={`modalField ${errors.amount ? 'fieldError' : ''}`}>
              <label className="modalFieldLabel" htmlFor="f-amount">Amount (₹) *</label>
              <input id="f-amount" className="modalInput" type="number" min="1"
                placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
              {errors.amount && <p className="fieldErrMsg">{errors.amount}</p>}
            </div>
            <div className={`modalField ${errors.date ? 'fieldError' : ''}`}>
              <label className="modalFieldLabel" htmlFor="f-date">Date *</label>
              <input id="f-date" className="modalInput" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} />
              {errors.date && <p className="fieldErrMsg">{errors.date}</p>}
            </div>
          </div>

          {/* Detail */}
          <div className="modalField">
            <label className="modalFieldLabel" htmlFor="f-detail">Details (optional)</label>
            <textarea id="f-detail" className="modalInput modalTextarea" rows={3}
              placeholder="Additional notes…" value={form.detail}
              onChange={e => set('detail', e.target.value)} />
          </div>
        </div>

        <div className="modalFooter">
          <button className="fnBtn fnBtnGhost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className={`fnBtn fnBtnPrimary ${saving ? 'btnLoading' : ''}`}
            onClick={handleSubmit} disabled={saving}>
            {saving ? <><span className="btnSpinner" /> Saving…</> : (initial?._id ? 'Update Record' : 'Add Record')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm delete dialog ────────────────────────────────────
function ConfirmDialog({ record, onConfirm, onCancel, deleting }) {
  return (
    <div className="modalOverlay" onClick={onCancel}>
      <div className="confirmCard" onClick={e => e.stopPropagation()}>
        <div className="confirmIcon">🗑</div>
        <h3 className="confirmTitle">Delete Record?</h3>
        <p className="confirmMsg">
          <strong>"{record.title}"</strong> — {fmt(record.amount)} on {fmtDate(record.date)}<br />
          This action cannot be undone.
        </p>
        <div className="confirmActions">
          <button className="fnBtn fnBtnGhost" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className={`fnBtn fnBtnDanger ${deleting ? 'btnLoading' : ''}`}
            onClick={onConfirm} disabled={deleting}>
            {deleting ? <><span className="btnSpinner" /> Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────
function Finance() {
  const [records, setRecords]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [modal, setModal]           = useState(null)   // null | 'add' | record (edit)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [filter, setFilter]         = useState('All')  // 'All' | 'Incoming' | 'Outgoing'
  const [search, setSearch]         = useState('')
  const [sortDesc, setSortDesc]     = useState(true)
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch all records ──
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        setLoading(true); setError(null)
        const res = await fetch(`${API_BASE}/finance/get`, { signal: controller.signal })
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

  // ── Add record ──
  const handleAdd = async (form) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/finance/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to add record.')
      const created = await res.json()
      setRecords(r => [created.data ?? created, ...r])
      setModal(null)
      showToast('Record added successfully.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  // ── Edit record ──
  const handleEdit = async (form) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/finance/update/${modal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to update record.')
      const updated = await res.json()
      setRecords(r => r.map(rec => rec._id === modal._id ? (updated.data ?? updated) : rec))
      setModal(null)
      showToast('Record updated.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setSaving(false) }
  }

  // ── Delete record ──
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/finance/delete/${deleteTarget._id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete record.')
      setRecords(r => r.filter(rec => rec._id !== deleteTarget._id))
      setDeleteTarget(null)
      showToast('Record deleted.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setDeleting(false) }
  }

  // ── Filtered + sorted list ──
  const displayed = useMemo(() => {
    let list = [...records]
    if (filter !== 'All') list = list.filter(r => r.type === filter)
    if (search.trim())    list = list.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.detail ?? '').toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => sortDesc
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
    )
    return list
  }, [records, filter, search, sortDesc])

  // ── Summary stats ──
  const totalIn  = records.filter(r => r.type === 'Incoming').reduce((s, r) => s + r.amount, 0)
  const totalOut = records.filter(r => r.type === 'Outgoing').reduce((s, r) => s + r.amount, 0)
  const balance  = totalIn - totalOut

  // ── Open edit modal with date formatted for input[type=date] ──
  const openEdit = (rec) => setModal({
    ...rec,
    date: rec.date ? new Date(rec.date).toISOString().split('T')[0] : '',
  })

  return (
    <div className="financeContainer">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fnToast ${toast.type === 'error' ? 'fnToastError' : ''}`}>
          {toast.type === 'error' ? '⚠ ' : '✓ '}{toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="financeHeader">
        <div>
          <p className="financeLabel">Admin / Finance</p>
          <h1 className="financeTitle">Financial Records</h1>
        </div>
        <button className="fnBtn fnBtnPrimary fnBtnAdd" onClick={() => setModal('add')}>
          <span>+</span> New Record
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="summaryGrid">
        <div className="summaryCard summaryBalance">
          <p className="summaryCardLabel">Net Balance</p>
          <p className={`summaryCardAmount ${balance >= 0 ? 'amtIn' : 'amtOut'}`}>{fmt(balance)}</p>
          <p className="summaryCardSub">{records.length} total records</p>
        </div>
        <div className="summaryCard summaryIn">
          <p className="summaryCardLabel">↑ Total Incoming</p>
          <p className="summaryCardAmount amtIn">{fmt(totalIn)}</p>
          <p className="summaryCardSub">{records.filter(r=>r.type==='Incoming').length} entries</p>
        </div>
        <div className="summaryCard summaryOut">
          <p className="summaryCardLabel">↓ Total Outgoing</p>
          <p className="summaryCardAmount amtOut">{fmt(totalOut)}</p>
          <p className="summaryCardSub">{records.filter(r=>r.type==='Outgoing').length} entries</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="financeToolbar">
        <div className="toolbarLeft">
          <input className="fnSearch" placeholder="🔍  Search records…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filterBtns">
            {['All','Incoming','Outgoing'].map(f => (
              <button key={f} className={`filterBtn ${filter===f?'filterActive':''} ${f!=='All'?`filter${f}`:''}`}
                onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>
        <button className="sortBtn" onClick={() => setSortDesc(d => !d)}
          title={sortDesc ? 'Newest first' : 'Oldest first'}>
          {sortDesc ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      {/* ── Table ── */}
      {loading && (
        <div className="fnTableWrap">
          {[...Array(5)].map((_, i) => <div key={i} className="skeletonRow" style={{'--i':i}} />)}
        </div>
      )}

      {!loading && error && (
        <div className="fnStateBox">
          <div className="fnStateIcon fnStateErr">⚠</div>
          <h3 className="fnStateTitle">Could not load records</h3>
          <p className="fnStateMsg">{error}</p>
          <button className="fnBtn fnBtnGhost" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="fnStateBox">
          <div className="fnStateIcon">₹</div>
          <h3 className="fnStateTitle">{search || filter !== 'All' ? 'No matching records' : 'No records yet'}</h3>
          <p className="fnStateMsg">
            {search || filter !== 'All' ? 'Try adjusting your filters.' : 'Click "+ New Record" to add your first entry.'}
          </p>
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="fnTableWrap">
          <table className="fnTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th className="thRight">Amount</th>
                <th>Details</th>
                <th className="thCenter">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((rec, i) => (
                <tr key={rec._id} className="fnRow" style={{'--i': i}}>
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
                  <td className="tdActions">
                    <button className="actionBtn editBtn" onClick={() => openEdit(rec)} title="Edit">✎</button>
                    <button className="actionBtn deleteBtn" onClick={() => setDeleteTarget(rec)} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <RecordModal
          initial={modal === 'add' ? null : modal}
          onSave={modal === 'add' ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          record={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

    </div>
  )
}

export default Finance