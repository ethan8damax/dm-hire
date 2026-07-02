import { AlertTriangle, Clock, Star, CalendarPlus, ArrowRight } from 'lucide-react'
import Avatar from './Avatar'
import ScoreBar from './ScoreBar'
import './KanbanCard.css'

export default function KanbanCard({ candidate, onClick, onSchedule, onMove }) {
  const { name, initials, avatarColor, currentRole, source, aiScore, daysInStage, isDuplicate, isStale, isTopCandidate } = candidate

  return (
    <div className={`kanban-card${isTopCandidate ? ' kc-top-candidate' : ''}`} onClick={onClick}>
      {isTopCandidate && (
        <div className="kc-top-badge"><Star size={11} /> Top Candidate</div>
      )}

      <div className="kc-top">
        <Avatar initials={initials} color={avatarColor} size="sm" />
        <div>
          <div className="kc-name">{name}</div>
          <div className="kc-role">{currentRole}</div>
        </div>
      </div>

      <span className="kc-tag">{source}</span>

      {isDuplicate && (
        <div className="kc-warning kc-warning-duplicate">
          <AlertTriangle size={11} /> Possible duplicate
        </div>
      )}
      {isStale && (
        <div className="kc-warning kc-warning-stale">
          <Clock size={11} /> Stale — {daysInStage}d no update
        </div>
      )}

      <div className="kc-footer">
        <ScoreBar value={aiScore} compact />
        <span className="kc-day">{daysInStage}d</span>
      </div>

      <div className="kc-actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="kc-act kca-sched" onClick={onSchedule}>
          <CalendarPlus size={12} /> Schedule
        </button>
        <button type="button" className="kc-act kca-move" onClick={onMove}>
          <ArrowRight size={12} /> Move
        </button>
      </div>
    </div>
  )
}
