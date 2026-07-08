import { Plus, Trash2 } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import EmptyState from './EmptyState'
import './RepeatableSection.css'

// Generic add/remove list of entry cards, used by Employment History, Education,
// and Training steps. renderItem supplies each card's fields; validation/error
// display stays the caller's responsibility.
export default function RepeatableSection({ items, renderItem, onAdd, onRemove, addLabel, emptyLabel, minRequired = 0 }) {
  return (
    <div className="repeatable-section">
      {items.length === 0 && <EmptyState title={emptyLabel} />}
      {items.map((item, i) => (
        <Card key={item.id} className="repeatable-entry">
          <Card.Body>
            {renderItem(item, i)}
            {items.length > minRequired && (
              <Button variant="ghost" size="sm" className="repeatable-remove" onClick={() => onRemove(item.id)}>
                <Trash2 size={14} /> Remove
              </Button>
            )}
          </Card.Body>
        </Card>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd}><Plus size={14} /> {addLabel}</Button>
    </div>
  )
}
