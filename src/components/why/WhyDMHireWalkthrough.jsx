import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WhyFeatureCard from './WhyFeatureCard'
import { clampIndex } from './clampIndex'

export default function WhyDMHireWalkthrough({ features, iconMap, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  // features is always non-empty: every stage has >=1 feature (see the
  // 016_why_dm_hire_stage migration backfill), so activeIndex is always valid.
  const feature = features[activeIndex]

  return (
    <div className="why-walkthrough">
      <div className="why-walk-row">
        <button
          type="button"
          className="why-walk-arrow"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => clampIndex(i, -1, features.length))}
          aria-label="Previous feature"
        >
          <ChevronLeft size={18} />
        </button>

        <WhyFeatureCard
          feature={feature}
          icon={iconMap[feature.icon]}
          onNavigate={() => navigate(feature.route)}
        />

        <button
          type="button"
          className="why-walk-arrow"
          disabled={activeIndex === features.length - 1}
          onClick={() => setActiveIndex((i) => clampIndex(i, 1, features.length))}
          aria-label="Next feature"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="why-filmstrip no-scrollbar">
        {features.map((f, i) => {
          const Icon = iconMap[f.icon]
          return (
            <button
              type="button"
              key={f.title}
              className={`why-filmstrip-chip${i === activeIndex ? ' active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={f.title}
            >
              <Icon size={14} />
            </button>
          )
        })}
        <span className="why-filmstrip-pos">{activeIndex + 1} / {features.length}</span>
      </div>
    </div>
  )
}
