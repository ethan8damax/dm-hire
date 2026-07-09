import { AlertTriangle, Clock, Star, History, Building2 } from 'lucide-react'
import Avatar from './Avatar'
import Badge from './Badge'
import './KanbanCard.css'

// actions: [{ label, onClick, tone }] — tone: 'default' | 'accent' | 'danger', max 2
export default function KanbanCard({ candidate, note, noteVariant = 'default', actions = [], showScore = true, dimmed = false, onClick, draggable = false, dragging = false, onDragStart, onDragEnd }) {
  const { name, initials, avatarColor, location, source, stage, aiScore, daysInStage, isDuplicate, isStale, isTopCandidate, isInternalApplicant, priorInteraction } = candidate

  return (
    <div
      className={`kanban-card${isTopCandidate ? ' kc-top-candidate' : ''}${dimmed ? ' kc-dimmed' : ''}${dragging ? ' kc-dragging' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isTopCandidate && (
        <div className="kc-top-badge"><Star size={11} /> Top Candidate</div>
      )}
      {isInternalApplicant && (
        <div className="kc-internal-badge"><Building2 size={11} /> Internal Applicant</div>
      )}
      {isDuplicate && (
        <div className="kc-warning kc-warning-duplicate" data-tour="tour-candidate-intel">
          <AlertTriangle size={11} /> Possible duplicate
        </div>
      )}

      <div className="kc-top">
        <Avatar initials={initials} color={avatarColor} size="sm" />
        <div>
          <div className="kc-name">{name}</div>
          <div className="kc-role">{location} · via {source}</div>
        </div>
      </div>

      {note && <div className={`kc-note kc-note-${noteVariant}`}>{note}</div>}

      {priorInteraction && (
        <div className="kc-prior">
          <History size={11} /> Spoke with in {priorInteraction.year} for a different role
        </div>
      )}

      {isStale && (
        <div className="kc-warning kc-warning-stale">
          <Clock size={11} /> Stale, {daysInStage}d no update
        </div>
      )}

      <div className="kc-footer">
        <Badge variant={stage} />
        {showScore && (
          aiScore != null
            ? <span className="kc-score" data-tour="tour-ai-score">{aiScore}%</span>
            : <span className="kc-score kc-score-pending" data-tour="tour-ai-score">AI review pending</span>
        )}
      </div>

      {actions.length > 0 && (
        <div className="kc-actions" onClick={(e) => e.stopPropagation()}>
          {actions.map((a) => (
            <button key={a.label} type="button" className={`kc-act kc-act-${a.tone ?? 'default'}`} onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
