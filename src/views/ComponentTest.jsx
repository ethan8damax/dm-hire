import { Briefcase, Users, BarChart3, Clock } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import MetricCard from '../components/ui/MetricCard'
import ScoreBar from '../components/ui/ScoreBar'
import FilterChip from '../components/ui/FilterChip'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import Timeline from '../components/ui/Timeline'
import EmptyState from '../components/ui/EmptyState'
import KanbanCard from '../components/ui/KanbanCard'
import { candidates } from '../data/candidates'

const STAGE_VARIANTS = ['new', 'screening', 'interviewing', 'offer', 'hired', 'rejected']
const JOB_STATUS_VARIANTS = ['open', 'pending_approval', 'draft', 'closed']
const AVATAR_COLORS = ['navy', 'green', 'orange', 'purple', 'blue', 'pink']

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {children}
      </div>
    </section>
  )
}

export default function ComponentTest() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeChip, setActiveChip] = useState('all')

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Component Library — /test</h1>

      <Section title="Button">
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="lg">Large</Button>
        <Button iconOnly aria-label="Icon button"><Briefcase size={16} /></Button>
        <Button variant="primary" disabled>Disabled</Button>
      </Section>

      <Section title="Badge — candidate stages">
        {STAGE_VARIANTS.map((v) => <Badge key={v} variant={v} />)}
      </Section>
      <Section title="Badge — job status">
        {JOB_STATUS_VARIANTS.map((v) => <Badge key={v} variant={v} />)}
      </Section>

      <Section title="Card">
        <Card style={{ width: 280 }}>
          <Card.Header><Card.Title>Card title</Card.Title></Card.Header>
          <Card.Body>Body content goes here.</Card.Body>
          <Card.Footer><Button size="sm" variant="ghost">Footer action</Button></Card.Footer>
        </Card>
      </Section>

      <Section title="Avatar">
        {AVATAR_COLORS.map((c) => <Avatar key={c} initials="JA" color={c} />)}
        <Avatar initials="XS" size="sm" />
        <Avatar initials="MD" size="md" />
        <Avatar initials="LG" size="lg" />
        <Avatar initials="XL" size="xl" />
        <Avatar.Group>
          <Avatar initials="AB" color="navy" size="sm" />
          <Avatar initials="CD" color="green" size="sm" />
          <Avatar initials="EF" color="orange" size="sm" />
        </Avatar.Group>
      </Section>

      <Section title="MetricCard">
        <MetricCard icon={Briefcase} iconColor="navy" label="Open Requisitions" value="12" change={8} />
        <MetricCard icon={Users} iconColor="green" label="Active Candidates" value="164" change={-3} />
        <MetricCard icon={BarChart3} iconColor="orange" label="Avg. Days to Fill" value="18.4" />
        <MetricCard icon={Clock} iconColor="blue" label="Offer Acceptance" value="92%" change={2} />
      </Section>

      <Section title="ScoreBar">
        <div style={{ width: 240 }}>
          <ScoreBar label="Payroll Expertise" value={87} color="var(--color-green)" />
        </div>
        <ScoreBar value={64} compact />
      </Section>

      <Section title="FilterChip">
        {['all', 'open', 'closed'].map((v) => (
          <FilterChip key={v} active={activeChip === v} onClick={() => setActiveChip(v)}>
            {v}
          </FilterChip>
        ))}
      </Section>

      <Section title="DataTable">
        <div style={{ width: '100%' }}>
          <DataTable
            keyField="id"
            columns={[
              { key: 'name', label: 'Name', sortable: true },
              { key: 'source', label: 'Source', sortable: true },
              { key: 'aiScore', label: 'Score', sortable: true },
              { key: 'stage', label: 'Stage', render: (row) => <Badge variant={row.stage} /> },
            ]}
            rows={candidates}
            onRowClick={(row) => console.log('clicked', row.id)}
          />
        </div>
      </Section>

      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Example modal"
          footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
        >
          Modal body content, focus-trapped and closable via Escape or overlay click.
        </Modal>
      </Section>

      <Section title="Timeline">
        <div style={{ width: 320 }}>
          <Timeline
            steps={[
              { status: 'complete', label: 'Application', date: 'Jun 15' },
              { status: 'complete', label: 'Phone Screen', date: 'Jun 18', note: 'Strong technical interview.' },
              { status: 'active', label: 'Interviewing', date: 'Jun 22' },
              { status: 'pending', label: 'Offer' },
            ]}
          />
        </div>
      </Section>

      <Section title="EmptyState">
        <div style={{ width: 320 }}>
          <EmptyState
            icon={Users}
            title="No candidates yet"
            subtitle="Candidates will appear here once they apply."
            ctaLabel="Invite a candidate"
            onCta={() => {}}
          />
        </div>
      </Section>

      <Section title="KanbanCard">
        <div style={{ width: 240 }}>
          <KanbanCard candidate={candidates[0]} />
        </div>
        <div style={{ width: 240 }}>
          <KanbanCard candidate={candidates[2]} />
        </div>
      </Section>
    </div>
  )
}
