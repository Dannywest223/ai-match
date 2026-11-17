const steps = [
  {
    title: "Tell us about you",
    desc: "Share your academic background, preferred country, budget, and course.",
    image: "/image1.png",
  },
  {
    title: "Get AI-powered matches",
    desc: "Receive personalized university and program recommendations with match scores.",
    image: "/image3.png", // Swapped: Now shows the UI with match scores
  },
  {
    title: "Apply with confidence",
    desc: "Connect with verified institutions and recruitment partners.",
    image: "/image2.png", // Swapped: Now shows the chat/connection screen
  },
  {
    title: "Receive your offer",
    desc: "Track your application in real-time and access visa guidance.",
    image: "/image4.png",
  },
];

export function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-gray-950 text-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          How it works
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your journey from profile to offer — simple, transparent, and guided
          at every step.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="group flex flex-col rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-xl hover:border-gray-700 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0f172a] flex items-center justify-center p-2">
              <img
                src={step.image}
                alt={step.title}
                loading={i === 0 ? "eager" : "lazy"}
                // object-contain makes sure the ENTIRE UI is visible without cutting off the text!
                className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Step number badge */}
              <div className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-gray-900">
                {i + 1}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold mb-3 text-white">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed flex-grow">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}