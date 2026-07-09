import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useCandidateSession } from '../context/CandidateSessionContext'
import { useCandidates } from '../hooks/useCandidates'
import './CandidateAccount.css'

const EMPTY_FORM = { name: '', email: '', phone: '', location: '', currentRole: '', linkedin: '' }

export default function CandidateAccount() {
  const { session, login } = useCandidateSession()
  const { updateCandidateByEmail } = useCandidates()
  const [form, setForm] = useState({ ...EMPTY_FORM, ...session })
  const [saved, setSaved] = useState(false)

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    if (session?.email) {
      updateCandidateByEmail(session.email, {
        phone: form.phone, location: form.location, currentRole: form.currentRole, linkedin: form.linkedin,
      })
    }
    login({ ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="candidate-account">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <div className="page-subtitle">This information is used to pre-fill future job applications.</div>
        </div>
      </div>

      <Card>
        <Card.Body>
          <form className="account-form" onSubmit={handleSave}>
            <div className="account-grid">
              <label className="account-field">
                <span>Full Name</span>
                <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
              </label>
              <label className="account-field">
                <span>Email</span>
                <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              </label>
              <label className="account-field">
                <span>Phone</span>
                <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </label>
              <label className="account-field">
                <span>Location</span>
                <input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="City, State" />
              </label>
              <label className="account-field">
                <span>Current Role</span>
                <input value={form.currentRole} onChange={(e) => updateField('currentRole', e.target.value)} />
              </label>
              <label className="account-field">
                <span>LinkedIn</span>
                <input value={form.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/…" />
              </label>
            </div>
            <div className="account-hint">Changing your email won't update applications you've already submitted.</div>
            <div className="account-actions">
              <Button variant="primary" type="submit">Save Changes</Button>
              {saved && <span className="account-saved"><CheckCircle2 size={14} /> Saved</span>}
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  )
}
