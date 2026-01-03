'use client'

import { useState } from 'react'
import { useLocale } from '@/components/i18n/useLocale'

interface ProblemPoint {
  id: string
  icon: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

interface SolutionBenefit {
  id: string
  icon: string
  title: string
  description: string
  problemIds: string[]
}

interface ProblemSolutionFrameworkProps {
  /** Custom styling */
  className?: string
  /** Show animated transitions */
  animated?: boolean
  /** Compact layout for mobile */
  compact?: boolean
}

export default function ProblemSolutionFramework({ 
  className = '',
  animated = true,
  compact = false 
}: ProblemSolutionFrameworkProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<'problem' | 'solution'>('problem')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Problem points data structure
  const problemPoints: ProblemPoint[] = [
    {
      id: 'fragmented',
      icon: '🧩',
      title: t('problemframework.points.fragmented.title'),
      description: t('problemframework.points.fragmented.description'),
      severity: 'high'
    },
    {
      id: 'forgotten',
      icon: '💭',
      title: t('problemframework.points.forgotten.title'),
      description: t('problemframework.points.forgotten.description'),
      severity: 'high'
    },
    {
      id: 'overwhelming',
      icon: '😰',
      title: t('problemframework.points.overwhelming.title'),
      description: t('problemframework.points.overwhelming.description'),
      severity: 'medium'
    },
    {
      id: 'nostructure',
      icon: '📚',
      title: t('problemframework.points.nostructure.title'),
      description: t('problemframework.points.nostructure.description'),
      severity: 'medium'
    },
    {
      id: 'timepressure',
      icon: '⏰',
      title: t('problemframework.points.timepressure.title'),
      description: t('problemframework.points.timepressure.description'),
      severity: 'high'
    },
    {
      id: 'familygap',
      icon: '👨‍👩‍👧‍👦',
      title: t('problemframework.points.familygap.title'),
      description: t('problemframework.points.familygap.description'),
      severity: 'medium'
    }
  ]

  // Solution benefits data structure
  const solutionBenefits: SolutionBenefit[] = [
    {
      id: 'aiassistant',
      icon: '🤖',
      title: t('problemframework.solution.benefits.aiassistant.title'),
      description: t('problemframework.solution.benefits.aiassistant.description'),
      problemIds: ['forgotten', 'overwhelming']
    },
    {
      id: 'structured',
      icon: '📖',
      title: t('problemframework.solution.benefits.structured.title'),
      description: t('problemframework.solution.benefits.structured.description'),
      problemIds: ['fragmented', 'nostructure']
    },
    {
      id: 'flexible',
      icon: '⚡',
      title: t('problemframework.solution.benefits.flexible.title'),
      description: t('problemframework.solution.benefits.flexible.description'),
      problemIds: ['timepressure']
    },
    {
      id: 'collaborative',
      icon: '🤝',
      title: t('problemframework.solution.benefits.collaborative.title'),
      description: t('problemframework.solution.benefits.collaborative.description'),
      problemIds: ['familygap']
    },
    {
      id: 'preservation',
      icon: '🏛️',
      title: t('problemframework.solution.benefits.preservation.title'),
      description: t('problemframework.solution.benefits.preservation.description'),
      problemIds: ['forgotten', 'fragmented']
    },
    {
      id: 'multimedia',
      icon: '🎨',
      title: t('problemframework.solution.benefits.multimedia.title'),
      description: t('problemframework.solution.benefits.multimedia.description'),
      problemIds: ['nostructure', 'overwhelming']
    }
  ]

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'var(--md-sys-color-error)'
      case 'medium': return 'var(--md-sys-color-warning)'
      case 'low': return 'var(--md-sys-color-tertiary)'
    }
  }

  const isConnected = (problemId: string, solutionId: string) => {
    const solution = solutionBenefits.find(s => s.id === solutionId)
    return solution?.problemIds.includes(problemId) || false
  }

  return (
    <section className={`problem-solution-framework ${className}`} aria-labelledby="problem-solution-title">
      {/* Header */}
      <div className="framework-header">
        <div className="framework-badge">
          {t('problemframework.badge')}
        </div>
        
        <h2 id="problem-solution-title" className="framework-title">
          {t('problemframework.title')}
        </h2>
        
        <p className="framework-subtitle">
          {t('problemframework.subtitle')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="framework-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'problem'}
          aria-controls="problem-panel"
          className={`framework-tab ${activeTab === 'problem' ? 'active' : ''}`}
          onClick={() => setActiveTab('problem')}
        >
          <span className="tab-icon">⚠️</span>
          <span className="tab-text">{t('problemframework.tabs.problem')}</span>
          <span className="tab-count">{problemPoints.length}</span>
        </button>
        
        <button
          role="tab"
          aria-selected={activeTab === 'solution'}
          aria-controls="solution-panel"
          className={`framework-tab ${activeTab === 'solution' ? 'active' : ''}`}
          onClick={() => setActiveTab('solution')}
        >
          <span className="tab-icon">✅</span>
          <span className="tab-text">{t('problemframework.tabs.solution')}</span>
          <span className="tab-count">{solutionBenefits.length}</span>
        </button>
      </div>

      {/* Problem Panel */}
      <div
        id="problem-panel"
        role="tabpanel"
        aria-labelledby="problem-tab"
        className={`framework-panel ${activeTab === 'problem' ? 'active' : ''}`}
        hidden={activeTab !== 'problem'}
      >
        <div className="framework-content">
          <div className="framework-intro">
            <h3>{t('problemframework.section.title')}</h3>
            <p>{t('problemframework.section.subtitle')}</p>
          </div>

          <div className="problem-grid">
            {problemPoints.map((problem, index) => (
              <div
                key={problem.id}
                className={`problem-card severity-${problem.severity} ${hoveredItem === problem.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(problem.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: animated ? `${index * 0.1}s` : '0s'
                }}
              >
                <div className="problem-severity-indicator">
                  <div 
                    className="severity-dot"
                    style={{ backgroundColor: getSeverityColor(problem.severity) }}
                    aria-label={t(`problemframework.severity.${problem.severity}`)}
                  />
                </div>
                
                <div className="problem-icon">
                  {problem.icon}
                </div>
                
                <div className="problem-content">
                  <h4 className="problem-title">{problem.title}</h4>
                  <p className="problem-description">{problem.description}</p>
                </div>
                
                <div className="problem-impact">
                  <span className="impact-label">
                    {t(`problemframework.impact.${problem.severity}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Panel */}
      <div
        id="solution-panel"
        role="tabpanel"
        aria-labelledby="solution-tab"
        className={`framework-panel ${activeTab === 'solution' ? 'active' : ''}`}
        hidden={activeTab !== 'solution'}
      >
        <div className="framework-content">
          <div className="framework-intro">
            <h3>{t('problemframework.solution.section.title')}</h3>
            <p>{t('problemframework.solution.section.subtitle')}</p>
          </div>

          <div className="solution-grid">
            {solutionBenefits.map((solution, index) => (
              <div
                key={solution.id}
                className={`solution-card ${hoveredItem === solution.id ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredItem(solution.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  animationDelay: animated ? `${index * 0.1}s` : '0s'
                }}
              >
                <div className="solution-icon">
                  {solution.icon}
                </div>
                
                <div className="solution-content">
                  <h4 className="solution-title">{solution.title}</h4>
                  <p className="solution-description">{solution.description}</p>
                </div>
                
                <div className="solution-connections">
                  <span className="connections-label">
                    {t('problemframework.solution.addresses')}:
                  </span>
                  <div className="connection-tags">
                    {solution.problemIds.map(problemId => {
                      const problem = problemPoints.find(p => p.id === problemId)
                      if (!problem) return null
                      
                      return (
                        <span
                          key={problemId}
                          className="connection-tag"
                          title={problem.title}
                        >
                          {problem.icon}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="framework-cta">
        <div className="cta-content">
          <h3 className="cta-title">
            {t('problemframework.cta.title')}
          </h3>
          <p className="cta-subtitle">
            {t('problemframework.cta.subtitle')}
          </p>
          <div className="cta-buttons">
            <button className="cta-primary">
              {t('problemframework.cta.primary')}
            </button>
            <button className="cta-secondary">
              {t('problemframework.cta.secondary')}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Visualization (hidden by default) */}
      <div className="framework-connections" aria-hidden="true">
        <svg width="100%" height="200" className="connection-svg">
          {/* Connection lines would be drawn here */}
        </svg>
      </div>
    </section>
  )
}