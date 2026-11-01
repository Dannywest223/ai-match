const steps = [
  ["Tell us about you", "Share your academic background, preferred country, budget, and course."],
  ["Get AI-powered matches", "Receive personalized university and program recommendations with match scores."],
  ["Apply with confidence", "Connect with verified institutions and recruitment partners."],
  ["Receive your offer", "Track your application in real-time and access visa guidance."],
];

export function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {steps.map(([t, d], i) => (
          <div key={t} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-4">
              {i + 1}
            </div>
            <h3 className="font-semibold mb-2">{t}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
