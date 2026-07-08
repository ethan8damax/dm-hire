import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, DollarSign, Briefcase, CalendarDays } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import FilterChip from '../components/ui/FilterChip'
import EmptyState from '../components/ui/EmptyState'
import { jobs } from '../data/jobs'
import './CareerHome.css'

function openExternalJobs() {
  return jobs.filter((j) => j.status === 'open' && !j.isInternal)
}

export default function CareerHome() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('all')

  const openJobs = openExternalJobs()
  const departments = ['all', ...new Set(openJobs.map((j) => j.department))]

  const filteredJobs = openJobs.filter((j) => {
    const matchesQuery = `${j.title} ${j.department} ${j.location}`.toLowerCase().includes(query.toLowerCase())
    const matchesDept = department === 'all' || j.department === department
    return matchesQuery && matchesDept
  })

  return (
    <div className="career-home">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find Your Next Role</h1>
          <div className="page-subtitle">{openJobs.length} open position{openJobs.length === 1 ? '' : 's'} at Doeren Mayhew</div>
        </div>
      </div>

      <div className="career-search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by title, department, or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-strip">
        {departments.map((d) => (
          <FilterChip key={d} active={department === d} onClick={() => setDepartment(d)}>
            {d === 'all' ? 'All Departments' : d}
          </FilterChip>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No open roles match your search" subtitle="Try a different search term or check back soon for new postings." /></Card>
      ) : (
        <div className="career-job-list">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="career-job-card" onClick={() => navigate(`/careers/jobs/${job.id}`)}>
              <Card.Body>
                <div className="career-job-title">{job.title}</div>
                <div className="career-job-dept">{job.department}</div>
                <div className="career-job-meta-row">
                  <span className="career-job-meta"><MapPin size={13} /> {job.location}</span>
                  <span className="career-job-meta"><DollarSign size={13} /> {job.compRange}</span>
                  <span className="career-job-meta"><CalendarDays size={13} /> Posted {job.postedDate}</span>
                </div>
                <p className="career-job-desc">{job.description}</p>
                <Button variant="primary" size="sm" onClick={() => navigate(`/careers/jobs/${job.id}`)}>
                  View & Apply
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
