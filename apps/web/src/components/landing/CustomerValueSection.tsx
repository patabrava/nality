'use client'

const customerSegments = [
  {
    title: "Families & Elders",
    subtitle: "Preserve generational wisdom",
    description: "Capture grandparents' stories before they're lost forever. Our AI guides elderly users through gentle conversations, while family members can collaborate on shared memories.",
    benefits: [
      "Easy voice recording for seniors",
      "Family collaboration tools",
      "Automated organization by decades",
      "Beautiful printed books for generations"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 17l-5-3 5-3" />
      </svg>
    ),
    testimonial: "\"We preserved 80 years of my grandmother's stories in just three sessions.\"",
    author: "Maria Santos"
  },
  {
    title: "Authors & Creatives",
    subtitle: "Professional memoir tools",
    description: "Transform your life experiences into compelling narratives. AI-powered story structure analysis, professional interview support, and publishing-quality exports.",
    benefits: [
      "AI story arc analysis",
      "Professional transcript services", 
      "Multi-format publishing",
      "Collaborative editing features"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    testimonial: "\"Nality helped me structure my memoir in ways I never imagined.\"",
    author: "Dr. James Patterson"
  },
  {
    title: "Organizations & Institutions",
    subtitle: "Institutional memory capture",
    description: "Preserve organizational history, capture retiring executives' knowledge, and create institutional legacies. Enterprise-grade security and collaboration.",
    benefits: [
      "Enterprise security & compliance",
      "Bulk user management",
      "Custom branding options",
      "API integrations available"
    ],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v1" />
        <path d="M9 15v1" />
        <path d="M15 13v1" />
      </svg>
    ),
    testimonial: "\"We've preserved 200+ years of institutional knowledge effortlessly.\"",
    author: "Heritage Foundation"
  }
]

export default function CustomerValueSection() {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">For Every Story</span>
        <h2 className="section-title">Tailored for <span className="serif-text italic text-gold">every storyteller</span></h2>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Whether you're preserving family heritage, crafting professional memoirs, or capturing institutional knowledge, Nality adapts to your unique storytelling needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {customerSegments.map((segment, index) => (
          <div
            key={index}
            className="bg-white p-8 text-center group hover:transform hover:scale-105 transition-all duration-500 rounded-lg border border-gray-200 shadow-lg"
          >
            {/* Icon */}
            <div className="feature-icon text-4xl mb-6 text-gold">
              {segment.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-serif mb-2 text-gray-900">{segment.title}</h3>
            <h4 className="text-lg mb-4 text-gold font-medium">{segment.subtitle}</h4>
            
            {/* Description */}
            <p className="text-gray-700 mb-6 leading-relaxed">{segment.description}</p>
            
            {/* Benefits */}
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {segment.benefits.map((benefit, benefitIndex) => (
                <li key={benefitIndex} className="flex items-center">
                  <svg className="w-4 h-4 mr-3 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ width: '16px', height: '16px', minWidth: '16px', minHeight: '16px' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Testimonial */}
            <blockquote className="border-l-4 border-gold pl-4 italic text-gray-600 text-sm">
              <p>{segment.testimonial}</p>
              <cite className="block mt-2 text-gold font-medium">— {segment.author}</cite>
            </blockquote>
          </div>
        ))}
      </div>
    </section>
  )
}