import { useState } from 'react'
import { Wallet, CalendarClock, Link2, Globe2, ShieldCheck, ClipboardList, Building2, Loader2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { integrations as initialIntegrations } from '../data/integrations'
import './Integrations.css'

const TODAY = '2026-07-07 10:00 AM'

const ICONS = {
  Payroll: Wallet,
  Calendar: CalendarClock,
  Sourcing: Link2,
  Screening: ShieldCheck,
  Assessment: ClipboardList,
  HRIS: Building2,
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState(initialIntegrations)
  const [connectingId, setConnectingId] = useState(null)

  function togglePause(id) {
    setIntegrations((list) => list.map((i) => (
      i.id === id ? { ...i, status: i.status === 'connected' ? 'paused' : 'connected' } : i
    )))
  }

  function connect(id) {
    setConnectingId(id)
    setTimeout(() => {
      setIntegrations((list) => list.map((i) => (
        i.id === id ? { ...i, status: 'connected', lastSync: TODAY } : i
      )))
      setConnectingId(null)
    }, 900)
  }

  return (
    <div className="integrations-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <div className="page-subtitle">Everything DM Hire connects to, in one place</div>
        </div>
      </div>

      <div className="integrations-grid">
        {integrations.map((i) => {
          const Icon = ICONS[i.category] ?? Globe2
          const isConnecting = connectingId === i.id
          return (
            <Card key={i.id} className="integration-card">
              <Card.Body>
                <div className="integration-hdr">
                  <div className="integration-icon"><Icon size={18} /></div>
                  <div className="integration-hdr-text">
                    <div className="integration-name">{i.name}</div>
                    <div className="integration-category">{i.category}</div>
                  </div>
                  <Badge variant={isConnecting ? 'paused' : i.status} />
                </div>

                <div className="integration-desc">{i.description}</div>

                {i.id === 'dm-payroll' && (
                  <div className="integration-fact"><strong>{i.newHireCount}</strong> new hires synced this quarter</div>
                )}
                {i.boards && (
                  <div className="integration-tags">
                    {i.boards.map((b) => <span key={b} className="integration-tag">{b}</span>)}
                  </div>
                )}
                {i.tools && (
                  <div className="integration-tags">
                    {i.tools.map((t) => <span key={t} className="integration-tag">{t}</span>)}
                  </div>
                )}

                <div className="integration-footer">
                  <span className="integration-sync">
                    {isConnecting ? 'Connecting…' : i.lastSync ? `Last sync ${i.lastSync}` : 'Never synced'}
                  </span>
                  {i.status === 'not_connected' ? (
                    <Button variant="primary" size="sm" disabled={isConnecting} onClick={() => connect(i.id)}>
                      {isConnecting && <Loader2 size={14} className="integration-spin" />}
                      {isConnecting ? 'Connecting…' : 'Connect'}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => togglePause(i.id)}>
                      {i.status === 'connected' ? 'Pause' : 'Resume'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
