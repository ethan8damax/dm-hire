import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WhyFeatureCard from './WhyFeatureCard'
import { clampIndex } from './clampIndex'

export default function WhyDMHireWalkthrough({ features, iconMap, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeChipRef = useRef(null)

  // Keeps the active filmstrip chip in view when stepping past whatever
  // fits on screen (e.g. card 21+ of 24) — otherwise it scrolls out of
  // the horizontally-scrollable strip and becomes both invisible and
  // unclickable.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    activeChipRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }, [activeIndex])

  // Every stage has >=1 feature under normal operation (see the
  // 016_why_dm_hire_stage migration backfill). This guard only fires if the
  // Supabase fetch itself failed (useWhyDmHireFeatures leaves the list empty
  // on error) — the grid degrades to zero cards in that case, so the
  // walkthrough should too instead of crashing on features[activeIndex].
  if (features.length === 0) return null

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

      <div className="why-filmstrip-wrap">
        <div className="why-filmstrip no-scrollbar">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon]
            return (
              <button
                type="button"
                key={f.title}
                ref={i === activeIndex ? activeChipRef : undefined}
                className={`why-filmstrip-chip${i === activeIndex ? ' active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={f.title}
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
        <span className="why-filmstrip-pos">{activeIndex + 1} / {features.length}</span>
      </div>
    </div>
  )
}
