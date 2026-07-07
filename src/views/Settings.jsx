import { useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import FilterChip from '../components/ui/FilterChip'
import Modal from '../components/ui/Modal'
import DataTable from '../components/ui/DataTable'
import { offices as initialOffices } from '../data/offices'
import { roleWorkflows } from '../data/workflows'
import { onboardingPackets as initialPackets } from '../data/onboardingPackets'
import { users as initialUsers } from '../data/users'
import { jobs } from '../data/jobs'
import './Settings.css'

const TABS = [
  { key: 'offices', label: 'Offices' },
  { key: 'workflows', label: 'Workflows' },
  { key: 'onboarding', label: 'Onboarding Packets' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'users', label: 'Users' },
  { key: 'branding', label: 'Branding' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('offices')

  return (
    <div className="settings-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-subtitle">Configure DM Hire for your organization's structure</div>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-nav" data-tour="tour-settings">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`settings-nav-item${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="settings-panel">
          {activeTab === 'offices' && <OfficesTab />}
          {activeTab === 'workflows' && <WorkflowsTab />}
          {activeTab === 'onboarding' && <OnboardingTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'branding' && <BrandingTab />}
        </div>
      </div>
    </div>
  )
}

const REGIONS = ['Midwest', 'Northeast', 'South', 'West']

function OfficesTab() {
  const [offices, setOffices] = useState(initialOffices)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', region: 'Midwest' })

  function submit() {
    setOffices((o) => [...o, { id: `office-${Date.now()}`, name: form.name, address: form.address, region: form.region }])
    setModalOpen(false)
    setForm({ name: '', address: '', region: 'Midwest' })
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Offices</div>
          <div className="settings-panel-sub">Each office's location informs geo-based job board targeting.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Add Office</Button>
      </div>

      <div className="settings-card-grid">
        {offices.map((o) => (
          <Card key={o.id}>
            <Card.Body>
              <div className="settings-office-name">{o.name}</div>
              <div className="settings-office-addr">{o.address}</div>
              <div className="settings-office-region">{o.region} region</div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Office"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!form.name.trim() || !form.address.trim()} onClick={submit}>Add Office</Button>
        </>}
      >
        <div className="settings-form-row">
          <label>Office Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Grand Rapids" />
        </div>
        <div className="settings-form-row">
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, City, State ZIP" />
        </div>
        <div className="settings-form-row">
          <label>Region</label>
          <select value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="settings-geo-preview">Jobs posted from this office will be geo-targeted to boards serving the {form.region} region.</div>
      </Modal>
    </div>
  )
}

function WorkflowsTab() {
  const [roleKey, setRoleKey] = useState('manager')
  const [stages, setStages] = useState(roleWorkflows.manager.stages)

  function selectRole(key) {
    setRoleKey(key)
    setStages(roleWorkflows[key].stages)
  }
  function updateStage(i, field, value) {
    setStages((s) => s.map((st, idx) => (idx === i ? { ...st, [field]: value } : st)))
  }
  function addStage() {
    setStages((s) => [...s, { name: '', approver: 'Hiring Manager', slaDays: 3 }])
  }
  function removeStage(i) {
    setStages((s) => s.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Workflows</div>
          <div className="settings-panel-sub">Interview stages, approver, and SLA per role template.</div>
        </div>
      </div>

      <div className="settings-role-tabs">
        {Object.entries(roleWorkflows).map(([key, t]) => (
          <FilterChip key={key} active={roleKey === key} onClick={() => selectRole(key)}>{t.label}</FilterChip>
        ))}
      </div>

      <div className="settings-stage-list">
        <div className="settings-stage-row settings-stage-row-hdr">
          <span>Stage</span><span>Approver</span><span>SLA (days)</span><span />
        </div>
        {stages.map((s, i) => (
          <div className="settings-stage-row" key={i}>
            <input value={s.name} onChange={(e) => updateStage(i, 'name', e.target.value)} />
            <input value={s.approver} onChange={(e) => updateStage(i, 'approver', e.target.value)} />
            <input type="number" min="1" value={s.slaDays} onChange={(e) => updateStage(i, 'slaDays', Number(e.target.value))} />
            <button type="button" className="settings-row-remove" onClick={() => removeStage(i)} aria-label="Remove stage"><X size={14} /></button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addStage}><Plus size={14} /> Add Stage</Button>
    </div>
  )
}

function OnboardingTab() {
  const [packets, setPackets] = useState(initialPackets)
  const [stateKey, setStateKey] = useState(Object.keys(initialPackets)[0])
  const [editing, setEditing] = useState(false)
  const [docDraft, setDocDraft] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newPacket, setNewPacket] = useState({ abbr: '', state: '' })

  const states = Object.keys(packets)
  const packet = packets[stateKey]

  function addDoc() {
    if (!docDraft.trim()) return
    setPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: [...p[stateKey].documents, docDraft.trim()] } }))
    setDocDraft('')
  }
  function removeDoc(doc) {
    setPackets((p) => ({ ...p, [stateKey]: { ...p[stateKey], documents: p[stateKey].documents.filter((d) => d !== doc) } }))
  }
  function submitNewPacket() {
    const abbr = newPacket.abbr.trim().toUpperCase()
    setPackets((p) => ({ ...p, [abbr]: { state: newPacket.state.trim(), documents: [] } }))
    setStateKey(abbr)
    setAddModalOpen(false)
    setNewPacket({ abbr: '', state: '' })
    setEditing(true)
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Onboarding Packets</div>
          <div className="settings-panel-sub">State-specific documents required for new hires.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}><Plus size={14} /> Add Packet</Button>
      </div>

      <div className="settings-role-tabs">
        {states.map((s) => (
          <FilterChip key={s} active={stateKey === s} onClick={() => { setStateKey(s); setEditing(false) }}>{packets[s].state}</FilterChip>
        ))}
      </div>

      <Card>
        <Card.Body>
          {packet.documents.length === 0 && <div className="settings-hint">No documents in this packet yet.</div>}
          {packet.documents.map((doc) => (
            <div className="settings-doc-row" key={doc}>
              <FileText size={14} /> <span>{doc}</span>
              {editing && <button type="button" className="settings-row-remove" onClick={() => removeDoc(doc)} aria-label="Remove document"><X size={14} /></button>}
            </div>
          ))}
          {editing && (
            <div className="settings-doc-add">
              <input value={docDraft} onChange={(e) => setDocDraft(e.target.value)} placeholder="Add a document…" />
              <Button variant="ghost" size="sm" onClick={addDoc}>Add</Button>
            </div>
          )}
          <div className="settings-panel-actions">
            <Button variant={editing ? 'primary' : 'ghost'} size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done Editing' : 'Edit Packet'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Onboarding Packet"
        footer={<>
          <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button variant="primary" disabled={!newPacket.abbr.trim() || !newPacket.state.trim()} onClick={submitNewPacket}>Add Packet</Button>
        </>}
      >
        <div className="settings-form-row">
          <label>State Abbreviation</label>
          <input value={newPacket.abbr} onChange={(e) => setNewPacket((f) => ({ ...f, abbr: e.target.value }))} placeholder="e.g. OH" maxLength={2} />
        </div>
        <div className="settings-form-row">
          <label>State Name</label>
          <input value={newPacket.state} onChange={(e) => setNewPacket((f) => ({ ...f, state: e.target.value }))} placeholder="e.g. Ohio" />
        </div>
      </Modal>
    </div>
  )
}

const DEPARTMENTS = [
  { key: 'it', label: 'IT', receives: 'Name, start date, equipment needs' },
  { key: 'facilities', label: 'Facilities', receives: 'Name, start date, desk assignment' },
  { key: 'security', label: 'Security', receives: 'Name, start date, badge/access level' },
  { key: 'finance', label: 'Finance', receives: 'Name, start date, compensation, cost center' },
]
const TRIGGERS = [
  { key: 'offer_accepted', label: 'Offer Accepted' },
  { key: 'start_minus_7', label: 'Start Date -7 Days' },
  { key: 'day_1', label: 'Day 1' },
]
const DEFAULT_NOTIF_MATRIX = {
  it: { offer_accepted: true, start_minus_7: true, day_1: true },
  facilities: { offer_accepted: false, start_minus_7: true, day_1: true },
  security: { offer_accepted: false, start_minus_7: true, day_1: true },
  finance: { offer_accepted: true, start_minus_7: false, day_1: false },
}

function NotificationsTab() {
  const [matrix, setMatrix] = useState(DEFAULT_NOTIF_MATRIX)

  function toggle(deptKey, triggerKey) {
    setMatrix((m) => ({ ...m, [deptKey]: { ...m[deptKey], [triggerKey]: !m[deptKey][triggerKey] } }))
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Department Notifications</div>
          <div className="settings-panel-sub">Which departments are notified when a hire is made, and what they receive.</div>
        </div>
      </div>

      <Card>
        <Card.Body>
          <table className="settings-notif-table">
            <thead>
              <tr>
                <th>Department</th>
                {TRIGGERS.map((t) => <th key={t.key}>{t.label}</th>)}
                <th>Receives</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map((d) => (
                <tr key={d.key}>
                  <td className="settings-notif-dept">{d.label}</td>
                  {TRIGGERS.map((t) => (
                    <td key={t.key} className="settings-notif-cell">
                      <input type="checkbox" checked={matrix[d.key][t.key]} onChange={() => toggle(d.key, t.key)} />
                    </td>
                  ))}
                  <td className="settings-notif-receives">{d.receives}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </div>
  )
}

const ROLE_OPTIONS = ['Admin', 'Recruiter', 'Hiring Manager']

function UsersTab() {
  const [users, setUsers] = useState(initialUsers)
  const [modalOpen, setModalOpen] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | inviting
  const [form, setForm] = useState({ name: '', email: '', role: 'Recruiter' })

  function invite() {
    setPhase('inviting')
    setTimeout(() => {
      setUsers((u) => [...u, { id: `user-${Date.now()}`, ...form, assignedJobIds: [], status: 'invited' }])
      setPhase('idle')
      setModalOpen(false)
      setForm({ name: '', email: '', role: 'Recruiter' })
    }, 900)
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (r) => <Badge variant={r.role === 'Admin' ? 'accepted' : r.role === 'Recruiter' ? 'new' : 'interviewing'}>{r.role}</Badge> },
    {
      key: 'assignedJobIds', label: 'Assigned Jobs',
      render: (r) => r.assignedJobIds.length
        ? r.assignedJobIds.map((id) => jobs.find((j) => j.id === id)?.title).filter(Boolean).join(', ')
        : '—',
    },
    { key: 'status', label: 'Status', render: (r) => r.status === 'invited' ? <Badge variant="awaiting">Invited</Badge> : <Badge variant="accepted">Active</Badge> },
  ]

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Users</div>
          <div className="settings-panel-sub">Who has access, their role, and which jobs they're assigned to.</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Invite User</Button>
      </div>

      <Card><DataTable columns={columns} rows={users} /></Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Invite User"
        footer={<>
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={phase === 'inviting'}>Cancel</Button>
          <Button variant="primary" disabled={!form.name.trim() || !form.email.trim() || phase === 'inviting'} onClick={invite}>
            {phase === 'inviting' ? 'Sending Invite…' : 'Send Invite'}
          </Button>
        </>}
      >
        <div className="settings-form-row">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="settings-form-row">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="settings-form-row">
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  )
}

const DEFAULT_NAVY_DARK = '#081D3F'

function BrandingTab() {
  const [color, setColor] = useState(DEFAULT_NAVY_DARK)

  function apply(hex) {
    setColor(hex)
    document.documentElement.style.setProperty('--color-navy-dark', hex)
  }
  function reset() {
    setColor(DEFAULT_NAVY_DARK)
    document.documentElement.style.removeProperty('--color-navy-dark')
  }

  return (
    <div>
      <div className="settings-panel-hdr">
        <div>
          <div className="settings-panel-title">Branding</div>
          <div className="settings-panel-sub">For client demos — updates the sidebar color live.</div>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="settings-form-row">
            <label>Logo</label>
            <div className="settings-logo-placeholder">Drop a logo file here (placeholder)</div>
          </div>
          <div className="settings-form-row">
            <label>Primary Color</label>
            <div className="settings-color-row">
              <input type="color" value={color} onChange={(e) => apply(e.target.value)} />
              <span className="settings-color-hex">{color}</span>
              <Button variant="ghost" size="sm" onClick={reset}>Reset to Default</Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
