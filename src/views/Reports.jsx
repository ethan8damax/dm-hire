import { useState } from 'react'
import { Clock, Wallet, CheckCircle2, BarChart3 } from 'lucide-react'
import Card from '../components/ui/Card'
import MetricCard from '../components/ui/MetricCard'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import TrendChart from '../components/ui/TrendChart'
import PipelineFunnel from '../components/ui/PipelineFunnel'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { useAnalytics } from '../hooks/useAnalytics'
import { useJobs } from '../hooks/useJobs'
import Loading from '../components/ui/Loading'
import './Reports.css'

const DATE_RANGES = ['Last 30 Days', 'Last Quarter', 'Year to Date', 'Last 12 Months']

const pct = (v) => `${Math.round(v * 100)}%`
const money = (v) => `$${v.toLocaleString()}`
const trendChange = (trend) => Math.round(((trend[trend.length - 1].value - trend[0].value) / trend[0].value) * 100)

function performanceBadge(row) {
  if (row.hires === 0) return <Badge variant="expired">Underperforming</Badge>
  if (row.conversionRate >= 0.2) return <Badge variant="accepted">Top Performer</Badge>
  return null
}

export default function Reports() {
  const { analytics, loading: analyticsLoading } = useAnalytics()
  const { jobs, loading: jobsLoading } = useJobs()
  const [dateRange, setDateRange] = useState(DATE_RANGES[0])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const loading = useSimulatedLoad()

  if (analyticsLoading || jobsLoading) return <Loading />

  const activeJobId = selectedJobId ?? jobs[0].id
  const selectedJob = jobs.find((j) => j.id === activeJobId)

  const sourceRows = analytics.sourceRoi.map((s) => ({
    ...s,
    estCost: analytics.costPerHire.bySource.find((c) => c.source === s.source)?.cost ?? null,
  }))

  const funnelStages = [
    { label: 'New', count: selectedJob.stageCounts.new },
    { label: 'Screening', count: selectedJob.stageCounts.screening },
    { label: 'Interview', count: selectedJob.stageCounts.interviewing },
    { label: 'Offer', count: selectedJob.stageCounts.offer },
    { label: 'Hired', count: selectedJob.stageCounts.hired },
  ]

  return (
    <div className="reports-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <div className="page-subtitle">Hiring performance across every open requisition</div>
        </div>
        <select className="reports-range-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          {DATE_RANGES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="metric-grid" data-tour="tour-reports-metrics">
        {/* fewer days is the improvement, so invert the sign — MetricCard's "up" (green) means "good", not "increased" */}
        <MetricCard icon={Clock} iconColor="navy" label="Avg. Days to Fill" value={analytics.timeToFill.avg} change={-trendChange(analytics.timeToFill.trend)} />
        <MetricCard icon={Wallet} iconColor="orange" label="Cost Per Hire" value={money(analytics.costPerHire.avg)} />
        <MetricCard icon={CheckCircle2} iconColor="green" label="Offer Acceptance Rate" value={pct(analytics.offerAcceptanceRate.overall)} change={trendChange(analytics.offerAcceptanceRate.trend)} />
        <MetricCard icon={BarChart3} iconColor="navy" label="Interview-to-Offer Ratio" value={`${analytics.interviewToOfferRatio.overall}:1`} />
      </div>

      <Card>
        <Card.Header><Card.Title>Time to Fill</Card.Title></Card.Header>
        <Card.Body>
          <TrendChart data={analytics.timeToFill.trend} format={(v) => `${v}d`} />
          <DataTable
            columns={[
              { key: 'dept', label: 'Department', sortable: true },
              { key: 'avg', label: 'Avg. Days', sortable: true, render: (r) => `${r.avg}d` },
            ]}
            rows={analytics.timeToFill.byDepartment}
            keyField="dept"
            loading={loading}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header><Card.Title>Cost Per Hire</Card.Title></Card.Header>
        <Card.Body>
          <DataTable
            columns={[
              { key: 'source', label: 'Source', sortable: true },
              { key: 'cost', label: 'Est. Cost', sortable: true, render: (r) => money(r.cost) },
            ]}
            rows={analytics.costPerHire.bySource}
            keyField="source"
            loading={loading}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header><Card.Title>Offer Acceptance Rate</Card.Title></Card.Header>
        <Card.Body>
          <TrendChart data={analytics.offerAcceptanceRate.trend} format={pct} />
          <DataTable
            columns={[
              { key: 'role', label: 'Role Type', sortable: true },
              { key: 'rate', label: 'Acceptance Rate', sortable: true, render: (r) => pct(r.rate) },
            ]}
            rows={analytics.offerAcceptanceRate.byRoleType}
            keyField="role"
            loading={loading}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header><Card.Title>Interview-to-Offer Ratio</Card.Title></Card.Header>
        <Card.Body>
          <DataTable
            columns={[
              { key: 'dept', label: 'Department', sortable: true },
              { key: 'ratio', label: 'Interviews per Offer', sortable: true, render: (r) => `${r.ratio}:1` },
            ]}
            rows={analytics.interviewToOfferRatio.byDepartment}
            keyField="dept"
            loading={loading}
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Per-Opening Stats</Card.Title>
          <select className="reports-job-select" value={activeJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </Card.Header>
        <Card.Body>
          <div className="page-subtitle reports-job-sub">{selectedJob.applicantCount} applicants · {selectedJob.daysOpen} days open</div>
          <PipelineFunnel stages={funnelStages} />
        </Card.Body>
      </Card>

      <Card data-tour="tour-reports-sourceroi">
        <Card.Header><Card.Title>Source ROI &amp; Job Board Performance</Card.Title></Card.Header>
        <Card.Body>
          <DataTable
            columns={[
              { key: 'source', label: 'Source', sortable: true },
              { key: 'applicants', label: 'Applicants', sortable: true },
              { key: 'interviews', label: 'Interviews', sortable: true },
              { key: 'hires', label: 'Hires', sortable: true },
              { key: 'conversionRate', label: 'Conv. Rate', sortable: true, render: (r) => pct(r.conversionRate) },
              { key: 'avgDays', label: 'Avg. Days', sortable: true, render: (r) => r.avgDays != null ? `${r.avgDays}d` : '-' },
              { key: 'estCost', label: 'Est. Cost', sortable: true, render: (r) => r.estCost != null ? money(r.estCost) : '-' },
              { key: 'performance', label: 'Performance', render: performanceBadge },
            ]}
            rows={sourceRows}
            keyField="source"
            loading={loading}
          />
        </Card.Body>
      </Card>
    </div>
  )
}
