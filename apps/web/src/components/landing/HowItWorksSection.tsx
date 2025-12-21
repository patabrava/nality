'use client'

const steps = [
  {
    number: 1,
    title: "Tell us your story",
    description: "Chat naturally by voice or text. Our assistant asks friendly, specific questions to capture events."
  },
  {
    number: 2,
    title: "See your timeline grow",
    description: "Moments become a living, editable timeline—with space for photos, videos, and audio notes."
  },
  {
    number: 3,
    title: "Add depth",
    description: "Prefer a guided conversation? Book a session with a real interviewer. We handle everything."
  },
  {
    number: 4,
    title: "Save and share",
    description: "Export a beautifully designed PDF that's ready to print or share with family."
  }
]

export default function HowItWorksSection() {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-label">Process</span>
        <h2 className="section-title">How it works</h2>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <h3 className="text-xl font-serif mb-3 text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
